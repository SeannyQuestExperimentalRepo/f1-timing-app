import type { DataChannel, RecordedData } from '@f1-timing/shared';
import type { DatabaseClient } from '../db/client.js';
import type { WebSocketHub } from '../ws/hub.js';
import type { CacheService } from './cache.js';
import { ChannelRouter } from '../ws/channels.js';

export interface RecordingOptions {
  sessionKey: string;
  autoCreateSession?: boolean;
  enableLiveForwarding?: boolean;
  batchSize?: number;
  flushInterval?: number;
}

export class RecordingService {
  private channelRouter: ChannelRouter;
  private recordingBatches = new Map<string, Array<Omit<RecordedData, 'id' | 'created_at'>>>();
  private flushIntervals = new Map<string, NodeJS.Timeout>();
  private activeRecordings = new Set<string>();

  constructor(
    private db: DatabaseClient,
    private wsHub: WebSocketHub,
    private cache: CacheService,
    private defaultBatchSize = 100,
    private defaultFlushInterval = 5000 // 5 seconds
  ) {
    this.channelRouter = new ChannelRouter(wsHub);
  }

  // Start recording for a session
  async startRecording(options: RecordingOptions): Promise<void> {
    const { sessionKey, autoCreateSession = true, enableLiveForwarding = true, batchSize = this.defaultBatchSize } = options;

    if (this.activeRecordings.has(sessionKey)) {
      throw new Error(`Recording already active for session ${sessionKey}`);
    }

    // Auto-create session if needed
    if (autoCreateSession) {
      const existingSession = await this.db.getSession(sessionKey);
      if (!existingSession) {
        await this.db.createSession({
          session_key: sessionKey,
          name: `Session ${sessionKey}`,
          circuit: 'Unknown',
          start_time: new Date().toISOString(),
          status: 'recording'
        });
      }
    }

    this.activeRecordings.add(sessionKey);
    this.recordingBatches.set(sessionKey, []);

    // Set up periodic flush
    const flushInterval = setInterval(() => {
      this.flushBatch(sessionKey);
    }, options.flushInterval || this.defaultFlushInterval);
    
    this.flushIntervals.set(sessionKey, flushInterval);

    console.log(`🎬 Started recording for session ${sessionKey}`);
  }

  // Stop recording for a session
  async stopRecording(sessionKey: string): Promise<void> {
    if (!this.activeRecordings.has(sessionKey)) {
      return;
    }

    // Flush remaining data
    await this.flushBatch(sessionKey);

    // Clear intervals
    const flushInterval = this.flushIntervals.get(sessionKey);
    if (flushInterval) {
      clearInterval(flushInterval);
      this.flushIntervals.delete(sessionKey);
    }

    // Clean up
    this.activeRecordings.delete(sessionKey);
    this.recordingBatches.delete(sessionKey);

    // Update session status
    await this.db.updateSession(sessionKey, {
      status: 'completed',
      end_time: new Date().toISOString()
    });

    console.log(`🏁 Stopped recording for session ${sessionKey}`);
  }

  // Record a single data point
  async recordDataPoint(
    sessionKey: string,
    channel: DataChannel,
    data: any,
    enableLiveForwarding = true
  ): Promise<void> {
    if (!this.activeRecordings.has(sessionKey)) {
      await this.startRecording({ sessionKey });
    }

    const timestamp = Date.now();
    
    // Add to batch
    const batch = this.recordingBatches.get(sessionKey);
    if (batch) {
      batch.push({
        session_key: sessionKey,
        timestamp_ms: timestamp,
        channel,
        data
      });

      // Flush if batch is full
      if (batch.length >= this.defaultBatchSize) {
        await this.flushBatch(sessionKey);
      }
    }

    // Update cache
    this.cache.updateLatestData(sessionKey, channel, data, timestamp);

    // Forward to live subscribers if enabled
    if (enableLiveForwarding) {
      this.channelRouter.routeLiveData(sessionKey, channel, data);
    }
  }

  // Record multiple data points at once
  async recordDataBatch(
    sessionKey: string,
    dataPoints: Array<{ channel: DataChannel; data: any; timestamp?: number }>
  ): Promise<void> {
    if (!this.activeRecordings.has(sessionKey)) {
      await this.startRecording({ sessionKey });
    }

    const batch = this.recordingBatches.get(sessionKey);
    if (!batch) return;

    const now = Date.now();

    for (const point of dataPoints) {
      const timestamp = point.timestamp || now;
      
      batch.push({
        session_key: sessionKey,
        timestamp_ms: timestamp,
        channel: point.channel,
        data: point.data
      });

      // Update cache
      this.cache.updateLatestData(sessionKey, point.channel, point.data, timestamp);

      // Forward to live subscribers
      this.channelRouter.routeLiveData(sessionKey, point.channel, point.data);
    }

    // Flush if batch is getting large
    if (batch.length >= this.defaultBatchSize * 2) {
      await this.flushBatch(sessionKey);
    }
  }

