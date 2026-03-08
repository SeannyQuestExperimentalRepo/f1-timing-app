// F1 Constants and Team Data

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

export const TIRE_COLORS = {
  SOFT: '#E8002D', // Red
  MEDIUM: '#FFD320', // Yellow  
  HARD: '#EEEEEE', // White
  INTERMEDIATE: '#52E252', // Green
  WET: '#0066CC', // Blue
} as const;

export const TIRE_NAMES = {
  SOFT: 'S',
  MEDIUM: 'M',
  HARD: 'H',
  INTERMEDIATE: 'I',
  WET: 'W',
} as const;

export const FLAG_COLORS = {
  GREEN: '#10B981',
  YELLOW: '#F59E0B',
  DOUBLE_YELLOW: '#F59E0B',
  RED: '#EF4444',
  BLUE: '#3B82F6',
  BLACK: '#1F2937',
  BLACK_AND_WHITE: '#6B7280',
  CHEQUERED: '#6B7280',
} as const;

export const SECTOR_COLORS = {
  BEST_OVERALL: '#8B5CF6', // Purple - best overall sector
  PERSONAL_BEST: '#10B981', // Green - personal best
  NORMAL: '#F59E0B', // Yellow - normal sector
  DEFAULT: '#71717a', // Gray - no time set
} as const;

// 2025 Driver List with Real Names and Numbers
export const DRIVERS_2025 = [
  { number: 1, name: 'Max Verstappen', code: 'VER', team: 'Red Bull Racing' },
  { number: 11, name: 'Sergio Pérez', code: 'PER', team: 'Red Bull Racing' },
  { number: 44, name: 'Lewis Hamilton', code: 'HAM', team: 'Ferrari' },
  { number: 63, name: 'George Russell', code: 'RUS', team: 'Mercedes' },
  { number: 16, name: 'Charles Leclerc', code: 'LEC', team: 'Ferrari' },
  { number: 18, name: 'Kimi Antonelli', code: 'ANT', team: 'Mercedes' },
  { number: 4, name: 'Lando Norris', code: 'NOR', team: 'McLaren' },
  { number: 81, name: 'Oscar Piastri', code: 'PIA', team: 'McLaren' },
  { number: 14, name: 'Fernando Alonso', code: 'ALO', team: 'Aston Martin' },
  { number: 18, name: 'Lance Stroll', code: 'STR', team: 'Aston Martin' },
  { number: 10, name: 'Pierre Gasly', code: 'GAS', team: 'Alpine' },
  { number: 31, name: 'Esteban Ocon', code: 'OCO', team: 'Alpine' },
  { number: 2, name: 'Logan Sargeant', code: 'SAR', team: 'Williams' },
  { number: 23, name: 'Alex Albon', code: 'ALB', team: 'Williams' },
  { number: 20, name: 'Kevin Magnussen', code: 'MAG', team: 'Haas F1 Team' },
  { number: 27, name: 'Nico Hülkenberg', code: 'HUL', team: 'Haas F1 Team' },
  { number: 22, name: 'Yuki Tsunoda', code: 'TSU', team: 'RB' },
  { number: 21, name: 'Liam Lawson', code: 'LAW', team: 'RB' },
  { number: 77, name: 'Valtteri Bottas', code: 'BOT', team: 'Sauber' },
  { number: 24, name: 'Zhou Guanyu', code: 'ZHO', team: 'Sauber' },
] as const;

export const CIRCUITS_2025 = {
  'bahrain': 'Bahrain International Circuit',
  'saudi_arabia': 'Jeddah Corniche Circuit',
  'australia': 'Albert Park Circuit',
  'china': 'Shanghai International Circuit',
  'miami': 'Miami International Autodrome',
  'imola': 'Autodromo Enzo e Dino Ferrari',
  'monaco': 'Circuit de Monaco',
  'canada': 'Circuit Gilles Villeneuve',
  'spain': 'Circuit de Barcelona-Catalunya',
  'austria': 'Red Bull Ring',
  'great_britain': 'Silverstone Circuit',
  'hungary': 'Hungaroring',
  'belgium': 'Circuit de Spa-Francorchamps',
  'netherlands': 'Circuit Zandvoort',
  'italy': 'Autodromo Nazionale di Monza',
  'azerbaijan': 'Baku City Circuit',
  'singapore': 'Marina Bay Street Circuit',
  'united_states': 'Circuit of the Americas',
  'mexico': 'Autodromo Hermanos Rodriguez',
  'brazil': 'Autodromo Jose Carlos Pace',
  'las_vegas': 'Las Vegas Street Circuit',
  'qatar': 'Losail International Circuit',
  'abu_dhabi': 'Yas Marina Circuit',
} as const;

export const PLAYBACK_SPEEDS = [0.25, 0.5, 1, 2, 4, 8, 16] as const;

export const SESSION_TYPES = {
  'Practice': 'Practice',
  'Qualifying': 'Qualifying', 
  'Sprint': 'Sprint',
  'Race': 'Race',
} as const;

export const WEBSOCKET_EVENTS = {
  // Client to Server
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  PLAYBACK: 'playback',
  
  // Server to Client
  CAR_DATA: 'car_data',
  LOCATION: 'location',
  POSITION: 'position',
  INTERVAL: 'interval',
  LAP: 'lap',
  PIT: 'pit',
  STINT: 'stint',
  WEATHER: 'weather',
  RACE_CONTROL: 'race_control',
  TEAM_RADIO: 'team_radio',
  SESSION: 'session',
  PLAYBACK_STATE: 'playback_state',
} as const;