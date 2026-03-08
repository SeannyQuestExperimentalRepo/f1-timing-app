'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from '@/components/ui/Tooltip';

interface CarMarkerProps {
  x: number;
  y: number;
  driverNumber: number;
  driverName: string;
  teamColor: string;
  speed?: number;
  gap?: number;
  className?: string;
}

export function CarMarker({
  x,
  y,
  driverNumber,
  driverName,
  teamColor,
  speed = 0,
  gap = 0,
  className
}: CarMarkerProps) {
  const [isHovered, setIsHovered] = useState(false);

  const tooltipContent = (
    <div className="text-xs space-y-1 min-w-[120px]">
      <div className="font-bold text-white">{driverName}</div>
      <div className="font-mono">
        <div>Speed: {speed} km/h</div>
        <div>Gap: {gap > 0 ? `+${gap.toFixed(3)}` : 'Leader'}</div>
      </div>
    </div>
  );

  return (
    <Tooltip content={tooltipContent} position="top">
      <motion.g
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="cursor-pointer"
        whileHover={{ scale: 1.2 }}
        animate={{ x, y }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        {/* Car body - larger circle */}
        <motion.circle
          r={isHovered ? 8 : 6}
          fill={teamColor}
          stroke="white"
          strokeWidth={isHovered ? 2 : 1}
          className="filter drop-shadow-lg"
          animate={{
            r: isHovered ? 8 : 6,
            strokeWidth: isHovered ? 2 : 1
          }}
        />
        
        {/* Driver number */}
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-white text-xs font-mono font-bold pointer-events-none select-none"
          style={{ fontSize: isHovered ? '10px' : '8px' }}
        >
          {driverNumber}
        </text>

        {/* Direction indicator (small arrow) */}
        <motion.polygon
          points="0,-10 -3,-6 3,-6"
          fill={teamColor}
          stroke="white"
          strokeWidth={0.5}
          className="opacity-70"
          animate={{
            scale: isHovered ? 1.2 : 1
          }}
        />

        {/* Glow effect when hovered */}
        {isHovered && (
          <motion.circle
            r={12}
            fill="none"
            stroke={teamColor}
            strokeWidth={1}
            className="opacity-30"
            initial={{ r: 6, opacity: 0 }}
            animate={{ r: 12, opacity: 0.3 }}
            exit={{ r: 6, opacity: 0 }}
          />
        )}
      </motion.g>
    </Tooltip>
  );
}