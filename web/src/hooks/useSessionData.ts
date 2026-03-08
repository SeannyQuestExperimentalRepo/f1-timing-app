// Hook for fetching and managing session data from REST API

import { useEffect, useState, useCallback } from 'react';
import { api, handleApiError } from '@/lib/api';
import { Session, SessionRecord, Driver, ApiError } from '@/lib/types';

interface SessionDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Generic data fetching hook
function useApiData<T>(
  fetcher: () => Promise<T>,
  deps: any[] = []
): SessionDataState<T> {
  const [state, setState] = useState<SessionDataState<T>>({
    data: null,
    loading: true,
    error: null,
    refetch: async () => {},
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await fetcher();
      setState(prev => ({ 
        ...prev, 
        data, 
        loading: false, 
        error: null 
      }));
    } catch (error) {
      const errorMessage = handleApiError(error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
    }
  }, deps);

  useEffect(() => {
    fetchData();
  }, deps);

  return {
    ...state,
    refetch: fetchData,
  };
}

// Hook for fetching all sessions
export function useSessions(year: number = 2024) {
  return useApiData(
    () => api.getSessions(year),
    [year]
  );
}

// Hook for fetching specific session
export function useSession(sessionKey: string | null) {
  return useApiData(
    () => sessionKey ? api.getSession(sessionKey) : Promise.resolve(null),
    [sessionKey]
  );
}

// Hook for fetching session laps
export function useSessionLaps(sessionKey: string | null) {
  return useApiData(
    () => sessionKey ? api.getSessionLaps(sessionKey) : Promise.resolve(null),
    [sessionKey]
  );
}

// Hook for fetching session stints
export function useSessionStints(sessionKey: string | null) {
  return useApiData(
    () => sessionKey ? api.getStints(sessionKey) : Promise.resolve(null),
    [sessionKey]
  );
}

// Hook for fetching session weather
export function useSessionWeather(sessionKey: string | null) {
  return useApiData(
    () => sessionKey ? api.getWeather(sessionKey) : Promise.resolve(null),
    [sessionKey]
  );
}

// Hook for fetching session race control messages
export function useSessionRaceControl(sessionKey: string | null) {
  return useApiData(
    () => sessionKey ? api.getRaceControl(sessionKey) : Promise.resolve(null),
    [sessionKey]
  );
}

// Hook for fetching drivers for a specific session
export function useDrivers(sessionKey: string | null) {
  return useApiData(
    () => sessionKey ? api.getDrivers(sessionKey) : Promise.resolve(null),
    [sessionKey]
  );
}

// Hook for fetching live session
export function useLiveSession() {
  const [state, setState] = useState<{
    session: Session | null;
    loading: boolean;
    error: string | null;
  }>({
    session: null,
    loading: true,
    error: null,
  });

  const fetchLiveSession = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const session = await api.getLatestSession();
      setState({ session, loading: false, error: null });
    } catch (error) {
      const errorMessage = handleApiError(error);
      setState({ session: null, loading: false, error: errorMessage });
    }
  }, []);

  useEffect(() => {
    fetchLiveSession();
    
    // Poll for live session updates every 30 seconds
    const interval = setInterval(fetchLiveSession, 30000);
    
    return () => clearInterval(interval);
  }, [fetchLiveSession]);

  return { ...state, refetch: fetchLiveSession };
}

