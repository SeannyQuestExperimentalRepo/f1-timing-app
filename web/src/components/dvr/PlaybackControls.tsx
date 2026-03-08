'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, SkipBack, SkipForward, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlaybackControlsProps {
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onRewind?: () => void;
  onFastForward?: () => void;
  currentTime?: number;
  totalTime?: number;
  playbackSpeed?: number;
  onSpeedChange?: (speed: number) => void;
  className?: string;
}

export function PlaybackControls({
  isPlaying = false,
  onPlayPause,
  onRewind,
  onFastForward,
  currentTime = 1234,
  totalTime = 5678,
  playbackSpeed = 1,
  onSpeedChange,
  className
}: PlaybackControlsProps) {
  const [speedDropdownOpen, setSpeedDropdownOpen] = useState(false);

  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const speedOptions = [0.25, 0.5, 1, 2, 4, 8, 16];

  const getSpeedText = (speed: number) => {
    if (speed === 1) return 'LIVE';
    if (speed < 1) return `${speed}x`;
    return `${speed}x`;
  };

  return (
    <div className={cn(
      'bg-surface/95 backdrop-blur-md border border-white/10 p-4 flex items-center justify-between',
      className
    )}>
      {/* Transport Controls */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onRewind}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-surface hover:bg-white/10 text-text-primary transition-colors"
        >
          <SkipBack size={20} />
        </button>

        <motion.button
          onClick={onPlayPause}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'flex items-center justify-center w-12 h-12 rounded-full transition-colors',
            isPlaying 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          )}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
        </motion.button>

        <button
          onClick={onFastForward}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-surface hover:bg-white/10 text-text-primary transition-colors"
        >
          <SkipForward size={20} />
        </button>
      </div>

      {/* Time Display */}
      <div className="flex items-center space-x-4 text-text-primary">
        <div className="text-sm font-mono">
          <span className="text-accent">{formatTime(currentTime)}</span>
          <span className="text-text-secondary mx-2">/</span>
          <span>{formatTime(totalTime)}</span>
        </div>

        {/* Progress indicator */}
        <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
      </div>

      {/* Speed Selector */}
      <div className="relative">
        <button
          onClick={() => setSpeedDropdownOpen(!speedDropdownOpen)}
          className="flex items-center space-x-2 px-3 py-2 bg-surface hover:bg-white/10 rounded-lg border border-white/20 text-text-primary transition-colors"
        >
          <span className="text-sm font-mono font-bold">
            {getSpeedText(playbackSpeed)}
          </span>
          <ChevronDown 
            size={16} 
            className={cn('transition-transform', speedDropdownOpen && 'rotate-180')}
          />
        </button>

        {speedDropdownOpen && (
          <div className="absolute bottom-full right-0 mb-2 bg-surface border border-white/20 rounded-lg shadow-xl z-50">
            {speedOptions.map((speed) => (
              <button
                key={speed}
                onClick={() => {
                  onSpeedChange?.(speed);
                  setSpeedDropdownOpen(false);
                }}
                className={cn(
                  'block w-full px-4 py-2 text-left text-sm font-mono hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg',
                  speed === playbackSpeed ? 'bg-accent/20 text-accent' : 'text-text-primary'
                )}
              >
                {getSpeedText(speed)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status Indicators */}
      <div className="flex items-center space-x-3 text-xs">
        <div className="flex items-center space-x-1">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isPlaying ? "bg-green-400 animate-pulse" : "bg-gray-400"
          )} />
          <span className="text-text-secondary uppercase tracking-wider">
            {isPlaying ? 'PLAYING' : 'PAUSED'}
          </span>
        </div>

        <div className="w-px h-4 bg-white/20" />

        <div className="text-text-secondary">
          REPLAY MODE
        </div>
      </div>
    </div>
  );
}