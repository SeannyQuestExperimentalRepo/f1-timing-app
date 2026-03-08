// Core F1 Data Types

export interface CarData {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  date: string;
  rpm: number;
  speed: number;
  n_gear: number;
  throttle: number;
  brake: number;
  drs: number;
}

export interface Location {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  date: string;
  x: number;
  y: number;
  z: number;
}

export interface Position {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  date: string;
  position: number;
}

export interface Interval {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  date: string;
  gap_to_leader: number;
  interval: number;
}

export interface Lap {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  date_start: string;
  lap_number: number;
  lap_duration: number;
  is_pit_out_lap: boolean;
  i1_speed?: number;
  i2_speed?: number;
  st_speed?: number;
  segments_sector_1: number[];
  segments_sector_2: number[];
  segments_sector_3: number[];
  lap_time: number;
  s1_time: number;
  s2_time: number;
  s3_time: number;
}

export interface PitStop {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  date: string;
  lap_number: number;
  pit_duration: number;
  is_pit_in?: boolean;
  is_pit_out?: boolean;
}

export interface Stint {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  stint_number: number;
  lap_start: number;
  lap_end: number;
  compound: TireCompound;
  tyre_age_at_start: number;
}

export interface Weather {
  meeting_key: number;
  session_key: number;
  date: string;
  air_temperature: number;
  humidity: number;
  pressure: number;
  rainfall: number;
  track_temperature: number;
  wind_direction: number;
  wind_speed: number;
}

export interface RaceControl {
  meeting_key: number;
  session_key: number;
  date: string;
  category: 'Flag' | 'SafetyCar' | 'VirtualSafetyCar' | 'DRS' | 'Penalty' | 'Investigation' | 'Other';
  flag: 'GREEN' | 'YELLOW' | 'DOUBLE_YELLOW' | 'RED' | 'BLUE' | 'CHEQUERED' | 'BLACK' | 'WHITE' | null;
  scope: 'Track' | 'Sector' | 'Driver' | null;
  sector?: number;
  driver_number?: number;
  message: string;
  lap_number?: number;
}

export interface TeamRadio {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  date: string;
  recording_url: string;
}

export interface Session {
  circuit_key: number;
  circuit_short_name: string;
  country_code: string;
  country_key: number;
  country_name: string;
  date_end: string;
  date_start: string;
  gmt_offset: string;
  location: string;
  meeting_key: number;
  session_key: number;
  session_name: string;
  session_type: 'Practice' | 'Qualifying' | 'Sprint' | 'Race';
  year: number;
}

export interface Driver {
  broadcast_name: string;
  country_code: string;
  driver_number: number;
  first_name: string;
  full_name: string;
  headshot_url: string;
  last_name: string;
  meeting_key: number;
  name_acronym: string;
  session_key: number;
  team_colour: string;
  team_name: string;
}

// Database Models
export interface RecordedData {
  id?: number;
  session_key: string;
  timestamp_ms: number;
  channel: DataChannel;
  data: any;
  created_at?: string;
}

export interface SessionRecord {
  session_key: string;
  name: string;
  circuit: string;
  start_time: string;
  end_time?: string;
  status: 'recording' | 'completed' | 'archived';
  total_data_points: number;
}

// WebSocket Events
export type DataChannel = 
  | 'car_data'
  | 'location' 
  | 'position'
  | 'interval'
  | 'lap'
  | 'pit'
  | 'stint'
  | 'weather'
  | 'race_control'
  | 'team_radio'
  | 'session'
  | 'drivers';

export interface WebSocketMessage {
  type: 'data' | 'playback_state' | 'error' | 'connection';
  channel?: DataChannel;
  data: any;
  timestamp?: number;
  session_key?: string;
}

export interface SubscribeMessage {
  action: 'subscribe';
  session_key: string;
  channels: DataChannel[];
}

export interface UnsubscribeMessage {
  action: 'unsubscribe';
  session_key?: string;
}

export interface PlaybackMessage {
  action: 'playback';
  command: 'play' | 'pause' | 'seek' | 'speed';
  value?: number; // timestamp for seek, multiplier for speed
  session_key: string;
}

export type ClientMessage = SubscribeMessage | UnsubscribeMessage | PlaybackMessage;

export interface PlaybackState {
  playing: boolean;
  speed: number; // 0.25, 0.5, 1, 2, 4, 8, 16
  current_timestamp: number;
  total_duration: number;
  session_key: string;
}

// Enums and Constants
export type TireCompound = 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET';

export type SessionStatus = 'Inactive' | 'Started' | 'Aborted' | 'Finished' | 'Finalised';

// UI State Types
export interface DriverSelection {
  primary?: number;
  secondary?: number;
}

export interface TrackMapState {
  zoom: number;
  center: { x: number; y: number };
  showSectors: boolean;
  showSpeedTrace: boolean;
}

export interface TelemetryRange {
  start: number;
  end: number;
  resolution: 'low' | 'medium' | 'high';
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface SessionSummary {
  session_key: string;
  name: string;
  circuit: string;
  date: string;
  duration_minutes: number;
  driver_count: number;
  lap_count: number;
  status: SessionRecord['status'];
}

// Error Types
export interface APIError {
  code: string;
  message: string;
  details?: any;
}

// Strategy Analysis Types
export interface TireStrategy {
  driver_number: number;
  stints: Array<{
    stint_number: number;
    compound: TireCompound;
    start_lap: number;
    end_lap: number;
    lap_count: number;
    avg_pace: number;
    degradation_rate: number;
  }>;
  pit_windows: Array<{
    optimal_lap: number;
    confidence: number;
    compound_recommendation: TireCompound;
  }>;
}