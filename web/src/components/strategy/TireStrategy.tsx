'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { TimingRowData } from '@/lib/types';
import { mockTimingData } from '@/lib/mock-data';
import { TIRE_COLORS } from '@/lib/constants';

interface TireStrategyProps {
  drivers?: TimingRowData[];
  className?: string;
}

export function TireStrategy({
  drivers = mockTimingData,
  className
}: TireStrategyProps) {
  const getTireColor = (compound: string) => {
    return TIRE_COLORS[compound as keyof typeof TIRE_COLORS] || '#666666';
  };

  const getStintNumber = (pitCount: number) => {
    return pitCount + 1;
  };

  const getCompoundAbbreviation = (compound: string) => {
    switch (compound) {
      case 'SOFT': return 'S';
      case 'MEDIUM': return 'M';
      case 'HARD': return 'H';
      case 'INTERMEDIATE': return 'I';
      case 'WET': return 'W';
      default: return compound[0];
    }
  };

  const sortedDrivers = [...drivers].sort((a, b) => a.position - b.position);

  return (
    <div className={cn(
      'bg-surface/80 backdrop-blur-md border border-white/10 rounded-xl p-4',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary font-medium text-sm uppercase tracking-wider">
          Tire Strategy
        </h3>
        <div className="text-xs text-text-secondary">
          Current compounds & ages
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-6 gap-2 pb-2 mb-2 border-b border-white/10 text-2xs text-text-secondary uppercase tracking-wider">
        <div>Pos</div>
        <div>Driver</div>
        <div>Compound</div>
        <div>Age (laps)</div>
        <div>Stint</div>
        <div>Pits</div>
      </div>

      {/* Driver Tire Data */}
      <div className="space-y-1 max-h-80 overflow-y-auto">
        {sortedDrivers.map((driver) => (
          <div
            key={driver.driver_number}
            className="grid grid-cols-6 gap-2 p-2 hover:bg-white/5 rounded-lg transition-colors border-l-2"
            style={{ borderLeftColor: driver.team_color }}
          >
            {/* Position */}
            <div className="flex items-center">
              <span className="font-mono text-sm font-bold text-text-primary">
                {driver.position}
              </span>
            </div>

            {/* Driver */}
            <div className="flex items-center">
              <span className="font-mono text-sm text-text-primary">
                {driver.driver_code}
              </span>
            </div>

            {/* Compound */}
            <div className="flex items-center">
              <Badge
                variant="tire"
                color={getTireColor(driver.current_compound)}
                size="sm"
              >
                {getCompoundAbbreviation(driver.current_compound)}
              </Badge>
            </div>

            {/* Age */}
            <div className="flex items-center">
              <span className={cn(
                "font-mono text-sm",
                driver.tyre_age > 15 ? "text-red-400" :
                driver.tyre_age > 10 ? "text-yellow-400" : "text-green-400"
              )}>
                {driver.tyre_age}
              </span>
            </div>

            {/* Stint */}
            <div className="flex items-center">
              <span className="font-mono text-sm text-text-primary">
                {getStintNumber(driver.pit_count)}
              </span>
            </div>

            {/* Pit Count */}
            <div className="flex items-center">
              <span className="font-mono text-sm text-text-primary">
                {driver.pit_count}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-text-secondary">Compounds:</span>
          
          <div className="flex items-center space-x-1">
            <Badge variant="tire" color={TIRE_COLORS.SOFT} size="sm">S</Badge>
            <span className="text-text-secondary">Soft</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Badge variant="tire" color={TIRE_COLORS.MEDIUM} size="sm">M</Badge>
            <span className="text-text-secondary">Medium</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Badge variant="tire" color={TIRE_COLORS.HARD} size="sm">H</Badge>
            <span className="text-text-secondary">Hard</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Badge variant="tire" color={TIRE_COLORS.INTERMEDIATE} size="sm">I</Badge>
            <span className="text-text-secondary">Inter</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Badge variant="tire" color={TIRE_COLORS.WET} size="sm">W</Badge>
            <span className="text-text-secondary">Wet</span>
          </div>
        </div>

        {/* Age indicators */}
        <div className="flex items-center gap-4 mt-2 text-xs">
          <span className="text-text-secondary">Age:</span>
          
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-text-secondary">Fresh (0-10 laps)</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-text-secondary">Used (11-15 laps)</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span className="text-text-secondary">Degraded (16+ laps)</span>
          </div>
        </div>
      </div>
    </div>
  );
}