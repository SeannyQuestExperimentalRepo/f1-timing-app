import type { DataChannel } from '@f1-timing/shared';

interface CacheEntry {
  sessionKey: string;
  channel: DataChannel;
  driverNumber?: number;
  data: any;
  timestamp: number;
  createdAt: number;
}

interface SessionCache {
  sessionKey: string;
  lastActivity: number;
  channels: Map<string, CacheEntry>; // key: "channel" or "channel:driverNumber"
  drivers: Set<number>;
  latestTimestamp: number;
}

export class CacheService {
  private sessions = new Map<string, SessionCache>();
  private readonly MAX_SESSION_AGE = 24 * 60 * 60 * 1000; // 24 hours
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupTimer();
  }

  // Update latest data for a session/channel
  updateLatestData(
    sessionKey: string,
    channel: DataChannel,
    data: any,
    timestamp: number,
    driverNumber?: number
  ): void {
    let session = this.sessions.get(sessionKey);
    
    if (!session) {
      session = {
        sessionKey,
        lastActivity: Date.now(),
        channels: new Map(),
        drivers: new Set(),
        latestTimestamp: timestamp
      };
      this.sessions.set(sessionKey, session);
    }

    // Update session activity
    session.lastActivity = Date.now();
    session.latestTimestamp = Math.max(session.latestTimestamp, timestamp);

    // Track driver if provided
    if (driverNumber !== undefined) {
      session.drivers.add(driverNumber);
    }

    // Create cache key
    const cacheKey = driverNumber !== undefined 
      ? `${channel}:${driverNumber}`
      : channel;

    // Store cache entry
    const entry: CacheEntry = {
      sessionKey,
      channel,
      driverNumber,
      data,
      timestamp,
      createdAt: Date.now()
    };

    session.channels.set(cacheKey, entry);
  }

  // Get latest data for a channel
  getLatestData(
    sessionKey: string,
    channel: DataChannel,
    driverNumber?: number
  ): any | null {
    const session = this.sessions.get(sessionKey);
    if (!session) return null;

    const cacheKey = driverNumber !== undefined 
      ? `${channel}:${driverNumber}`
      : channel;

    const entry = session.channels.get(cacheKey);
    return entry ? entry.data : null;
  }

  // Get latest data for all drivers in a channel
  getLatestDataForAllDrivers(
    sessionKey: string,
    channel: DataChannel
  ): Record<number, any> {
    const session = this.sessions.get(sessionKey);
    if (!session) return {};

    const result: Record<number, any> = {};
    
    for (const [key, entry] of session.channels.entries()) {
      if (entry.channel === channel && entry.driverNumber !== undefined) {
        result[entry.driverNumber] = entry.data;
      }
    }

    return result;
  }

  // Get all latest data for a session
  getAllLatestData(sessionKey: string): Record<string, any> {
    const session = this.sessions.get(sessionKey);
    if (!session) return {};

    const result: Record<string, any> = {};
    
    for (const [key, entry] of session.channels.entries()) {
      result[key] = {
        channel: entry.channel,
        driver_number: entry.driverNumber,
        data: entry.data,
        timestamp: entry.timestamp
      };
    }

    return result;
  }

  // Get session overview
  getSessionOverview(sessionKey: string): {
    drivers: number[];
    channels: DataChannel[];
    lastActivity: number;
    latestTimestamp: number;
    dataPoints: number;
  } | null {
    const session = this.sessions.get(sessionKey);
    if (!session) return null;

    const channels = new Set<DataChannel>();
    for (const entry of session.channels.values()) {
      channels.add(entry.channel);
    }

    return {
      drivers: Array.from(session.drivers).sort((a, b) => a - b),
      channels: Array.from(channels),
      lastActivity: session.lastActivity,
      latestTimestamp: session.latestTimestamp,
      dataPoints: session.channels.size
    };
  }

  // Get driver positions for a session
  getCurrentPositions(sessionKey: string): Array<{
    driverNumber: number;
    position: number;
    timestamp: number;
  }> {
    const session = this.sessions.get(sessionKey);
    if (!session) return [];

    const positions = [];
    
    for (const [key, entry] of session.channels.entries()) {
      if (entry.channel === 'position' && entry.driverNumber !== undefined) {
        positions.push({
          driverNumber: entry.driverNumber,
          position: entry.data.position,
          timestamp: entry.timestamp
        });
      }
    }

    return positions.sort((a, b) => a.position - b.position);
  }

  // Get current race control status
  getCurrentRaceControlStatus(sessionKey: string): {
    flag?: string;
    message?: string;
    timestamp: number;
  } | null {
    const latestRaceControl = this.getLatestData(sessionKey, 'race_control');
    
    if (!latestRaceControl) return null;

    return {
      flag: latestRaceControl.flag,
      message: latestRaceControl.message,
      timestamp: latestRaceControl.timestamp || Date.now()
    };
  }

  // Get current weather
  getCurrentWeather(sessionKey: string): any | null {
    return this.getLatestData(sessionKey, 'weather');
  }

  // Clear session cache
  clearSession(sessionKey: string): boolean {
    return this.sessions.delete(sessionKey);
  }

  // Clear old cache entries
  clearOldEntries(maxAge: number = this.MAX_SESSION_AGE): number {
    let cleared = 0;
    const cutoffTime = Date.now() - maxAge;
    
    for (const [sessionKey, session] of this.sessions.entries()) {
      if (session.lastActivity < cutoffTime) {
        this.sessions.delete(sessionKey);
        cleared++;
      }
    }

    return cleared;
  }

  // Get cache statistics
  getStats(): {
    totalSessions: number;
    totalEntries: number;
    oldestSession: number | null;
    newestSession: number | null;
    memoryUsage: string;
  } {
    let totalEntries = 0;
    let oldestSession: number | null = null;
    let newestSession: number | null = null;

    for (const session of this.sessions.values()) {
      totalEntries += session.channels.size;
      
      if (oldestSession === null || session.lastActivity < oldestSession) {
        oldestSession = session.lastActivity;
      }
      
      if (newestSession === null || session.lastActivity > newestSession) {
        newestSession = session.lastActivity;
      }
    }

    // Rough memory usage estimate
    const entrySizeEstimate = 200; // bytes per cache entry (rough estimate)
    const memoryUsageBytes = totalEntries * entrySizeEstimate;
    const memoryUsageMB = (memoryUsageBytes / 1024 / 1024).toFixed(2);

    return {
      totalSessions: this.sessions.size,
      totalEntries,
      oldestSession,
      newestSession,
      memoryUsage: `${memoryUsageMB} MB`
    };
  }

  // Get all session keys
  getSessionKeys(): string[] {
    return Array.from(this.sessions.keys());
  }

  // Check if session exists in cache
  hasSession(sessionKey: string): boolean {
    return this.sessions.has(sessionKey);
  }

  // Get driver-specific latest data
  getDriverData(sessionKey: string, driverNumber: number): Record<DataChannel, any> {
    const session = this.sessions.get(sessionKey);
    if (!session) return {} as Record<DataChannel, any>;

    const result: Partial<Record<DataChannel, any>> = {};
    
    for (const [key, entry] of session.channels.entries()) {
      if (entry.driverNumber === driverNumber) {
        result[entry.channel] = entry.data;
      }
    }

    return result as Record<DataChannel, any>;
  }

  // Get comparative data for two drivers
  getDriverComparison(
    sessionKey: string,
    driver1: number,
    driver2: number,
    channels: DataChannel[]
  ): {
    driver1: Record<DataChannel, any>;
    driver2: Record<DataChannel, any>;
    comparison: Record<DataChannel, any>;
  } {
    const driver1Data = this.getDriverData(sessionKey, driver1);
    const driver2Data = this.getDriverData(sessionKey, driver2);
    
    const comparison: Record<string, any> = {};
    
    for (const channel of channels) {
      const data1 = driver1Data[channel];
      const data2 = driver2Data[channel];
      
      if (data1 && data2) {
        // Add channel-specific comparisons
        switch (channel) {
          case 'position':
            comparison[channel] = {
              gap: Math.abs(data1.position - data2.position),
              leader: data1.position < data2.position ? driver1 : driver2
            };
            break;
          case 'car_data':
            comparison[channel] = {
              speed_diff: data1.speed - data2.speed,
              rpm_diff: data1.rpm - data2.rpm
            };
            break;
          default:
            comparison[channel] = { available: true };
        }
      } else {
        comparison[channel] = { available: false };
      }
    }

    return {
      driver1: driver1Data,
      driver2: driver2Data,
      comparison
    };
  }

  // Start cleanup timer
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      const cleared = this.clearOldEntries();
      if (cleared > 0) {
        console.log(`🧹 Cleared ${cleared} old cache sessions`);
      }
    }, this.CLEANUP_INTERVAL);
  }

  // Stop cache service
  stop(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.sessions.clear();
  }
}