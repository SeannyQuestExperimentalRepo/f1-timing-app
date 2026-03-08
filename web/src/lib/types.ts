// Re-export all shared types
export * from './shared-types';
import type { TireCompound, Session, SessionRecord, DataChannel } from './shared-types';

// Additional frontend-specific types
export interface ThemeConfig {
  isDark: boolean;
  accentColor: string;
  backgroundColor: string;
}

export interface ViewportConfig {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

export interface PanelState {
  id: string;
  title: string;
  isCollapsed: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isVisible: boolean;
}

export interface UserPreferences {
  selectedDrivers: number[];
  preferredUnits: 'metric' | 'imperial';
  autoPlay: boolean;
  soundEnabled: boolean;
  notifications: boolean;
  colorBlindMode: boolean;
}

export interface ConnectionState {
  isConnected: boolean;
  reconnectAttempts: number;
  lastHeartbeat: number;
  latency: number;
}

// Animation states
export interface AnimationState {
  isAnimating: boolean;
  duration: number;
  easing: string;
}

// Chart data types for recharts
export interface SpeedChartData {
  distance: number; // 0-100% lap distance
  speed: number;
  throttle: number;
  brake: number;
  gear: number;
}

export interface TireDegChartData {
  age: number;
  lapTime: number;
  compound: string;
  driver: string;
}

export interface GapChartData {
  lap: number;
  gap: number;
  driver1: string;
  driver2: string;
}

// UI Component Props Types
export interface BadgeProps {
  variant: 'default' | 'tire' | 'position' | 'flag' | 'team';
  size: 'sm' | 'md' | 'lg';
  color?: string;
  children: React.ReactNode;
}

export interface PanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export interface TooltipProps {
  content: React.ReactNode;
  position: 'top' | 'bottom' | 'left' | 'right';
  trigger: React.ReactNode;
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Form types for settings/preferences
export interface DriverSelectionForm {
  primaryDriver: number;
  compareDriver?: number;
  followMode: 'manual' | 'leader' | 'selected';
}

export interface PlaybackForm {
  speed: number;
  position: number;
  autoRewind: boolean;
  showMinimap: boolean;
}

// Track map types
export interface TrackPoint {
  x: number;
  y: number;
  sector?: number;
  isPitLane?: boolean;
  isStartFinish?: boolean;
}

// Missing types referenced in session store
export interface TimingRowData {
  position: number;
  driver_number: number;
  driver_code: string;
  team_name: string;
  team_color: string;
  interval: number;
  gap_to_leader: number;
  last_lap_time: number;
  best_lap_time: number;
  sector_1_time: number;
  sector_2_time: number;
  sector_3_time: number;
  sector_1_pb: boolean;
  sector_2_pb: boolean;
  sector_3_pb: boolean;
  sector_1_overall_fastest: boolean;
  sector_2_overall_fastest: boolean;
  sector_3_overall_fastest: boolean;
  current_compound: TireCompound;
  tyre_age: number;
  lap_count: number;
  pit_count: number;
  in_pit: boolean;
  status: 'RUNNING' | 'PIT' | 'OUT' | 'RETIRED' | 'DNF';
}

export type FlagType = 'GREEN' | 'YELLOW' | 'DOUBLE_YELLOW' | 'RED' | 'BLUE' | 'CHEQUERED' | 'BLACK' | 'WHITE' | 'SC' | 'VSC';

// Additional telemetry types
export interface TelemetryData {
  driver_number: number;
  timestamp: number;
  speed: number;
  throttle: number;
  brake: number;
  gear: number;
  rpm: number;
  drs: number;
  lap_distance: number; // 0-100%
}

// Additional session data types
export interface LiveSessionData {
  session: Session;
  timing: TimingRowData[];
  current_lap: number;
  total_laps?: number;
  flag_status: FlagType;
  safety_car_deployed: boolean;
  drs_enabled: boolean;
  elapsed_time: number;
}

// Playback types
export interface PlaybackSession extends SessionRecord {
  data_channels: DataChannel[];
  start_timestamp: number;
  end_timestamp: number;
}