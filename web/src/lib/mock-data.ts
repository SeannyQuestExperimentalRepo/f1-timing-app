// Mock F1 data for development and testing
// This provides realistic data when the backend is not available

import { 
  Driver, 
  Session, 
  TimingRowData, 
  CarData, 
  Location, 
  Position, 
  Interval,
  Weather,
  Lap,
  Stint,
  RaceControl,
  TeamRadio,
  TireCompound,
  FlagType,
  SessionRecord 
} from './types';
import { DRIVERS_2025, TEAM_COLORS } from './constants';

// Mock drivers based on 2025 season
export const MOCK_DRIVERS = DRIVERS_2025.map((driver, index) => ({
  driver_number: driver.number,
  broadcast_name: driver.name,
  country_code: getCountryCode(driver.name),
  first_name: driver.name.split(' ')[0],
  last_name: driver.name.split(' ').slice(1).join(' '),
  name_acronym: driver.code,
  team_name: driver.team,
  team_colour: TEAM_COLORS[driver.team as keyof typeof TEAM_COLORS],
  headshot_url: `https://api.openf1.org/v1/drivers/${driver.number}/headshot`,
}));

function getCountryCode(driverName: string): string {
  const countryCodes: Record<string, string> = {
    'Max Verstappen': 'NL',
    'Sergio Pérez': 'MX',
    'Lewis Hamilton': 'GB',
    'George Russell': 'GB',
    'Charles Leclerc': 'MC',
    'Kimi Antonelli': 'IT',
    'Lando Norris': 'GB',
    'Oscar Piastri': 'AU',
    'Fernando Alonso': 'ES',
    'Lance Stroll': 'CA',
    'Pierre Gasly': 'FR',
    'Esteban Ocon': 'FR',
    'Logan Sargeant': 'US',
    'Alex Albon': 'TH',
    'Kevin Magnussen': 'DK',
    'Nico Hülkenberg': 'DE',
    'Yuki Tsunoda': 'JP',
    'Liam Lawson': 'NZ',
    'Valtteri Bottas': 'FI',
    'Zhou Guanyu': 'CN',
  };
  return countryCodes[driverName] || 'XX';
}

// Mock current session
export const MOCK_SESSION = {
  session_key: 'mock-2025-bahrain-race',
  session_name: '2025 Bahrain Grand Prix - Race',
  session_type: 'Race',
  country_name: 'Bahrain',
  country_code: 'BH',
  circuit_short_name: 'Sakhir',
  date_start: '2025-03-15T15:00:00Z',
  date_end: '2025-03-15T17:00:00Z',
  gmt_offset: '+03:00',
  meeting_key: '1234',
  year: 2025,
  status: 'live' as const,
};

// Generate mock timing data
export function generateMockTimingData() {
  const baseTime = 87.542; // Base lap time in seconds
  
  return MOCK_DRIVERS.map((driver, index) => ({
    position: index + 1,
    driver_number: driver.driver_number,
    driver_code: driver.name_acronym,
    team_name: driver.team_name,
    team_color: driver.team_colour,
    interval: index === 0 ? 0 : Math.random() * 3 + 0.5,
    gap_to_leader: index === 0 ? 0 : Math.random() * 30 + index * 2,
    last_lap_time: baseTime + index * 0.5 + (Math.random() - 0.5) * 3,
    best_lap_time: baseTime - 1 + index * 0.3,
    sector_1_time: baseTime * 0.3 + (Math.random() - 0.5) * 1,
    sector_2_time: baseTime * 0.4 + (Math.random() - 0.5) * 1,
    sector_3_time: baseTime * 0.3 + (Math.random() - 0.5) * 1,
    sector_1_pb: Math.random() < 0.1,
    sector_2_pb: Math.random() < 0.1,
    sector_3_pb: Math.random() < 0.1,
    sector_1_overall_fastest: index === 0 && Math.random() < 0.3,
    sector_2_overall_fastest: index === 1 && Math.random() < 0.3,
    sector_3_overall_fastest: index === 2 && Math.random() < 0.3,
    current_compound: getRandomTireCompound(),
    tyre_age: Math.floor(Math.random() * 15),
    lap_count: Math.floor(15 + Math.random() * 10),
    pit_count: Math.floor(Math.random() * 3),
    in_pit: Math.random() < 0.05,
    status: (Math.random() < 0.9 ? 'RUNNING' : 
            Math.random() < 0.7 ? 'PIT' : 'OUT') as 'RUNNING' | 'PIT' | 'OUT',
  }));
}

