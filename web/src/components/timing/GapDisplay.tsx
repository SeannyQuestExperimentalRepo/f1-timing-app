'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface GapDisplayProps {
  gap: number;
  isInterval?: boolean;
  previousGap?: number;
  className?: string;
}

export function GapDisplay({
  gap,
  isInterval = false,
  previousGap,
  className
}: GapDisplayProps) {
  const [trend, setTrend] = useState<'gaining' | 'losing' | 'stable'>('stable');

  useEffect(() => {
    if (previousGap !== undefined && previousGap !== gap) {
      if (gap < previousGap) {
        setTrend('gaining');
      } else if (gap > previousGap) {
        setTrend('losing');
      } else {
        setTrend('stable');
      }
      
      // Reset trend after animation
      const timer = setTimeout(() => setTrend('stable'), 2000);
      return () => clearTimeout(timer);
    }
  }, [gap, previousGap]);

  const formatGap = (gapValue: number) => {
    if (gapValue === 0) return isInterval ? '-' : 'LEADER';
    
    if (gapValue < 1) {
      return `+${(gapValue * 1000).toFixed(0)}ms`;
    }
    
    if (gapValue < 60) {
      return `+${gapValue.toFixed(3)}`;
    }
    
    const minutes = Math.floor(gapValue / 60);
    const seconds = (gapValue % 60).toFixed(3);
    return `+${minutes}:${seconds.padStart(6, '0')}`;
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'gaining':
        return 'text-green-400';
      case 'losing':
        return 'text-red-400';
      default:
        return 'text-text-primary';
    }
  };

  const getTrendBg = () => {
    switch (trend) {
      case 'gaining':
        return 'bg-green-400/20';
      case 'losing':
        return 'bg-red-400/20';
      default:
        return 'bg-transparent';
    }
  };

  return (
    <motion.div
      className={cn(
        'px-2 py-1 rounded font-mono font-bold text-xs text-center min-w-[80px]',
        getTrendColor(),
        className
      )}
      animate={{
        backgroundColor: trend !== 'stable' ? [
          'rgba(0,0,0,0)',
          trend === 'gaining' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          'rgba(0,0,0,0)'
        ] : 'rgba(0,0,0,0)',
        scale: trend !== 'stable' ? [1, 1.05, 1] : 1
      }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      key={gap} // Re-trigger animation on gap change
    >
      {formatGap(gap)}
    </motion.div>
  );
}