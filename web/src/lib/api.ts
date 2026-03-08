// OpenF1 API client using Next.js API routes

import { 
  Session, 
  Driver, 
  Lap, 
  Position, 
  Weather, 
  CarData,
  Stint,
  RaceControl,
  Location,
  ApiError 
} from './types';

const API_BASE_URL = 'https://api.openf1.org/v1';

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

  // Sessions
  async getSessions(year: number = 2024): Promise<Session[]> {
    return this.request(`/sessions?year=${year}`);
  }

  async getSession(sessionKey: string): Promise<Session> {
    const sessions = await this.request<Session[]>(`/sessions?session_key=${sessionKey}`);
    return sessions[0];
  }

  // Get the most recent session (for "live" purposes)
  async getLatestSession(): Promise<Session | null> {
    try {
      const sessions = await this.getSessions(2025);
      if (sessions.length === 0) {
        const sessions2024 = await this.getSessions(2024);
        return sessions2024.length > 0 ? sessions2024[sessions2024.length - 1] : null;
      }
      // Sort by date and return the most recent
      sessions.sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime());
      return sessions[0];
    } catch {
      return null;
    }
  }

  // Drivers
  async getDrivers(sessionKey: string): Promise<Driver[]> {
    return this.request(`/drivers?session_key=${sessionKey}`);
  }

  // Timing/Laps data
  async getSessionLaps(sessionKey: string, limit: number = 100): Promise<Lap[]> {
    return this.request(`/laps?session_key=${sessionKey}&limit=${limit}`);
  }

  // Position data
  async getPositions(
    sessionKey: string,
    options: {
      driverNumber?: number;
      dateGte?: string;
      dateLte?: string;
    } = {}
  ): Promise<Position[]> {
    const params = new URLSearchParams({ session_key: sessionKey });
    if (options.driverNumber) params.append('driver_number', options.driverNumber.toString());
    if (options.dateGte) params.append('date_gte', options.dateGte);
    if (options.dateLte) params.append('date_lte', options.dateLte);
    
    return this.request(`/position?${params.toString()}`);
  }

  // Weather data
  async getWeather(sessionKey: string): Promise<Weather[]> {
    return this.request(`/weather?session_key=${sessionKey}`);
  }

  // Car telemetry data
  async getCarData(
    sessionKey: string,
    options: {
      driverNumber?: number;
      dateGte?: string;
      dateLte?: string;
      limit?: number;
    } = {}
  ): Promise<CarData[]> {
    const params = new URLSearchParams({ session_key: sessionKey });
    if (options.driverNumber) params.append('driver_number', options.driverNumber.toString());
    if (options.dateGte) params.append('date_gte', options.dateGte);
    if (options.dateLte) params.append('date_lte', options.dateLte);
    if (options.limit) params.append('limit', options.limit.toString());
    
    return this.request(`/car_data?${params.toString()}`);
  }

  // Stint data
  async getStints(
    sessionKey: string,
    driverNumber?: number
  ): Promise<Stint[]> {
    const params = new URLSearchParams({ session_key: sessionKey });
    if (driverNumber) params.append('driver_number', driverNumber.toString());
    
    return this.request(`/stints?${params.toString()}`);
  }

  // Race control data
  async getRaceControl(
    sessionKey: string,
    options: {
      category?: string;
      flag?: string;
    } = {}
  ): Promise<RaceControl[]> {
    const params = new URLSearchParams({ session_key: sessionKey });
    if (options.category) params.append('category', options.category);
    if (options.flag) params.append('flag', options.flag);
    
    return this.request(`/race_control?${params.toString()}`);
  }

  // Replay data (fetches laps for a given session, used by DVR/replay)
  async getReplayData(
    sessionKey: string,
    options: {
      from?: number;
      to?: number;
      limit?: number;
      offset?: number;
      channels?: string[];
    } = {}
  ): Promise<{ data: any[]; total: number; hasMore: boolean }> {
    const laps = await this.getSessionLaps(sessionKey, options.limit || 100);
    return { data: laps, total: laps.length, hasMore: false };
  }

  // Driver telemetry (wraps getCarData for a specific driver)
  async getDriverTelemetry(
    sessionKey: string,
    driverNumber: number,
    options: { from?: number; to?: number; dataTypes?: string[] } = {}
  ): Promise<CarData[]> {
    return this.getCarData(sessionKey, {
      driverNumber,
      dateGte: options.from ? new Date(options.from).toISOString() : undefined,
      dateLte: options.to ? new Date(options.to).toISOString() : undefined,
    });
  }

  // Health check
  async health(): Promise<{ status: string }> {
    return { status: 'ok' };
  }

  // Location data for track map
  async getLocations(
    sessionKey: string,
    options: {
      driverNumber?: number;
      dateGte?: string;
      dateLte?: string;
    } = {}
  ): Promise<Location[]> {
    const params = new URLSearchParams({ session_key: sessionKey });
    if (options.driverNumber) params.append('driver_number', options.driverNumber.toString());
    if (options.dateGte) params.append('date_gte', options.dateGte);
    if (options.dateLte) params.append('date_lte', options.dateLte);
    
    return this.request(`/location?${params.toString()}`);
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