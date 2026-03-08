'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { TimingRowData } from '@/lib/types';
import { mockTimingData } from '@/lib/mock-data';

interface DriverComparisonProps {
  drivers?: TimingRowData[];
  className?: string;
}

export function DriverComparison({
  drivers = mockTimingData,
  className
}: DriverComparisonProps) {
  const [driver1, setDriver1] = useState<TimingRowData | null>(drivers[0] || null);
  const [driver2, setDriver2] = useState<TimingRowData | null>(drivers[1] || null);
  const [dropdown1Open, setDropdown1Open] = useState(false);
  const [dropdown2Open, setDropdown2Open] = useState(false);

  const formatTime = (time?: number) => {
    if (!time) return '-';
    const minutes = Math.floor(time / 60);
    const seconds = (time % 60).toFixed(3);
    return minutes > 0 ? `${minutes}:${seconds.padStart(6, '0')}` : seconds;
  };

  const formatGap = (gap: number) => {
    if (gap === 0) return 'LEADER';
    if (gap < 1) return `+${(gap * 1000).toFixed(0)}ms`;
    if (gap < 60) return `+${gap.toFixed(3)}`;
    const minutes = Math.floor(gap / 60);
    const seconds = (gap % 60).toFixed(3);
    return `+${minutes}:${seconds.padStart(6, '0')}`;
  };

  const compareDrivers = (d1: TimingRowData | null, d2: TimingRowData | null) => {
    if (!d1 || !d2) return null;
    
    const gap = d2.gap_to_leader - d1.gap_to_leader;
    return {
      positionDiff: d2.position - d1.position,
      gapBetween: Math.abs(gap),
      leader: gap > 0 ? d1 : d2,
      faster: d1.last_lap_time < d2.last_lap_time ? d1 : d2
    };
  };

  const comparison = compareDrivers(driver1, driver2);

  const DriverDropdown = ({ 
    selectedDriver, 
    onSelect, 
    isOpen, 
    onToggle,
    side 
  }: {
    selectedDriver: TimingRowData | null;
    onSelect: (driver: TimingRowData) => void;
    isOpen: boolean;
    onToggle: () => void;
    side: 'left' | 'right';
  }) => (
    <div className="relative">
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all',
          selectedDriver ? 'border-white/20 bg-surface/40' : 'border-dashed border-white/30',
          isOpen && 'border-white/40'
        )}
        style={selectedDriver ? { borderLeftColor: selectedDriver.team_color, borderLeftWidth: '4px' } : {}}
      >
        <div className="flex items-center space-x-3">
          {selectedDriver ? (
            <>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold"
                   style={{ backgroundColor: selectedDriver.team_color, color: 'white' }}>
                {selectedDriver.position}
              </div>
              <div>
                <div className="font-mono font-bold text-text-primary">{selectedDriver.driver_code}</div>
                <div className="text-xs text-text-secondary">{selectedDriver.team_name}</div>
              </div>
            </>
          ) : (
            <div className="text-text-secondary">Select driver...</div>
          )}
        </div>
        <ChevronDown size={16} className={cn('transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-white/20 rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto">
          {drivers
            .filter(d => d.driver_number !== (side === 'left' ? driver2?.driver_number : driver1?.driver_number))
            .map((driver) => (
              <button
                key={driver.driver_number}
                onClick={() => {
                  onSelect(driver);
                  onToggle();
                }}
                className="w-full flex items-center space-x-3 p-3 hover:bg-white/5 transition-colors border-l-4"
                style={{ borderLeftColor: driver.team_color }}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold"
                     style={{ backgroundColor: driver.team_color, color: 'white' }}>
                  {driver.position}
                </div>
                <div className="text-left">
                  <div className="font-mono font-bold text-text-primary text-sm">{driver.driver_code}</div>
                  <div className="text-xs text-text-secondary">{driver.team_name}</div>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={cn(
      'bg-surface/80 backdrop-blur-md border border-white/10 rounded-xl p-4',
      className
    )}>
      <h3 className="text-text-primary font-medium text-sm uppercase tracking-wider mb-4">
        Driver Comparison
      </h3>

      {/* Driver Selection */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <DriverDropdown
          selectedDriver={driver1}
          onSelect={setDriver1}
          isOpen={dropdown1Open}
          onToggle={() => setDropdown1Open(!dropdown1Open)}
          side="left"
        />
        <DriverDropdown
          selectedDriver={driver2}
          onSelect={setDriver2}
          isOpen={dropdown2Open}
          onToggle={() => setDropdown2Open(!dropdown2Open)}
          side="right"
        />
      </div>

      {/* Comparison Data */}
      {driver1 && driver2 && (
        <div className="space-y-4">
          {/* Quick Stats */}
          {comparison && (
            <div className="p-3 bg-surface/40 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-center text-sm">
                <div>
                  <div className="text-text-secondary">Position Diff</div>
                  <div className="font-mono font-bold text-text-primary">
                    {comparison.positionDiff > 0 ? '+' : ''}{comparison.positionDiff}
                  </div>
                </div>
                <div>
                  <div className="text-text-secondary">Gap Between</div>
                  <div className="font-mono font-bold text-text-primary">
                    {formatGap(comparison.gapBetween)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Side-by-side comparison */}
          <div className="grid grid-cols-2 gap-1 text-sm">
            {/* Headers */}
            <div className="p-2 text-center font-mono font-bold" style={{ color: driver1.team_color }}>
              {driver1.driver_code}
            </div>
            <div className="p-2 text-center font-mono font-bold" style={{ color: driver2.team_color }}>
              {driver2.driver_code}
            </div>

            {/* Position */}
            <div className="p-2 text-center bg-surface/20 rounded-l">
              <div className="text-xs text-text-secondary mb-1">Position</div>
              <div className="font-mono font-bold text-text-primary">P{driver1.position}</div>
            </div>
            <div className="p-2 text-center bg-surface/20 rounded-r">
              <div className="text-xs text-text-secondary mb-1">Position</div>
              <div className="font-mono font-bold text-text-primary">P{driver2.position}</div>
            </div>

            {/* Last Lap */}
            <div className={cn(
              "p-2 text-center rounded-l",
              driver1.last_lap_time < driver2.last_lap_time ? "bg-green-500/20" : "bg-surface/20"
            )}>
              <div className="text-xs text-text-secondary mb-1">Last Lap</div>
              <div className="font-mono font-bold text-text-primary">{formatTime(driver1.last_lap_time)}</div>
            </div>
            <div className={cn(
              "p-2 text-center rounded-r",
              driver2.last_lap_time < driver1.last_lap_time ? "bg-green-500/20" : "bg-surface/20"
            )}>
              <div className="text-xs text-text-secondary mb-1">Last Lap</div>
              <div className="font-mono font-bold text-text-primary">{formatTime(driver2.last_lap_time)}</div>
            </div>

            {/* Best Lap */}
            <div className={cn(
              "p-2 text-center rounded-l",
              driver1.best_lap_time < driver2.best_lap_time ? "bg-purple-500/20" : "bg-surface/20"
            )}>
              <div className="text-xs text-text-secondary mb-1">Best Lap</div>
              <div className="font-mono font-bold text-text-primary">{formatTime(driver1.best_lap_time)}</div>
            </div>
            <div className={cn(
              "p-2 text-center rounded-r",
              driver2.best_lap_time < driver1.best_lap_time ? "bg-purple-500/20" : "bg-surface/20"
            )}>
              <div className="text-xs text-text-secondary mb-1">Best Lap</div>
              <div className="font-mono font-bold text-text-primary">{formatTime(driver2.best_lap_time)}</div>
            </div>

            {/* Tire Age */}
            <div className={cn(
              "p-2 text-center rounded-l",
              driver1.tyre_age < driver2.tyre_age ? "bg-green-500/20" : "bg-surface/20"
            )}>
              <div className="text-xs text-text-secondary mb-1">Tire Age</div>
              <div className="font-mono font-bold text-text-primary">{driver1.tyre_age} laps</div>
            </div>
            <div className={cn(
              "p-2 text-center rounded-r",
              driver2.tyre_age < driver1.tyre_age ? "bg-green-500/20" : "bg-surface/20"
            )}>
              <div className="text-xs text-text-secondary mb-1">Tire Age</div>
              <div className="font-mono font-bold text-text-primary">{driver2.tyre_age} laps</div>
            </div>

            {/* Pit Stops */}
            <div className="p-2 text-center bg-surface/20 rounded-l">
              <div className="text-xs text-text-secondary mb-1">Pit Stops</div>
              <div className="font-mono font-bold text-text-primary">{driver1.pit_count}</div>
            </div>
            <div className="p-2 text-center bg-surface/20 rounded-r">
              <div className="text-xs text-text-secondary mb-1">Pit Stops</div>
              <div className="font-mono font-bold text-text-primary">{driver2.pit_count}</div>
            </div>
          </div>
        </div>
      )}

      {(!driver1 || !driver2) && (
        <div className="text-center text-text-secondary py-8">
          Select two drivers to compare
        </div>
      )}
    </div>
  );
}