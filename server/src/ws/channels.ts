import type { DataChannel } from '@f1-timing/shared';
import type { WebSocketHub } from './hub.js';

export interface ChannelData {
  sessionKey: string;
  channel: DataChannel;
  data: any;
  timestamp?: number;
}

export class ChannelRouter {
  constructor(private wsHub: WebSocketHub) {}

  // Route incoming data to appropriate channels
  routeData(channelData: ChannelData): void {
    const { sessionKey, channel, data, timestamp } = channelData;
    
    // Add timestamp if not provided
    const enrichedData = {
      ...data,
      timestamp: timestamp || Date.now()
    };

    // Broadcast to all subscribers of this session and channel
    this.wsHub.broadcastToSession(sessionKey, channel, enrichedData);
  }

  // Route multiple data points at once (for batch processing)
  routeDataBatch(channelDataList: ChannelData[]): void {
    for (const channelData of channelDataList) {
      this.routeData(channelData);
    }
  }

  // Route live session data
  routeLiveData(sessionKey: string, channel: DataChannel, data: any): void {
    this.routeData({
      sessionKey,
      channel,
      data,
      timestamp: Date.now()
    });
  }

  // Route playback data (with original timestamp)
  routePlaybackData(sessionKey: string, channel: DataChannel, data: any, originalTimestamp: number): void {
    this.routeData({
      sessionKey,
      channel,
      data,
      timestamp: originalTimestamp
    });
  }

  // Specialized routing for different data types
  routeCarData(sessionKey: string, carData: any[]): void {
    for (const data of carData) {
      this.routeLiveData(sessionKey, 'car_data', data);
    }
  }

  routeLocation(sessionKey: string, locationData: any[]): void {
    for (const data of locationData) {
      this.routeLiveData(sessionKey, 'location', data);
    }
  }

  routePosition(sessionKey: string, positionData: any[]): void {
    for (const data of positionData) {
      this.routeLiveData(sessionKey, 'position', data);
    }
  }

  routeInterval(sessionKey: string, intervalData: any[]): void {
    for (const data of intervalData) {
      this.routeLiveData(sessionKey, 'interval', data);
    }
  }

  routeLap(sessionKey: string, lapData: any[]): void {
    for (const data of lapData) {
      this.routeLiveData(sessionKey, 'lap', data);
    }
  }

  routePit(sessionKey: string, pitData: any[]): void {
    for (const data of pitData) {
      this.routeLiveData(sessionKey, 'pit', data);
    }
  }

  routeStint(sessionKey: string, stintData: any[]): void {
    for (const data of stintData) {
      this.routeLiveData(sessionKey, 'stint', data);
    }
  }

  routeWeather(sessionKey: string, weatherData: any[]): void {
    for (const data of weatherData) {
      this.routeLiveData(sessionKey, 'weather', data);
    }
  }

  routeRaceControl(sessionKey: string, raceControlData: any[]): void {
    for (const data of raceControlData) {
      this.routeLiveData(sessionKey, 'race_control', data);
    }
  }

  routeTeamRadio(sessionKey: string, teamRadioData: any[]): void {
    for (const data of teamRadioData) {
      this.routeLiveData(sessionKey, 'team_radio', data);
    }
  }

  routeSession(sessionKey: string, sessionData: any): void {
    this.routeLiveData(sessionKey, 'session', sessionData);
  }

  routeDrivers(sessionKey: string, driverData: any[]): void {
    // Drivers data is typically sent as a complete array
    this.routeLiveData(sessionKey, 'drivers', driverData);
  }

  // Broadcast playback state changes
  broadcastPlaybackState(sessionKey: string, playbackState: any): void {
    this.wsHub.broadcastPlaybackState(sessionKey, playbackState);
  }

  // Utility method to get channel statistics
  getChannelStats(): Record<DataChannel, number> {
    // This would require tracking sent messages, for now return empty
    return {
      car_data: 0,
      location: 0,
      position: 0,
      interval: 0,
      lap: 0,
      pit: 0,
      stint: 0,
      weather: 0,
      race_control: 0,
      team_radio: 0,
      session: 0,
      drivers: 0
    };
  }
}