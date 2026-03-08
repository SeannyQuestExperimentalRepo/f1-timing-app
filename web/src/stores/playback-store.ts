// Zustand store for session playback/DVR functionality

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { SessionRecord, RecordedData } from '@/lib/types';

export interface PlaybackState {
  // Playback session
  session: SessionRecord | null;
  isPlaybackMode: boolean;
  
  // Playback controls
  isPlaying: boolean;
  speed: number; // 0.25, 0.5, 1, 2, 4, 8, 16
  currentPosition: number; // Current timestamp in milliseconds
  totalDuration: number; // Total session duration in milliseconds
  
  // Timeline data
  sessionStartTime: number;
  sessionEndTime: number;
  
  // Buffered data
  dataBuffer: RecordedData[];
  bufferStartTime: number;
  bufferEndTime: number;
  
  // Timeline markers (laps, pit stops, flags)
  lapMarkers: Array<{ timestamp: number; lap: number; driver?: number }>;
  pitMarkers: Array<{ timestamp: number; driver: number; duration: number }>;
  flagMarkers: Array<{ timestamp: number; flag: string; duration?: number }>;
  
  // Playback state
  lastFrameTime: number;
  isBuffering: boolean;
  bufferHealth: number; // 0-1, how much data is buffered ahead
  
  // Actions
  setSession: (session: SessionRecord | null) => void;
  setPlaybackMode: (enabled: boolean) => void;
  play: () => void;
  pause: () => void;
  seek: (timestamp: number) => void;
  setSpeed: (speed: number) => void;
  updatePosition: (timestamp: number) => void;
  setBuffer: (data: RecordedData[], startTime: number, endTime: number) => void;
  addLapMarker: (timestamp: number, lap: number, driver?: number) => void;
  addPitMarker: (timestamp: number, driver: number, duration: number) => void;
  addFlagMarker: (timestamp: number, flag: string, duration?: number) => void;
  updateBufferHealth: (health: number) => void;
  reset: () => void;
  
  // Derived getters
  getProgressPercentage: () => number;
  getTimeRemaining: () => number;
  getCurrentData: () => RecordedData[];
  getNearbyMarkers: (windowMs: number) => {
    laps: typeof this['lapMarkers'];
    pits: typeof this['pitMarkers'];
    flags: typeof this['flagMarkers'];
  };
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 1, 2, 4, 8, 16];

