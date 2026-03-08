import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';

const SessionQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  status: z.enum(['recording', 'completed', 'archived']).optional()
});

const SessionKeySchema = z.object({
  key: z.string().min(1)
});

export default async function sessionsRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // GET /api/sessions - List all recorded sessions
  fastify.get('/sessions', {
    schema: {
      querystring: SessionQuerySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            sessions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  session_key: { type: 'string' },
                  name: { type: 'string' },
                  circuit: { type: 'string' },
                  start_time: { type: 'string' },
                  end_time: { type: ['string', 'null'] },
                  status: { type: 'string' },
                  total_data_points: { type: 'number' },
                  duration_ms: { type: ['number', 'null'] },
                  channel_count: { type: 'number' }
                }
              }
            },
            pagination: {
              type: 'object',
              properties: {
                limit: { type: 'number' },
                offset: { type: 'number' },
                total: { type: 'number' },
                has_more: { type: 'boolean' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { limit, offset, status } = request.query as z.infer<typeof SessionQuerySchema>;
      
      const sessions = await fastify.db.getSessions(limit + 1, offset); // Get one extra to check if there are more
      const hasMore = sessions.length > limit;
      
      if (hasMore) {
        sessions.pop(); // Remove the extra session
      }

      // Filter by status if specified
      const filteredSessions = status 
        ? sessions.filter(session => session.status === status)
        : sessions;

      return {
        sessions: filteredSessions,
        pagination: {
          limit,
          offset,
          total: filteredSessions.length, // In a real app, you'd get total count separately
          has_more: hasMore
        }
      };
    } catch (error) {
      fastify.log.error('Failed to get sessions:', error);
      reply.code(500);
      return {
        error: 'Failed to retrieve sessions',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // GET /api/sessions/:key - Get specific session details
  fastify.get<{
    Params: z.infer<typeof SessionKeySchema>
  }>('/sessions/:key', {
    schema: {
      params: SessionKeySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            session: {
              type: 'object',
              properties: {
                session_key: { type: 'string' },
                name: { type: 'string' },
                circuit: { type: 'string' },
                start_time: { type: 'string' },
                end_time: { type: ['string', 'null'] },
                status: { type: 'string' },
                total_data_points: { type: 'number' },
                duration_ms: { type: ['number', 'null'] },
                channel_count: { type: 'number' },
                first_data_timestamp: { type: ['number', 'null'] },
                last_data_timestamp: { type: ['number', 'null'] }
              }
            },
            time_range: {
              type: ['object', 'null'],
              properties: {
                start: { type: 'number' },
                end: { type: 'number' },
                duration: { type: 'number' }
              }
            },
            latest_data: {
              type: 'array'
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
      const { key } = request.params;
      
      const session = await fastify.db.getSessionSummary(key);
      if (!session) {
        reply.code(404);
        return { error: 'Session not found' };
      }

      const timeRange = await fastify.db.getTimeRange(key);
      const latestData = await fastify.db.getLatestData(key);

      return {
        session,
        time_range: timeRange ? {
          start: timeRange.start,
          end: timeRange.end,
          duration: timeRange.end - timeRange.start
        } : null,
        latest_data: latestData
      };
    } catch (error) {
      fastify.log.error('Failed to get session:', error);
      reply.code(500);
      return {
        error: 'Failed to retrieve session',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // POST /api/sessions - Create a new session (for testing)
  fastify.post('/sessions', {
    schema: {
      body: {
        type: 'object',
        required: ['session_key', 'name', 'circuit'],
        properties: {
          session_key: { type: 'string' },
          name: { type: 'string' },
          circuit: { type: 'string' },
          start_time: { type: 'string' },
          status: { type: 'string', enum: ['recording', 'completed', 'archived'] }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const sessionData = request.body as any;
      
      await fastify.db.createSession({
        session_key: sessionData.session_key,
        name: sessionData.name,
        circuit: sessionData.circuit,
        start_time: sessionData.start_time || new Date().toISOString(),
        status: sessionData.status || 'recording'
      });

      reply.code(201);
      return {
        success: true,
        session_key: sessionData.session_key
      };
    } catch (error) {
      fastify.log.error('Failed to create session:', error);
      reply.code(500);
      return {
        error: 'Failed to create session',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // PUT /api/sessions/:key/status - Update session status
  fastify.put<{
    Params: z.infer<typeof SessionKeySchema>
  }>('/sessions/:key/status', {
    schema: {
      params: SessionKeySchema,
      body: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['recording', 'completed', 'archived'] },
          end_time: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { key } = request.params;
      const { status, end_time } = request.body as any;
      
      const session = await fastify.db.getSession(key);
      if (!session) {
        reply.code(404);
        return { error: 'Session not found' };
      }

      await fastify.db.updateSession(key, {
        status,
        end_time: end_time || (status === 'completed' ? new Date().toISOString() : undefined)
      });

      return {
        success: true,
        session_key: key,
        status
      };
    } catch (error) {
      fastify.log.error('Failed to update session status:', error);
      reply.code(500);
      return {
        error: 'Failed to update session status',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });
}