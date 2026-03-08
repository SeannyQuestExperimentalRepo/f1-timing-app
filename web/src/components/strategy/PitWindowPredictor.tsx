'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface PitWindowData {
  driver: string;
  driverNumber: number;
  teamColor: string;
  currentLap: number;
  optimalWindow: {
    start: number;
    end: number;
    compound: 'SOFT' | 'MEDIUM' | 'HARD';
    confidence: number;
  };
  currentStint: {
    compound: 'SOFT' | 'MEDIUM' | 'HARD';
    age: number;
  };
  urgency: 'low' | 'medium' | 'high';
}

interface PitWindowPredictorProps {
  className?: string;
}

export function PitWindowPredictor({
  className
}: PitWindowPredictorProps) {
  // Mock pit window data
  const pitWindowData: PitWindowData[] = [
    {
      driver: 'VER',
      driverNumber: 1,
      teamColor: '#0600ef',
      currentLap: 24,
      optimalWindow: { start: 25, end: 28, compound: 'MEDIUM', confidence: 85 },
      currentStint: { compound: 'SOFT', age: 15 },
      urgency: 'high'
    },
    {
      driver: 'LEC',
      driverNumber: 16,
      teamColor: '#dc0000',
      currentLap: 24,
      optimalWindow: { start: 27, end: 30, compound: 'HARD', confidence: 78 },
      currentStint: { compound: 'MEDIUM', age: 12 },
      urgency: 'medium'
    },
    {
      driver: 'NOR',
      driverNumber: 4,
      teamColor: '#ff8700',
      currentLap: 24,
      optimalWindow: { start: 32, end: 35, compound: 'MEDIUM', confidence: 92 },
      currentStint: { compound: 'HARD', age: 8 },
      urgency: 'low'
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/40';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/40';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/40';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <AlertTriangle size={16} className="text-red-400" />;
      case 'medium': return <TrendingUp size={16} className="text-yellow-400" />;
      case 'low': return <Clock size={16} className="text-green-400" />;
      default: return <Clock size={16} className="text-gray-400" />;
    }
  };

  const getCompoundColor = (compound: string) => {
    switch (compound) {
      case 'SOFT': return '#ff0000';
      case 'MEDIUM': return '#ffff00';
      case 'HARD': return '#ffffff';
      default: return '#666666';
    }
  };

  return (
    <div className={cn(
      'bg-surface/80 backdrop-blur-md border border-white/10 rounded-xl p-4',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary font-medium text-sm uppercase tracking-wider">
          Pit Window Predictor
        </h3>
        <div className="flex items-center space-x-2 text-xs text-text-secondary">
          <Clock size={14} />
          <span>Lap 24/57</span>
        </div>
      </div>

      {/* Pit Window Cards */}
      <div className="space-y-3">
        {pitWindowData.map((data) => (
          <div
            key={data.driverNumber}
            className={cn(
              'p-3 rounded-lg border transition-colors',
              getUrgencyColor(data.urgency)
            )}
          >
            {/* Driver Info */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div
                  className="w-1 h-8 rounded-full"
                  style={{ backgroundColor: data.teamColor }}
                />
                <div>
                  <div className="font-mono font-bold text-text-primary">
                    {data.driver}
                  </div>
                  <div className="text-xs text-text-secondary">
                    #{data.driverNumber}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {getUrgencyIcon(data.urgency)}
                <span className="text-xs uppercase tracking-wider">
                  {data.urgency}
                </span>
              </div>
            </div>

            {/* Current Stint Info */}
            <div className="flex items-center justify-between mb-3 p-2 bg-surface/40 rounded">
              <div className="text-xs text-text-secondary">Current Stint:</div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="tire"
                  color={getCompoundColor(data.currentStint.compound)}
                  size="sm"
                >
                  {data.currentStint.compound[0]}
                </Badge>
                <span className="text-xs font-mono text-text-primary">
                  {data.currentStint.age} laps
                </span>
              </div>
            </div>

            {/* Optimal Window */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">
                  Optimal Window:
                </span>
                <div className="flex items-center space-x-1">
                  <span className="text-lg font-mono font-bold text-text-primary">
                    Lap {data.optimalWindow.start}-{data.optimalWindow.end}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">
                  Recommended Compound:
                </span>
                <Badge
                  variant="tire"
                  color={getCompoundColor(data.optimalWindow.compound)}
                  size="sm"
                >
                  {data.optimalWindow.compound[0]}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">
                  Confidence:
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                      style={{ width: `${data.optimalWindow.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-text-primary">
                    {data.optimalWindow.confidence}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Strategy Summary */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-xs text-text-secondary mb-2">
          <strong>Strategic Overview:</strong>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-text-secondary mb-1">Track Position:</div>
            <div className="text-text-primary">Overcut opportunity in laps 25-30</div>
          </div>
          <div>
            <div className="text-text-secondary mb-1">Weather:</div>
            <div className="text-text-primary">Stable conditions, no rain risk</div>
          </div>
        </div>
      </div>

      {/* Live Strategy Updates */}
      <div className="mt-3 p-2 bg-accent/10 border border-accent/30 rounded text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span className="text-accent font-medium">LIVE UPDATE:</span>
          <span className="text-text-primary">VER pit window opening - degradation accelerating</span>
        </div>
      </div>
    </div>
  );
}