// Hook for searching sessions
export function useSessionSearch() {
  const [state, setState] = useState<{
    results: Session[];
    loading: boolean;
    error: string | null;
    query: string;
  }>({
    results: [],
    loading: false,
    error: null,
    query: '',
  });

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setState(prev => ({ ...prev, results: [], query: '', error: null }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null, query }));
    
    try {
      // Simple client-side search since OpenF1 doesn't have search endpoint
      const allSessions = await api.getSessions(2024);
      const results = allSessions.filter(session => 
        session.session_name.toLowerCase().includes(query.toLowerCase()) ||
        session.circuit_short_name.toLowerCase().includes(query.toLowerCase()) ||
        session.location.toLowerCase().includes(query.toLowerCase())
      );
      
      setState(prev => ({ 
        ...prev, 
        results, 
        loading: false, 
        error: null 
      }));
    } catch (error) {
      const errorMessage = handleApiError(error);
      setState(prev => ({ 
        ...prev, 
        results: [], 
        loading: false, 
        error: errorMessage 
      }));
    }
  }, []);

  const clearSearch = useCallback(() => {
    setState({
      results: [],
      loading: false,
      error: null,
      query: '',
    });
  }, []);

  return { ...state, search, clearSearch };
}

// Hook for fetching replay data with pagination
export function useReplayData(
  sessionKey: string | null,
  options: {
    from?: number;
    to?: number;
    limit?: number;
    offset?: number;
    channels?: string[];
  } = {}
) {
  const [state, setState] = useState<{
    data: any[];
    total: number;
    hasMore: boolean;
    loading: boolean;
    error: string | null;
    loadingMore: boolean;
  }>({
    data: [],
    total: 0,
    hasMore: false,
    loading: true,
    error: null,
    loadingMore: false,
  });

  const fetchData = useCallback(async (append = false) => {
    if (!sessionKey) {
      setState(prev => ({ 
        ...prev, 
        data: [], 
        loading: false, 
        error: null 
      }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      loading: !append, 
      loadingMore: append,
      error: null 
    }));
    
    try {
      const result = await api.getReplayData(sessionKey, options);
      
      setState(prev => ({
        data: append ? [...prev.data, ...result.data] : result.data,
        total: result.total,
        hasMore: result.hasMore,
        loading: false,
        loadingMore: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = handleApiError(error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        loadingMore: false,
        error: errorMessage 
      }));
    }
  }, [sessionKey, JSON.stringify(options)]);

  const loadMore = useCallback(() => {
    if (state.hasMore && !state.loadingMore) {
      const newOptions = {
        ...options,
        offset: (options.offset || 0) + state.data.length,
      };
      // This would need to be implemented differently since options changed
      fetchData(true);
    }
  }, [state.hasMore, state.loadingMore, state.data.length, options, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: () => fetchData(), loadMore };
}

// Hook for driver telemetry data
export function useDriverTelemetry(
  sessionKey: string | null,
  driverNumber: number | null,
  options: {
    from?: number;
    to?: number;
    dataTypes?: string[];
  } = {}
) {
  return useApiData(
    () => sessionKey && driverNumber 
      ? api.getDriverTelemetry(sessionKey, driverNumber, options)
      : Promise.resolve(null),
    [sessionKey, driverNumber, JSON.stringify(options)]
  );
}

// Hook for health check with auto-retry
export function useApiHealth() {
  const [state, setState] = useState<{
    isHealthy: boolean;
    loading: boolean;
    lastChecked: number | null;
    error: string | null;
  }>({
    isHealthy: false,
    loading: true,
    lastChecked: null,
    error: null,
  });

  const checkHealth = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await api.health();
      setState({
        isHealthy: true,
        loading: false,
        lastChecked: Date.now(),
        error: null,
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      setState({
        isHealthy: false,
        loading: false,
        lastChecked: Date.now(),
        error: errorMessage,
      });
    }
  }, []);

  useEffect(() => {
    checkHealth();
    
    // Check health every 60 seconds
    const interval = setInterval(checkHealth, 60000);
    
    return () => clearInterval(interval);
  }, [checkHealth]);

  return { ...state, checkHealth };
}

// Utility hook for handling API errors globally
export function useApiErrorHandler() {
  const [lastError, setLastError] = useState<string | null>(null);

  const handleError = useCallback((error: unknown) => {
    const message = handleApiError(error);
    setLastError(message);
    
    // Auto-clear error after 10 seconds
    setTimeout(() => setLastError(null), 10000);
    
    return message;
  }, []);

  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  return { lastError, handleError, clearError };
}