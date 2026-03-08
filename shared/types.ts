// Shared F1 Data Types
// Generated from BUILD-SPEC.md — all F1 data types for the timing application

export interface Driver {
  driver_number: number;
  broadcast_name: string;
  country_code: string;
  first_name: string;
  last_name: string;
  name_acronym: string; // 3-letter code (HAM, VER, LEC)
  team_name: string;
  team_colour: string;
  headshot_url?: string;
}

export interface Session {
  session_key: string;
  session_name: string;
  session_type: 'Practice' | 'Qualifying' | 'Sprint' | 'Race';
  country_name: string;
  country_code: string;
  circuit_short_name: string;
  date_start: string;
  date_end: string;
  gmt_offset: string;
  meeting_key: string;
  year: number;
  status: 'upcoming' | 'live' | 'completed' | 'recording' | 'archived';
}

export interface CarData {
  date: string;
  driver_number: number;
  meeting_key: number;
  session_key: number;
  speed: number; // km/h
  throttle: number; // 0-100%
  brake: boolean; // true if braking
  drs: number; // 0-14 (0=closed, 1-8=opening, 9-14=open)
  n_gear: number; // 1-8
  rpm: number;
}

export interface Location {
  date: string;
  driver_number: number;
  meeting_key: number;
  session_key: number;
  x: number; // track coordinates
  y: number;
  z: number;
}

export interface Position {
  date: string;
  driver_number: number;
  meeting_key: number;
  session_key: number;
  position: number;
}

export interface Interval {
  date: string;
  driver_number: number;
  meeting_key: number;
  session_key: number;
  gap_to_leader?: number; // seconds, null for leader
  interval?: number; // seconds to car ahead, null for leader
}

export interface Lap {
  date_start: string;
  driver_number: number;
  duration_sector_1?: number; // seconds
  duration_sector_2?: number;
  duration_sector_3?: number;
  i1_speed?: number; // speed trap 1
  i2_speed?: number; // speed trap 2
  is_pit_out_lap: boolean;
  lap_duration?: number; // total lap time in seconds
  lap_number: number;
  meeting_key: number;
  segments_sector_1: number[]; // mini-sector data
  segments_sector_2: number[];
  segments_sector_3: number[];
  session_key: number;
  st_speed?: number; // finish line speed trap
}

export interface Pit {
  date: string;
  driver_number: number;
  lap_number: number;
  meeting_key: number;
  pit_duration: number; // seconds
  session_key: number;
}

export interface Stint {
  compound: TireCompound;
  driver_number: number;
  lap_end?: number;
  lap_start: number;
  meeting_key: number;
  session_key: number;
  stint_number: number;
  tyre_age_at_start: number;
}

export interface Weather {
  air_temperature: number; // Celsius
  date: string;
  humidity: number; // %
  meeting_key: number;
  pressure: number; // mbar
  rainfall: boolean;
  session_key: number;
  track_temperature: number; // Celsius
  wind_direction: number; // degrees
  wind_speed: number; // m/s
}

export interface TeamRadio {
  date: string;
  driver_number: number;
  meeting_key: number;
  recording_url: string;
  session_key: number;
}

export interface RaceControl {
  category: RaceControlCategory;
  date: string;
  driver_number?: number;
  flag: FlagType;
  lap_number?: number;
  meeting_key: number;
  message: string;
  scope: 'Track' | 'Driver' | 'Sector';
  sector?: number;
  session_key: number;
}

// Enums and Union Types
export type TireCompound = 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET';
export type RaceControlCategory = 'Flag' | 'SafetyCar' | 'Drs' | 'Other';
export type FlagType = 'GREEN' | 'YELLOW' | 'DOUBLE_YELLOW' | 'RED' | 'BLACK' | 'BLACK_AND_WHITE' | 'BLUE' | 'CHEQUERED';

// Team Colors (2025 Season)
export const TEAM_COLORS = {
  'Red Bull Racing': '#3671C6',
  'Mercedes': '#6CD3BF', 
  'Ferrari': '#E8002D',
  'McLaren': '#FF8000',
  'Aston Martin': '#358C75',
  'Alpine': '#2293D1',
  'Williams': '#37BEDD',
  'Haas F1 Team': '#B6BABD',
  'RB': '#6692FF',
  'Sauber': '#52E252',
} as const;

