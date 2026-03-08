'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface GearIndicatorProps {
  gear?: number;
  rpm?: number;
  maxRpm?: number;
  teamColor?: string;
  className?: string;
}

export function GearIndicator({
  gear = 6,
  rpm = 12500,
  maxRpm = 15000,
  teamColor = '#0600ef',
  className
}: GearIndicatorProps) {
  const [animatedRpm, setAnimatedRpm] = useState(rpm);

  useEffect(() => {
    setAnimatedRpm(rpm);
  }, [rpm]);

  // RPM percentage for arc fill
  const rpmPercentage = Math.min((rpm / maxRpm) * 100, 100);
  
  // Arc parameters
  const size = 200;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Arc covers 270 degrees (3/4 circle)
  const arcLength = (270 / 360) * circumference;
  const rpmArcLength = (rpmPercentage / 100) * arcLength;
  
  // SVG path for the arc (270 degrees starting from bottom)
  const startAngle = -225; // Start at bottom left
  const endAngle = 45; // End at bottom right
  
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  const backgroundArcPath = describeArc(center, center, radius, startAngle, endAngle);
  
  // Get RPM color based on percentage
  const getRpmColor = (percentage: number) => {
    if (percentage > 90) return '#ef4444'; // Red zone
    if (percentage > 75) return '#f59e0b'; // Amber zone
    return teamColor; // Normal zone
  };

  const rpmColor = getRpmColor(rpmPercentage);

  return (
    <div className={cn(
      'bg-surface/80 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col items-center',
      className
    )}>
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <h3 className="text-text-primary font-medium text-sm uppercase tracking-wider">
          Gear & RPM
        </h3>
        <div className="text-xs text-text-secondary font-mono">
          {rpm.toLocaleString()} RPM
        </div>
      </div>

      {/* Gear and RPM Display */}
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background arc */}
          <path
            d={backgroundArcPath}
            fill="none"
            stroke="#374151"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* RPM arc */}
          <motion.path
            d={backgroundArcPath}
            fill="none"
            stroke={rpmColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={arcLength}
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset: arcLength - rpmArcLength }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              filter: `drop-shadow(0 0 8px ${rpmColor}40)`
            }}
          />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((percentage) => {
            const angle = startAngle + (percentage / 100) * (endAngle - startAngle);
            const tickStart = polarToCartesian(center, center, radius - strokeWidth/2, angle);
            const tickEnd = polarToCartesian(center, center, radius - strokeWidth/2 - 8, angle);
            
            return (
              <line
                key={percentage}
                x1={tickStart.x}
                y1={tickStart.y}
                x2={tickEnd.x}
                y2={tickEnd.y}
                stroke="white"
                strokeWidth="2"
                strokeOpacity="0.6"
                className="transform rotate-90 origin-center"
              />
            );
          })}
        </svg>

        {/* Gear number in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            key={gear}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            <div 
              className="text-6xl font-mono font-black"
              style={{ color: teamColor }}
            >
              {gear}
            </div>
            <div className="text-sm text-text-secondary uppercase tracking-wider -mt-2">
              Gear
            </div>
          </motion.div>
        </div>
      </div>

      {/* RPM Scale */}
      <div className="w-full flex justify-between text-xs text-text-secondary mt-4 px-4">
        <span>0</span>
        <span>3.75k</span>
        <span>7.5k</span>
        <span>11.25k</span>
        <span>15k</span>
      </div>

      {/* Status indicators */}
      <div className="w-full flex justify-between items-center mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center space-x-2">
          <div 
            className={cn(
              "w-2 h-2 rounded-full",
              rpmPercentage > 90 ? "bg-red-500 animate-pulse" : 
              rpmPercentage > 75 ? "bg-yellow-500" : "bg-green-500"
            )}
          />
          <span className="text-xs text-text-secondary">
            {rpmPercentage > 90 ? "REV LIMIT" : 
             rpmPercentage > 75 ? "HIGH RPM" : "NORMAL"}
          </span>
        </div>
        
        <div className="text-xs text-text-secondary">
          {rpmPercentage.toFixed(0)}% of max
        </div>
      </div>
    </div>
  );
}