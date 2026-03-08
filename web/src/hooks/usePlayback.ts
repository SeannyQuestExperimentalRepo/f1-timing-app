// Hook for session playback and DVR controls

import { useEffect, useCallback, useRef } from 'react';
import { usePlaybackStore } from '@/stores/playback-store';
import { useF1WebSocket } from './useF1WebSocket';
import { api } from '@/lib/api';
import { Session, SessionRecord } from '@/lib/types';

interface PlaybackOptions {
  bufferSize?: number; // How many seconds of data to buffer
  preloadTime?: number; // How far ahead to preload data
  autoPlay?: boolean; // Start playing immediately when session loads
}

const DEFAULT_OPTIONS: Required<PlaybackOptions> = {
  bufferSize: 60, // 60 seconds
  preloadTime: 10, // 10 seconds ahead
  autoPlay: false,
};

export function usePlayback(options: PlaybackOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  const playbackStore = usePlaybackStore();
  const { playbackControl, isConnected } = useF1WebSocket();
  
  const bufferIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastBufferUpdateRef = useRef<number>(0);

  // Refresh buffer with data around current position
  // TODO: Implement OpenF1 API-based data buffering for replay functionality
  const refreshBuffer = useCallback(async () => {
    if (!playbackStore.session) return;
    
    // For now, this is a stub since we don't have replay data from OpenF1
    // In a real implementation, we'd query OpenF1 with time-based filters
    lastBufferUpdateRef.current = Date.now();
    
    // Update buffer health (simulated)
    playbackStore.updateBufferHealth(0.8); // Simulate good buffer health
  }, [playbackStore]);

  // Start or resume playback
  const play = useCallback(() => {
    if (!playbackStore.session) return;

    playbackStore.play();
    
    // Send play command to server if connected
    if (isConnected) {
      playbackControl('play');
    }
    
    // Start local playback timer if not connected (offline mode)
    if (!isConnected && !playbackIntervalRef.current) {
      const startTime = Date.now();
      const startPosition = playbackStore.currentPosition;
      
      playbackIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const scaledElapsed = elapsed * playbackStore.speed;
        const newPosition = startPosition + scaledElapsed;
        
        playbackStore.updatePosition(newPosition);
      }, 16); // ~60fps updates
    }
  }, [playbackStore, isConnected, playbackControl]);

  // Pause playback
  const pause = useCallback(() => {
    playbackStore.pause();
    
    // Send pause command to server
    if (isConnected) {
      playbackControl('pause');
    }
    
    // Clear local playback timer
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
  }, [playbackStore, isConnected, playbackControl]);

  // Seek to specific time
  const seek = useCallback(async (timestamp: number) => {
    playbackStore.seek(timestamp);
    
    // Send seek command to server
    if (isConnected) {
      playbackControl('seek', timestamp);
    }
    
    // Force buffer refresh after seeking
    await refreshBuffer();
  }, [playbackStore, isConnected, playbackControl, refreshBuffer]);

  // Change playback speed
  const setSpeed = useCallback((speed: number) => {
    playbackStore.setSpeed(speed);
    
    // Send speed command to server
    if (isConnected) {
      playbackControl('speed', speed);
    }
  }, [playbackStore, isConnected, playbackControl]);

  // Jump forward/backward by specific duration
  const skip = useCallback((seconds: number) => {
    const newTimestamp = playbackStore.currentPosition + (seconds * 1000);
    seek(newTimestamp);
  }, [playbackStore.currentPosition, seek]);

  // Jump to specific lap
  const jumpToLap = useCallback((lapNumber: number, driverNumber?: number) => {
    const lapMarker = playbackStore.lapMarkers.find(marker => 
      marker.lap === lapNumber && 
      (driverNumber ? marker.driver === driverNumber : true)
    );
    
    if (lapMarker) {
      seek(lapMarker.timestamp);
    }
  }, [playbackStore.lapMarkers, seek]);

  // Jump to specific event (pit stop, flag, etc.)
  const jumpToEvent = useCallback((eventType: 'pit' | 'flag', timestamp: number) => {
    seek(timestamp);
  }, [seek]);

  // Helper to convert Session to SessionRecord for the playback store
  const sessionToRecord = (session: Session): SessionRecord => ({
    session_key: session.session_key.toString(),
    name: session.session_name,
    circuit: session.circuit_short_name,
    start_time: session.date_start,
    end_time: session.date_end,
    status: 'completed' as const,
    total_data_points: 0 // Will be updated when we have actual data
  });

  // Load session for playback
  const loadSession = useCallback(async (session: Session) => {
    const sessionRecord = sessionToRecord(session);
    playbackStore.setSession(sessionRecord);
    
    if (config.autoPlay) {
      // Small delay to allow session to load
      setTimeout(play, 100);
    }
    
    // Start buffering data
    await refreshBuffer();
  }, [playbackStore, config.autoPlay, play, refreshBuffer]);

  // Duplicate removed - refreshBuffer is now defined earlier

  // Auto-buffer management
  useEffect(() => {
    if (!playbackStore.isPlaybackMode || !playbackStore.isPlaying) return;
    
    // Check if we need to refresh buffer
    const checkBuffer = () => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastBufferUpdateRef.current;
      const currentTime = playbackStore.currentPosition;
      
      // Refresh if:
      // 1. It's been more than 30 seconds since last update
      // 2. Current position is near buffer edge
      const bufferEdgeThreshold = config.preloadTime * 1000;
      const nearBufferEdge = 
        currentTime <= playbackStore.bufferStartTime + bufferEdgeThreshold ||
        currentTime >= playbackStore.bufferEndTime - bufferEdgeThreshold;
      
      if (timeSinceLastUpdate > 30000 || nearBufferEdge) {
        refreshBuffer();
      }
    };
    
    // Check buffer health every 5 seconds during playback
    bufferIntervalRef.current = setInterval(checkBuffer, 5000);
    
    return () => {
      if (bufferIntervalRef.current) {
        clearInterval(bufferIntervalRef.current);
        bufferIntervalRef.current = null;
      }
    };
  }, [
    playbackStore.isPlaybackMode,
    playbackStore.isPlaying,
    playbackStore.currentPosition,
    playbackStore.bufferStartTime,
    playbackStore.bufferEndTime,
    config.preloadTime,
    refreshBuffer
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
      if (bufferIntervalRef.current) {
        clearInterval(bufferIntervalRef.current);
      }
    };
  }, []);

  // Stop playback when reaching end
  useEffect(() => {
    if (playbackStore.isPlaying && 
        playbackStore.currentPosition >= playbackStore.sessionEndTime) {
      pause();
    }
  }, [playbackStore.isPlaying, playbackStore.currentPosition, playbackStore.sessionEndTime, pause]);

  return {
    // Playback state
    isPlaybackMode: playbackStore.isPlaybackMode,
    isPlaying: playbackStore.isPlaying,
    speed: playbackStore.speed,
    currentPosition: playbackStore.currentPosition,
    totalDuration: playbackStore.totalDuration,
    session: playbackStore.session,
    
    // Buffer state
    isBuffering: playbackStore.isBuffering,
    bufferHealth: playbackStore.bufferHealth,
    
    // Timeline markers
    lapMarkers: playbackStore.lapMarkers,
    pitMarkers: playbackStore.pitMarkers,
    flagMarkers: playbackStore.flagMarkers,
    
    // Playback controls
    play,
    pause,
    seek,
    setSpeed,
    skip,
    jumpToLap,
    jumpToEvent,
    loadSession,
    
    // Utility functions
    getProgressPercentage: playbackStore.getProgressPercentage,
    getTimeRemaining: playbackStore.getTimeRemaining,
    getCurrentData: playbackStore.getCurrentData,
    getNearbyMarkers: playbackStore.getNearbyMarkers,
    refreshBuffer,
  };
}

