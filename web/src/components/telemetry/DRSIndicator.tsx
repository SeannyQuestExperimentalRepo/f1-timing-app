'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

type DRSStatus = 'CLOSED' | 'ELIGIBLE' | 'OPEN';

interface DRSIndicatorProps {
  status?: DRSStatus;
  className?: string;
}

export function DRSIndicator({
  status = 'ELIGIBLE',
  className
}: DRSIndicatorProps) {
  const getStatusConfig = (status: DRSStatus) => {
    switch (status) {
      case 'OPEN':
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/40',
          glowColor: 'shadow-green-500/50',
          animation: true,
          icon: true
        };
      case 'ELIGIBLE':
        return {
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/40',
          glowColor: 'shadow-yellow-500/50',
          animation: true,
          icon: false
        };
      case 'CLOSED':
      default:
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/40',
          glowColor: 'shadow-gray-500/50',
          animation: false,
          icon: false
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={cn(
      'bg-surface/80 backdrop-blur-md border border-white/10 rounded-xl p-6',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-text-primary font-medium text-sm uppercase tracking-wider">
          DRS Status
        </h3>
        <div className="text-xs text-text-secondary">
          Drag Reduction System
        </div>
      </div>

      {/* DRS Status Display */}
      <div className="flex items-center justify-center">
        <motion.div
          className={cn(
            'relative flex items-center justify-center w-48 h-24 rounded-xl border-2 transition-all duration-300',
            config.bgColor,
            config.borderColor
          )}
          animate={config.animation ? {
            boxShadow: [
              `0 0 20px ${config.glowColor}`,
              `0 0 40px ${config.glowColor}`,
              `0 0 20px ${config.glowColor}`
            ]
          } : {}}
          transition={{
            duration: 2,
            repeat: config.animation ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          {/* DRS Icon */}
          <div className="flex items-center space-x-3">
            {config.icon && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Zap size={24} className={config.color} />
              </motion.div>
            )}
            
            {/* Status Text */}
            <motion.div
              key={status}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={cn('text-3xl font-mono font-black', config.color)}
            >
              {status}
            </motion.div>
          </div>

          {/* Animated background for OPEN status */}
          {status === 'OPEN' && (
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/10 via-green-300/20 to-green-500/10"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ backgroundSize: '200% 200%' }}
            />
          )}

          {/* Pulse effect for ELIGIBLE status */}
          {status === 'ELIGIBLE' && (
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-yellow-400/60"
              animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </motion.div>
      </div>

      {/* Status Description */}
      <div className="mt-6 text-center">
        <div className="text-sm text-text-secondary">
          {status === 'OPEN' && 'DRS flap is open - reduced drag'}
          {status === 'ELIGIBLE' && 'DRS available in next zone'}
          {status === 'CLOSED' && 'DRS not available'}
        </div>
      </div>

      {/* DRS Zone Info */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex justify-between items-center text-xs">
          <span className="text-text-secondary">Zone Status:</span>
          <div className="flex items-center space-x-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              status === 'OPEN' ? "bg-green-500" :
              status === 'ELIGIBLE' ? "bg-yellow-500" : "bg-gray-500"
            )} />
            <span className={config.color}>
              {status === 'OPEN' ? 'Active' :
               status === 'ELIGIBLE' ? 'Available' : 'Disabled'}
            </span>
          </div>
        </div>

        {/* DRS Zones indicators */}
        <div className="flex justify-between items-center mt-2 text-xs">
          <span className="text-text-secondary">Next Zone:</span>
          <span className="text-text-primary font-mono">
            {status === 'OPEN' ? 'Current' : '0.8km'}
          </span>
        </div>
      </div>
    </div>
  );
}