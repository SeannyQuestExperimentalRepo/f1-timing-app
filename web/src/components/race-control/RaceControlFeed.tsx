'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Flag, AlertTriangle, Info, Zap, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RaceControlMessage {
  id: string;
  timestamp: string;
  category: 'Flag' | 'Investigation' | 'Penalty' | 'DRS' | 'SafetyCar' | 'Other';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  sector?: number;
  driver?: string;
}

interface RaceControlFeedProps {
  messages?: RaceControlMessage[];
  className?: string;
}

export function RaceControlFeed({
  messages = mockMessages,
  className
}: RaceControlFeedProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Flag': return <Flag size={16} />;
      case 'Investigation': return <AlertTriangle size={16} />;
      case 'DRS': return <Zap size={16} />;
      case 'SafetyCar': return <AlertTriangle size={16} />;
      default: return <Info size={16} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/40';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40';
      case 'info': return 'text-blue-400 bg-blue-500/20 border-blue-500/40';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/40';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn(
      'bg-surface/80 backdrop-blur-md border border-white/10 rounded-xl p-4',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary font-medium text-sm uppercase tracking-wider">
          Race Control
        </h3>
        <div className="flex items-center space-x-2 text-xs text-text-secondary">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>Live Feed</span>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'p-3 rounded-lg border transition-all hover:scale-[1.02]',
                getSeverityColor(message.severity)
              )}
            >
              {/* Message Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(message.category)}
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {message.category}
                  </span>
                  {message.sector && (
                    <span className="text-xs bg-white/20 px-1 py-0.5 rounded">
                      S{message.sector}
                    </span>
                  )}
                  {message.driver && (
                    <span className="text-xs bg-white/20 px-1 py-0.5 rounded font-mono">
                      {message.driver}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 text-xs opacity-70">
                  <Clock size={12} />
                  <span>{formatTime(message.timestamp)}</span>
                </div>
              </div>

              {/* Message Content */}
              <div className="text-sm text-white font-medium">
                {message.message}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-xs">
        <div className="text-center">
          <div className="text-text-secondary mb-1">Total Messages</div>
          <div className="text-lg font-mono font-bold text-text-primary">
            {messages.length}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-text-secondary mb-1">Critical</div>
          <div className="text-lg font-mono font-bold text-red-400">
            {messages.filter(m => m.severity === 'critical').length}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-text-secondary mb-1">Last Update</div>
          <div className="text-xs font-mono text-text-primary">
            {messages.length > 0 ? formatTime(messages[0].timestamp) : '-'}
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock data
const mockMessages: RaceControlMessage[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 30000).toISOString(),
    category: 'Flag',
    severity: 'critical',
    message: 'YELLOW FLAG - Sector 2 - Debris on track',
    sector: 2
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    category: 'Investigation',
    severity: 'warning',
    message: 'Incident involving HAM and VER at Turn 4 - Under investigation',
    driver: 'HAM'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 180000).toISOString(),
    category: 'DRS',
    severity: 'info',
    message: 'DRS enabled - All DRS zones now active'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 240000).toISOString(),
    category: 'Flag',
    severity: 'info',
    message: 'GREEN FLAG - Session resumed'
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 360000).toISOString(),
    category: 'Penalty',
    severity: 'warning',
    message: '5-second time penalty for LEC - Track limits',
    driver: 'LEC'
  }
];