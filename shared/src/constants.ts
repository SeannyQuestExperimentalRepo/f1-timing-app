// F1 2025 Season Constants

export const TEAM_COLORS = {
  'Red Bull Racing': '#3671C6',
  'Mercedes': '#6CD3BF', 
  'Ferrari': '#E8002D',
  'McLaren': '#FF8000',
  'Aston Martin': '#358C75',
  'Alpine': '#2293D1',
  'Williams': '#37BEDD',
  'Haas': '#B6BABD',
  'RB': '#6692FF',
  'Sauber': '#52E252',
} as const;

export const DRIVER_CODES_2025 = {
  // Red Bull Racing
  1: 'VER', // Max Verstappen
  11: 'PER', // Sergio Pérez
  
  // Mercedes
  44: 'HAM', // Lewis Hamilton
  63: 'RUS', // George Russell
  
  // Ferrari  
  16: 'LEC', // Charles Leclerc
  55: 'SAI', // Carlos Sainz
  
  // McLaren
  4: 'NOR', // Lando Norris
  81: 'PIA', // Oscar Piastri
  
  // Aston Martin
  14: 'ALO', // Fernando Alonso
  18: 'STR', // Lance Stroll
  
  // Alpine
  10: 'GAS', // Pierre Gasly
  31: 'OCO', // Esteban Ocon
  
  // Williams
  2: 'SAR', // Logan Sargeant
  23: 'ALB', // Alexander Albon
  
  // Haas
  20: 'MAG', // Kevin Magnussen
  27: 'HUL', // Nico Hülkenberg
  
  // RB (AlphaTauri)
  3: 'RIC', // Daniel Ricciardo
  22: 'TSU', // Yuki Tsunoda
  
  // Sauber (Alfa Romeo)
  24: 'ZHO', // Guanyu Zhou
  77: 'BOT', // Valtteri Bottas
} as const;

export const DRIVER_NAMES_2025 = {
  1: 'Max Verstappen',
  2: 'Logan Sargeant', 
  3: 'Daniel Ricciardo',
  4: 'Lando Norris',
  10: 'Pierre Gasly',
  11: 'Sergio Pérez',
  14: 'Fernando Alonso',
  16: 'Charles Leclerc',
  18: 'Lance Stroll',
  20: 'Kevin Magnussen',
  22: 'Yuki Tsunoda',
  23: 'Alexander Albon',
  24: 'Guanyu Zhou',
  27: 'Nico Hülkenberg',
  31: 'Esteban Ocon',
  44: 'Lewis Hamilton',
  55: 'Carlos Sainz',
  63: 'George Russell',
  77: 'Valtteri Bottas',
  81: 'Oscar Piastri',
} as const;

export const TEAM_BY_DRIVER = {
  1: 'Red Bull Racing',
  2: 'Williams',
  3: 'RB',
  4: 'McLaren', 
  10: 'Alpine',
  11: 'Red Bull Racing',
  14: 'Aston Martin',
  16: 'Ferrari',
  18: 'Aston Martin',
  20: 'Haas',
  22: 'RB',
  23: 'Williams',
  24: 'Sauber',
  27: 'Haas',
  31: 'Alpine',
  44: 'Mercedes',
  55: 'Ferrari',
  63: 'Mercedes',
  77: 'Sauber',
  81: 'McLaren',
} as const;

export const TIRE_COLORS = {
  SOFT: '#E8002D',     // Red
  MEDIUM: '#FFD320',   // Yellow  
  HARD: '#FFFFFF',     // White
  INTERMEDIATE: '#43B02A', // Green
  WET: '#0067AD',      // Blue
} as const;

export const TIRE_COMPOUNDS = ['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET'] as const;

export const SESSION_TYPES = {
  'Practice 1': 'FP1',
  'Practice 2': 'FP2', 
  'Practice 3': 'FP3',
  'Qualifying': 'Q',
  'Sprint Shootout': 'SQ',
  'Sprint': 'S',
  'Race': 'R',
} as const;

export const FLAG_COLORS = {
  GREEN: '#00D000',
  YELLOW: '#FFD320', 
  DOUBLE_YELLOW: '#FFD320',
  RED: '#E8002D',
  BLUE: '#0067AD',
  CHEQUERED: '#FFFFFF',
  BLACK: '#000000',
  WHITE: '#FFFFFF',
} as const;

// Polling intervals (milliseconds)
export const POLLING_INTERVALS = {
  CAR_DATA: 1500,      // 1.5s for car data and location
  LOCATION: 1500,      // 1.5s 
  POSITION: 5000,      // 5s for everything else
  INTERVALS: 5000,     // 5s
  LAPS: 5000,          // 5s
  PIT: 5000,           // 5s
  STINTS: 5000,        // 5s
  WEATHER: 10000,      // 10s (changes slowly)
  RACE_CONTROL: 3000,  // 3s (important for flags)
  TEAM_RADIO: 5000,    // 5s
  SESSION: 30000,      // 30s (rarely changes)
  DRIVERS: 60000,      // 60s (static during session)
} as const;

// OpenF1 API Configuration
export const OPENF1_CONFIG = {
  BASE_URL: 'https://api.openf1.org/v1',
  ENDPOINTS: {
    CAR_DATA: '/car_data',
    LOCATION: '/location', 
    POSITION: '/position',
    INTERVALS: '/intervals',
    LAPS: '/laps',
    PIT: '/pit',
    STINTS: '/stints',
    WEATHER: '/weather',
    RACE_CONTROL: '/race_control',
    TEAM_RADIO: '/team_radio',
    SESSIONS: '/sessions',
    DRIVERS: '/drivers',
  },
  DEFAULT_PARAMS: {
    session_key: 'latest',
  },
} as const;

// WebSocket Configuration
export const WS_CONFIG = {
  RECONNECT_INTERVAL: 3000,    // 3s
  MAX_RECONNECT_ATTEMPTS: 10,
  PING_INTERVAL: 30000,        // 30s
  PONG_TIMEOUT: 5000,          // 5s
} as const;

// UI Theme
export const THEME = {
  COLORS: {
    BACKGROUND: '#0a0a0f',
    SURFACE: '#12121a', 
    SURFACE_ELEVATED: '#1a1a2e',
    BORDER: '#ffffff10',
    TEXT_PRIMARY: '#e4e4e7',
    TEXT_SECONDARY: '#71717a',
    ACCENT: '#e10600',
    SUCCESS: '#00D000',
    WARNING: '#FFD320',
    ERROR: '#E8002D',
  },
  FONTS: {
    DISPLAY: 'Inter',
    BODY: 'Inter',
    MONO: 'JetBrains Mono',
  },
} as const;

// Playback Speeds
export const PLAYBACK_SPEEDS = [0.25, 0.5, 1, 2, 4, 8, 16] as const;

// Data retention policies (days)
export const RETENTION_DAYS = {
  LIVE_CACHE: 1,        // In-memory cache
  HOT_STORAGE: 30,      // Recent sessions
  WARM_STORAGE: 365,    // Archive
  COLD_STORAGE: 0,      // Never delete (compressed)
} as const;