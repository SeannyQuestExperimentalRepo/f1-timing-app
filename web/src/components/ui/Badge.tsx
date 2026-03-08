'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'tire' | 'position' | 'flag' | 'team' | 'sector';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  children: React.ReactNode;
}

export function Badge({
  variant = 'default',
  size = 'md',
  color,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        // Base styles
        'inline-flex items-center justify-center font-medium rounded-md border transition-colors',
        
        // Sizes
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-1 text-sm',
        size === 'lg' && 'px-3 py-1.5 text-base',
        
        // Variants
        variant === 'default' && [
          'bg-accent/10 text-accent border-accent/20',
          'hover:bg-accent/20'
        ],
        
        variant === 'tire' && [
          'bg-surface-elevated text-text-primary border-border',
          'hover:bg-surface'
        ],
        
        variant === 'position' && [
          'bg-surface-elevated text-text-primary border-border font-bold',
          'hover:bg-surface'
        ],
        
        variant === 'flag' && [
          'bg-surface-elevated text-text-primary border-border',
          'hover:bg-surface'
        ],
        
        variant === 'team' && [
          'bg-surface text-text-primary border-border',
          'hover:bg-surface-elevated'
        ],
        
        variant === 'sector' && [
          'bg-surface-elevated text-text-primary border-border font-mono',
          'hover:bg-surface'
        ],
        
        className
      )}
      style={color ? { 
        backgroundColor: `${color}20`, 
        borderColor: `${color}40`,
        color: color 
      } : {}}
      {...props}
    >
      {children}
    </div>
  );
}

// Specialized badge variants for common use cases

interface PositionBadgeProps {
  position: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PositionBadge({ position, size = 'md', className }: PositionBadgeProps) {
  return (
    <Badge
      variant="position"
      size={size}
      className={cn(
        position === 1 && 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        position === 2 && 'bg-gray-400/20 text-gray-300 border-gray-400/30',
        position === 3 && 'bg-orange-600/20 text-orange-400 border-orange-600/30',
        className
      )}
    >
      {position}
    </Badge>
  );
}

interface TireBadgeProps {
  compound: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET';
  age?: number;
  size?: 'sm' | 'md' | 'lg';
  showAge?: boolean;
  className?: string;
}

export function TireBadge({ 
  compound, 
  age, 
  size = 'sm', 
  showAge = true,
  className 
}: TireBadgeProps) {
  const getCompoundChar = () => {
    switch (compound) {
      case 'SOFT': return 'S';
      case 'MEDIUM': return 'M';
      case 'HARD': return 'H';
      case 'INTERMEDIATE': return 'I';
      case 'WET': return 'W';
      default: return '?';
    }
  };

  const getCompoundStyles = () => {
    switch (compound) {
      case 'SOFT': return 'tire-soft';
      case 'MEDIUM': return 'tire-medium';
      case 'HARD': return 'tire-hard';
      case 'INTERMEDIATE': return 'tire-intermediate';
      case 'WET': return 'tire-wet';
      default: return '';
    }
  };

  return (
    <Badge
      variant="tire"
      size={size}
      className={cn(
        getCompoundStyles(),
        'font-bold',
        className
      )}
    >
      <span>{getCompoundChar()}</span>
      {showAge && age !== undefined && (
        <span className="ml-1 text-xs opacity-80">{age}</span>
      )}
    </Badge>
  );
}

interface FlagBadgeProps {
  flag: 'GREEN' | 'YELLOW' | 'DOUBLE_YELLOW' | 'RED' | 'BLUE' | 'BLACK' | 'BLACK_AND_WHITE' | 'CHEQUERED';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function FlagBadge({ 
  flag, 
  size = 'sm', 
  animated = true,
  className 
}: FlagBadgeProps) {
  const getFlagStyles = () => {
    switch (flag) {
      case 'GREEN':
        return 'flag-green';
      case 'YELLOW':
      case 'DOUBLE_YELLOW':
        return cn('flag-yellow', animated && 'animate-pulse-slow');
      case 'RED':
        return cn('flag-red', animated && 'animate-bounce-subtle');
      case 'BLUE':
        return 'flag-blue';
      case 'BLACK':
      case 'BLACK_AND_WHITE':
        return 'bg-gray-800/20 text-gray-300 border-gray-800/30';
      case 'CHEQUERED':
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
      default:
        return '';
    }
  };

  const getFlagText = () => {
    switch (flag) {
      case 'DOUBLE_YELLOW':
        return 'DBL YEL';
      case 'BLACK_AND_WHITE':
        return 'B&W';
      default:
        return flag;
    }
  };

  return (
    <Badge
      variant="flag"
      size={size}
      className={cn(
        getFlagStyles(),
        className
      )}
    >
      {getFlagText()}
    </Badge>
  );
}

interface SectorBadgeProps {
  time: number;
  type: 'best_overall' | 'personal_best' | 'normal' | 'default';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SectorBadge({ 
  time, 
  type, 
  size = 'sm',
  className 
}: SectorBadgeProps) {
  const formatSectorTime = (seconds: number) => {
    const sec = Math.floor(seconds);
    const ms = Math.round((seconds - sec) * 1000);
    return `${sec}.${ms.toString().padStart(3, '0')}`;
  };

  const getSectorStyles = () => {
    switch (type) {
      case 'best_overall':
        return 'sector-best-overall';
      case 'personal_best':
        return 'sector-personal-best';
      case 'normal':
        return 'sector-normal';
      default:
        return 'bg-surface-elevated text-text-secondary border-border';
    }
  };

  return (
    <Badge
      variant="sector"
      size={size}
      className={cn(
        getSectorStyles(),
        className
      )}
    >
      {time > 0 ? formatSectorTime(time) : '---.---'}
    </Badge>
  );
}

interface TeamBadgeProps {
  teamName: string;
  teamColor: string;
  driverCode?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TeamBadge({ 
  teamName, 
  teamColor, 
  driverCode, 
  size = 'md',
  className 
}: TeamBadgeProps) {
  return (
    <Badge
      variant="team"
      size={size}
      className={cn(
        'flex items-center space-x-2',
        className
      )}
    >
      <div 
        className="w-2 h-2 rounded-full" 
        style={{ backgroundColor: teamColor }}
      />
      {driverCode && <span className="font-bold">{driverCode}</span>}
      <span className="truncate max-w-20">{teamName}</span>
    </Badge>
  );
}