  // Handle data from external sources (OpenF1 API, pipeline)
  async handleExternalData(
    sessionKey: string,
    channel: DataChannel,
    data: any[] | any,
    sourceTimestamp?: number
  ): Promise<void> {
    const dataArray = Array.isArray(data) ? data : [data];
    
    const dataPoints = dataArray.map(item => ({
      channel,
      data: item,
      timestamp: sourceTimestamp
    }));

    await this.recordDataBatch(sessionKey, dataPoints);
  }

  // Flush batch to database
  private async flushBatch(sessionKey: string): Promise<void> {
    const batch = this.recordingBatches.get(sessionKey);
    if (!batch || batch.length === 0) return;

    try {
      await this.db.recordDataBatch([...batch]);
      
      console.log(`💾 Flushed ${batch.length} data points for session ${sessionKey}`);
      
      // Clear batch
      batch.length = 0;
    } catch (error) {
      console.error(`Failed to flush batch for session ${sessionKey}:`, error);
      // Don't clear the batch on error - retry on next flush
    }
  }

  // WebSocket endpoint for receiving data from pipeline
  async handlePipelineData(message: {
    session_key: string;
    channel: DataChannel;
    data: any;
    timestamp?: number;
  }): Promise<void> {
    const { session_key, channel, data, timestamp } = message;
    
    await this.recordDataPoint(
      session_key,
      channel,
      data,
      true // Enable live forwarding
    );
  }

  // Specialized handlers for different data types
  async recordCarData(sessionKey: string, carData: any[]): Promise<void> {
    await this.handleExternalData(sessionKey, 'car_data', carData);
  }

  async recordLocation(sessionKey: string, locationData: any[]): Promise<void> {
    await this.handleExternalData(sessionKey, 'location', locationData);
  }

  async recordPosition(sessionKey: string, positionData: any[]): Promise<void> {
    await this.handleExternalData(sessionKey, 'position', positionData);
  }

  async recordInterval(sessionKey: string, intervalData: any[]): Promise<void> {
    await this.handleExternalData(sessionKey, 'interval', intervalData);
  }

  async recordLap(sessionKey: string, lapData: any[]): Promise<void> {
    await this.handleExternalData(sessionKey, 'lap', lapData);
  }

  async recordPit(sessionKey: string, pitData: any[]): Promise<void> {
    await this.handleExternalData(sessionKey, 'pit', pitData);
  }

  async recordStint(sessionKey: string, stintData: any[]): Promise<void> {
    await this.handleExternalData(sessionKey, 'stint', stintData);
  }

  async recordWeather(sessionKey: string, weatherData: any[]): Promise<void> {
    await this.handleExternalData(sessionKey, 'weather', weatherData);
  }

  async recordRaceControl(sessionKey: string, raceControlData: any[]): Promise<void> {
    await this.handleExternalData(sessionKey, 'race_control', raceControlData);
  }

  async recordTeamRadio(sessionKey: string, teamRadioData: any[]): Promise<void> {
    await this.handleExternalData(sessionKey, 'team_radio', teamRadioData);
  }

  async recordSession(sessionKey: string, sessionData: any): Promise<void> {
    await this.handleExternalData(sessionKey, 'session', sessionData);
  }

  async recordDrivers(sessionKey: string, driverData: any[]): Promise<void> {
    await this.handleExternalData(sessionKey, 'drivers', driverData);
  }

  // Utility methods
  isRecording(sessionKey: string): boolean {
    return this.activeRecordings.has(sessionKey);
  }

  getActiveRecordings(): string[] {
    return Array.from(this.activeRecordings);
  }

  async stopAllRecordings(): Promise<void> {
    const sessions = Array.from(this.activeRecordings);
    
    for (const sessionKey of sessions) {
      await this.stopRecording(sessionKey);
    }
  }

  stop(): void {
    console.log('🛑 Stopping recording service...');
    
    // Stop all recordings
    this.stopAllRecordings();
    
    // Clear intervals
    for (const interval of this.flushIntervals.values()) {
      clearInterval(interval);
    }
    this.flushIntervals.clear();
  }

  // Get recording statistics
  getStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const sessionKey of this.activeRecordings) {
      const batch = this.recordingBatches.get(sessionKey);
      stats[sessionKey] = {
        active: true,
        pending_batch_size: batch?.length || 0
      };
    }
    
    return stats;
  }
}