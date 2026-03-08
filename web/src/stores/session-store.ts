// Zustand store for F1 session data and state management

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
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
  ConnectionState 
} from '@/lib/types';

interface SessionState {
  // Session metadata
  currentSession: Session | null;
  drivers: Driver[];
  
  // Live timing data
  timingData: TimingRowData[];
  positions: Position[];
  intervals: Interval[];
  
  // Telemetry data (latest for each driver)
  carData: Map<number, CarData>;
  locations: Map<number, Location>;
  
  // Session data
  laps: Lap[];
  stints: Stint[];
  weather: Weather | null;
  
  // Race control and communications
  raceControlMessages: RaceControl[];
  teamRadioClips: TeamRadio[];
  
  // UI state
  selectedDrivers: number[];
  followDriver: number | null;
  connectionState: ConnectionState;
  lastUpdated: number;
  
  // Actions
  setCurrentSession: (session: Session | null) => void;
  setDrivers: (drivers: Driver[]) => void;
  updateTimingData: (data: TimingRowData[]) => void;
  updateCarData: (driverNumber: number, data: CarData) => void;
  updateLocation: (driverNumber: number, data: Location) => void;
  updatePosition: (data: Position) => void;
  updateInterval: (data: Interval) => void;
  addLap: (lap: Lap) => void;
  updateStint: (stint: Stint) => void;
  updateWeather: (weather: Weather) => void;
  addRaceControlMessage: (message: RaceControl) => void;
  addTeamRadioClip: (clip: TeamRadio) => void;
  selectDriver: (driverNumber: number) => void;
  deselectDriver: (driverNumber: number) => void;
  setFollowDriver: (driverNumber: number | null) => void;
  updateConnectionState: (state: Partial<ConnectionState>) => void;
  reset: () => void;
  
  // Derived data getters
  getDriverByNumber: (driverNumber: number) => Driver | null;
  getTimingForDriver: (driverNumber: number) => TimingRowData | null;
  getCurrentStintForDriver: (driverNumber: number) => Stint | null;
  getLatestLapForDriver: (driverNumber: number) => Lap | null;
  getSortedTimingData: () => TimingRowData[];
}

const initialConnectionState: ConnectionState = {
  isConnected: false,
  reconnectAttempts: 0,
  lastHeartbeat: 0,
  latency: 0,
};

