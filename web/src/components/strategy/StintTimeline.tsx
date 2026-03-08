'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { TIRE_COLORS } from '@/lib/constants';
import { Badge } from '@/components/ui/Badge';

interface StintData {
  stintNumber: number;
  compound: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET';
  startLap: number;
  endLap: number;
  lapCount: number;
}

interface DriverStintData {
  driver: string;
  driverNumber: number;
  teamColor: string;
  stints: StintData[];
  totalLaps: number;
}

interface StintTimelineProps {
  className?: string;
}

export function StintTimeline({
  className
}: StintTimelineProps) {
  // Mock stint data for drivers
  const driversStintData: DriverStintData[] = [
    {
      driver: 'VER',
      driverNumber: 1,
      teamColor: '#0600ef',
      totalLaps: 57,
      stints: [
        { stintNumber: 1, compound: 'SOFT', startLap: 1, endLap: 18, lapCount: 18 },
        { stintNumber: 2, compound: 'MEDIUM', startLap: 19, endLap: 42, lapCount: 24 },
        { stintNumber: 3, compound: 'HARD', startLap: 43, endLap: 57, lapCount: 15 }
      ]
    },
    {
      driver: 'LEC',
      driverNumber: 16,
      teamColor: '#dc0000',
      totalLaps: 57,
      stints: [
        { stintNumber: 1, compound: 'MEDIUM', startLap: 1, endLap: 22, lapCount: 22 },
        { stintNumber: 2, compound: 'HARD', startLap: 23, endLap: 57, lapCount: 35 }
      ]
    },
    {
      driver: 'NOR',
      driverNumber: 4,
      teamColor: '#ff8700',
      totalLaps: 57,
      stints: [
        { stintNumber: 1, compound: 'HARD', startLap: 1, endLap: 25, lapCount: 25 },
        { stintNumber: 2, compound: 'MEDIUM', startLap: 26, endLap: 47, lapCount: 22 },
        { stintNumber: 3, compound: 'SOFT', startLap: 48, endLap: 57, lapCount: 10 }
      ]
    },
    {
      driver: 'RUS',
      driverNumber: 63,
      teamColor: '#00d2be',
      totalLaps: 57,
      stints: [
        { stintNumber: 1, compound: 'SOFT', startLap: 1, endLap: 15, lapCount: 15 },
        { stintNumber: 2, compound: 'MEDIUM', startLap: 16, endLap: 35, lapCount: 20 },
        { stintNumber: 3, compound: 'MEDIUM', startLap: 36, endLap: 57, lapCount: 22 }
      ]
    },
    {
      driver: 'PIA',
      driverNumber: 81,
      teamColor: '#ff8700',
      totalLaps: 57,
      stints: [
        { stintNumber: 1, compound: 'MEDIUM', startLap: 1, endLap: 28, lapCount: 28 },
        { stintNumber: 2, compound: 'HARD', startLap: 29, endLap: 57, lapCount: 29 }
      ]
    }
  ];

  const getCompoundColor = (compound: string) => {
    return TIRE_COLORS[compound as keyof typeof TIRE_COLORS] || '#666666';
  };

  const getStintWidth = (lapCount: number, totalLaps: number) => {
    return (lapCount / totalLaps) * 100;
  };

  return (
    <div className={cn(
      'bg-surface/80 backdrop-blur-md border border-white/10 rounded-xl p-4',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary font-medium text-sm uppercase tracking-wider">
          Stint Timeline
        </h3>
        <div className="text-xs text-text-secondary">
          Race distance: 57 laps
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {driversStintData.map((driverData) => (
          <div key={driverData.driverNumber} className="space-y-2">
            {/* Driver Info */}
            <div className="flex items-center space-x-3">
              <div
                className="w-1 h-6 rounded-full"
                style={{ backgroundColor: driverData.teamColor }}
              />
              <div className="font-mono font-bold text-text-primary text-sm w-12">
                {driverData.driver}
              </div>
              <div className="text-xs text-text-secondary">
                #{driverData.driverNumber}
              </div>
            </div>

            {/* Stint Bars */}
            <div className="flex items-center h-8 bg-surface/40 rounded-lg overflow-hidden">
              {driverData.stints.map((stint, index) => {
                const width = getStintWidth(stint.lapCount, driverData.totalLaps);
                const isLastStint = index === driverData.stints.length - 1;
                
                return (
                  <div key={stint.stintNumber} className="flex h-full">
                    {/* Stint Bar */}
                    <div
                      className="relative flex items-center justify-center transition-all hover:opacity-80 cursor-pointer"
                      style={{
                        width: `${width}%`,
                        backgroundColor: getCompoundColor(stint.compound),
                        borderRight: isLastStint ? 'none' : '2px solid rgba(255,255,255,0.3)'
                      }}
                    >
                      {/* Stint Info */}
                      {stint.lapCount > 5 && (
                        <div className="text-xs font-bold text-white/90 text-center">
                          <div>{stint.compound[0]}</div>
                          <div className="text-2xs">{stint.lapCount}L</div>
                        </div>
                      )}
                      
                      {/* Stint Number Badge */}
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black text-2xs font-bold rounded-full flex items-center justify-center">
                        {stint.stintNumber}
                      </div>
                    </div>

                    {/* Pit Stop Indicator */}
                    {!isLastStint && (
                      <div className="flex items-center justify-center w-2 bg-red-500">
                        <div className="w-0.5 h-full bg-white/80" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Lap Numbers */}
            <div className="relative h-4">
              {driverData.stints.map((stint, index) => {
                const leftPosition = driverData.stints
                  .slice(0, index)
                  .reduce((sum, s) => sum + getStintWidth(s.lapCount, driverData.totalLaps), 0);
                const rightPosition = leftPosition + getStintWidth(stint.lapCount, driverData.totalLaps);

                return (
                  <div key={stint.stintNumber}>
                    {/* Start lap */}
                    <div
                      className="absolute text-2xs text-text-secondary"
                      style={{ left: `${leftPosition}%` }}
                    >
                      L{stint.startLap}
                    </div>
                    
                    {/* End lap (only for last stint) */}
                    {index === driverData.stints.length - 1 && (
                      <div
                        className="absolute text-2xs text-text-secondary"
                        style={{ left: `${rightPosition - 2}%` }}
                      >
                        L{stint.endLap}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="grid grid-cols-2 gap-4">
          {/* Compounds */}
          <div>
            <div className="text-xs text-text-secondary mb-2 uppercase tracking-wider">
              Compounds
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TIRE_COLORS).map(([compound, color]) => (
                <div key={compound} className="flex items-center space-x-1">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-2xs text-text-secondary">
                    {compound}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Strategy Stats */}
          <div>
            <div className="text-xs text-text-secondary mb-2 uppercase tracking-wider">
              Strategy Stats
            </div>
            <div className="space-y-1 text-2xs text-text-secondary">
              <div>• Average stint length: 22.3 laps</div>
              <div>• Most popular strategy: M-H (2 stops)</div>
              <div>• Fastest pit stop: 3.2s (VER)</div>
            </div>
          </div>
        </div>

        {/* Pit Stop Indicator */}
        <div className="flex items-center space-x-2 mt-3">
          <div className="w-2 h-6 bg-red-500" />
          <span className="text-2xs text-text-secondary">Pit Stop</span>
          <div className="w-4 h-4 bg-white text-black text-2xs font-bold rounded-full flex items-center justify-center">
            1
          </div>
          <span className="text-2xs text-text-secondary">Stint Number</span>
        </div>
      </div>
    </div>
  );
}