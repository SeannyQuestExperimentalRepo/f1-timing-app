'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SectorComparisonProps {
  driver1?: {
    name: string;
    color: string;
    sectors: [number, number, number];
  };
  driver2?: {
    name: string;
    color: string;
    sectors: [number, number, number];
  };
  className?: string;
}

export function SectorComparison({
  driver1 = { name: 'VER', color: '#0600ef', sectors: [27.234, 38.567, 21.891] },
  driver2 = { name: 'LEC', color: '#dc0000', sectors: [27.456, 38.234, 22.123] },
  className
}: SectorComparisonProps) {
  const getSectorWinner = (s1: number, s2: number) => s1 < s2 ? 'driver1' : 'driver2';
  const getSectorDelta = (s1: number, s2: number) => Math.abs(s1 - s2);

  return (
    <div className={cn(
      'bg-surface/80 backdrop-blur-md border border-white/10 rounded-xl p-4',
      className
    )}>
      <h3 className="text-text-primary font-medium text-sm uppercase tracking-wider mb-4">
        Sector Comparison
      </h3>

      <div className="space-y-4">
        {[0, 1, 2].map((sectorIndex) => {
          const sector1Time = driver1.sectors[sectorIndex];
          const sector2Time = driver2.sectors[sectorIndex];
          const winner = getSectorWinner(sector1Time, sector2Time);
          const delta = getSectorDelta(sector1Time, sector2Time);
          
          return (
            <div key={sectorIndex} className="space-y-2">
              <div className="text-xs text-text-secondary uppercase tracking-wider">
                Sector {sectorIndex + 1}
              </div>
              
              <div className="relative">
                {/* Driver 1 Bar */}
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-12 text-xs font-mono font-bold" style={{ color: driver1.color }}>
                    {driver1.name}
                  </div>
                  <div className="flex-1 relative">
                    <motion.div
                      className={cn(
                        "h-6 rounded flex items-center px-2 text-xs font-mono font-bold text-white relative overflow-hidden",
                        winner === 'driver1' ? 'bg-green-600' : 'bg-red-600'
                      )}
                      style={{ backgroundColor: driver1.color + '80' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(sector1Time / Math.max(sector1Time, sector2Time)) * 100}%` }}
                      transition={{ duration: 1, delay: sectorIndex * 0.2 }}
                    >
                      {sector1Time.toFixed(3)}
                      {winner === 'driver1' && (
                        <motion.div
                          className="absolute inset-0 bg-green-500/30"
                          animate={{ opacity: [0, 0.8, 0] }}
                          transition={{ duration: 1, repeat: 2 }}
                        />
                      )}
                    </motion.div>
                  </div>
                </div>

                {/* Driver 2 Bar */}
                <div className="flex items-center space-x-2">
                  <div className="w-12 text-xs font-mono font-bold" style={{ color: driver2.color }}>
                    {driver2.name}
                  </div>
                  <div className="flex-1 relative">
                    <motion.div
                      className={cn(
                        "h-6 rounded flex items-center px-2 text-xs font-mono font-bold text-white relative overflow-hidden",
                        winner === 'driver2' ? 'bg-green-600' : 'bg-red-600'
                      )}
                      style={{ backgroundColor: driver2.color + '80' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(sector2Time / Math.max(sector1Time, sector2Time)) * 100}%` }}
                      transition={{ duration: 1, delay: sectorIndex * 0.2 }}
                    >
                      {sector2Time.toFixed(3)}
                      {winner === 'driver2' && (
                        <motion.div
                          className="absolute inset-0 bg-green-500/30"
                          animate={{ opacity: [0, 0.8, 0] }}
                          transition={{ duration: 1, repeat: 2 }}
                        />
                      )}
                    </motion.div>
                  </div>
                </div>

                {/* Delta */}
                <div className="text-center mt-1">
                  <span className="text-xs text-text-secondary">
                    Δ {delta.toFixed(3)}s
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div style={{ color: driver1.color }}>
            <div className="font-mono font-bold text-lg">
              {driver1.sectors.reduce((a, b) => a + b, 0).toFixed(3)}
            </div>
            <div className="text-xs text-text-secondary">Total Time</div>
          </div>
          <div style={{ color: driver2.color }}>
            <div className="font-mono font-bold text-lg">
              {driver2.sectors.reduce((a, b) => a + b, 0).toFixed(3)}
            </div>
            <div className="text-xs text-text-secondary">Total Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}