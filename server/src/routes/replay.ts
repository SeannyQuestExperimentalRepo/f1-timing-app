import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import type { DataChannel } from '@f1-timing/shared';

const ReplayParamsSchema = z.object({
  sessionKey: z.string().min(1)
});

const ReplayQuerySchema = z.object({
  from: z.coerce.number().min(0).default(0),
  to: z.coerce.number().optional(),
  limit: z.coerce.number().min(1).max(5000).default(1000),
  offset: z.coerce.number().min(0).default(0),
  channel: z.enum([
    'car_data', 'location', 'position', 'interval', 'lap', 'pit', 
    'stint', 'weather', 'race_control', 'team_radio', 'session', 'drivers'
  ] as const).optional(),
  driver: z.coerce.number().min(1).max(99).optional()
});

const PlaybackCommandSchema = z.object({
  command: z.enum(['start', 'pause', 'stop', 'seek', 'speed']),
  timestamp: z.number().optional(), // For seek command
  speed: z.number().min(0.25).max(16).optional() // For speed command
});

export default async function replayRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // GET /api/replay/:sessionKey/data - Get paginated recorded data for playback
  fastify.get<{
    Params: z.infer<typeof ReplayParamsSchema>,
    Querystring: z.infer<typeof ReplayQuerySchema>
  }>('/replay/:sessionKey/data', {
    schema: {
      params: ReplayParamsSchema,
      querystring: ReplayQuerySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            session_key: { type: 'string' },
            data: { type: 'array' },
            pagination: {
              type: 'object',
              properties: {
                from: { type: 'number' },
                to: { type: 'number' },
                limit: { type: 'number' },
                offset: { type: 'number' },
                returned: { type: 'number' },
                has_more: { type: 'boolean' }
              }
            },
            time_range: {
              type: 'object',
              properties: {
                start: { type: 'number' },
                end: { type: 'number' },
                duration: { type: 'number' }
              }
            }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { sessionKey } = request.params;
      const { from, to, limit, offset, channel, driver } = request.query;
      
      const session = await fastify.db.getSession(sessionKey);
      if (!session) {
        reply.code(404);
        return { error: 'Session not found' };
      }

      // Get session time range if 'to' not specified
      const timeRange = await fastify.db.getTimeRange(sessionKey);
      const endTime = to || (timeRange?.end ?? Date.now());

      const data = await fastify.db.getRecordedData(
        sessionKey,
        from,
        endTime,
        channel || null,
        limit,
        offset
      );

      // Filter by driver if specified and channel supports it
      const driverChannels: DataChannel[] = ['car_data', 'location', 'position', 'interval', 'lap', 'pit', 'stint'];
      const filteredData = driver && (!channel || driverChannels.includes(channel))
        ? data.filter(item => item.data.driver_number === driver)
        : data;

      return {
        session_key: sessionKey,
        data: filteredData,
        pagination: {
          from,
          to: endTime,
          limit,
          offset,
          returned: filteredData.length,
          has_more: data.length === limit
        },
        time_range: timeRange ? {
          start: timeRange.start,
          end: timeRange.end,
          duration: timeRange.end - timeRange.start
        } : null
      };
    } catch (error) {
      fastify.log.error('Failed to get replay data:', error);
      reply.code(500);
      return {
        error: 'Failed to retrieve replay data',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // GET /api/replay/:sessionKey/timeline - Get timeline markers for navigation
  fastify.get<{
    Params: z.infer<typeof ReplayParamsSchema>
  }>('/replay/:sessionKey/timeline', {
    schema: {
      params: ReplayParamsSchema
    }
  }, async (request, reply) => {
    try {
      const { sessionKey } = request.params;
      
      const session = await fastify.db.getSession(sessionKey);
      if (!session) {
        reply.code(404);
        return { error: 'Session not found' };
      }

      const timeRange = await fastify.db.getTimeRange(sessionKey);
      if (!timeRange) {
        reply.code(404);
        return { error: 'No data found for session' };
      }

      // Get key events for timeline markers
      const raceControlEvents = await fastify.db.getRecordedData(
        sessionKey,
        timeRange.start,
        timeRange.end,
        'race_control',
        100, // Limit to important events
        0
      );

      const lapEvents = await fastify.db.getRecordedData(
        sessionKey,
        timeRange.start,
        timeRange.end,
        'lap',
        50, // Sample of lap events
        0
      );

      const pitEvents = await fastify.db.getRecordedData(
        sessionKey,
        timeRange.start,
        timeRange.end,
        'pit',
        100,
        0
      );

      // Create timeline markers
      const markers = [
        ...raceControlEvents.map(event => ({
          timestamp: event.timestamp_ms,
          type: 'race_control' as const,
          category: event.data.category,
          message: event.data.message,
          flag: event.data.flag
        })),
        ...pitEvents.map(event => ({
          timestamp: event.timestamp_ms,
          type: 'pit' as const,
          driver_number: event.data.driver_number,
          duration: event.data.pit_duration
        })),
        ...lapEvents.filter((_, i) => i % 5 === 0).map(event => ({ // Sample every 5th lap
          timestamp: event.timestamp_ms,
          type: 'lap' as const,
          driver_number: event.data.driver_number,
          lap_number: event.data.lap_number,
          lap_time: event.data.lap_time
        }))
      ].sort((a, b) => a.timestamp - b.timestamp);

      return {
        session_key: sessionKey,
        time_range: timeRange,
        markers,
        total_duration: timeRange.end - timeRange.start
      };
    } catch (error) {
      fastify.log.error('Failed to get timeline:', error);
      reply.code(500);
      return {
        error: 'Failed to retrieve timeline data',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // POST /api/replay/:sessionKey/playback - Control playback
  fastify.post<{
    Params: z.infer<typeof ReplayParamsSchema>,
    Body: z.infer<typeof PlaybackCommandSchema>
  }>('/replay/:sessionKey/playback', {
    schema: {
      params: ReplayParamsSchema,
      body: PlaybackCommandSchema
    }
  }, async (request, reply) => {
    try {
      const { sessionKey } = request.params;
      const { command, timestamp, speed } = request.body;
      
      const session = await fastify.db.getSession(sessionKey);
      if (!session) {
        reply.code(404);
        return { error: 'Session not found' };
      }

      let result;
      
      switch (command) {
        case 'start':
          result = await fastify.playback.startPlayback(sessionKey);
          break;
          
        case 'pause':
          result = await fastify.playback.pausePlayback(sessionKey);
          break;
          
        case 'stop':
          result = await fastify.playback.stopPlayback(sessionKey);
          break;
          
        case 'seek':
          if (timestamp === undefined) {
            reply.code(400);
            return { error: 'Timestamp required for seek command' };
          }
          result = await fastify.playback.seekTo(sessionKey, timestamp);
          break;
          
        case 'speed':
          if (speed === undefined) {
            reply.code(400);
            return { error: 'Speed required for speed command' };
          }
          result = await fastify.playback.setSpeed(sessionKey, speed);
          break;
          
        default:
          reply.code(400);
          return { error: 'Invalid playback command' };
      }

      return {
        success: true,
        session_key: sessionKey,
        command,
        state: result
      };
    } catch (error) {
      fastify.log.error('Failed to control playback:', error);
      reply.code(500);
      return {
        error: 'Failed to control playback',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // GET /api/replay/:sessionKey/state - Get current playback state
  fastify.get<{
    Params: z.infer<typeof ReplayParamsSchema>
  }>('/replay/:sessionKey/state', {
    schema: {
      params: ReplayParamsSchema
    }
  }, async (request, reply) => {
    try {
      const { sessionKey } = request.params;
      
      const session = await fastify.db.getSession(sessionKey);
      if (!session) {
        reply.code(404);
        return { error: 'Session not found' };
      }

      const state = fastify.playback.getPlaybackState(sessionKey);
      const timeRange = await fastify.db.getTimeRange(sessionKey);

      return {
        session_key: sessionKey,
        playback_state: state,
        time_range: timeRange,
        is_active: !!state
      };
    } catch (error) {
      fastify.log.error('Failed to get playback state:', error);
      reply.code(500);
      return {
        error: 'Failed to retrieve playback state',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });
}