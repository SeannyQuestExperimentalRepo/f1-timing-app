'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Play, Calendar, Clock, Database } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { SessionRecord } from '@/lib/types';
import { MOCK_SESSION_RECORDS } from '@/lib/mock-data';

interface SessionBrowserProps {
  sessions?: SessionRecord[];
  onSessionSelect?: (sessionKey: string) => void;
  className?: string;
}

export function SessionBrowser({
  sessions = MOCK_SESSION_RECORDS,
  onSessionSelect,
  className
}: SessionBrowserProps) {
  const [selectedType, setSelectedType] = useState<string>('all');

  const sessionTypes = ['all', 'race', 'qualifying', 'practice'];
  const filteredSessions = selectedType === 'all' 
    ? sessions 
    : sessions.filter(s => s.name.toLowerCase().includes(selectedType));

  const formatDuration = (start: string, end?: string) => {
    if (!end) return 'In Progress';
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diff = (endTime.getTime() - startTime.getTime()) / 1000 / 60; // minutes
    return `${Math.floor(diff)}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSessionTypeFromName = (name: string) => {
    if (name.includes('Race')) return 'Race';
    if (name.includes('Qualifying')) return 'Qualifying';
    if (name.includes('Practice')) return 'Practice';
    return 'Session';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'recording': return 'text-yellow-400 bg-yellow-500/20';
      case 'archived': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className={cn(
      'bg-surface/80 backdrop-blur-md border border-white/10 rounded-xl p-4',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary font-medium text-sm uppercase tracking-wider">
          Session Browser
        </h3>
        <div className="text-xs text-text-secondary">
          {filteredSessions.length} sessions
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-4 p-1 bg-surface/40 rounded-lg">
        {sessionTypes.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={cn(
              'px-3 py-2 text-xs font-medium rounded transition-colors capitalize',
              selectedType === type 
                ? 'bg-accent text-white' 
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            )}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredSessions.map((session) => (
          <div
            key={session.session_key}
            className="p-4 bg-surface/40 hover:bg-white/5 rounded-lg border border-white/10 transition-all cursor-pointer group"
            onClick={() => onSessionSelect?.(session.session_key)}
          >
            {/* Session Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-text-primary group-hover:text-accent transition-colors truncate">
                  {session.name}
                </h4>
                <div className="flex items-center space-x-2 mt-1 text-xs text-text-secondary">
                  <span>{session.circuit}</span>
                  <span>•</span>
                  <span>{formatDate(session.start_time)}</span>
                </div>
              </div>
              
              <button 
                className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/20 group-hover:bg-accent group-hover:text-white transition-colors ml-3"
                onClick={(e) => {
                  e.stopPropagation();
                  onSessionSelect?.(session.session_key);
                }}
              >
                <Play size={16} className="ml-0.5" />
              </button>
            </div>

            {/* Session Info Grid */}
            <div className="grid grid-cols-4 gap-3 text-xs">
              <div className="flex items-center space-x-1">
                <Badge variant="default" size="sm">
                  {getSessionTypeFromName(session.name)}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-1">
                <Clock size={12} className="text-text-secondary" />
                <span className="text-text-secondary">
                  {formatDuration(session.start_time, session.end_time)}
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Database size={12} className="text-text-secondary" />
                <span className="text-text-secondary">
                  {session.total_data_points.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-end">
                <span className={cn(
                  'px-2 py-1 rounded text-2xs font-medium uppercase',
                  getStatusColor(session.status)
                )}>
                  {session.status}
                </span>
              </div>
            </div>

            {/* Progress bar for recording sessions */}
            {session.status === 'recording' && (
              <div className="mt-3">
                <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full w-3/4 animate-pulse" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-text-secondary mb-4" />
          <p className="text-text-secondary">No sessions found</p>
          <p className="text-xs text-text-secondary mt-2">
            Try selecting a different filter
          </p>
        </div>
      )}
    </div>
  );
}