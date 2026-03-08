'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { TimingRowData } from '@/lib/types';
import { mockTimingData } from '@/lib/mock-data';

interface SidebarProps {
  drivers?: TimingRowData[];
  selectedDrivers?: number[];
  onDriverSelect?: (driverNumber: number) => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  drivers = mockTimingData,
  selectedDrivers = [],
  onDriverSelect,
  className,
  isCollapsed = false,
  onToggleCollapse
}: SidebarProps) {
  const [isMobileCollapsed, setIsMobileCollapsed] = useState(false);

  const formatGap = (gap: number) => {
    if (gap === 0) return 'LEADER';
    if (gap < 1) return `+${(gap * 1000).toFixed(0)}ms`;
    if (gap < 60) return `+${gap.toFixed(3)}`;
    const minutes = Math.floor(gap / 60);
    const seconds = (gap % 60).toFixed(3);
    return `+${minutes}:${seconds.padStart(6, '0')}`;
  };

  const handleDriverClick = (driverNumber: number) => {
    onDriverSelect?.(driverNumber);
  };

  const sortedDrivers = [...drivers].sort((a, b) => a.position - b.position);

  return (
    <motion.aside
      className={cn(
        'bg-surface border-r border-white/10 flex flex-col',
        isCollapsed ? 'w-16' : 'w-80',
        'lg:relative fixed left-0 top-0 h-full z-30',
        className
      )}
      initial={false}
      animate={{ width: isCollapsed ? 64 : 320 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-surface/80">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-text-primary font-semibold uppercase tracking-wider text-sm"
            >
              Drivers
            </motion.h2>
          )}
        </AnimatePresence>
        
        <button
          onClick={onToggleCollapse}
          className="p-1 hover:bg-white/10 rounded transition-colors text-text-secondary hover:text-text-primary"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Driver List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {sortedDrivers.map((driver) => {
            const isSelected = selectedDrivers.includes(driver.driver_number);
            
            return (
              <motion.div
                key={driver.driver_number}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDriverClick(driver.driver_number)}
                className={cn(
                  'flex items-center p-2 rounded-lg cursor-pointer transition-all relative overflow-hidden',
                  'hover:bg-white/5',
                  isSelected && 'bg-white/10 ring-1 ring-white/20'
                )}
              >
                {/* Team Color Bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ backgroundColor: driver.team_color }}
                />

                <div className="flex items-center space-x-3 ml-3 w-full">
                  {/* Position */}
                  <div className="flex-shrink-0 w-8 text-center">
                    <span className="font-mono font-bold text-lg text-text-primary">
                      {driver.position}
                    </span>
                  </div>

                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="flex-1 min-w-0"
                      >
                        {/* Driver Code */}
                        <div className="font-mono font-bold text-text-primary text-sm">
                          {driver.driver_code}
                        </div>
                        
                        {/* Gap */}
                        <div className="text-xs text-text-secondary font-mono">
                          {formatGap(driver.gap_to_leader)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Collapse Instructions */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 border-t border-white/10 bg-surface/50"
          >
            <p className="text-xs text-text-secondary text-center">
              Click driver to view telemetry
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}