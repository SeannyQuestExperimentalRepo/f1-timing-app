// Typed REST client for F1 Timing API

import { Session, SessionRecord, Driver, RecordedData, ApiError } from './types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error: ApiError = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
        throw error;
      }

      // Handle empty responses
      if (response.status === 204) {
        return {} as T;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        // Network error
        throw {
          message: 'Network error - unable to connect to server',
          status: 0,
          code: 'NETWORK_ERROR',
        } as ApiError;
      }
      throw error;
    }
  }

  // Health check
  async health(): Promise<{ status: string; timestamp: number }> {
    return this.request('/health');
  }

  // Sessions
  async getSessions(): Promise<SessionRecord[]> {
    return this.request('/sessions');
  }

  async getSession(sessionKey: string): Promise<SessionRecord> {
    return this.request(`/sessions/${sessionKey}`);
  }

  async getSessionLaps(sessionKey: string): Promise<any[]> {
    return this.request(`/sessions/${sessionKey}/laps`);
  }

  async getSessionStints(sessionKey: string): Promise<any[]> {
    return this.request(`/sessions/${sessionKey}/stints`);
  }

  async getSessionRaceControl(sessionKey: string): Promise<any[]> {
    return this.request(`/sessions/${sessionKey}/race-control`);
  }

  async getSessionWeather(sessionKey: string): Promise<any[]> {
    return this.request(`/sessions/${sessionKey}/weather`);
  }

  // Drivers
  async getDrivers(): Promise<Driver[]> {
    return this.request('/drivers');
  }

  // Replay/Playback data
  async getReplayData(
    sessionKey: string, 
    options: {
      from?: number;
      to?: number;
      limit?: number;
      offset?: number;
      channels?: string[];
    } = {}
  ): Promise<{
    data: RecordedData[];
    total: number;
    hasMore: boolean;
  }> {
    const params = new URLSearchParams();
    
    if (options.from) params.append('from', options.from.toString());
    if (options.to) params.append('to', options.to.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    if (options.channels) params.append('channels', options.channels.join(','));

    const query = params.toString();
    const endpoint = `/replay/${sessionKey}/data${query ? `?${query}` : ''}`;
    
    return this.request(endpoint);
  }

  // Telemetry endpoints (for detailed telemetry data)
  async getDriverTelemetry(
    sessionKey: string,
    driverNumber: number,
    options: {
      from?: number;
      to?: number;
      dataTypes?: string[];
    } = {}
  ): Promise<any[]> {
    const params = new URLSearchParams();
    params.append('driver', driverNumber.toString());
    
    if (options.from) params.append('from', options.from.toString());
    if (options.to) params.append('to', options.to.toString());
    if (options.dataTypes) params.append('types', options.dataTypes.join(','));

    const query = params.toString();
    return this.request(`/sessions/${sessionKey}/telemetry?${query}`);
  }

  // Search sessions
  async searchSessions(query: string): Promise<SessionRecord[]> {
    const params = new URLSearchParams({ q: query });
    return this.request(`/sessions/search?${params.toString()}`);
  }

  // Get live session (current/latest)
  async getLiveSession(): Promise<Session | null> {
    try {
      return await this.request('/sessions/live');
    } catch (error) {
      if ((error as ApiError).status === 404) {
        return null; // No live session
      }
      throw error;
    }
  }
}

// Create singleton instance
export const api = new ApiClient();

// Export class for testing
export { ApiClient };

// Helper function for handling API errors
export function handleApiError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const apiError = error as ApiError;
    
    switch (apiError.status) {
      case 0:
        return 'Unable to connect to server. Please check your connection.';
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required.';
      case 403:
        return 'Access denied.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable.';
      default:
        return apiError.message || 'An unexpected error occurred.';
    }
  }
  
  return 'An unexpected error occurred.';
}

// Type guards for API responses
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'status' in error
  );
}

// Utility function for retrying failed requests
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      
      // Only retry on network errors or 5xx server errors
      if (isApiError(error) && error.status >= 400 && error.status < 500) {
        throw error; // Don't retry client errors
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw new Error('Max retry attempts reached');
}