// Specialized hook for playback timeline UI
export function usePlaybackTimeline() {
  const playback = usePlayback();
  
  const getMarkerPosition = useCallback((timestamp: number) => {
    if (playback.totalDuration <= 0) return 0;
    
    const startMs = playback.session?.start_time ? new Date(playback.session.start_time).getTime() : 0;
    const elapsed = timestamp - startMs;
    return Math.max(0, Math.min(100, (elapsed / playback.totalDuration) * 100));
  }, [playback.totalDuration, playback.session]);
  
  const getTimestampFromPosition = useCallback((percentage: number) => {
    if (!playback.session) return 0;
    
    const sessionStart = new Date(playback.session.start_time).getTime();
    const elapsed = (percentage / 100) * playback.totalDuration;
    return sessionStart + elapsed;
  }, [playback.session, playback.totalDuration]);
  
  return {
    ...playback,
    getMarkerPosition,
    getTimestampFromPosition,
  };
}

// Hook for keyboard shortcuts during playback
export function usePlaybackKeyboard() {
  const playback = usePlayback();
  
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle shortcuts when in playback mode
      if (!playback.isPlaybackMode) return;
      
      // Don't handle if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement)?.tagName)) {
        return;
      }
      
      switch (event.code) {
        case 'Space':
          event.preventDefault();
          if (playback.isPlaying) {
            playback.pause();
          } else {
            playback.play();
          }
          break;
          
        case 'ArrowLeft':
          event.preventDefault();
          playback.skip(event.shiftKey ? -30 : -10); // 30s if shift, 10s if normal
          break;
          
        case 'ArrowRight':
          event.preventDefault();
          playback.skip(event.shiftKey ? 30 : 10); // 30s if shift, 10s if normal
          break;
          
        case 'Digit1':
        case 'Digit2':
        case 'Digit4':
        case 'Digit8':
          const speedMap: { [key: string]: number } = {
            'Digit1': 1,
            'Digit2': 2,
            'Digit4': 4,
            'Digit8': 8,
          };
          playback.setSpeed(speedMap[event.code]);
          break;
          
        case 'Home':
          event.preventDefault();
          playback.seek(playback.session?.start_time ? new Date(playback.session.start_time).getTime() : 0);
          break;
          
        case 'End':
          event.preventDefault();
          playback.seek(playback.session?.end_time ? new Date(playback.session.end_time).getTime() : Date.now());
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [playback]);
}