export type TeamName = keyof typeof TEAM_COLORS;

// Tire Compound Colors
export const TIRE_COLORS = {
  SOFT: '#E8002D', // Red
  MEDIUM: '#FFD320', // Yellow
  HARD: '#EEEEEE', // White
  INTERMEDIATE: '#52E252', // Green
  WET: '#0066CC', // Blue
} as const;

// WebSocket Events
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface CarDataMessage extends WebSocketMessage {
  type: 'car_data';
  data: CarData;
}

export interface LocationMessage extends WebSocketMessage {
  type: 'location';
  data: Location;
}

export interface PositionMessage extends WebSocketMessage {
  type: 'position';
  data: Position;
}

export interface IntervalMessage extends WebSocketMessage {
  type: 'interval';
  data: Interval;
}

export interface LapMessage extends WebSocketMessage {
  type: 'lap';
  data: Lap;
}

export interface PitMessage extends WebSocketMessage {
  type: 'pit';
  data: Pit;
}

export interface StintMessage extends WebSocketMessage {
  type: 'stint';
  data: Stint;
}

export interface WeatherMessage extends WebSocketMessage {
  type: 'weather';
  data: Weather;
}

export interface RaceControlMessage extends WebSocketMessage {
  type: 'race_control';
  data: RaceControl;
}

export interface TeamRadioMessage extends WebSocketMessage {
  type: 'team_radio';
  data: TeamRadio;
}

export interface SessionMessage extends WebSocketMessage {
  type: 'session';
  data: Session;
}

export interface PlaybackState {
  playing: boolean;
  speed: number; // 1x, 2x, 4x, 8x, 16x
  current_ts: number;
  total_ts: number;
  session_key: string;
}

export interface PlaybackMessage extends WebSocketMessage {
  type: 'playback_state';
  data: PlaybackState;
}

// Client-to-Server WebSocket Commands
export interface SubscribeCommand {
  action: 'subscribe';
  session: string;
  channels: string[];
}

export interface UnsubscribeCommand {
  action: 'unsubscribe';
  session: string;
}

export interface PlaybackCommand {
  action: 'playback';
  command: 'play' | 'pause' | 'seek' | 'speed';
  value?: number;
}

export type WebSocketCommand = SubscribeCommand | UnsubscribeCommand | PlaybackCommand;

// Frontend State Types
export interface TimingRowData {
  position: number;
  driver: Driver;
  lastLap?: Lap;
  currentStint?: Stint;
  gapToLeader?: number;
  interval?: number;
  currentSpeed?: number;
  sector1?: number;
  sector2?: number;
  sector3?: number;
  pitCount: number;
  isInPit: boolean;
}

export interface TelemetryData {
  speed: number[];
  throttle: number[];
  brake: number[];
  gear: number[];
  drs: number[];
  rpm: number[];
  distance: number[]; // lap distance %
}

export interface TrackCoordinates {
  name: string;
  path: Array<[number, number]>; // SVG coordinate pairs
  sector1End: number; // % of track distance
  sector2End: number;
  pitLaneEntry: number;
  pitLaneExit: number;
}

// Strategy Analysis Types
export interface TireDegradation {
  compound: TireCompound;
  ageVsLapTime: Array<{
    age: number;
    lapTime: number;
    compound: TireCompound;
  }>;
}

export interface PitWindowPrediction {
  driver: Driver;
  currentTireAge: number;
  compound: TireCompound;
  estimatedPitWindow: {
    earliest: number; // lap number
    latest: number;
    optimal: number;
  };
  expectedTimeGain: number; // seconds per lap after pit
}

// Head-to-Head Comparison
export interface DriverComparison {
  driver1: Driver;
  driver2: Driver;
  gapHistory: Array<{
    lap: number;
    gap: number; // seconds, positive if driver1 ahead
  }>;
  sectorComparison: {
    sector1: { driver1: number; driver2: number; delta: number };
    sector2: { driver1: number; driver2: number; delta: number };
    sector3: { driver1: number; driver2: number; delta: number };
  };
}

// Database Record Types (for recorded sessions)
export interface RecordedData {
  id: number;
  session_key: string;
  timestamp_ms: number;
  channel: string;
  data: any;
  created_at: string;
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