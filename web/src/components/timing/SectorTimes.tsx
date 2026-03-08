'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SectorTimesProps {
  sector1?: number;
  sector2?: number;
  sector3?: number;
  sector1PB?: boolean;
  sector2PB?: boolean;
  sector3PB?: boolean;
  sector1Overall?: boolean;
  sector2Overall?: boolean;
  sector3Overall?: boolean;
  className?: string;
}

export function SectorTimes({
  sector1,
  sector2,
  sector3,
  sector1PB = false,
  sector2PB = false,
  sector3PB = false,
  sector1Overall = false,
  sector2Overall = false,
  sector3Overall = false,
  className
}: SectorTimesProps) {
  const [flashingSectors, setFlashingSectors] = useState({
    s1: false,
    s2: false,
    s3: false
  });

  const formatSectorTime = (time?: number) => {
    if (!time) return '-';
    return time.toFixed(3);
  };

  const getSectorColor = (isPB: boolean, isOverall: boolean) => {
    if (isOverall) return 'text-sector-purple';
    if (isPB) return 'text-sector-green';
    return 'text-sector-yellow';
  };

  const getSectorBg = (isPB: boolean, isOverall: boolean) => {
    if (isOverall) return 'bg-sector-purple/20';
    if (isPB) return 'bg-sector-green/20';
    return 'bg-transparent';
  };

  // Flash animation when new personal best
  useEffect(() => {
    if (sector1PB) {
      setFlashingSectors(prev => ({ ...prev, s1: true }));
      setTimeout(() => setFlashingSectors(prev => ({ ...prev, s1: false })), 2000);
    }
  }, [sector1PB]);

  useEffect(() => {
    if (sector2PB) {
      setFlashingSectors(prev => ({ ...prev, s2: true }));
      setTimeout(() => setFlashingSectors(prev => ({ ...prev, s2: false })), 2000);
    }
  }, [sector2PB]);

  useEffect(() => {
    if (sector3PB) {
      setFlashingSectors(prev => ({ ...prev, s3: true }));
      setTimeout(() => setFlashingSectors(prev => ({ ...prev, s3: false })), 2000);
    }
  }, [sector3PB]);

  return (
    <div className={cn('flex space-x-2', className)}>
      {/* Sector 1 */}
      <motion.div
        className={cn(
          'px-2 py-1 rounded text-xs font-mono font-bold text-center min-w-[60px]',
          getSectorColor(sector1PB, sector1Overall),
          getSectorBg(sector1PB, sector1Overall)
        )}
        animate={{
          scale: flashingSectors.s1 ? [1, 1.1, 1] : 1,
          backgroundColor: flashingSectors.s1 
            ? ['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.4)', 'rgba(34, 197, 94, 0.2)']
            : undefined
        }}
        transition={{ duration: 0.5, repeat: flashingSectors.s1 ? 3 : 0 }}
      >
        {formatSectorTime(sector1)}
      </motion.div>

      {/* Sector 2 */}
      <motion.div
        className={cn(
          'px-2 py-1 rounded text-xs font-mono font-bold text-center min-w-[60px]',
          getSectorColor(sector2PB, sector2Overall),
          getSectorBg(sector2PB, sector2Overall)
        )}
        animate={{
          scale: flashingSectors.s2 ? [1, 1.1, 1] : 1,
          backgroundColor: flashingSectors.s2 
            ? ['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.4)', 'rgba(34, 197, 94, 0.2)']
            : undefined
        }}
        transition={{ duration: 0.5, repeat: flashingSectors.s2 ? 3 : 0 }}
      >
        {formatSectorTime(sector2)}
      </motion.div>

      {/* Sector 3 */}
      <motion.div
        className={cn(
          'px-2 py-1 rounded text-xs font-mono font-bold text-center min-w-[60px]',
          getSectorColor(sector3PB, sector3Overall),
          getSectorBg(sector3PB, sector3Overall)
        )}
        animate={{
          scale: flashingSectors.s3 ? [1, 1.1, 1] : 1,
          backgroundColor: flashingSectors.s3 
            ? ['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.4)', 'rgba(34, 197, 94, 0.2)']
            : undefined
        }}
        transition={{ duration: 0.5, repeat: flashingSectors.s3 ? 3 : 0 }}
      >
        {formatSectorTime(sector3)}
      </motion.div>
    </div>
  );
}