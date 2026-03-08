import type { PlaybackState, DataChannel, PLAYBACK_SPEEDS } from '@f1-timing/shared';
import type { DatabaseClient } from '../db/client.js';
import type { WebSocketHub } from '../ws/hub.js';
import { ChannelRouter } from '../ws/channels.js';

type PlaybackSpeed = typeof PLAYBACK_SPEEDS[number];

interface PlaybackSession {
  sessionKey: string;
  state: PlaybackState;
  timeRange: { start: number; end: number };
  playbackTimer: NodeJS.Timeout | null;
  lastUpdateTime: number;
  dataBuffer: Array<{ timestamp: number; channel: DataChannel; data: any }>;
  bufferPosition: number;
  subscribers: Set<string>;
}

export class PlaybackService {
  private channelRouter: ChannelRouter;
  private activeSessions = new Map<string, PlaybackSession>();
  private readonly BUFFER_SIZE = 1000;
  private readonly UPDATE_INTERVAL = 100; // 100ms for smooth playback

  constructor(
    private db: DatabaseClient,
    private wsHub: WebSocketHub
  ) {
    this.channelRouter = new ChannelRouter(wsHub);
  }

  // Start playback for a session
  async startPlayback(sessionKey: string, fromTimestamp?: number): Promise<PlaybackState> {
    let session = this.activeSessions.get(sessionKey);
    
    if (session) {
      // Resume existing session
      session.state.playing = true;
      session.lastUpdateTime = Date.now();
      this.scheduleNextUpdate(session);
    } else {
      // Create new playback session
      const timeRange = await this.db.getTimeRange(sessionKey);
      if (!timeRange) {
        throw new Error(`No data found for session ${sessionKey}`);
      }

      const startTime = fromTimestamp || timeRange.start;
      
      session = {
        sessionKey,
        state: {
          playing: true,
          speed: 1,
          current_timestamp: startTime,
          total_duration: timeRange.end - timeRange.start,
          session_key: sessionKey
        },
        timeRange,
        playbackTimer: null,
        lastUpdateTime: Date.now(),
        dataBuffer: [],
        bufferPosition: 0,
        subscribers: new Set()
      };

      this.activeSessions.set(sessionKey, session);
      
      // Load initial data buffer
      await this.loadDataBuffer(session);
    }

    this.scheduleNextUpdate(session);
    this.broadcastPlaybackState(session);
    
    return session.state;
  }

  // Pause playback
  async pausePlayback(sessionKey: string): Promise<PlaybackState> {
    const session = this.activeSessions.get(sessionKey);
    if (!session) {
      throw new Error(`No active playback session for ${sessionKey}`);
    }

    session.state.playing = false;
    this.clearUpdateTimer(session);
    this.broadcastPlaybackState(session);
    
    return session.state;
  }

  // Stop playback
  async stopPlayback(sessionKey: string): Promise<PlaybackState> {
    const session = this.activeSessions.get(sessionKey);
    if (!session) {
      throw new Error(`No active playback session for ${sessionKey}`);
    }

    session.state.playing = false;
    session.state.current_timestamp = session.timeRange.start;
    session.bufferPosition = 0;
    
    this.clearUpdateTimer(session);
    this.broadcastPlaybackState(session);
    
    return session.state;
  }

  // Seek to specific timestamp
  async seekTo(sessionKey: string, timestamp: number): Promise<PlaybackState> {
    const session = this.activeSessions.get(sessionKey);
    if (!session) {
      throw new Error(`No active playback session for ${sessionKey}`);
    }

    // Validate timestamp
    if (timestamp < session.timeRange.start || timestamp > session.timeRange.end) {
      throw new Error(`Timestamp ${timestamp} is outside session range`);
    }

    const wasPlaying = session.state.playing;
    
    // Pause during seek
    session.state.playing = false;
    this.clearUpdateTimer(session);
    
    // Update timestamp
    session.state.current_timestamp = timestamp;
    session.lastUpdateTime = Date.now();
    
    // Reload buffer from new position
    session.dataBuffer = [];
    session.bufferPosition = 0;
    await this.loadDataBuffer(session);
    
    // Resume if was playing
    if (wasPlaying) {
      session.state.playing = true;
      this.scheduleNextUpdate(session);
    }

    this.broadcastPlaybackState(session);
    
    return session.state;
  }

  // Set playback speed
  async setSpeed(sessionKey: string, speed: PlaybackSpeed): Promise<PlaybackState> {
    const session = this.activeSessions.get(sessionKey);
    if (!session) {
      throw new Error(`No active playback session for ${sessionKey}`);
    }

    session.state.speed = speed;
    session.lastUpdateTime = Date.now();
    
    // Reschedule updates if playing
    if (session.state.playing) {
      this.clearUpdateTimer(session);
      this.scheduleNextUpdate(session);
    }

    this.broadcastPlaybackState(session);
    
    return session.state;
  }

  // Get current playback state
  getPlaybackState(sessionKey: string): PlaybackState | null {
    const session = this.activeSessions.get(sessionKey);
    return session ? session.state : null;
  }

