import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export default async function healthRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Basic health check
  fastify.get('/health', async (request, reply) => {
    try {
      // Test database connection
      const sessionCount = await fastify.db.getDataCount('test');
      
      // Test cache service
      const cacheStatus = fastify.cache.getStats();
      
      // Test WebSocket hub
      const wsStatus = fastify.wsHub.getConnectionCount();

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          test_query_result: sessionCount
        },
        cache: {
          active: true,
          stats: cacheStatus
        },
        websocket: {
          active: true,
          connections: wsStatus
        },
        services: {
          recording: 'active',
          playback: 'active'
        }
      };
    } catch (error) {
      reply.code(503);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Detailed status endpoint
  fastify.get('/status', async (request, reply) => {
    try {
      const sessions = await fastify.db.getSessions(5);
      const cacheStats = fastify.cache.getStats();
      
      return {
        server: {
          name: 'F1 Timing API',
          version: '1.0.0',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu_usage: process.cpuUsage()
        },
        database: {
          recent_sessions: sessions.length,
          latest_session: sessions[0] || null
        },
        cache: cacheStats,
        websocket: {
          connections: fastify.wsHub.getConnectionCount(),
          active_subscriptions: fastify.wsHub.getActiveSubscriptions()
        }
      };
    } catch (error) {
      reply.code(500);
      return {
        error: 'Failed to get status',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });
}