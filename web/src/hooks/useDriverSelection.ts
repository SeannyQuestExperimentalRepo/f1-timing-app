// Hook for managing driver selection and multi-driver operations

import { useCallback, useMemo } from 'react';
import { useSessionStore, useSelectedDrivers, useFollowDriver, useDrivers } from '@/stores/session-store';
import { Driver, TimingRowData } from '@/lib/types';
import { getStoredValue, setStoredValue } from '@/lib/utils';

interface DriverSelectionOptions {
  maxSelection?: number;
  persistSelection?: boolean;
  autoSelectLeader?: boolean;
}

const DEFAULT_OPTIONS: Required<DriverSelectionOptions> = {
  maxSelection: 5,
  persistSelection: true,
  autoSelectLeader: false,
};

export function useDriverSelection(options: DriverSelectionOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  const sessionStore = useSessionStore();
  const selectedDrivers = useSelectedDrivers();
  const followDriver = useFollowDriver();
  const drivers = useDrivers();
  
  // Get selected driver objects
  const selectedDriverObjects = useMemo(() => {
    return selectedDrivers
      .map(driverNumber => sessionStore.getDriverByNumber(driverNumber))
      .filter((driver): driver is Driver => driver !== null);
  }, [selectedDrivers, sessionStore]);
  
  // Get timing data for selected drivers
  const selectedDriversTimingData = useMemo(() => {
    return selectedDrivers
      .map(driverNumber => sessionStore.getTimingForDriver(driverNumber))
      .filter((timing): timing is TimingRowData => timing !== null);
  }, [selectedDrivers, sessionStore]);
  
  // Select a driver
  const selectDriver = useCallback((driverNumber: number) => {
    // Check if already selected
    if (selectedDrivers.includes(driverNumber)) {
      return;
    }
    
    // Check max selection limit
    if (selectedDrivers.length >= config.maxSelection) {
      // Remove oldest selection
      sessionStore.deselectDriver(selectedDrivers[0]);
    }
    
    sessionStore.selectDriver(driverNumber);
    
    // Persist to localStorage if enabled
    if (config.persistSelection) {
      const newSelection = [...selectedDrivers, driverNumber].slice(-config.maxSelection);
      setStoredValue('f1-selected-drivers', newSelection);
    }
  }, [selectedDrivers, sessionStore, config.maxSelection, config.persistSelection]);
  
  // Deselect a driver
  const deselectDriver = useCallback((driverNumber: number) => {
    sessionStore.deselectDriver(driverNumber);
    
    // Update localStorage
    if (config.persistSelection) {
      const newSelection = selectedDrivers.filter(d => d !== driverNumber);
      setStoredValue('f1-selected-drivers', newSelection);
    }
  }, [selectedDrivers, sessionStore, config.persistSelection]);
  
  // Toggle driver selection
  const toggleDriver = useCallback((driverNumber: number) => {
    if (selectedDrivers.includes(driverNumber)) {
      deselectDriver(driverNumber);
    } else {
      selectDriver(driverNumber);
    }
  }, [selectedDrivers, selectDriver, deselectDriver]);
  
  // Select multiple drivers
  const selectDrivers = useCallback((driverNumbers: number[]) => {
    // Clear current selection
    selectedDrivers.forEach(driverNumber => {
      sessionStore.deselectDriver(driverNumber);
    });
    
    // Select new drivers (respect max limit)
    const limitedSelection = driverNumbers.slice(-config.maxSelection);
    limitedSelection.forEach(driverNumber => {
      sessionStore.selectDriver(driverNumber);
    });
    
    // Persist selection
    if (config.persistSelection) {
      setStoredValue('f1-selected-drivers', limitedSelection);
    }
  }, [selectedDrivers, sessionStore, config.maxSelection, config.persistSelection]);
  
  // Clear all selections
  const clearSelection = useCallback(() => {
    selectedDrivers.forEach(driverNumber => {
      sessionStore.deselectDriver(driverNumber);
    });
    
    if (config.persistSelection) {
      setStoredValue('f1-selected-drivers', []);
    }
  }, [selectedDrivers, sessionStore, config.persistSelection]);
  
  // Select top N drivers by position
  const selectTopDrivers = useCallback((count: number = 3) => {
    const timingData = sessionStore.getSortedTimingData();
    const topDriverNumbers = timingData
      .slice(0, count)
      .map(timing => timing.driver_number);
    
    selectDrivers(topDriverNumbers);
  }, [sessionStore, selectDrivers]);
  
  // Select drivers by team
  const selectByTeam = useCallback((teamName: string) => {
    const teamDriverNumbers = drivers
      .filter(driver => driver.team_name === teamName)
      .map(driver => driver.driver_number);
    
    selectDrivers(teamDriverNumbers);
  }, [drivers, selectDrivers]);
  
  // Set follow driver (for camera/focus mode)
  const setFollowDriver = useCallback((driverNumber: number | null) => {
    sessionStore.setFollowDriver(driverNumber);
    
    if (config.persistSelection) {
      setStoredValue('f1-follow-driver', driverNumber);
    }
  }, [sessionStore, config.persistSelection]);
  
  // Follow leader automatically
  const followLeader = useCallback(() => {
    const timingData = sessionStore.getSortedTimingData();
    if (timingData.length > 0) {
      setFollowDriver(timingData[0].driver_number);
    }
  }, [sessionStore, setFollowDriver]);
  
  // Get driver by position
  const getDriverByPosition = useCallback((position: number): TimingRowData | null => {
    const timingData = sessionStore.getSortedTimingData();
    const driverTiming = timingData.find(timing => timing.position === position);
    return driverTiming || null;
  }, [sessionStore]);
  
  // Check if driver is selected
  const isDriverSelected = useCallback((driverNumber: number): boolean => {
    return selectedDrivers.includes(driverNumber);
  }, [selectedDrivers]);
  
  // Get selection info
  const getSelectionInfo = useMemo(() => {
    return {
      count: selectedDrivers.length,
      maxCount: config.maxSelection,
      isEmpty: selectedDrivers.length === 0,
      isFull: selectedDrivers.length >= config.maxSelection,
      canSelectMore: selectedDrivers.length < config.maxSelection,
    };
  }, [selectedDrivers, config.maxSelection]);
  
  // Load persisted selection on mount
  const loadPersistedSelection = useCallback(() => {
    if (!config.persistSelection) return;
    
    const savedDrivers = getStoredValue<number[]>('f1-selected-drivers', []);
    const savedFollowDriver = getStoredValue<number | null>('f1-follow-driver', null);
    
    if (savedDrivers.length > 0) {
      selectDrivers(savedDrivers);
    }
    
    if (savedFollowDriver !== null) {
      setFollowDriver(savedFollowDriver);
    }
    
    if (config.autoSelectLeader && savedDrivers.length === 0) {
      followLeader();
    }
  }, [config.persistSelection, config.autoSelectLeader, selectDrivers, setFollowDriver, followLeader]);
  
  return {
    // Selection state
    selectedDrivers,
    selectedDriverObjects,
    selectedDriversTimingData,
    followDriver,
    selectionInfo: getSelectionInfo,
    
    // Selection actions
    selectDriver,
    deselectDriver,
    toggleDriver,
    selectDrivers,
    clearSelection,
    selectTopDrivers,
    selectByTeam,
    
    // Follow actions
    setFollowDriver,
    followLeader,
    
    // Utility functions
    isDriverSelected,
    getDriverByPosition,
    loadPersistedSelection,
  };
}

