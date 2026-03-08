'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ThrottleBrakeGaugeProps {
  throttle?: number;
  brake?: number;
  className?: string;
}

export function ThrottleBrakeGauge({
  throttle = 75,
  brake = 0,
  className
}: ThrottleBrakeGaugeProps) {
  const [animatedThrottle, setAnimatedThrottle] = useState(0);
  const [animatedBrake, setAnimatedBrake] = useState(0);

  // Animate to new values
  useEffect(() => {
    setAnimatedThrottle(throttle);
  }, [throttle]);

  useEffect(() => {
    setAnimatedBrake(brake);
  }, [brake]);

  return (
    <div className={cn(
      'bg-surface/80 backdrop-blur-md border border-white/10 rounded-xl p-4',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary font-medium text-sm uppercase tracking-wider">
          Throttle & Brake
        </h3>
        
        {/* Digital readouts */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-text-secondary">THR</span>
            <span className="font-mono text-sm text-text-primary">{throttle}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-text-secondary">BRK</span>
            <span className="font-mono text-sm text-text-primary">{brake}%</span>
          </div>
        </div>
      </div>

      {/* Gauge Bars */}
      <div className="flex items-end justify-center space-x-8 h-48">
        {/* Throttle Gauge */}
        <div className="flex flex-col items-center">
          <div className="text-xs text-text-secondary uppercase tracking-wider mb-2">
            Throttle
          </div>
          
          {/* Throttle Bar Container */}
          <div className="relative w-12 h-40 bg-surface border border-white/20 rounded-lg overflow-hidden">
            {/* Background graduation marks */}
            <div className="absolute inset-0 flex flex-col justify-between p-1">
              {[100, 75, 50, 25, 0].map((mark) => (
                <div key={mark} className="flex items-center justify-end">
                  <div className="w-2 h-px bg-white/20"></div>
                </div>
              ))}
            </div>

            {/* Throttle Fill */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-600 to-green-400 rounded-b-lg"
              initial={{ height: '0%' }}
              animate={{ height: `${animatedThrottle}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />

            {/* Throttle highlight effect */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-300/60 to-transparent rounded-b-lg"
              initial={{ height: '0%' }}
              animate={{ height: `${animatedThrottle * 0.8}%` }}
              transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 }}
            />
          </div>

          {/* Throttle Percentage */}
          <div className="mt-2 text-center">
            <div className="text-lg font-mono font-bold text-green-400">
              {throttle}%
            </div>
          </div>
        </div>

        {/* Brake Gauge */}
        <div className="flex flex-col items-center">
          <div className="text-xs text-text-secondary uppercase tracking-wider mb-2">
            Brake
          </div>
          
          {/* Brake Bar Container */}
          <div className="relative w-12 h-40 bg-surface border border-white/20 rounded-lg overflow-hidden">
            {/* Background graduation marks */}
            <div className="absolute inset-0 flex flex-col justify-between p-1">
              {[100, 75, 50, 25, 0].map((mark) => (
                <div key={mark} className="flex items-center justify-start">
                  <div className="w-2 h-px bg-white/20"></div>
                </div>
              ))}
            </div>

            {/* Brake Fill */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-600 to-red-400 rounded-b-lg"
              initial={{ height: '0%' }}
              animate={{ height: `${animatedBrake}%` }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            />

            {/* Brake highlight effect */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-300/60 to-transparent rounded-b-lg"
              initial={{ height: '0%' }}
              animate={{ height: `${animatedBrake * 0.8}%` }}
              transition={{ duration: 0.2, ease: 'easeOut', delay: 0.05 }}
            />

            {/* Brake intensity glow when active */}
            {brake > 0 && (
              <motion.div
                className="absolute inset-0 bg-red-500/20 rounded-lg"
                animate={{ opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            )}
          </div>

          {/* Brake Percentage */}
          <div className="mt-2 text-center">
            <div className="text-lg font-mono font-bold text-red-400">
              {brake}%
            </div>
          </div>
        </div>
      </div>

      {/* Scale labels */}
      <div className="flex justify-center space-x-8 mt-4 pt-4 border-t border-white/10">
        <div className="flex flex-col space-y-1 text-xs text-text-secondary text-center">
          <div>0%</div>
          <div>25%</div>
          <div>50%</div>
          <div>75%</div>
          <div>100%</div>
        </div>
        <div className="flex flex-col space-y-1 text-xs text-text-secondary text-center">
          <div>0%</div>
          <div>25%</div>
          <div>50%</div>
          <div>75%</div>
          <div>100%</div>
        </div>
      </div>
    </div>
  );
}