'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { CarMarker } from './CarMarker';
import { TRACK_COORDINATES, coordinatesToSVGPath, getCoordinatesAtPosition } from '@/lib/track-coords';
import { TimingRowData } from '@/lib/types';
import { mockTimingData } from '@/lib/mock-data';

interface TrackMapProps {
  trackName?: string;
  drivers?: TimingRowData[];
  className?: string;
  showSectors?: boolean;
  showDRSZones?: boolean;
}

export function TrackMap({
  trackName = 'bahrain',
  drivers = mockTimingData,
  className,
  showSectors = true,
  showDRSZones = true
}: TrackMapProps) {
  const track = TRACK_COORDINATES[trackName];

  // Generate random car positions along the track for demo
  const carPositions = useMemo(() => {
    if (!track) return [];
    
    return drivers.map((driver, index) => {
      // Spread cars around the track based on their position
      const basePosition = (index * 4) % 100; // Space cars out
      const trackPosition = getCoordinatesAtPosition(track.path, basePosition);
      
      return {
        driver,
        x: trackPosition ? trackPosition[0] : 0,
        y: trackPosition ? trackPosition[1] : 0,
      };
    });
  }, [track, drivers]);

  if (!track) {
    return (
      <div className={cn(
        'flex items-center justify-center h-96 bg-surface/80 backdrop-blur-md border border-white/10 rounded-xl',
        className
      )}>
        <p className="text-text-secondary">Track data not available</p>
      </div>
    );
  }

  const trackPath = coordinatesToSVGPath(track.path);
  const [viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight] = track.viewBox;

  // Calculate sector boundaries
  const sector1EndCoords = getCoordinatesAtPosition(track.path, track.sector1End);
  const sector2EndCoords = getCoordinatesAtPosition(track.path, track.sector2End);

  // Calculate DRS zones (example positions)
  const drsZone1Start = getCoordinatesAtPosition(track.path, 10);
  const drsZone1End = getCoordinatesAtPosition(track.path, 25);
  const drsZone2Start = getCoordinatesAtPosition(track.path, 70);
  const drsZone2End = getCoordinatesAtPosition(track.path, 85);

  return (
    <div className={cn(
      'bg-surface/80 backdrop-blur-md border border-white/10 rounded-xl p-4',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary font-medium text-sm uppercase tracking-wider">
          {track.name}
        </h3>
        <div className="flex items-center space-x-4 text-xs text-text-secondary">
          {showSectors && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span>S1</span>
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              <span>S2</span>
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              <span>S3</span>
            </div>
          )}
          {showDRSZones && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <span>DRS</span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Track Map */}
      <div className="relative bg-gray-900/50 rounded-lg overflow-hidden">
        <svg
          width="100%"
          height="400"
          viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid pattern for reference */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeOpacity="0.03" strokeWidth="1"/>
            </pattern>
            <linearGradient id="trackGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1f2937" />
              <stop offset="100%" stopColor="#374151" />
            </linearGradient>
          </defs>

          {/* Background grid */}
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* DRS Zones */}
          {showDRSZones && drsZone1Start && drsZone1End && (
            <line
              x1={drsZone1Start[0]}
              y1={drsZone1Start[1]}
              x2={drsZone1End[0]}
              y2={drsZone1End[1]}
              stroke="#3b82f6"
              strokeWidth="6"
              strokeOpacity="0.6"
              strokeLinecap="round"
            />
          )}
          {showDRSZones && drsZone2Start && drsZone2End && (
            <line
              x1={drsZone2Start[0]}
              y1={drsZone2Start[1]}
              x2={drsZone2End[0]}
              y2={drsZone2End[1]}
              stroke="#3b82f6"
              strokeWidth="6"
              strokeOpacity="0.6"
              strokeLinecap="round"
            />
          )}

          {/* Track Surface */}
          <path
            d={trackPath}
            fill="none"
            stroke="url(#trackGradient)"
            strokeWidth="20"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="filter drop-shadow-lg"
          />

          {/* Track Border */}
          <path
            d={trackPath}
            fill="none"
            stroke="#64748b"
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.4"
          />

          {/* Inner Track Line */}
          <path
            d={trackPath}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.3"
            strokeDasharray="10,5"
          />

          {/* Sector Boundaries */}
          {showSectors && sector1EndCoords && (
            <circle
              cx={sector1EndCoords[0]}
              cy={sector1EndCoords[1]}
              r="8"
              fill="#22c55e"
              stroke="white"
              strokeWidth="2"
              className="animate-pulse"
            />
          )}
          {showSectors && sector2EndCoords && (
            <circle
              cx={sector2EndCoords[0]}
              cy={sector2EndCoords[1]}
              r="8"
              fill="#eab308"
              stroke="white"
              strokeWidth="2"
              className="animate-pulse"
            />
          )}

          {/* Start/Finish Line */}
          <circle
            cx={track.startFinishLine[0]}
            cy={track.startFinishLine[1]}
            r="10"
            fill="#ef4444"
            stroke="white"
            strokeWidth="2"
            className="animate-pulse"
          />
          <text
            x={track.startFinishLine[0]}
            y={track.startFinishLine[1] - 20}
            textAnchor="middle"
            className="fill-white text-xs font-bold"
          >
            S/F
          </text>

          {/* Car Markers */}
          {carPositions.map(({ driver, x, y }) => (
            <CarMarker
              key={driver.driver_number}
              x={x}
              y={y}
              driverNumber={driver.driver_number}
              driverName={driver.driver_code}
              teamColor={driver.team_color}
              speed={280 + Math.random() * 40}
              gap={driver.gap_to_leader}
            />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-between text-xs text-text-secondary">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <span>Start/Finish</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
            <span>Cars</span>
          </div>
        </div>
        <span>{drivers.length} cars on track</span>
      </div>
    </div>
  );
}