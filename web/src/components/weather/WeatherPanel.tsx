'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Thermometer, Droplets, Wind } from 'lucide-react';
import { motion } from 'framer-motion';

interface WeatherData {
  airTemperature: number;
  trackTemperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number; // degrees
  rainfall: number; // mm/h
  pressure: number; // hPa
}

interface WeatherPanelProps {
  weather?: WeatherData;
  className?: string;
}

export function WeatherPanel({
  weather = mockWeather,
  className
}: WeatherPanelProps) {
  const getWindDirectionText = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  const getRainStatus = (rainfall: number) => {
    if (rainfall === 0) return { text: 'DRY', color: 'text-green-400' };
    if (rainfall < 1) return { text: 'LIGHT RAIN', color: 'text-blue-400' };
    if (rainfall < 5) return { text: 'MODERATE RAIN', color: 'text-blue-500' };
    return { text: 'HEAVY RAIN', color: 'text-blue-600' };
  };

  const rainStatus = getRainStatus(weather.rainfall);

  return (
    <div className={cn(
      'bg-surface/80 backdrop-blur-md border border-white/10 rounded-xl p-4',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary font-medium text-sm uppercase tracking-wider">
          Weather Conditions
        </h3>
        <div className="text-xs text-text-secondary">
          Live Data
        </div>
      </div>

      {/* Main Weather Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Air Temperature */}
        <div className="flex items-center space-x-3 p-3 bg-surface/40 rounded-lg">
          <Thermometer size={20} className="text-orange-400" />
          <div>
            <div className="text-xs text-text-secondary uppercase tracking-wider">
              Air Temp
            </div>
            <div className="text-2xl font-mono font-bold text-text-primary">
              {weather.airTemperature}°C
            </div>
          </div>
        </div>

        {/* Track Temperature */}
        <div className="flex items-center space-x-3 p-3 bg-surface/40 rounded-lg">
          <Thermometer size={20} className="text-red-400" />
          <div>
            <div className="text-xs text-text-secondary uppercase tracking-wider">
              Track Temp
            </div>
            <div className="text-2xl font-mono font-bold text-text-primary">
              {weather.trackTemperature}°C
            </div>
          </div>
        </div>

        {/* Humidity */}
        <div className="flex items-center space-x-3 p-3 bg-surface/40 rounded-lg">
          <Droplets size={20} className="text-blue-400" />
          <div>
            <div className="text-xs text-text-secondary uppercase tracking-wider">
              Humidity
            </div>
            <div className="text-2xl font-mono font-bold text-text-primary">
              {weather.humidity}%
            </div>
          </div>
        </div>

        {/* Wind */}
        <div className="flex items-center space-x-3 p-3 bg-surface/40 rounded-lg">
          <motion.div
            animate={{ rotate: weather.windDirection }}
            transition={{ duration: 0.5 }}
          >
            <Wind size={20} className="text-gray-400" />
          </motion.div>
          <div>
            <div className="text-xs text-text-secondary uppercase tracking-wider">
              Wind
            </div>
            <div className="text-xl font-mono font-bold text-text-primary">
              {weather.windSpeed} m/s
            </div>
            <div className="text-xs text-text-secondary">
              {getWindDirectionText(weather.windDirection)} ({weather.windDirection}°)
            </div>
          </div>
        </div>
      </div>

      {/* Rain Indicator */}
      <div className="p-3 bg-surface/40 rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={weather.rainfall > 0 ? {
                y: [0, 10, 0],
                opacity: [1, 0.5, 1]
              } : {}}
              transition={{ duration: 0.5, repeat: weather.rainfall > 0 ? Infinity : 0 }}
            >
              <Droplets 
                size={20} 
                className={weather.rainfall > 0 ? "text-blue-400" : "text-gray-400"} 
              />
            </motion.div>
            <div>
              <div className="text-xs text-text-secondary uppercase tracking-wider">
                Precipitation
              </div>
              <div className={cn(
                "text-xl font-mono font-bold",
                rainStatus.color
              )}>
                {rainStatus.text}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-mono font-bold text-text-primary">
              {weather.rainfall}
            </div>
            <div className="text-xs text-text-secondary">mm/h</div>
          </div>
        </div>
      </div>

      {/* Additional Data */}
      <div className="grid grid-cols-1 gap-2 text-xs">
        <div className="flex justify-between p-2 bg-surface/20 rounded">
          <span className="text-text-secondary">Atmospheric Pressure:</span>
          <span className="font-mono text-text-primary">{weather.pressure} hPa</span>
        </div>
        
        <div className="flex justify-between p-2 bg-surface/20 rounded">
          <span className="text-text-secondary">Weather Trend:</span>
          <span className="text-text-primary">
            {weather.pressure > 1013 ? 'Improving' : 'Deteriorating'}
          </span>
        </div>
      </div>

      {/* Weather Alert */}
      {weather.rainfall > 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-blue-500/20 border border-blue-500/40 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Droplets size={16} className="text-blue-400" />
            </motion.div>
            <span className="text-blue-400 font-medium text-sm">
              RAIN ALERT: Wet weather conditions affecting track
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

const mockWeather: WeatherData = {
  airTemperature: 28.5,
  trackTemperature: 42.3,
  humidity: 45,
  windSpeed: 3.2,
  windDirection: 180,
  rainfall: 0,
  pressure: 1013.2
};