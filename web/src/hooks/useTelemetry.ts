// Hook for managing telemetry data buffering and real-time updates

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSessionStore, useDriverData } from '@/stores/session-store';
import { CarData, SpeedChartData } from '@/lib/types';

interface ProcessedTelemetry {
  speed: number[];
  throttle: number[];
  brake: number[];
  gear: number[];
  drs: number[];
  rpm: number[];
  distance: number[];
}

interface TelemetryBuffer {
  data: CarData[];
  maxSize: number;
  startTime: number;
  endTime: number;
}

interface TelemetryOptions {
  bufferSize?: number; // Maximum number of data points to keep
  updateInterval?: number; // How often to process buffered data (ms)
  smoothingWindow?: number; // Number of points for data smoothing
  autoCleanup?: boolean; // Remove old data automatically
}

const DEFAULT_OPTIONS: Required<TelemetryOptions> = {
  bufferSize: 1000,
  updateInterval: 100,
  smoothingWindow: 5,
  autoCleanup: true,
};

export function useTelemetry(driverNumber: number, options: TelemetryOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  const driverData = useDriverData(driverNumber);
  const [telemetryBuffer, setTelemetryBuffer] = useState<TelemetryBuffer>({
    data: [],
    maxSize: config.bufferSize,
    startTime: 0,
    endTime: 0,
  });
  
  const [processedTelemetry, setProcessedTelemetry] = useState<ProcessedTelemetry>({
    speed: [],
    throttle: [],
    brake: [],
    gear: [],
    drs: [],
    rpm: [],
    distance: [],
  });
  
  const bufferIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Add new telemetry data to buffer
  const addTelemetryData = useCallback((data: CarData) => {
    setTelemetryBuffer(prev => {
      const newData = [...prev.data, data];
      
      // Remove old data if buffer is too large
      if (config.autoCleanup && newData.length > config.bufferSize) {
        newData.splice(0, newData.length - config.bufferSize);
      }
      
      const now = Date.now();
      return {
        data: newData,
        maxSize: config.bufferSize,
        startTime: newData.length > 0 ? new Date(newData[0].date).getTime() : now,
        endTime: now,
      };
    });
  }, [config.bufferSize, config.autoCleanup]);
  
  // Process raw telemetry data into charts-ready format
  const processTelemetryData = useCallback(() => {
    const { data } = telemetryBuffer;
    if (data.length === 0) return;
    
    // Apply smoothing if enabled
    const smoothData = config.smoothingWindow > 1 
      ? applySmoothingFilter(data, config.smoothingWindow)
      : data;
    
    const processed: ProcessedTelemetry = {
      speed: smoothData.map(d => d.speed),
      throttle: smoothData.map(d => d.throttle),
      brake: smoothData.map(d => d.brake ? 100 : 0), // Convert boolean to percentage
      gear: smoothData.map(d => d.n_gear),
      drs: smoothData.map(d => d.drs),
      rpm: smoothData.map(d => d.rpm),
      distance: smoothData.map((_, index) => (index / smoothData.length) * 100), // Approximate distance
    };
    
    setProcessedTelemetry(processed);
  }, [telemetryBuffer, config.smoothingWindow]);
  
  // Get telemetry data for charts with distance mapping
  const getSpeedChartData = useCallback((): SpeedChartData[] => {
    const { data } = telemetryBuffer;
    if (data.length === 0) return [];
    
    return data.map((point, index) => ({
      distance: (index / data.length) * 100, // Convert to percentage of lap
      speed: point.speed,
      throttle: point.throttle,
      brake: point.brake ? 100 : 0,
      gear: point.n_gear,
    }));
  }, [telemetryBuffer]);
  
  // Get latest telemetry values
  const getLatestValues = useCallback(() => {
    const { data } = telemetryBuffer;
    if (data.length === 0) return null;
    
    const latest = data[data.length - 1];
    return {
      speed: latest.speed,
      throttle: latest.throttle,
      brake: latest.brake,
      gear: latest.n_gear,
      drs: latest.drs,
      rpm: latest.rpm,
      timestamp: new Date(latest.date).getTime(),
    };
  }, [telemetryBuffer]);
  
  // Get telemetry statistics
  const getTelemetryStats = useCallback(() => {
    const { data } = telemetryBuffer;
    if (data.length === 0) return null;
    
    const speeds = data.map(d => d.speed);
    const rpms = data.map(d => d.rpm);
    const throttles = data.map(d => d.throttle);
    
    return {
      maxSpeed: Math.max(...speeds),
      minSpeed: Math.min(...speeds),
      avgSpeed: speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length,
      maxRpm: Math.max(...rpms),
      avgThrottle: throttles.reduce((sum, throttle) => sum + throttle, 0) / throttles.length,
      brakingPercentage: (data.filter(d => d.brake).length / data.length) * 100,
      drsUsage: (data.filter(d => d.drs > 8).length / data.length) * 100, // DRS open
      dataPoints: data.length,
      timeSpan: data.length > 1 
        ? new Date(data[data.length - 1].date).getTime() - new Date(data[0].date).getTime()
        : 0,
    };
  }, [telemetryBuffer]);
  
  // Clear telemetry buffer
  const clearTelemetry = useCallback(() => {
    setTelemetryBuffer({
      data: [],
      maxSize: config.bufferSize,
      startTime: 0,
      endTime: 0,
    });
    setProcessedTelemetry({
      speed: [],
      throttle: [],
      brake: [],
      gear: [],
      drs: [],
      rpm: [],
      distance: [],
    });
  }, [config.bufferSize]);
  
  // Listen for new car data from the store
  useEffect(() => {
    if (driverData.carData) {
      addTelemetryData(driverData.carData);
    }
  }, [driverData.carData, addTelemetryData]);
  
  // Process telemetry data periodically
  useEffect(() => {
    if (config.updateInterval > 0) {
      bufferIntervalRef.current = setInterval(processTelemetryData, config.updateInterval);
      
      return () => {
        if (bufferIntervalRef.current) {
          clearInterval(bufferIntervalRef.current);
        }
      };
    }
  }, [processTelemetryData, config.updateInterval]);
  
  // Initial processing
  useEffect(() => {
    processTelemetryData();
  }, [telemetryBuffer.data.length]);
  
  return {
    // Raw buffer
    buffer: telemetryBuffer,
    
    // Processed data
    telemetry: processedTelemetry,
    
    // Getters
    getSpeedChartData,
    getLatestValues,
    getTelemetryStats,
    
    // Controls
    clearTelemetry,
    
    // State
    hasData: telemetryBuffer.data.length > 0,
    dataPointCount: telemetryBuffer.data.length,
    bufferHealth: telemetryBuffer.data.length / config.bufferSize,
  };
}