// Export mock timing data for direct use
export const mockTimingData = generateMockTimingData();

function getRandomTireCompound(): TireCompound {
  const compounds: TireCompound[] = ['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET'];
  return compounds[Math.floor(Math.random() * 3)]; // Favor dry compounds
}

// Mock car data for telemetry
export function generateMockCarData(driverNumber: number) {
  return {
    date: new Date().toISOString(),
    driver_number: driverNumber,
    meeting_key: parseInt(MOCK_SESSION.meeting_key),
    session_key: parseInt(MOCK_SESSION.session_key.split('-').pop() || '0'),
    speed: Math.floor(Math.random() * 100 + 200), // 200-300 km/h
    throttle: Math.floor(Math.random() * 100), // 0-100%
    brake: Math.random() < 0.2, // 20% chance of braking
    drs: Math.floor(Math.random() * 15), // 0-14 DRS state
    n_gear: Math.floor(Math.random() * 8 + 1), // 1-8 gears
    rpm: Math.floor(Math.random() * 6000 + 8000), // 8000-14000 RPM
  };
}

// Mock location data for track map
export function generateMockLocation(driverNumber: number) {
  return {
    date: new Date().toISOString(),
    driver_number: driverNumber,
    meeting_key: parseInt(MOCK_SESSION.meeting_key),
    session_key: parseInt(MOCK_SESSION.session_key.split('-').pop() || '0'),
    x: Math.random() * 800, // Track coordinates
    y: Math.random() * 600,
    z: Math.random() * 10,
  };
}

// Mock weather data
export const MOCK_WEATHER= {
  air_temperature: 28.5,
  date: new Date().toISOString(),
  humidity: 45,
  meeting_key: parseInt(MOCK_SESSION.meeting_key),
  pressure: 1013.2,
  rainfall: false,
  session_key: parseInt(MOCK_SESSION.session_key.split('-').pop() || '0'),
  track_temperature: 42.3,
  wind_direction: 180,
  wind_speed: 3.2,
};

// Mock race control messages
export const MOCK_RACE_CONTROL= [
  {
    category: 'Flag',
    date: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
    flag: 'GREEN',
    message: 'GREEN FLAG - Race Start',
    scope: 'Track',
    meeting_key: parseInt(MOCK_SESSION.meeting_key),
    session_key: parseInt(MOCK_SESSION.session_key.split('-').pop() || '0'),
  },
  {
    category: 'Drs',
    date: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
    flag: 'GREEN',
    message: 'DRS ENABLED',
    scope: 'Track',
    meeting_key: parseInt(MOCK_SESSION.meeting_key),
    session_key: parseInt(MOCK_SESSION.session_key.split('-').pop() || '0'),
  },
];

// Mock session records for history
export const MOCK_SESSION_RECORDS= [
  {
    session_key: 'mock-2025-bahrain-race',
    name: '2025 Bahrain Grand Prix - Race',
    circuit: 'Sakhir',
    start_time: '2025-03-15T15:00:00Z',
    end_time: '2025-03-15T17:00:00Z',
    status: 'completed' as const,
    total_data_points: 15432,
  },
  {
    session_key: 'mock-2025-bahrain-qualifying',
    name: '2025 Bahrain Grand Prix - Qualifying',
    circuit: 'Sakhir',
    start_time: '2025-03-14T15:00:00Z',
    end_time: '2025-03-14T16:00:00Z',
    status: 'completed' as const,
    total_data_points: 8765,
  },
  {
    session_key: 'mock-2025-bahrain-practice3',
    name: '2025 Bahrain Grand Prix - Practice 3',
    circuit: 'Sakhir',
    start_time: '2025-03-14T11:30:00Z',
    end_time: '2025-03-14T12:30:00Z',
    status: 'completed' as const,
    total_data_points: 6543,
  },
];

