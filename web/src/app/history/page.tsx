'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { SessionBrowser } from '@/components/dvr/SessionBrowser';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MOCK_SESSION_RECORDS } from '@/lib/mock-data';
import { Search, Grid, List, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HistoryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type'>('date');

  // Extended mock data for demonstration
  const extendedSessions = [
    ...MOCK_SESSION_RECORDS,
    {
      session_key: 'mock-2025-jeddah-race',
      name: '2025 Saudi Arabian Grand Prix - Race',
      circuit: 'Jeddah',
      start_time: '2025-03-22T18:00:00Z',
      end_time: '2025-03-22T20:00:00Z',
      status: 'completed' as const,
      total_data_points: 18234,
    },
    {
      session_key: 'mock-2025-australia-race',
      name: '2025 Australian Grand Prix - Race',
      circuit: 'Melbourne',
      start_time: '2025-04-05T05:00:00Z',
      end_time: '2025-04-05T07:00:00Z',
      status: 'completed' as const,
      total_data_points: 16890,
    },
    {
      session_key: 'mock-2025-japan-qualifying',
      name: '2025 Japanese Grand Prix - Qualifying',
      circuit: 'Suzuka',
      start_time: '2025-04-12T06:00:00Z',
      end_time: '2025-04-12T07:00:00Z',
      status: 'completed' as const,
      total_data_points: 9876,
    }
  ];

  const sessionTypes = ['all', 'race', 'qualifying', 'practice'];
  
  const filteredSessions = extendedSessions
    .filter(session => {
      const matchesSearch = session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          session.circuit.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || 
                         session.name.toLowerCase().includes(selectedType);
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const handleSessionSelect = (sessionKey: string) => {
    router.push(`/replay/${sessionKey}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], { 
      year: 'numeric',
      month: 'long', 
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

  const getSessionTypeColor = (sessionName: string) => {
    if (sessionName.includes('Race')) return '#ef4444';
    if (sessionName.includes('Qualifying')) return '#eab308';
    if (sessionName.includes('Practice')) return '#6b7280';
    return '#6b7280';
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-text-primary mb-2">Session History</h1>
          <p className="text-text-secondary">
            Browse and replay past Formula 1 sessions with full telemetry data.
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <Card className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search sessions by name or circuit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-surface border border-white/20 rounded-lg text-text-primary placeholder-text-secondary focus-ring"
                />
              </div>

              {/* Type Filter */}
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-text-secondary" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-surface border border-white/20 rounded-lg px-3 py-2 text-text-primary focus-ring"
                >
                  {sessionTypes.map(type => (
                    <option key={type} value={type} className="bg-surface">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-text-secondary">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'type')}
                  className="bg-surface border border-white/20 rounded-lg px-3 py-2 text-text-primary focus-ring"
                >
                  <option value="date" className="bg-surface">Date</option>
                  <option value="name" className="bg-surface">Name</option>
                  <option value="type" className="bg-surface">Type</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center space-x-1 bg-surface/60 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Grid size={16} />
                </button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="mb-4"
        >
          <p className="text-sm text-text-secondary">
            Showing {filteredSessions.length} of {extendedSessions.length} sessions
          </p>
        </motion.div>

        {/* Session Browser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {viewMode === 'list' ? (
            <SessionBrowser
              sessions={filteredSessions}
              onSessionSelect={handleSessionSelect}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSessions.map((session, index) => (
                <motion.div
                  key={session.session_key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card className="hover-lift cursor-pointer transition-all hover:border-accent/50 group h-full">
                    <div className="p-4 h-full flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-text-primary group-hover:text-accent transition-colors line-clamp-2 mb-2">
                            {session.name}
                          </h3>
                          <div className="flex items-center space-x-2 text-xs text-text-secondary mb-2">
                            <span>{session.circuit}</span>
                          </div>
                          <div className="text-xs text-text-secondary">
                            {formatDate(session.start_time)}
                          </div>
                        </div>
                        <div 
                          className="w-2 h-12 rounded-full ml-2 flex-shrink-0"
                          style={{ backgroundColor: getSessionTypeColor(session.name) }}
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-2 text-xs text-text-secondary">
                          <div className="flex justify-between">
                            <span>Type:</span>
                            <Badge variant="default" size="sm">
                              {getSessionTypeFromName(session.name)}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Data Points:</span>
                            <span className="font-mono">{session.total_data_points.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <span className={`font-medium ${
                              session.status === 'completed' ? 'text-green-400' : 'text-gray-400'
                            }`}>
                              {session.status.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleSessionSelect(session.session_key)}
                          className="mt-4 btn-secondary w-full"
                        >
                          REPLAY SESSION
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* No Results */}
        {filteredSessions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-text-secondary mb-4">No sessions found matching your criteria.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}