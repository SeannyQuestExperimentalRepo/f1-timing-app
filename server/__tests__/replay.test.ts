import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildServer } from '../src/index.js';
import type { FastifyInstance } from 'fastify';
import { unlink } from 'fs/promises';

describe('Replay API', () => {
  let app: FastifyInstance;
  const testDbPath = './test-replay.db';
  const testSessionKey = 'test_replay_session';

  beforeEach(async () => {
    process.env.DATABASE_PATH = testDbPath;
    app = await buildServer();
    await app.ready();

    // Create test session and add some data
    await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: {
        session_key: testSessionKey,
        name: '2025 Test Session - Replay',
        circuit: 'Test Circuit'
      }
    });

    // Add some test data for replay
    const currentTime = Date.now();
    const testData = [
      {
        channel: 'car_data',
        data: { driver_number: 1, speed: 250, rpm: 11000, gear: 6 },
        timestamp: currentTime
      },
      {
        channel: 'car_data',
        data: { driver_number: 44, speed: 245, rpm: 10800, gear: 6 },
        timestamp: currentTime + 1000
      },
      {
        channel: 'position',
        data: { driver_number: 1, position: 1 },
        timestamp: currentTime + 2000
      },
      {
        channel: 'lap',
        data: { driver_number: 1, lap_number: 1, lap_time: 85.432 },
        timestamp: currentTime + 30000
      }
    ];

    // Record data through recording service
    for (const dataPoint of testData) {
      await app.recording.recordDataPoint(
        testSessionKey,
        dataPoint.channel as any,
        dataPoint.data,
        false // Don't forward to live subscribers during setup
      );
    }

    // Force flush to database
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(async () => {
    await app.close();
    try {
      await unlink(testDbPath);
    } catch {
      // File might not exist
    }
  });

  describe('GET /api/replay/:sessionKey/data', () => {
    it('should return recorded data for playback', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/replay/${testSessionKey}/data?limit=10`
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      
      expect(data.session_key).toBe(testSessionKey);
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.pagination).toMatchObject({
        limit: 10,
        offset: 0,
        returned: expect.any(Number),
        has_more: expect.any(Boolean)
      });
      expect(data.time_range).toBeDefined();
    });

    it('should filter data by channel', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/replay/${testSessionKey}/data?channel=car_data&limit=10`
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      
      expect(data.data.every((item: any) => item.channel === 'car_data')).toBe(true);
    });

    it('should filter data by driver', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/replay/${testSessionKey}/data?driver=1&limit=10`
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      
      // All returned data should be for driver 1 (where applicable)
      const driverFilteredData = data.data.filter((item: any) => 
        item.data.driver_number !== undefined
      );
      expect(driverFilteredData.every((item: any) => 
        item.data.driver_number === 1
      )).toBe(true);
    });

    it('should handle time range filtering', async () => {
      const timeRange = await app.db.getTimeRange(testSessionKey);
      expect(timeRange).toBeDefined();

      const midPoint = timeRange!.start + (timeRange!.end - timeRange!.start) / 2;

      const response = await app.inject({
        method: 'GET',
        url: `/api/replay/${testSessionKey}/data?from=${midPoint}&limit=10`
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      
      // All returned data should be from the specified time
      expect(data.data.every((item: any) => 
        item.timestamp_ms >= midPoint
      )).toBe(true);
    });

    it('should return 404 for non-existent session', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/replay/non_existent_session/data'
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().error).toBe('Session not found');
    });
  });

  describe('GET /api/replay/:sessionKey/timeline', () => {
    it('should return timeline markers for navigation', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/replay/${testSessionKey}/timeline`
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      
      expect(data.session_key).toBe(testSessionKey);
      expect(data.time_range).toBeDefined();
      expect(data.time_range.start).toBeDefined();
      expect(data.time_range.end).toBeDefined();
      expect(data.total_duration).toBeDefined();
      expect(Array.isArray(data.markers)).toBe(true);
      
      // Check that markers are sorted by timestamp
      const timestamps = data.markers.map((marker: any) => marker.timestamp);
      const sortedTimestamps = [...timestamps].sort((a, b) => a - b);
      expect(timestamps).toEqual(sortedTimestamps);
    });

    it('should return 404 for session with no data', async () => {
      // Create empty session
      await app.inject({
        method: 'POST',
        url: '/api/sessions',
        payload: {
          session_key: 'empty_session',
          name: 'Empty Test Session',
          circuit: 'Test Circuit'
        }
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/replay/empty_session/timeline'
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().error).toBe('No data found for session');
    });
  });

  describe('POST /api/replay/:sessionKey/playback', () => {
    it('should start playback', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/replay/${testSessionKey}/playback`,
        payload: {
          command: 'start'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      
      expect(data.success).toBe(true);
      expect(data.command).toBe('start');
      expect(data.state).toBeDefined();
      expect(data.state.playing).toBe(true);
    });

    it('should pause playback', async () => {
      // Start playback first
      await app.inject({
        method: 'POST',
        url: `/api/replay/${testSessionKey}/playback`,
        payload: { command: 'start' }
      });

      const response = await app.inject({
        method: 'POST',
        url: `/api/replay/${testSessionKey}/playback`,
        payload: {
          command: 'pause'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      
      expect(data.success).toBe(true);
      expect(data.command).toBe('pause');
      expect(data.state.playing).toBe(false);
    });

    it('should handle seek command', async () => {
      // Start playback first
      await app.inject({
        method: 'POST',
        url: `/api/replay/${testSessionKey}/playback`,
        payload: { command: 'start' }
      });

      const timeRange = await app.db.getTimeRange(testSessionKey);
      const seekTime = timeRange!.start + 5000; // Seek 5 seconds from start

      const response = await app.inject({
        method: 'POST',
        url: `/api/replay/${testSessionKey}/playback`,
        payload: {
          command: 'seek',
          timestamp: seekTime
        }
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      
      expect(data.success).toBe(true);
      expect(data.command).toBe('seek');
      expect(data.state.current_timestamp).toBe(seekTime);
    });

    it('should handle speed changes', async () => {
      // Start playback first
      await app.inject({
        method: 'POST',
        url: `/api/replay/${testSessionKey}/playback`,
        payload: { command: 'start' }
      });

      const response = await app.inject({
        method: 'POST',
        url: `/api/replay/${testSessionKey}/playback`,
        payload: {
          command: 'speed',
          speed: 2
        }
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      
      expect(data.success).toBe(true);
      expect(data.command).toBe('speed');
      expect(data.state.speed).toBe(2);
    });

    it('should return 400 for invalid commands', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/replay/${testSessionKey}/playback`,
        payload: {
          command: 'invalid_command'
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for seek without timestamp', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/replay/${testSessionKey}/playback`,
        payload: {
          command: 'seek'
          // Missing timestamp
        }
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error).toContain('Timestamp required');
    });

    it('should return 400 for speed without speed value', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/replay/${testSessionKey}/playback`,
        payload: {
          command: 'speed'
          // Missing speed
        }
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error).toContain('Speed required');
    });
  });

  describe('GET /api/replay/:sessionKey/state', () => {
    it('should return null state when no playback is active', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/replay/${testSessionKey}/state`
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      
      expect(data.session_key).toBe(testSessionKey);
      expect(data.playback_state).toBeNull();
      expect(data.is_active).toBe(false);
      expect(data.time_range).toBeDefined();
    });

    it('should return current state when playback is active', async () => {
      // Start playback
      await app.inject({
        method: 'POST',
        url: `/api/replay/${testSessionKey}/playback`,
        payload: { command: 'start' }
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/replay/${testSessionKey}/state`
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      
      expect(data.session_key).toBe(testSessionKey);
      expect(data.playback_state).toBeDefined();
      expect(data.playback_state.playing).toBe(true);
      expect(data.is_active).toBe(true);
    });
  });
});