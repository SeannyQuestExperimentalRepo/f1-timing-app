import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { DatabaseClient } from './db/client.js';
import { WebSocketHub } from './ws/hub.js';
import { RecordingService } from './services/recording.js';
import { PlaybackService } from './services/playback.js';
import { CacheService } from './services/cache.js';

// Route imports
import healthRoutes from './routes/health.js';
import sessionsRoutes from './routes/sessions.js';
import telemetryRoutes from './routes/telemetry.js';
import replayRoutes from './routes/replay.js';

const HOST = process.env.HOST || '0.0.0.0';
const PORT = parseInt(process.env.PORT || '3001');

async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'info'
    }
  });

  // Register CORS
  await fastify.register(cors, {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://f1-timing.app'] // Add your production domain
      : true, // Allow all origins in development
    credentials: true
  });

  // Register WebSocket support
  await fastify.register(websocket);

  // Initialize core services
  const db = new DatabaseClient();
  const wsHub = new WebSocketHub();
  const cache = new CacheService();
  const recording = new RecordingService(db, wsHub, cache);
  const playback = new PlaybackService(db, wsHub);

  // Store services in Fastify context for route access
  fastify.decorate('db', db);
  fastify.decorate('wsHub', wsHub);
  fastify.decorate('recording', recording);
  fastify.decorate('playback', playback);
  fastify.decorate('cache', cache);

  // Register routes
  await fastify.register(healthRoutes, { prefix: '/api' });
  await fastify.register(sessionsRoutes, { prefix: '/api' });
  await fastify.register(telemetryRoutes, { prefix: '/api' });
  await fastify.register(replayRoutes, { prefix: '/api' });

  // WebSocket route for real-time data
  fastify.register(async function (fastify) {
    fastify.get('/ws', { websocket: true }, (connection, request) => {
      wsHub.addConnection(connection, request);
      
      connection.on('close', () => {
        wsHub.removeConnection(connection);
      });
    });
  });

  // Root health check
  fastify.get('/', async () => {
    return { 
      name: 'F1 Timing API',
      version: '1.0.0',
      status: 'online',
      timestamp: new Date().toISOString()
    };
  });

  // Graceful shutdown handling
  const gracefulShutdown = async (signal: string) => {
    fastify.log.info(`Received ${signal}, shutting down gracefully...`);
    
    try {
      // Close WebSocket connections
      wsHub.closeAll();
      
      // Stop services
      recording.stop();
      playback.stopAll();
      
      // Close database
      db.close();
      
      // Close Fastify server
      await fastify.close();
      
      process.exit(0);
    } catch (error) {
      fastify.log.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  return fastify;
}

async function start() {
  try {
    const server = await buildServer();
    
    await server.listen({ 
      host: HOST, 
      port: PORT 
    });
    
    console.log(`🏁 F1 Timing Server running on http://${HOST}:${PORT}`);
    console.log(`📊 WebSocket endpoint: ws://${HOST}:${PORT}/ws`);
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}

export { buildServer };

// Extend Fastify type definitions
declare module 'fastify' {
  interface FastifyInstance {
    db: DatabaseClient;
    wsHub: WebSocketHub;
    recording: RecordingService;
    playback: PlaybackService;
    cache: CacheService;
  }
}