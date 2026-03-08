'use client';

import React from 'react';
import { Circle, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { FlagType } from '@/lib/types';

interface HeaderProps {
  sessionName?: string;
  currentLap?: number;
  totalLaps?: number;
  flagStatus?: FlagType;
  isConnected?: boolean;
  className?: string;
}

export function Header({
  sessionName = "",
  currentLap = 32,
  totalLaps = 57,
  flagStatus = "GREEN",
  isConnected = true,
  className
}: HeaderProps) {
  const getFlagColor = (flag: FlagType) => {
    switch (flag) {
      case 'GREEN': return '#00ff00';
      case 'YELLOW': return '#ffff00';
      case 'DOUBLE_YELLOW': return '#ffaa00';
      case 'RED': return '#ff0000';
      case 'SC': return '#ffaa00';
      case 'VSC': return '#ffaa00';
      case 'CHEQUERED': return '#ffffff';
      default: return '#666666';
    }
  };

  const getFlagText = (flag: FlagType) => {
    switch (flag) {
      case 'SC': return 'SAFETY CAR';
      case 'VSC': return 'VSC';
      case 'DOUBLE_YELLOW': return 'DBL YELLOW';
      default: return flag;
    }
  };

  return (
    <header className={cn(
      'flex items-center justify-between px-4 py-3 bg-surface border-b border-white/10',
      className
    )}>
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">F1</span>
          </div>
          <span className="text-text-primary font-bold text-lg tracking-wide">
            LIVE TIMING
          </span>
        </div>
      </div>

      {/* Session Name */}
      <div className="flex items-center space-x-4">
        <h1 className="text-text-primary font-semibold text-lg text-center">
          {sessionName}
        </h1>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center space-x-4">
        {/* Lap Counter */}
        <div className="flex items-center space-x-2 text-text-primary">
          <span className="text-xs text-text-secondary uppercase tracking-wider">
            LAP
          </span>
          <span className="font-mono text-lg font-bold">
            {currentLap}
          </span>
          {totalLaps && (
            <>
              <span className="text-text-secondary">/</span>
              <span className="font-mono text-sm text-text-secondary">
                {totalLaps}
              </span>
            </>
          )}
        </div>

        {/* Flag Status */}
        <div className="flex items-center space-x-2">
          <Flag size={16} />
          <Badge
            variant="flag"
            color={getFlagColor(flagStatus)}
            size="sm"
          >
            {getFlagText(flagStatus)}
          </Badge>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <Circle
            size={8}
            className={cn(
              'fill-current',
              isConnected ? 'text-green-400' : 'text-red-400'
            )}
          />
          <span className={cn(
            'text-xs uppercase tracking-wider',
            isConnected ? 'text-green-400' : 'text-red-400'
          )}>
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>
    </header>
  );
}