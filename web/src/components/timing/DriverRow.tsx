'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { SectorTimes } from './SectorTimes';
import { GapDisplay } from './GapDisplay';
import { TimingRowData } from '@/lib/types';
import { TIRE_COLORS } from '@/lib/constants';

interface DriverRowProps {
  data: TimingRowData;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function DriverRow({
  data,
  isSelected = false,
  onClick,
  className
}: DriverRowProps) {
  const formatLapTime = (time?: number) => {
    if (!time) return '-';
    
    const minutes = Math.floor(time / 60);
    const seconds = (time % 60).toFixed(3);
    
    if (minutes > 0) {
      return `${minutes}:${seconds.padStart(6, '0')}`;
    }
    
    return seconds;
  };

  const getStatusColor = () => {
    switch (data.status) {
      case 'PIT':
        return 'bg-yellow-500/20 border-yellow-500/40';
      case 'OUT':
      case 'RETIRED':
      case 'DNF':
        return 'bg-red-500/20 border-red-500/40';
      default:
        return '';
    }
  };

  const getTireColor = () => {
    return TIRE_COLORS[data.current_compound as keyof typeof TIRE_COLORS] || '#666666';
  };

  return (
    <motion.div
      layout
      onClick={onClick}
      className={cn(
        'grid grid-cols-[50px_120px_80px_80px_100px_180px_60px_50px_50px] gap-2 p-3 hover:bg-white/5 transition-colors border-l-4 relative cursor-pointer',
        isSelected && 'bg-white/10 ring-1 ring-white/20',
        getStatusColor(),
        className
      )}
      style={{ borderLeftColor: data.team_color }}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.998 }}
    >
      {/* Position */}
      <div className="flex items-center justify-center">
        <span className="font-mono font-bold text-lg text-text-primary">
          {data.position}
        </span>
      </div>

      {/* Driver */}
      <div className="flex flex-col justify-center">
        <span className="font-mono font-bold text-text-primary text-sm">
          {data.driver_code}
        </span>
        <span className="text-xs text-text-secondary truncate">
          {data.team_name}
        </span>
      </div>

      {/* Interval */}
      <div className="flex items-center justify-center">
        <GapDisplay 
          gap={data.interval} 
          isInterval={true}
        />
      </div>

      {/* Gap */}
      <div className="flex items-center justify-center">
        <GapDisplay gap={data.gap_to_leader} />
      </div>

      {/* Last Lap */}
      <div className="flex items-center justify-center">
        <span className="font-mono text-sm text-text-primary">
          {formatLapTime(data.last_lap_time)}
        </span>
      </div>

      {/* Sector Times */}
      <div className="flex items-center justify-center">
        <SectorTimes
          sector1={data.sector_1_time}
          sector2={data.sector_2_time}
          sector3={data.sector_3_time}
          sector1PB={data.sector_1_pb}
          sector2PB={data.sector_2_pb}
          sector3PB={data.sector_3_pb}
          sector1Overall={data.sector_1_overall_fastest}
          sector2Overall={data.sector_2_overall_fastest}
          sector3Overall={data.sector_3_overall_fastest}
        />
      </div>

      {/* Tire */}
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center space-y-1">
          <Badge
            variant="tire"
            color={getTireColor()}
            size="sm"
          >
            {data.current_compound[0]}
          </Badge>
          <span className="text-xs text-text-secondary font-mono">
            {data.tyre_age}
          </span>
        </div>
      </div>

      {/* Laps */}
      <div className="flex items-center justify-center">
        <span className="font-mono text-sm text-text-primary">
          {data.lap_count}
        </span>
      </div>

      {/* Pits */}
      <div className="flex items-center justify-center">
        <span className="font-mono text-sm text-text-primary">
          {data.pit_count}
        </span>
      </div>

      {/* Status Indicator */}
      {data.status !== 'RUNNING' && (
        <div className="absolute right-2 top-2">
          <Badge
            variant="default"
            size="sm"
            className="text-xs"
          >
            {data.status}
          </Badge>
        </div>
      )}

      {/* Pit Indicator */}
      {data.in_pit && (
        <div className="absolute right-2 bottom-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
        </div>
      )}
    </motion.div>
  );
}