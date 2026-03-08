import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import type { DataChannel } from '@f1-timing/shared';

const TelemetryParamsSchema = z.object({
  sessionKey: z.string().min(1)
});

const TelemetryQuerySchema = z.object({
  from: z.coerce.number().min(0).optional(),
  to: z.coerce.number().optional(),
  driver: z.coerce.number().min(1).max(99).optional(),
  limit: z.coerce.number().min(1).max(5000).default(1000),
  offset: z.coerce.number().min(0).default(0)
});

export default async function telemetryRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // GET /api/sessions/:sessionKey/laps - Get lap data for session
  fastify.get<{
    Params: z.infer<typeof TelemetryParamsSchema>,
    Querystring: z.infer<typeof TelemetryQuerySchema>
  }>('/sessions/:sessionKey/laps', {
    schema: {
      params: TelemetryParamsSchema,
      querystring: TelemetryQuerySchema
    }
  }, async (request, reply) => {
    try {
      const { sessionKey } = request.params;
      const { from = 0, to = Date.now(), driver, limit, offset } = request.query;
      
      const session = await fastify.db.getSession(sessionKey);
      if (!session) {
        reply.code(404);
        return { error: 'Session not found' };
      }

      const data = await fastify.db.getRecordedData(
        sessionKey,
        from,
        to,
        'lap',
        limit,
        offset
      );

      // Filter by driver if specified
      const filteredData = driver 
        ? data.filter(item => item.data.driver_number === driver)
        : data;

      return {
        session_key: sessionKey,
        channel: 'lap',
        data: filteredData.map(item => item.data),
        pagination: {
          limit,
          offset,
          returned: filteredData.length,
          has_more: data.length === limit
        },
        time_range: {
          from,
          to
        }
      };
    } catch (error) {
      fastify.log.error('Failed to get lap data:', error);
      reply.code(500);
      return {
        error: 'Failed to retrieve lap data',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // GET /api/sessions/:sessionKey/stints - Get stint data for session
  fastify.get<{
    Params: z.infer<typeof TelemetryParamsSchema>,
    Querystring: z.infer<typeof TelemetryQuerySchema>
  }>('/sessions/:sessionKey/stints', {
    schema: {
      params: TelemetryParamsSchema,
      querystring: TelemetryQuerySchema
    }
  }, async (request, reply) => {
    try {
      const { sessionKey } = request.params;
      const { from = 0, to = Date.now(), driver, limit, offset } = request.query;
      
      const session = await fastify.db.getSession(sessionKey);
      if (!session) {
        reply.code(404);
        return { error: 'Session not found' };
      }

      const data = await fastify.db.getRecordedData(
        sessionKey,
        from,
        to,
        'stint',
        limit,
        offset
      );

      // Filter by driver if specified
      const filteredData = driver 
        ? data.filter(item => item.data.driver_number === driver)
        : data;

      return {
        session_key: sessionKey,
        channel: 'stint',
        data: filteredData.map(item => item.data),
        pagination: {
          limit,
          offset,
          returned: filteredData.length,
          has_more: data.length === limit
        },
        time_range: {
          from,
          to
        }
      };
    } catch (error) {
      fastify.log.error('Failed to get stint data:', error);
      reply.code(500);
      return {
        error: 'Failed to retrieve stint data',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // GET /api/sessions/:sessionKey/race-control - Get race control messages
  fastify.get<{
    Params: z.infer<typeof TelemetryParamsSchema>,
    Querystring: z.infer<typeof TelemetryQuerySchema>
  }>('/sessions/:sessionKey/race-control', {
    schema: {
      params: TelemetryParamsSchema,
      querystring: TelemetryQuerySchema
    }
  }, async (request, reply) => {
    try {
      const { sessionKey } = request.params;
      const { from = 0, to = Date.now(), limit, offset } = request.query;
      
      const session = await fastify.db.getSession(sessionKey);
      if (!session) {
        reply.code(404);
        return { error: 'Session not found' };
      }

      const data = await fastify.db.getRecordedData(
        sessionKey,
        from,
        to,
        'race_control',
        limit,
        offset
      );

      return {
        session_key: sessionKey,
        channel: 'race_control',
        data: data.map(item => item.data),
        pagination: {
          limit,
          offset,
          returned: data.length,
          has_more: data.length === limit
        },
        time_range: {
          from,
          to
        }
      };
    } catch (error) {
      fastify.log.error('Failed to get race control data:', error);
      reply.code(500);
      return {
        error: 'Failed to retrieve race control data',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // GET /api/sessions/:sessionKey/weather - Get weather data
  fastify.get<{
    Params: z.infer<typeof TelemetryParamsSchema>,
    Querystring: z.infer<typeof TelemetryQuerySchema>
  }>('/sessions/:sessionKey/weather', {
    schema: {
      params: TelemetryParamsSchema,
      querystring: TelemetryQuerySchema
    }
  }, async (request, reply) => {
    try {
      const { sessionKey } = request.params;
      const { from = 0, to = Date.now(), limit, offset } = request.query;
      
      const session = await fastify.db.getSession(sessionKey);
      if (!session) {
        reply.code(404);
        return { error: 'Session not found' };
      }

      const data = await fastify.db.getRecordedData(
        sessionKey,
        from,
        to,
        'weather',
        limit,
        offset
      );

      return {
        session_key: sessionKey,
        channel: 'weather',
        data: data.map(item => item.data),
        pagination: {
          limit,
          offset,
          returned: data.length,
          has_more: data.length === limit
        },
        time_range: {
          from,
          to
        }
      };
    } catch (error) {
      fastify.log.error('Failed to get weather data:', error);
      reply.code(500);
      return {
        error: 'Failed to retrieve weather data',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // GET /api/sessions/:sessionKey/car-data - Get car telemetry data
  fastify.get<{
    Params: z.infer<typeof TelemetryParamsSchema>,
    Querystring: z.infer<typeof TelemetryQuerySchema>
  }>('/sessions/:sessionKey/car-data', {
    schema: {
      params: TelemetryParamsSchema,
      querystring: TelemetryQuerySchema
    }
  }, async (request, reply) => {
    try {
      const { sessionKey } = request.params;
      const { from = 0, to = Date.now(), driver, limit, offset } = request.query;
      
      if (!driver) {
        reply.code(400);
        return { error: 'Driver parameter is required for car data' };
      }
      
      const session = await fastify.db.getSession(sessionKey);
      if (!session) {
        reply.code(404);
        return { error: 'Session not found' };
      }

      const data = await fastify.db.getRecordedData(
        sessionKey,
        from,
        to,
        'car_data',
        limit,
        offset
      );

      // Filter by driver
      const filteredData = data.filter(item => item.data.driver_number === driver);

      return {
        session_key: sessionKey,
        channel: 'car_data',
        driver_number: driver,
        data: filteredData.map(item => item.data),
        pagination: {
          limit,
          offset,
          returned: filteredData.length,
          has_more: data.length === limit
        },
        time_range: {
          from,
          to
        }
      };
    } catch (error) {
      fastify.log.error('Failed to get car data:', error);
      reply.code(500);
      return {
        error: 'Failed to retrieve car data',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // GET /api/sessions/:sessionKey/location - Get location data
  fastify.get<{
    Params: z.infer<typeof TelemetryParamsSchema>,
    Querystring: z.infer<typeof TelemetryQuerySchema>
  }>('/sessions/:sessionKey/location', {
    schema: {
      params: TelemetryParamsSchema,
      querystring: TelemetryQuerySchema
    }
  }, async (request, reply) => {
    try {
      const { sessionKey } = request.params;
      const { from = 0, to = Date.now(), driver, limit, offset } = request.query;
      
      const session = await fastify.db.getSession(sessionKey);
      if (!session) {
        reply.code(404);
        return { error: 'Session not found' };
      }

      const data = await fastify.db.getRecordedData(
        sessionKey,
        from,
        to,
        'location',
        limit,
        offset
      );

      // Filter by driver if specified
      const filteredData = driver 
        ? data.filter(item => item.data.driver_number === driver)
        : data;

      return {
        session_key: sessionKey,
        channel: 'location',
        data: filteredData.map(item => item.data),
        pagination: {
          limit,
          offset,
          returned: filteredData.length,
          has_more: data.length === limit
        },
        time_range: {
          from,
          to
        }
      };
    } catch (error) {
      fastify.log.error('Failed to get location data:', error);
      reply.code(500);
      return {
        error: 'Failed to retrieve location data',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });
}