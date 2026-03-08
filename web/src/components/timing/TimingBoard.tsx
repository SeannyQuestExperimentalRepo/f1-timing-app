'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { DriverRow } from './DriverRow';
import { TimingRowData } from '@/lib/types';
import { mockTimingData } from '@/lib/mock-data';

interface TimingBoardProps {
  data?: TimingRowData[];
  selectedDrivers?: number[];
  onDriverSelect?: (driverNumber: number) => void;
  className?: string;
}

export function TimingBoard({
  data = mockTimingData,
  selectedDrivers = [],
  onDriverSelect,
  className
}: TimingBoardProps) {
  const [sortedData] = useState(() => 
    [...data].sort((a, b) => a.position - b.position)
  );

  const handleDriverClick = (driverNumber: number) => {
    onDriverSelect?.(driverNumber);
  };

  const columns = [
    { key: 'pos', label: 'POS', width: '50px' },
    { key: 'driver', label: 'DRIVER', width: '120px' },
    { key: 'interval', label: 'INTERVAL', width: '80px' },
    { key: 'gap', label: 'GAP', width: '80px' },
    { key: 'last_lap', label: 'LAST LAP', width: '100px' },
    { key: 'sectors', label: 'S1 | S2 | S3', width: '180px' },
    { key: 'tire', label: 'TIRE', width: '60px' },
    { key: 'laps', label: 'LAPS', width: '50px' },
    { key: 'pits', label: 'PITS', width: '50px' }
  ];

  return (
    <div className={cn(
      'bg-surface/80 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden',
      className
    )}>
      {/* Header */}
      <div className="border-b border-white/10 bg-surface/60">
        <div className="grid grid-cols-[50px_120px_80px_80px_100px_180px_60px_50px_50px] gap-2 p-3">
          {columns.map((column) => (
            <div
              key={column.key}
              className="flex items-center justify-center"
            >
              <span className="text-text-secondary text-2xs font-medium uppercase tracking-wider">
                {column.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Driver Rows */}
      <div className="relative">
        <AnimatePresence initial={false}>
          {sortedData.map((driver, index) => (
            <motion.div
              key={driver.driver_number}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.3,
                delay: index * 0.02,
                layout: { duration: 0.5, ease: 'easeInOut' }
              }}
              className={cn(
                index !== sortedData.length - 1 && 'border-b border-white/5'
              )}
            >
              <DriverRow
                data={driver}
                isSelected={selectedDrivers.includes(driver.driver_number)}
                onClick={() => handleDriverClick(driver.driver_number)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading State */}
      {data.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary text-sm">Loading timing data...</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-white/10 bg-surface/30 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>{data.length} drivers</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-sector-purple rounded-full" />
              <span>Overall Best</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-sector-green rounded-full" />
              <span>Personal Best</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-sector-yellow rounded-full" />
              <span>Current</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}