  // Get all active sessions
  getActiveSessions(): string[] {
    return Array.from(this.activeSessions.keys());
  }

  // Stop all playback sessions
  stopAll(): void {
    for (const sessionKey of this.activeSessions.keys()) {
      this.stopPlayback(sessionKey);
    }
    this.activeSessions.clear();
  }

  // Load data into buffer for smooth playback
  private async loadDataBuffer(session: PlaybackSession): Promise<void> {
    const { sessionKey, state, timeRange } = session;
    
    try {
      const data = await this.db.getRecordedData(
        sessionKey,
        state.current_timestamp,
        Math.min(state.current_timestamp + (60 * 1000 * state.speed), timeRange.end), // 60 seconds ahead
        null, // all channels
        this.BUFFER_SIZE,
        0
      );

      session.dataBuffer = data.map(item => ({
        timestamp: item.timestamp_ms,
        channel: item.channel,
        data: item.data
      })).sort((a, b) => a.timestamp - b.timestamp);

      console.log(`📖 Loaded ${session.dataBuffer.length} data points into buffer for ${sessionKey}`);
    } catch (error) {
      console.error(`Failed to load data buffer for ${sessionKey}:`, error);
    }
  }

  // Schedule next playback update
  private scheduleNextUpdate(session: PlaybackSession): void {
    if (!session.state.playing) return;

    session.playbackTimer = setTimeout(() => {
      this.processPlaybackUpdate(session);
    }, this.UPDATE_INTERVAL);
  }

  // Process playback update
  private async processPlaybackUpdate(session: PlaybackSession): Promise<void> {
    if (!session.state.playing) return;

    const now = Date.now();
    const timeDelta = (now - session.lastUpdateTime) * session.state.speed;
    const newTimestamp = session.state.current_timestamp + timeDelta;
    
    // Check if we've reached the end
    if (newTimestamp >= session.timeRange.end) {
      session.state.playing = false;
      session.state.current_timestamp = session.timeRange.end;
      this.broadcastPlaybackState(session);
      return;
    }

    // Update current timestamp
    session.state.current_timestamp = newTimestamp;
    session.lastUpdateTime = now;

    // Send data points that should be played at this timestamp
    const dataToSend = [];
    
    while (session.bufferPosition < session.dataBuffer.length) {
      const dataPoint = session.dataBuffer[session.bufferPosition];
      
      if (dataPoint.timestamp <= newTimestamp) {
        dataToSend.push(dataPoint);
        session.bufferPosition++;
      } else {
        break;
      }
    }

    // Send data to subscribers
    for (const dataPoint of dataToSend) {
      this.channelRouter.routePlaybackData(
        session.sessionKey,
        dataPoint.channel,
        dataPoint.data,
        dataPoint.timestamp
      );
    }

    // Reload buffer if we're running low
    if (session.bufferPosition >= session.dataBuffer.length * 0.8) {
      await this.loadDataBuffer(session);
      session.bufferPosition = 0;
    }

    // Broadcast state update periodically
    if (Math.random() < 0.1) { // 10% chance each update
      this.broadcastPlaybackState(session);
    }

    // Schedule next update
    this.scheduleNextUpdate(session);
  }

  // Clear update timer
  private clearUpdateTimer(session: PlaybackSession): void {
    if (session.playbackTimer) {
      clearTimeout(session.playbackTimer);
      session.playbackTimer = null;
    }
  }

  // Broadcast playback state to subscribers
  private broadcastPlaybackState(session: PlaybackSession): void {
    this.channelRouter.broadcastPlaybackState(session.sessionKey, session.state);
  }

  // Add subscriber to playback session
  addSubscriber(sessionKey: string, connectionId: string): void {
    const session = this.activeSessions.get(sessionKey);
    if (session) {
      session.subscribers.add(connectionId);
    }
  }

  // Remove subscriber from playback session
  removeSubscriber(sessionKey: string, connectionId: string): void {
    const session = this.activeSessions.get(sessionKey);
    if (session) {
      session.subscribers.delete(connectionId);
      
      // Stop session if no more subscribers
      if (session.subscribers.size === 0) {
        console.log(`🗑️ No more subscribers for playback session ${sessionKey}, stopping...`);
        this.stopPlayback(sessionKey);
        this.activeSessions.delete(sessionKey);
      }
    }
  }

  // Get playback statistics
  getStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [sessionKey, session] of this.activeSessions.entries()) {
      const progressPercent = session.timeRange.start === session.timeRange.end 
        ? 100 
        : ((session.state.current_timestamp - session.timeRange.start) / 
           (session.timeRange.end - session.timeRange.start)) * 100;

      stats[sessionKey] = {
        playing: session.state.playing,
        speed: session.state.speed,
        progress_percent: Math.round(progressPercent * 100) / 100,
        current_timestamp: session.state.current_timestamp,
        buffer_size: session.dataBuffer.length,
        buffer_position: session.bufferPosition,
        subscribers: session.subscribers.size
      };
    }
    
    return stats;
  }
}