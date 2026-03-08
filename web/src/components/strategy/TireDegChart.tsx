'use client';

import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { cn } from '@/lib/utils';
import { generateMockTireDegData } from '@/lib/mock-data';
import { TIRE_COLORS } from '@/lib/constants';

interface TireDegChartProps {
  className?: string;
}

export function TireDegChart({
  className
}: TireDegChartProps) {
  const degData = generateMockTireDegData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/90 border border-white/20 rounded px-3 py-2 text-xs">
          <p className="text-white font-bold">{data.compound} Compound</p>
          <p className="text-white font-mono">Age: {data.age} laps</p>
          <p className="text-white font-mono">Lap Time: {data.lapTime.toFixed(3)}s</p>
          <p className="text-text-secondary">Driver: {data.driver}</p>
        </div>
      );
    }
    return null;
  };

  // Group data by compound
  const softData = degData.filter(d => d.compound === 'SOFT');
  const mediumData = degData.filter(d => d.compound === 'MEDIUM');
  const hardData = degData.filter(d => d.compound === 'HARD');

  // Calculate degradation rates (simplified linear regression)
  const calculateDegradationRate = (data: any[]) => {
    if (data.length < 2) return 0;
    
    const firstPoint = data[0];
    const lastPoint = data[data.length - 1];
    
    return (lastPoint.lapTime - firstPoint.lapTime) / (lastPoint.age - firstPoint.age);
  };

  const softDegRate = calculateDegradationRate(softData);
  const mediumDegRate = calculateDegradationRate(mediumData);
  const hardDegRate = calculateDegradationRate(hardData);

  return (
    <div className={cn(
      'bg-surface/80 backdrop-blur-md border border-white/10 rounded-xl p-4',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary font-medium text-sm uppercase tracking-wider">
          Tire Degradation
        </h3>
        <div className="text-xs text-text-secondary">
          Lap time vs tire age
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="age"
              type="number"
              domain={[0, 20]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              label={{ value: 'Tire Age (laps)', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fontSize: 10, fill: '#9ca3af' } }}
            />
            
            <YAxis
              dataKey="lapTime"
              type="number"
              domain={['dataMin - 0.5', 'dataMax + 0.5']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              label={{ value: 'Lap Time (s)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 10, fill: '#9ca3af' } }}
            />

            <RechartsTooltip content={<CustomTooltip />} />

            <Scatter
              name="Soft"
              data={softData}
              fill={TIRE_COLORS.SOFT}
            />
            
            <Scatter
              name="Medium"
              data={mediumData}
              fill={TIRE_COLORS.MEDIUM}
            />
            
            <Scatter
              name="Hard"
              data={hardData}
              fill={TIRE_COLORS.HARD}
            />

            <Legend 
              wrapperStyle={{ fontSize: '10px' }}
              iconType="circle"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Degradation Rates */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
        <div className="text-center">
          <div 
            className="w-3 h-3 rounded-full mx-auto mb-1"
            style={{ backgroundColor: TIRE_COLORS.SOFT }}
          />
          <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
            Soft
          </div>
          <div className="text-sm font-mono font-bold text-text-primary">
            +{softDegRate.toFixed(3)}s/lap
          </div>
        </div>

        <div className="text-center">
          <div 
            className="w-3 h-3 rounded-full mx-auto mb-1"
            style={{ backgroundColor: TIRE_COLORS.MEDIUM }}
          />
          <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
            Medium
          </div>
          <div className="text-sm font-mono font-bold text-text-primary">
            +{mediumDegRate.toFixed(3)}s/lap
          </div>
        </div>

        <div className="text-center">
          <div 
            className="w-3 h-3 rounded-full mx-auto mb-1"
            style={{ backgroundColor: TIRE_COLORS.HARD }}
          />
          <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
            Hard
          </div>
          <div className="text-sm font-mono font-bold text-text-primary">
            +{hardDegRate.toFixed(3)}s/lap
          </div>
        </div>
      </div>

      {/* Analysis */}
      <div className="mt-4 p-3 bg-surface/40 rounded-lg">
        <div className="text-xs text-text-secondary mb-2">
          <strong>Analysis:</strong>
        </div>
        <div className="text-xs text-text-primary space-y-1">
          <div>• Soft tires show highest degradation rate</div>
          <div>• Medium compound offers balanced performance</div>
          <div>• Hard tires maintain consistent pace longer</div>
          <div>• Optimal window: Soft 5-8 laps, Medium 12-15 laps</div>
        </div>
      </div>
    </div>
  );
}