// Hook for comparing telemetry between two drivers
export function useTelemetryComparison(driver1: number, driver2: number) {
  const telemetry1 = useTelemetry(driver1);
  const telemetry2 = useTelemetry(driver2);
  
  const getComparisonData = useCallback(() => {
    const data1 = telemetry1.getSpeedChartData();
    const data2 = telemetry2.getSpeedChartData();
    
    // Normalize data length for comparison
    const maxLength = Math.max(data1.length, data2.length);
    if (maxLength === 0) return { driver1: [], driver2: [], deltas: [] };
    
    const normalized1 = normalizeDataArray(data1, maxLength);
    const normalized2 = normalizeDataArray(data2, maxLength);
    
    // Calculate deltas
    const deltas = normalized1.map((point1, index) => {
      const point2 = normalized2[index];
      return {
        distance: point1.distance,
        speedDelta: point1.speed - point2.speed,
        throttleDelta: point1.throttle - point2.throttle,
        gearDelta: point1.gear - point2.gear,
      };
    });
    
    return {
      driver1: normalized1,
      driver2: normalized2,
      deltas,
    };
  }, [telemetry1, telemetry2]);
  
  return {
    telemetry1,
    telemetry2,
    getComparisonData,
    hasBothDrivers: telemetry1.hasData && telemetry2.hasData,
  };
}

// Hook for telemetry alerts and warnings
export function useTelemetryAlerts(driverNumber: number) {
  const telemetry = useTelemetry(driverNumber);
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: number;
  }>>([]);
  
  // Check for telemetry alerts
  useEffect(() => {
    const stats = telemetry.getTelemetryStats();
    const latest = telemetry.getLatestValues();
    
    if (!stats || !latest) return;
    
    const newAlerts = [];
    
    // High RPM warning
    if (latest.rpm > 13000) {
      newAlerts.push({
        id: 'high-rpm',
        type: 'warning' as const,
        message: `High RPM: ${latest.rpm}`,
        timestamp: Date.now(),
      });
    }
    
    // Low speed warning (potential issue)
    if (latest.speed < 50 && stats.avgSpeed > 200) {
      newAlerts.push({
        id: 'low-speed',
        type: 'warning' as const,
        message: `Unusually low speed: ${latest.speed} km/h`,
        timestamp: Date.now(),
      });
    }
    
    // DRS stuck open
    if (latest.drs > 8 && stats.drsUsage > 90) {
      newAlerts.push({
        id: 'drs-stuck',
        type: 'error' as const,
        message: 'Possible DRS stuck open',
        timestamp: Date.now(),
      });
    }
    
    setAlerts(newAlerts);
  }, [telemetry.buffer.endTime, telemetry]);
  
  const clearAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);
  
  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);
  
  return {
    alerts,
    clearAlert,
    clearAllAlerts,
    hasAlerts: alerts.length > 0,
    warningCount: alerts.filter(a => a.type === 'warning').length,
    errorCount: alerts.filter(a => a.type === 'error').length,
  };
}

// Utility functions

function applySmoothingFilter(data: CarData[], windowSize: number): CarData[] {
  if (windowSize <= 1 || data.length < windowSize) return data;
  
  return data.map((point, index) => {
    const start = Math.max(0, index - Math.floor(windowSize / 2));
    const end = Math.min(data.length, start + windowSize);
    const window = data.slice(start, end);
    
    const smoothed = {
      ...point,
      speed: window.reduce((sum, p) => sum + p.speed, 0) / window.length,
      throttle: window.reduce((sum, p) => sum + p.throttle, 0) / window.length,
      rpm: window.reduce((sum, p) => sum + p.rpm, 0) / window.length,
    };
    
    return smoothed;
  });
}

function normalizeDataArray<T>(data: T[], targetLength: number): T[] {
  if (data.length === 0 || targetLength === 0) return [];
  if (data.length === targetLength) return data;
  
  const result: T[] = [];
  const step = data.length / targetLength;
  
  for (let i = 0; i < targetLength; i++) {
    const index = Math.floor(i * step);
    result.push(data[Math.min(index, data.length - 1)]);
  }
  
  return result;
}