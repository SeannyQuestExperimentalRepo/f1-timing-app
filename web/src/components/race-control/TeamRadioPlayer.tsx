'use client';

import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

interface RadioClip {
  id: string;
  driverNumber: number;
  driverCode: string;
  teamColor: string;
  timestamp: string;
  duration: number;
  transcript: string;
  audioUrl?: string;
}

interface TeamRadioPlayerProps {
  clips?: RadioClip[];
  className?: string;
}

export function TeamRadioPlayer({
  clips = mockRadioClips,
  className
}: TeamRadioPlayerProps) {
  const [activeClip, setActiveClip] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const playClip = (clipId: string) => {
    if (activeClip === clipId && isPlaying) {
      setIsPlaying(false);
      audioRef.current?.pause();
    } else {
      setActiveClip(clipId);
      setIsPlaying(true);
      // In a real app, you would load and play the actual audio file
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn(
      'bg-surface/80 backdrop-blur-md border border-white/10 rounded-xl p-4',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary font-medium text-sm uppercase tracking-wider flex items-center space-x-2">
          <Radio size={16} />
          <span>Team Radio</span>
        </h3>
        <div className="text-xs text-text-secondary">
          {clips.length} clips
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {clips.map((clip) => (
          <motion.div
            key={clip.id}
            whileHover={{ scale: 1.02 }}
            className={cn(
              'p-3 rounded-lg border cursor-pointer transition-all',
              activeClip === clip.id ? 'bg-white/10 border-white/30' : 'bg-surface/40 border-white/10 hover:bg-white/5'
            )}
            onClick={() => playClip(clip.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div
                  className="w-1 h-8 rounded-full"
                  style={{ backgroundColor: clip.teamColor }}
                />
                <div>
                  <div className="font-mono font-bold text-text-primary text-sm">
                    {clip.driverCode}
                  </div>
                  <div className="text-xs text-text-secondary">
                    #{clip.driverNumber}
                  </div>
                </div>
                <button
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full border transition-colors',
                    activeClip === clip.id && isPlaying 
                      ? 'bg-red-500 border-red-500 text-white' 
                      : 'border-white/30 text-text-primary hover:bg-white/10'
                  )}
                >
                  {activeClip === clip.id && isPlaying ? (
                    <Pause size={14} />
                  ) : (
                    <Play size={14} className="ml-0.5" />
                  )}
                </button>
              </div>

              <div className="text-right text-xs text-text-secondary">
                <div>{formatTime(clip.timestamp)}</div>
                <div>{formatDuration(clip.duration)}</div>
              </div>
            </div>

            <div className="text-sm text-text-primary italic">
              &ldquo;{clip.transcript}&rdquo;
            </div>
          </motion.div>
        ))}
      </div>

      <audio ref={audioRef} className="hidden" />
    </div>
  );
}

const mockRadioClips: RadioClip[] = [
  {
    id: '1',
    driverNumber: 1,
    driverCode: 'VER',
    teamColor: '#0600ef',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    duration: 4,
    transcript: 'How are the tyres feeling Max?'
  },
  {
    id: '2', 
    driverNumber: 16,
    driverCode: 'LEC',
    teamColor: '#dc0000',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    duration: 3,
    transcript: 'Box this lap Charles, box box'
  },
  {
    id: '3',
    driverNumber: 4,
    driverCode: 'NOR',
    teamColor: '#ff8700', 
    timestamp: new Date(Date.now() - 180000).toISOString(),
    duration: 5,
    transcript: 'That was a good move Lando, well done'
  }
];