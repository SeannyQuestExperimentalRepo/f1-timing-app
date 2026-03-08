import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseClient } from '../src/db/client.js';
import { RecordingService } from '../src/services/recording.js';
import { CacheService } from '../src/services/cache.js';
import { WebSocketHub } from '../src/ws/hub.js';
import { unlink } from 'fs/promises';

describe('RecordingService', () => {
  let db: DatabaseClient;
  let recording: RecordingService;
  let cache: CacheService;
  let wsHub: WebSocketHub;
  const testDbPath = './test-recording.db';

  beforeEach(async () => {
    db = new DatabaseClient(testDbPath);
    wsHub = new WebSocketHub();
    cache = new CacheService();
    recording = new RecordingService(db, wsHub, cache, 10, 1000); // Small batch size and quick flush for testing
  });

  afterEach(async () => {
    recording.stop();
    cache.stop();
    wsHub.closeAll();
    db.close();
    
    try {
      await unlink(testDbPath);
    } catch {
      // File might not exist
    }
  });

  describe('Session Recording', () => {
    it('should start and stop recording for a session', async () => {
      const sessionKey = 'test_recording_session';
      
      // Start recording
      await recording.startRecording({ sessionKey });
      
      expect(recording.isRecording(sessionKey)).toBe(true);
      expect(recording.getActiveRecordings()).toContain(sessionKey);

      // Verify session was created
      const session = await db.getSession(sessionKey);
      expect(session).toBeDefined();
      expect(session?.status).toBe('recording');

      // Stop recording
      await recording.stopRecording(sessionKey);
      
      expect(recording.isRecording(sessionKey)).toBe(false);

      // Verify session status updated
      const updatedSession = await db.getSession(sessionKey);
      expect(updatedSession?.status).toBe('completed');
    });

    it('should handle multiple concurrent recordings', async () => {
      const session1 = 'test_session_1';
      const session2 = 'test_session_2';
      
      await recording.startRecording({ sessionKey: session1 });
      await recording.startRecording({ sessionKey: session2 });
      
      expect(recording.getActiveRecordings()).toHaveLength(2);
      expect(recording.isRecording(session1)).toBe(true);
      expect(recording.isRecording(session2)).toBe(true);
      
      await recording.stopAllRecordings();
      
      expect(recording.getActiveRecordings()).toHaveLength(0);
    });
  });

  describe('Data Recording', () => {
    it('should record individual data points', async () => {
      const sessionKey = 'test_data_recording';
      await recording.startRecording({ sessionKey });

      const testCarData = {
        driver_number: 44,
        speed: 280.5,
        rpm: 11500,
        throttle: 95,
        brake: 0,
        gear: 7,
        drs: 1
      };

      await recording.recordDataPoint(sessionKey, 'car_data', testCarData);
      
      // Allow time for batch flush
      await new Promise(resolve => setTimeout(resolve, 1200));

      const recordedData = await db.getRecordedData(sessionKey, 0, Date.now(), 'car_data', 10, 0);
      
      expect(recordedData).toHaveLength(1);
      expect(recordedData[0].data).toMatchObject(testCarData);
      expect(recordedData[0].channel).toBe('car_data');

      // Verify cache was updated
      const cachedData = cache.getLatestData(sessionKey, 'car_data', 44);
      expect(cachedData).toMatchObject(testCarData);
    });

    it('should record batch data efficiently', async () => {
      const sessionKey = 'test_batch_recording';
      await recording.startRecording({ sessionKey });

      const batchData = [
        { channel: 'car_data' as const, data: { driver_number: 1, speed: 290 }},
        { channel: 'car_data' as const, data: { driver_number: 44, speed: 285 }},
        { channel: 'position' as const, data: { driver_number: 1, position: 1 }},
        { channel: 'position' as const, data: { driver_number: 44, position: 2 }}
      ];

      await recording.recordDataBatch(sessionKey, batchData);
      
      // Allow time for batch flush
      await new Promise(resolve => setTimeout(resolve, 1200));

      const carDataRecords = await db.getRecordedData(sessionKey, 0, Date.now(), 'car_data', 10, 0);
      const positionRecords = await db.getRecordedData(sessionKey, 0, Date.now(), 'position', 10, 0);
      
      expect(carDataRecords).toHaveLength(2);
      expect(positionRecords).toHaveLength(2);

      // Verify cache has latest data for both drivers
      expect(cache.getLatestData(sessionKey, 'car_data', 1)?.speed).toBe(290);
      expect(cache.getLatestData(sessionKey, 'car_data', 44)?.speed).toBe(285);
    });

    it('should handle external data from pipeline', async () => {
      const sessionKey = 'test_external_data';
      
      const locationData = [
        { driver_number: 1, x: 100.5, y: 200.3, z: 0 },
        { driver_number: 44, x: 105.2, y: 201.1, z: 0 }
      ];

      await recording.handleExternalData(sessionKey, 'location', locationData);
      
      // Recording should auto-start for new session
      expect(recording.isRecording(sessionKey)).toBe(true);
      
      // Allow time for batch flush
      await new Promise(resolve => setTimeout(resolve, 1200));

      const recordedData = await db.getRecordedData(sessionKey, 0, Date.now(), 'location', 10, 0);
      expect(recordedData).toHaveLength(2);
    });
  });

  describe('Specialized Data Handlers', () => {
    it('should handle different data types correctly', async () => {
      const sessionKey = 'test_specialized_handlers';

      const carData = [{ driver_number: 1, speed: 300, rpm: 12000 }];
      const lapData = [{ driver_number: 1, lap_number: 1, lap_time: 85.432 }];
      const weatherData = [{ air_temperature: 35, track_temperature: 45, humidity: 60 }];

      await recording.recordCarData(sessionKey, carData);
      await recording.recordLap(sessionKey, lapData);
      await recording.recordWeather(sessionKey, weatherData);

      // Allow time for batch flush
      await new Promise(resolve => setTimeout(resolve, 1200));

      const carRecords = await db.getRecordedData(sessionKey, 0, Date.now(), 'car_data', 10, 0);
      const lapRecords = await db.getRecordedData(sessionKey, 0, Date.now(), 'lap', 10, 0);
      const weatherRecords = await db.getRecordedData(sessionKey, 0, Date.now(), 'weather', 10, 0);

      expect(carRecords).toHaveLength(1);
      expect(lapRecords).toHaveLength(1);
      expect(weatherRecords).toHaveLength(1);

      expect(carRecords[0].data.speed).toBe(300);
      expect(lapRecords[0].data.lap_time).toBe(85.432);
      expect(weatherRecords[0].data.air_temperature).toBe(35);
    });
  });

  describe('Pipeline Message Handling', () => {
    it('should handle WebSocket messages from data pipeline', async () => {
      const pipelineMessage = {
        session_key: 'test_pipeline_msg',
        channel: 'race_control' as const,
        data: {
          category: 'Flag',
          flag: 'YELLOW',
          message: 'Track clear in sector 2',
          lap_number: 15
        },
        timestamp: Date.now()
      };

      await recording.handlePipelineData(pipelineMessage);

      expect(recording.isRecording(pipelineMessage.session_key)).toBe(true);

      // Allow time for batch flush
      await new Promise(resolve => setTimeout(resolve, 1200));

      const recordedData = await db.getRecordedData(
        pipelineMessage.session_key, 
        0, 
        Date.now(), 
        'race_control', 
        10, 
        0
      );

      expect(recordedData).toHaveLength(1);
      expect(recordedData[0].data.flag).toBe('YELLOW');
    });
  });

  describe('Statistics and Monitoring', () => {
    it('should provide recording statistics', async () => {
      const sessionKey = 'test_stats';
      await recording.startRecording({ sessionKey });

      const stats = recording.getStats();
      expect(stats[sessionKey]).toBeDefined();
      expect(stats[sessionKey].active).toBe(true);
      expect(stats[sessionKey].pending_batch_size).toBe(0);

      // Add some data to pending batch
      await recording.recordDataPoint(sessionKey, 'car_data', { driver_number: 1, speed: 250 });
      
      const updatedStats = recording.getStats();
      expect(updatedStats[sessionKey].pending_batch_size).toBe(1);
    });
  });
});