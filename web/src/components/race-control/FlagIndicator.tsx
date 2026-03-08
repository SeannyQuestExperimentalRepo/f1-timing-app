'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Flag } from 'lucide-react';
import { FlagType } from '@/lib/types';

interface FlagIndicatorProps {
  currentFlag?: FlagType;
  className?: string;
}

export function FlagIndicator({
  currentFlag = 'GREEN',
  className
}: FlagIndicatorProps) {
  const getFlagConfig = (flag: FlagType) => {
    switch (flag) {
      case 'GREEN':
        return {
          color: '#22c55e',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/40',
          text: 'GREEN FLAG',
          animation: 'subtle-glow',
          textColor: 'text-green-400'
        };
      case 'YELLOW':
        return {
          color: '#eab308',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/40',
          text: 'YELLOW FLAG',
          animation: 'pulse',
          textColor: 'text-yellow-400'
        };
      case 'DOUBLE_YELLOW':
        return {
          color: '#f59e0b',
          bgColor: 'bg-orange-500/20',
          borderColor: 'border-orange-500/40',
          text: 'DOUBLE YELLOW',
          animation: 'flash',
          textColor: 'text-orange-400'
        };
      case 'RED':
        return {
          color: '#ef4444',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/40',
          text: 'RED FLAG',
          animation: 'flash-red',
          textColor: 'text-red-400'
        };
      case 'SC':
        return {
          color: '#f59e0b',
          bgColor: 'bg-orange-500/20',
          borderColor: 'border-orange-500/40',
          text: 'SAFETY CAR',
          animation: 'strobe',
          textColor: 'text-orange-400'
        };
      case 'VSC':
        return {
          color: '#f59e0b',
          bgColor: 'bg-orange-500/20',
          borderColor: 'border-orange-500/40',
          text: 'VSC',
          animation: 'pulse',
          textColor: 'text-orange-400'
        };
      case 'CHEQUERED':
        return {
          color: '#ffffff',
          bgColor: 'bg-white/20',
          borderColor: 'border-white/40',
          text: 'CHEQUERED',
          animation: 'wave',
          textColor: 'text-white'
        };
      default:
        return {
          color: '#6b7280',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/40',
          text: flag,
          animation: 'none',
          textColor: 'text-gray-400'
        };
    }
  };

  const config = getFlagConfig(currentFlag);

  const getAnimation = (type: string) => {
    switch (type) {
      case 'subtle-glow':
        return {
          boxShadow: [
            `0 0 10px ${config.color}20`,
            `0 0 20px ${config.color}40`,
            `0 0 10px ${config.color}20`
          ]
        };
      case 'pulse':
        return {
          scale: [1, 1.05, 1],
          boxShadow: [
            `0 0 10px ${config.color}40`,
            `0 0 30px ${config.color}60`,
            `0 0 10px ${config.color}40`
          ]
        };
      case 'flash':
        return {
          backgroundColor: [
            config.bgColor.replace('/20', '/20'),
            config.bgColor.replace('/20', '/40'),
            config.bgColor.replace('/20', '/20')
          ],
          boxShadow: [
            `0 0 20px ${config.color}40`,
            `0 0 40px ${config.color}80`,
            `0 0 20px ${config.color}40`
          ]
        };
      case 'flash-red':
        return {
          backgroundColor: [
            'rgba(239, 68, 68, 0.2)',
            'rgba(239, 68, 68, 0.6)',
            'rgba(239, 68, 68, 0.2)'
          ],
          boxShadow: [
            '0 0 20px rgba(239, 68, 68, 0.4)',
            '0 0 60px rgba(239, 68, 68, 0.8)',
            '0 0 20px rgba(239, 68, 68, 0.4)'
          ]
        };
      case 'strobe':
        return {
          opacity: [1, 0.3, 1, 0.3, 1],
          boxShadow: [
            `0 0 20px ${config.color}40`,
            `0 0 5px ${config.color}20`,
            `0 0 20px ${config.color}40`,
            `0 0 5px ${config.color}20`,
            `0 0 20px ${config.color}40`
          ]
        };
      case 'wave':
        return {
          background: [
            'linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%)',
            'linear-gradient(45deg, transparent 25%, #ffffff 25%, #ffffff 75%, transparent 75%)'
          ],
          backgroundSize: ['10px 10px', '10px 10px'],
          backgroundPosition: ['0 0', '5px 5px']
        };
      default:
        return {};
    }
  };

  const getTransition = (type: string) => {
    switch (type) {
      case 'subtle-glow':
        return { duration: 2, repeat: Infinity, ease: 'easeInOut' };
      case 'pulse':
        return { duration: 1.5, repeat: Infinity, ease: 'easeInOut' };
      case 'flash':
        return { duration: 1, repeat: Infinity, ease: 'easeInOut' };
      case 'flash-red':
        return { duration: 0.8, repeat: Infinity, ease: 'easeInOut' };
      case 'strobe':
        return { duration: 0.6, repeat: Infinity, ease: 'easeInOut' };
      case 'wave':
        return { duration: 1, repeat: Infinity, ease: 'linear' };
      default:
        return { duration: 0 };
    }
  };

  return (
    <div className={cn(
      'bg-surface/80 backdrop-blur-md border border-white/10 rounded-xl p-6 flex items-center justify-center',
      className
    )}>
      <motion.div
        className={cn(
          'relative flex items-center justify-center w-64 h-32 rounded-xl border-2 transition-all duration-300',
          config.bgColor,
          config.borderColor
        )}
        animate={getAnimation(config.animation)}
        transition={getTransition(config.animation)}
      >
        {/* Flag Icon */}
        <div className="flex items-center space-x-4">
          <motion.div
            animate={config.animation === 'wave' ? { rotate: [0, 10, 0, -10, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Flag 
              size={32} 
              className={config.textColor}
              style={{ color: config.color }}
            />
          </motion.div>
          
          {/* Flag Text */}
          <motion.div
            className={cn(
              'text-2xl font-mono font-black uppercase tracking-wider',
              config.textColor
            )}
            style={{ color: config.color }}
            animate={config.animation === 'flash-red' ? {
              textShadow: [
                '0 0 10px rgba(239, 68, 68, 0.5)',
                '0 0 20px rgba(239, 68, 68, 0.8)',
                '0 0 10px rgba(239, 68, 68, 0.5)'
              ]
            } : {}}
          >
            {config.text}
          </motion.div>
        </div>

        {/* Special effects overlay */}
        {config.animation === 'strobe' && (
          <motion.div
            className="absolute inset-0 rounded-xl"
            animate={{
              background: [
                'radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%)',
                'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)',
                'radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%)'
              ]
            }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
        )}

        {/* Emergency pulse for red flag */}
        {currentFlag === 'RED' && (
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-red-500"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [1, 0.3, 1]
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Flag Description */}
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <div className="text-xs text-text-secondary">
          {currentFlag === 'GREEN' && 'Normal racing conditions'}
          {currentFlag === 'YELLOW' && 'Caution - Slow down, no overtaking'}
          {currentFlag === 'DOUBLE_YELLOW' && 'Extreme caution - Prepare to stop'}
          {currentFlag === 'RED' && 'Session stopped - Return to pit lane'}
          {currentFlag === 'SC' && 'Follow safety car - No overtaking'}
          {currentFlag === 'VSC' && 'Virtual safety car - Maintain gap'}
          {currentFlag === 'CHEQUERED' && 'Session finished'}
        </div>
      </div>
    </div>
  );
}