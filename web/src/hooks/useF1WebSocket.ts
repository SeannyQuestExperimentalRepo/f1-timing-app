// WebSocket hook for F1 Live Timing data
// Handles connection, reconnection, and message routing

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSessionStore } from '@/stores/session-store';
import { usePlaybackStore } from '@/stores/playback-store';
import { WebSocketMessage } from '@/lib/types';

interface WebSocketOptions {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  autoConnect?: boolean;
}

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
  lastHeartbeat: number;
  latency: number;
}

const DEFAULT_OPTIONS: Required<WebSocketOptions> = {
  url: process.env.NODE_ENV === 'production' ? 'wss://localhost:3001' : 'ws://localhost:3001',
  reconnectInterval: 1000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000,
  autoConnect: true,
};

export function useF1WebSocket(options: WebSocketOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
    lastHeartbeat: 0,
    latency: 0,
  });

  // Store actions
  const updateSessionStore = useSessionStore();
  const updateConnectionState = useSessionStore(state => state.updateConnectionState);
  const playbackStore = usePlaybackStore();

  // Message handlers
  const handleMessage = useCallback((message: any) => {
    const now = Date.now();
    
    switch (message.type) {
      case 'car_data':
        const carData = (message as any).data;
        updateSessionStore.updateCarData(carData.driver_number, carData);
        break;
        
      case 'location':
        const location = (message as any).data;
        updateSessionStore.updateLocation(location.driver_number, location);
        break;
        
      case 'position':
        const position = (message as any).data;
        updateSessionStore.updatePosition(position);
        break;
        
      case 'interval':
        const interval = (message as any).data;
        updateSessionStore.updateInterval(interval);
        break;
        
      case 'lap':
        const lap = (message as any).data;
        updateSessionStore.addLap(lap);
        
        // Add lap marker for playback
        if (playbackStore.isPlaybackMode) {
          playbackStore.addLapMarker(now, lap.lap_number, lap.driver_number);
        }
        break;
        
      case 'stint':
        const stint = (message as any).data;
        updateSessionStore.updateStint(stint);
        break;
        
      case 'weather':
        const weather = (message as any).data;
        updateSessionStore.updateWeather(weather);
        break;
        
      case 'race_control':
        const raceControl = (message as any).data;
        
        // Add flag marker for playback
        if (playbackStore.isPlaybackMode && raceControl.flag) {
          playbackStore.addFlagMarker(now, raceControl.flag);
        }
        break;
        
      case 'team_radio':
        const teamRadio = (message as any).data;
        updateSessionStore.addTeamRadioClip(teamRadio);
        break;
        
      case 'session':
        const session = (message as any).data;
        updateSessionStore.setCurrentSession(session);
        break;
        
      case 'playback_state':
        const playbackState = (message as any).data;
        if (playbackState.session_key) {
          playbackStore.updatePosition(playbackState.current_ts);
        }
        break;
        
      case 'pong':
        // Calculate latency
        const latency = now - state.lastHeartbeat;
        setState(prev => ({ ...prev, latency, lastHeartbeat: now }));
        break;
        
      default:
        console.warn('Unknown WebSocket message type:', message.type);
    }
  }, [updateSessionStore, playbackStore.isPlaybackMode]);

  // Send command to server
  const sendCommand = useCallback((command: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(command));
    } else {
      console.warn('WebSocket not connected, cannot send command:', command);
    }
  }, []);

  // Subscribe to data channels
  const subscribe = useCallback((sessionKey: string, channels: string[]) => {
    sendCommand({
      action: 'subscribe',
      session: sessionKey,
      channels,
    });
  }, [sendCommand]);

  // Unsubscribe from data channels
  const unsubscribe = useCallback((sessionKey: string) => {
    sendCommand({
      action: 'unsubscribe',
      session: sessionKey,
    });
  }, [sendCommand]);

  // Send playback command
  const playbackControl = useCallback((command: 'play' | 'pause' | 'seek' | 'speed', value?: number) => {
    sendCommand({
      action: 'playback',
      command,
      value,
    });
  }, [sendCommand]);

  // Send heartbeat ping
  const sendHeartbeat = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      setState(prev => ({ ...prev, lastHeartbeat: Date.now() }));
    }
  }, []);

  // Connect WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.CONNECTING || 
        wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected or connecting
    }

    setState(prev => ({ 
      ...prev, 
      isConnecting: true, 
      error: null 
    }));

    try {
      wsRef.current = new WebSocket(config.url);
      
      wsRef.current.onopen = () => {
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
          reconnectAttempts: 0,
        }));

        updateConnectionState({ 
          isConnected: true, 
          reconnectAttempts: 0 
        });

        // Start heartbeat
        if (heartbeatTimeoutRef.current) {
          clearInterval(heartbeatTimeoutRef.current);
        }
        heartbeatTimeoutRef.current = setInterval(sendHeartbeat, config.heartbeatInterval);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));

        updateConnectionState({ isConnected: false });

        // Clear heartbeat
        if (heartbeatTimeoutRef.current) {
          clearInterval(heartbeatTimeoutRef.current);
          heartbeatTimeoutRef.current = null;
        }

        // Attempt reconnect if not a clean close
        if (!event.wasClean && state.reconnectAttempts < config.maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, state.reconnectAttempts), 30000);
          
          setState(prev => ({
            ...prev,
            reconnectAttempts: prev.reconnectAttempts + 1,
          }));

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        setState(prev => ({
          ...prev,
          error: 'WebSocket connection error',
          isConnecting: false,
        }));
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to create WebSocket connection',
        isConnecting: false,
      }));
      console.error('WebSocket creation error:', error);
    }
  }, [config.url, config.heartbeatInterval, config.maxReconnectAttempts, handleMessage, sendHeartbeat, updateConnectionState, state.reconnectAttempts]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    // Clear timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }

    // Close connection
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }

    setState({
      isConnected: false,
      isConnecting: false,
      error: null,
      reconnectAttempts: 0,
      lastHeartbeat: 0,
      latency: 0,
    });

    updateConnectionState({ 
      isConnected: false, 
      reconnectAttempts: 0 
    });
  }, [updateConnectionState]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 100);
  }, [disconnect, connect]);

  // Auto-connect on mount
  useEffect(() => {
    if (config.autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [config.autoConnect]); // Don't include connect/disconnect to avoid re-connecting

  return {
    // Connection state
    ...state,
    
    // Connection controls
    connect,
    disconnect,
    reconnect,
    
    // Data subscriptions
    subscribe,
    unsubscribe,
    
    // Playback controls
    playbackControl,
    
    // Send raw command
    sendCommand,
  };
}