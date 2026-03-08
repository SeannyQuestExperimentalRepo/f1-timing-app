'use client';

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { generateMockTelemetryHistory } from '@/lib/mock-data';
import { TEAM_COLORS } from '@/lib/constants';

interface SpeedTraceProps {
  driverNumber?: number;
  teamColor?: string;
  currentSpeed?: number;
  className?: string;
}

export function SpeedTrace({
  driverNumber = 1,
  teamColor = TEAM_COLORS['Red Bull Racing'] || '#0600ef',
  currentSpeed = 312,
  className
}: SpeedTraceProps) {
  const telemetryData = useMemo(() => {
    return generateMockTelemetryHistory(driverNumber, 100);
  }, [driverNumber]);

  const gradientId = `speedGradient-${driverNumber}`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/90 border border-white/20 rounded px-3 py-2 text-xs">
          <p className="text-white font-mono">
            Distance: {data.distance.toFixed(1)}%
          </p>
          <p className="text-white font-mono">
            Speed: {data.speed.toFixed(0)} km/h
          </p>
          <p className="text-text-secondary font-mono">
            Gear: {data.gear}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn(
      'bg-surface/80 backdrop-blur-md border border-white/10 rounded-xl p-4',
      className
    )}>
      {/* Header with current speed */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-text-primary font-medium text-sm uppercase tracking-wider">
            Speed Trace
          </h3>
          <div className="text-xs text-text-secondary font-mono">
            Driver {driverNumber}
          </div>
        </div>
        
        {/* Current Speed Display */}
        <div className="text-right">
          <div className="text-2xs text-text-secondary uppercase tracking-wider">
            Current Speed
          </div>
          <div 
            className="text-2xl font-mono font-bold"
            style={{ color: teamColor }}
          >
            {currentSpeed}
            <span className="text-lg text-text-secondary ml-1">km/h</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={telemetryData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            {/* Gradient definition */}
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={teamColor} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={teamColor} stopOpacity={0.1}/>
              </linearGradient>
            </defs>

            <XAxis 
              dataKey="distance"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
            />
            
            <YAxis
              domain={['dataMin - 20', 'dataMax + 20']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickFormatter={(value) => `${value}`}
            />

            <RechartsTooltip content={<CustomTooltip />} />

            <Line
              type="monotone"
              dataKey="speed"
              stroke={teamColor}
              strokeWidth={2}
              dot={false}
              fill={`url(#${gradientId})`}
              fillOpacity={1}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Speed Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
        <div className="text-center">
          <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
            Max Speed
          </div>
          <div className="text-lg font-mono font-bold text-text-primary">
            {Math.max(...telemetryData.map(d => d.speed)).toFixed(0)}
          </div>
          <div className="text-xs text-text-secondary">km/h</div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
            Min Speed
          </div>
          <div className="text-lg font-mono font-bold text-text-primary">
            {Math.min(...telemetryData.map(d => d.speed)).toFixed(0)}
          </div>
          <div className="text-xs text-text-secondary">km/h</div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
            Avg Speed
          </div>
          <div className="text-lg font-mono font-bold text-text-primary">
            {(telemetryData.reduce((sum, d) => sum + d.speed, 0) / telemetryData.length).toFixed(0)}
          </div>
          <div className="text-xs text-text-secondary">km/h</div>
        </div>
      </div>
    </div>
  );
}