// Hook for driver comparison selection (specifically for head-to-head)
export function useDriverComparison() {
  const [driver1, setDriver1] = useState<number | null>(null);
  const [driver2, setDriver2] = useState<number | null>(null);
  
  const sessionStore = useSessionStore();
  
  const driver1Data = useMemo(() => {
    return driver1 ? sessionStore.getDriverByNumber(driver1) : null;
  }, [driver1, sessionStore]);
  
  const driver2Data = useMemo(() => {
    return driver2 ? sessionStore.getDriverByNumber(driver2) : null;
  }, [driver2, sessionStore]);
  
  const swapDrivers = useCallback(() => {
    const temp = driver1;
    setDriver1(driver2);
    setDriver2(temp);
  }, [driver1, driver2]);
  
  const clearComparison = useCallback(() => {
    setDriver1(null);
    setDriver2(null);
  }, []);
  
  const setDriverForComparison = useCallback((driverNumber: number, slot: 1 | 2) => {
    if (slot === 1) {
      setDriver1(driverNumber);
    } else {
      setDriver2(driverNumber);
    }
  }, []);
  
  const canCompare = useMemo(() => {
    return driver1 !== null && driver2 !== null && driver1 !== driver2;
  }, [driver1, driver2]);
  
  return {
    driver1,
    driver2,
    driver1Data,
    driver2Data,
    setDriver1,
    setDriver2,
    swapDrivers,
    clearComparison,
    setDriverForComparison,
    canCompare,
  };
}

// Hook for team-based driver grouping
export function useTeamDrivers() {
  const drivers = useDrivers();
  
  const teamGroups = useMemo(() => {
    const groups: Record<string, Driver[]> = {};
    
    drivers.forEach(driver => {
      if (!groups[driver.team_name]) {
        groups[driver.team_name] = [];
      }
      groups[driver.team_name].push(driver);
    });
    
    return groups;
  }, [drivers]);
  
  const getTeammates = useCallback((driverNumber: number): Driver[] => {
    const driver = drivers.find(d => d.driver_number === driverNumber);
    if (!driver) return [];
    
    return teamGroups[driver.team_name]?.filter(d => d.driver_number !== driverNumber) || [];
  }, [drivers, teamGroups]);
  
  const getTeamName = useCallback((driverNumber: number): string | null => {
    const driver = drivers.find(d => d.driver_number === driverNumber);
    return driver?.team_name || null;
  }, [drivers]);
  
  return {
    teamGroups,
    getTeammates,
    getTeamName,
    teamNames: Object.keys(teamGroups),
  };
}

import { useState } from 'react';