// Mock telemetry history for charts
export function generateMockTelemetryHistory(driverNumber: number, samples: number = 100) {
  const telemetry = [];
  
  for (let i = 0; i < samples; i++) {
    const lapDistance = (i / samples) * 100;
    const speed = 150 + Math.sin(lapDistance * 0.1) * 80 + Math.random() * 20;
    const isCorner = Math.sin(lapDistance * 0.15) > 0.7;
    
    telemetry.push({
      distance: lapDistance,
      speed: Math.max(80, speed),
      throttle: isCorner ? Math.random() * 30 : 80 + Math.random() * 20,
      brake: isCorner && Math.random() < 0.3 ? 100 : 0,
      gear: Math.min(8, Math.max(1, Math.floor(speed / 40))),
      drs: lapDistance > 70 && lapDistance < 90 && Math.random() < 0.8 ? 12 : 0,
      rpm: 8000 + (speed * 40) + Math.random() * 1000,
    });
  }
  
  return telemetry;
}

// Generate mock pit stop data
export function generateMockPitStops() {
  return MOCK_DRIVERS.slice(0, 8).map((driver, index) => ({
    driver_number: driver.driver_number,
    lap_number: 15 + index * 2,
    pit_duration: 3.2 + Math.random() * 1.5,
    compound_in: 'MEDIUM' as TireCompound,
    compound_out: 'HARD' as TireCompound,
    timestamp: new Date(Date.now() - (8 - index) * 180000).toISOString(),
  }));
}

// Generate mock tire degradation data
export function generateMockTireDegData() {
  const compounds: TireCompound[] = ['SOFT', 'MEDIUM', 'HARD'];
  const data = [];
  
  compounds.forEach(compound => {
    for (let age = 1; age <= 20; age++) {
      let baseTime = 87.5;
      
      // Different degradation rates
      switch (compound) {
        case 'SOFT':
          baseTime += age * 0.15; // Fast degradation
          break;
        case 'MEDIUM':
          baseTime += age * 0.08; // Medium degradation
          break;
        case 'HARD':
          baseTime += age * 0.04; // Slow degradation
          break;
      }
      
      data.push({
        age,
        lapTime: baseTime + (Math.random() - 0.5) * 1.5,
        compound,
        driver: 'VER', // Example driver
      });
    }
  });
  
  return data;
}

// Helper function to simulate live data updates
export function createMockDataStream() {
  return {
    timing: () => generateMockTimingData(),
    carData: (driverNumber: number) => generateMockCarData(driverNumber),
    location: (driverNumber: number) => generateMockLocation(driverNumber),
    weather: () => MOCK_WEATHER,
    raceControl: () => MOCK_RACE_CONTROL,
  };
}

// Mock WebSocket event generator
export function* mockWebSocketEvents() {
  while (true) {
    // Emit car data for random driver
    const randomDriver = MOCK_DRIVERS[Math.floor(Math.random() * MOCK_DRIVERS.length)];
    
    yield {
      type: 'car_data',
      data: generateMockCarData(randomDriver.driver_number),
      timestamp: Date.now(),
    };
    
    yield {
      type: 'location',
      data: generateMockLocation(randomDriver.driver_number),
      timestamp: Date.now(),
    };
    
    // Occasionally emit other types
    if (Math.random() < 0.1) {
      yield {
        type: 'weather',
        data: MOCK_WEATHER,
        timestamp: Date.now(),
      };
    }
    
    if (Math.random() < 0.05) {
      yield {
        type: 'race_control',
        data: MOCK_RACE_CONTROL[Math.floor(Math.random() * MOCK_RACE_CONTROL.length)],
        timestamp: Date.now(),
      };
    }
  }
}

// Already exported above via named exports