export const usePlaybackStore = create<PlaybackState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    session: null,
    isPlaybackMode: false,
    isPlaying: false,
    speed: 1,
    currentPosition: 0,
    totalDuration: 0,
    sessionStartTime: 0,
    sessionEndTime: 0,
    dataBuffer: [],
    bufferStartTime: 0,
    bufferEndTime: 0,
    lapMarkers: [],
    pitMarkers: [],
    flagMarkers: [],
    lastFrameTime: 0,
    isBuffering: false,
    bufferHealth: 1,

    // Actions
    setSession: (session) => set((state) => {
      if (!session) {
        return {
          session: null,
          isPlaybackMode: false,
          currentPosition: 0,
          totalDuration: 0,
          sessionStartTime: 0,
          sessionEndTime: 0,
          dataBuffer: [],
          bufferStartTime: 0,
          bufferEndTime: 0,
          lapMarkers: [],
          pitMarkers: [],
          flagMarkers: [],
        };
      }

      const startTime = new Date(session.start_time).getTime();
      const endTime = session.end_time 
        ? new Date(session.end_time).getTime() 
        : Date.now();
      
      return {
        session,
        isPlaybackMode: true,
        currentPosition: startTime,
        totalDuration: endTime - startTime,
        sessionStartTime: startTime,
        sessionEndTime: endTime,
        isPlaying: false,
      };
    }),

    setPlaybackMode: (enabled) => set({ isPlaybackMode: enabled }),

    play: () => set((state) => ({
      isPlaying: true,
      lastFrameTime: Date.now(),
    })),

    pause: () => set({ isPlaying: false }),

    seek: (timestamp) => set((state) => {
      // Clamp timestamp to session bounds
      const clampedTimestamp = Math.max(
        state.sessionStartTime,
        Math.min(timestamp, state.sessionEndTime)
      );
      
      return {
        currentPosition: clampedTimestamp,
        lastFrameTime: Date.now(),
        isBuffering: true, // Will need to buffer new data
      };
    }),

    setSpeed: (speed) => set((state) => {
      // Validate speed is one of the allowed values
      const validSpeed = PLAYBACK_SPEEDS.includes(speed) ? speed : 1;
      return {
        speed: validSpeed,
        lastFrameTime: Date.now(),
      };
    }),

    updatePosition: (timestamp) => set((state) => {
      // Don't update if we're not playing
      if (!state.isPlaying) return state;
      
      // Don't go past the end of the session
      if (timestamp >= state.sessionEndTime) {
        return {
          currentPosition: state.sessionEndTime,
          isPlaying: false, // Auto-pause at end
        };
      }
      
      return {
        currentPosition: timestamp,
        lastFrameTime: Date.now(),
      };
    }),

    setBuffer: (data, startTime, endTime) => set({
      dataBuffer: data,
      bufferStartTime: startTime,
      bufferEndTime: endTime,
      isBuffering: false,
    }),

    addLapMarker: (timestamp, lap, driver) => set((state) => ({
      lapMarkers: [...state.lapMarkers, { timestamp, lap, driver }]
        .sort((a, b) => a.timestamp - b.timestamp),
    })),

    addPitMarker: (timestamp, driver, duration) => set((state) => ({
      pitMarkers: [...state.pitMarkers, { timestamp, driver, duration }]
        .sort((a, b) => a.timestamp - b.timestamp),
    })),

    addFlagMarker: (timestamp, flag, duration) => set((state) => ({
      flagMarkers: [...state.flagMarkers, { timestamp, flag, duration }]
        .sort((a, b) => a.timestamp - b.timestamp),
    })),

    updateBufferHealth: (health) => set({ bufferHealth: Math.max(0, Math.min(1, health)) }),

    reset: () => set({
      session: null,
      isPlaybackMode: false,
      isPlaying: false,
      speed: 1,
      currentPosition: 0,
      totalDuration: 0,
      sessionStartTime: 0,
      sessionEndTime: 0,
      dataBuffer: [],
      bufferStartTime: 0,
      bufferEndTime: 0,
      lapMarkers: [],
      pitMarkers: [],
      flagMarkers: [],
      lastFrameTime: 0,
      isBuffering: false,
      bufferHealth: 1,
    }),

    // Derived getters
    getProgressPercentage: () => {
      const state = get();
      if (state.totalDuration <= 0) return 0;
      
      const elapsed = state.currentPosition - state.sessionStartTime;
      return Math.max(0, Math.min(100, (elapsed / state.totalDuration) * 100));
    },

    getTimeRemaining: () => {
      const state = get();
      const remaining = state.sessionEndTime - state.currentPosition;
      return Math.max(0, remaining);
    },

    getCurrentData: () => {
      const state = get();
      const currentTime = state.currentPosition;
      
      // Return data points that should be active at current time
      // This could include a small window around the current time
      const windowMs = 1000; // 1 second window
      
      return state.dataBuffer.filter(item => 
        item.timestamp_ms >= currentTime - windowMs &&
        item.timestamp_ms <= currentTime + windowMs
      );
    },

    getNearbyMarkers: (windowMs = 30000) => { // 30 second window by default
      const state = get();
      const currentTime = state.currentPosition;
      
      return {
        laps: state.lapMarkers.filter(marker =>
          Math.abs(marker.timestamp - currentTime) <= windowMs
        ),
        pits: state.pitMarkers.filter(marker =>
          Math.abs(marker.timestamp - currentTime) <= windowMs
        ),
        flags: state.flagMarkers.filter(marker =>
          Math.abs(marker.timestamp - currentTime) <= windowMs
        ),
      };
    },
  }))
);

// Selectors for commonly used playback data
export const useIsPlaybackMode = () => usePlaybackStore(state => state.isPlaybackMode);
export const usePlaybackControls = () => usePlaybackStore(state => ({
  isPlaying: state.isPlaying,
  speed: state.speed,
  play: state.play,
  pause: state.pause,
  setSpeed: state.setSpeed,
}));

export const usePlaybackProgress = () => usePlaybackStore(state => ({
  currentPosition: state.currentPosition,
  totalDuration: state.totalDuration,
  progressPercentage: state.getProgressPercentage(),
  timeRemaining: state.getTimeRemaining(),
  seek: state.seek,
}));

export const usePlaybackSession = () => usePlaybackStore(state => state.session);

export const useBufferState = () => usePlaybackStore(state => ({
  isBuffering: state.isBuffering,
  bufferHealth: state.bufferHealth,
  bufferStartTime: state.bufferStartTime,
  bufferEndTime: state.bufferEndTime,
}));

export const useTimelineMarkers = () => usePlaybackStore(state => ({
  lapMarkers: state.lapMarkers,
  pitMarkers: state.pitMarkers,
  flagMarkers: state.flagMarkers,
  getNearbyMarkers: state.getNearbyMarkers,
}));

// Helper hook for playback time formatting
export const useFormattedPlaybackTime = () => {
  const { currentPosition, sessionStartTime, totalDuration } = usePlaybackStore(state => ({
    currentPosition: state.currentPosition,
    sessionStartTime: state.sessionStartTime,
    totalDuration: state.totalDuration,
  }));

  const elapsed = Math.max(0, currentPosition - sessionStartTime);
  const remaining = Math.max(0, totalDuration - elapsed);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return {
    elapsed: formatTime(elapsed),
    remaining: formatTime(remaining),
    total: formatTime(totalDuration),
  };
};