export const useSessionStore = create<SessionState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentSession: null,
    drivers: [],
    timingData: [],
    positions: [],
    intervals: [],
    carData: new Map(),
    locations: new Map(),
    laps: [],
    stints: [],
    weather: null,
    raceControlMessages: [],
    teamRadioClips: [],
    selectedDrivers: [],
    followDriver: null,
    connectionState: initialConnectionState,
    lastUpdated: 0,

    // Actions
    setCurrentSession: (session) => set({ currentSession: session }),
    
    setDrivers: (drivers) => set({ drivers }),
    
    updateTimingData: (data) => set({ 
      timingData: data,
      lastUpdated: Date.now() 
    }),
    
    updateCarData: (driverNumber, data) => set((state) => {
      const newCarData = new Map(state.carData);
      newCarData.set(driverNumber, data);
      return { 
        carData: newCarData,
        lastUpdated: Date.now() 
      };
    }),
    
    updateLocation: (driverNumber, data) => set((state) => {
      const newLocations = new Map(state.locations);
      newLocations.set(driverNumber, data);
      return { 
        locations: newLocations,
        lastUpdated: Date.now() 
      };
    }),
    
    updatePosition: (data) => set((state) => {
      const newPositions = state.positions.filter(p => p.driver_number !== data.driver_number);
      newPositions.push(data);
      return { 
        positions: newPositions.sort((a, b) => a.position - b.position),
        lastUpdated: Date.now() 
      };
    }),
    
    updateInterval: (data) => set((state) => {
      const newIntervals = state.intervals.filter(i => i.driver_number !== data.driver_number);
      newIntervals.push(data);
      return { 
        intervals: newIntervals,
        lastUpdated: Date.now() 
      };
    }),
    
    addLap: (lap) => set((state) => ({
      laps: [...state.laps.filter(l => 
        l.driver_number !== lap.driver_number || l.lap_number !== lap.lap_number
      ), lap].sort((a, b) => 
        a.driver_number - b.driver_number || a.lap_number - b.lap_number
      ),
      lastUpdated: Date.now()
    })),
    
    updateStint: (stint) => set((state) => ({
      stints: [...state.stints.filter(s => 
        s.driver_number !== stint.driver_number || s.stint_number !== stint.stint_number
      ), stint],
      lastUpdated: Date.now()
    })),
    
    updateWeather: (weather) => set({ 
      weather,
      lastUpdated: Date.now() 
    }),
    
    addRaceControlMessage: (message) => set((state) => ({
      raceControlMessages: [...state.raceControlMessages, message]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 100), // Keep only latest 100 messages
      lastUpdated: Date.now()
    })),
    
    addTeamRadioClip: (clip) => set((state) => ({
      teamRadioClips: [...state.teamRadioClips, clip]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 50), // Keep only latest 50 clips
      lastUpdated: Date.now()
    })),
    
    selectDriver: (driverNumber) => set((state) => ({
      selectedDrivers: state.selectedDrivers.includes(driverNumber) 
        ? state.selectedDrivers 
        : [...state.selectedDrivers, driverNumber]
    })),
    
    deselectDriver: (driverNumber) => set((state) => ({
      selectedDrivers: state.selectedDrivers.filter(d => d !== driverNumber)
    })),
    
    setFollowDriver: (driverNumber) => set({ followDriver: driverNumber }),
    
    updateConnectionState: (newState) => set((state) => ({
      connectionState: { ...state.connectionState, ...newState }
    })),
    
    reset: () => set({
      currentSession: null,
      drivers: [],
      timingData: [],
      positions: [],
      intervals: [],
      carData: new Map(),
      locations: new Map(),
      laps: [],
      stints: [],
      weather: null,
      raceControlMessages: [],
      teamRadioClips: [],
      selectedDrivers: [],
      followDriver: null,
      connectionState: initialConnectionState,
      lastUpdated: 0,
    }),

    // Derived data getters
    getDriverByNumber: (driverNumber) => {
      const { drivers } = get();
      return drivers.find(d => d.driver_number === driverNumber) || null;
    },
    
    getTimingForDriver: (driverNumber) => {
      const { timingData } = get();
      return timingData.find(t => t.driver_number === driverNumber) || null;
    },
    
    getCurrentStintForDriver: (driverNumber) => {
      const { stints } = get();
      const driverStints = stints.filter(s => s.driver_number === driverNumber);
      return driverStints.length > 0 
        ? driverStints.sort((a, b) => b.stint_number - a.stint_number)[0]
        : null;
    },
    
    getLatestLapForDriver: (driverNumber) => {
      const { laps } = get();
      const driverLaps = laps.filter(l => l.driver_number === driverNumber);
      return driverLaps.length > 0
        ? driverLaps.sort((a, b) => b.lap_number - a.lap_number)[0]
        : null;
    },
    
    getSortedTimingData: () => {
      const { timingData } = get();
      return timingData.sort((a, b) => a.position - b.position);
    },
  }))
);

// Selectors for commonly used derived data
export const useCurrentSession = () => useSessionStore(state => state.currentSession);
export const useDrivers = () => useSessionStore(state => state.drivers);
export const useTimingData = () => useSessionStore(state => state.getSortedTimingData());
export const useSelectedDrivers = () => useSessionStore(state => state.selectedDrivers);
export const useFollowDriver = () => useSessionStore(state => state.followDriver);
export const useConnectionState = () => useSessionStore(state => state.connectionState);
export const useWeather = () => useSessionStore(state => state.weather);
export const useRaceControlMessages = () => useSessionStore(state => state.raceControlMessages);
export const useTeamRadioClips = () => useSessionStore(state => state.teamRadioClips);

// Selectors for specific driver data
export const useDriverData = (driverNumber: number) => useSessionStore(state => ({
  driver: state.getDriverByNumber(driverNumber),
  timing: state.getTimingForDriver(driverNumber),
  carData: state.carData.get(driverNumber),
  location: state.locations.get(driverNumber),
  currentStint: state.getCurrentStintForDriver(driverNumber),
  latestLap: state.getLatestLapForDriver(driverNumber),
}));

// Selector for multiple driver comparison
export const useDriverComparison = (driver1: number, driver2: number) => 
  useSessionStore(state => ({
    driver1Data: {
      driver: state.getDriverByNumber(driver1),
      timing: state.getTimingForDriver(driver1),
      carData: state.carData.get(driver1),
      latestLap: state.getLatestLapForDriver(driver1),
    },
    driver2Data: {
      driver: state.getDriverByNumber(driver2),
      timing: state.getTimingForDriver(driver2),
      carData: state.carData.get(driver2),
      latestLap: state.getLatestLapForDriver(driver2),
    },
  }));