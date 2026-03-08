import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildServer } from '../src/index.js';
import type { FastifyInstance } from 'fastify';
import { unlink } from 'fs/promises';

describe('Sessions API', () => {
  let app: FastifyInstance;
  const testDbPath = './test-sessions.db';

  beforeEach(async () => {
    process.env.DATABASE_PATH = testDbPath;
    app = await buildServer();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    try {
      await unlink(testDbPath);
    } catch {
      // File might not exist
    }
  });

  describe('GET /api/sessions', () => {
    it('should return empty list when no sessions exist', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/sessions'
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.sessions).toEqual([]);
      expect(data.pagination).toMatchObject({
        limit: 20,
        offset: 0,
        has_more: false
      });
    });

    it('should return sessions with pagination', async () => {
      // Create test sessions
      await app.inject({
        method: 'POST',
        url: '/api/sessions',
        payload: {
          session_key: 'test_session_1',
          name: '2025 Bahrain GP - Practice 1',
          circuit: 'Bahrain International Circuit'
        }
      });

      await app.inject({
        method: 'POST',
        url: '/api/sessions',
        payload: {
          session_key: 'test_session_2', 
          name: '2025 Bahrain GP - Qualifying',
          circuit: 'Bahrain International Circuit'
        }
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/sessions?limit=1'
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.sessions).toHaveLength(1);
      expect(data.pagination.has_more).toBe(true);
    });
  });

  describe('POST /api/sessions', () => {
    it('should create a new session', async () => {
      const sessionData = {
        session_key: 'test_session_create',
        name: '2025 Bahrain GP - Race',
        circuit: 'Bahrain International Circuit',
        status: 'recording'
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/sessions',
        payload: sessionData
      });

      expect(response.statusCode).toBe(201);
      const data = response.json();
      expect(data.success).toBe(true);
      expect(data.session_key).toBe(sessionData.session_key);
    });

    it('should reject session with missing required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/sessions',
        payload: {
          session_key: 'test_incomplete'
          // Missing name and circuit
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/sessions/:key', () => {
    it('should return session details', async () => {
      const sessionKey = 'test_session_details';
      
      // Create session first
      await app.inject({
        method: 'POST',
        url: '/api/sessions',
        payload: {
          session_key: sessionKey,
          name: '2025 Bahrain GP - Race',
          circuit: 'Bahrain International Circuit'
        }
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/sessions/${sessionKey}`
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.session).toMatchObject({
        session_key: sessionKey,
        name: '2025 Bahrain GP - Race',
        circuit: 'Bahrain International Circuit',
        status: 'recording'
      });
      expect(data.time_range).toBeNull(); // No data yet
      expect(data.latest_data).toEqual([]);
    });

    it('should return 404 for non-existent session', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/sessions/non_existent'
      });

      expect(response.statusCode).toBe(404);
      const data = response.json();
      expect(data.error).toBe('Session not found');
    });
  });

  describe('PUT /api/sessions/:key/status', () => {
    it('should update session status', async () => {
      const sessionKey = 'test_session_status';
      
      // Create session first
      await app.inject({
        method: 'POST',
        url: '/api/sessions',
        payload: {
          session_key: sessionKey,
          name: '2025 Bahrain GP - Race',
          circuit: 'Bahrain International Circuit'
        }
      });

      const response = await app.inject({
        method: 'PUT',
        url: `/api/sessions/${sessionKey}/status`,
        payload: {
          status: 'completed',
          end_time: new Date().toISOString()
        }
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.success).toBe(true);
      expect(data.status).toBe('completed');

      // Verify the update
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/sessions/${sessionKey}`
      });
      
      const sessionData = getResponse.json();
      expect(sessionData.session.status).toBe('completed');
      expect(sessionData.session.end_time).toBeDefined();
    });

    it('should return 404 for non-existent session', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/sessions/non_existent/status',
        payload: {
          status: 'completed'
        }
      });

      expect(response.statusCode).toBe(404);
    });
  });
});