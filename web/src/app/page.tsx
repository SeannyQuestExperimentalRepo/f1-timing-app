'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Clock, Database, TrendingUp } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MOCK_SESSION_RECORDS, MOCK_SESSION } from '@/lib/mock-data';

export default function HomePage() {
  const currentSession = MOCK_SESSION;
  const recentSessions = MOCK_SESSION_RECORDS.slice(0, 6);
  const isLiveSession = true; // Mock live session state

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
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
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gradient mb-4">
            F1 LIVE TIMING
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Real-time Formula 1 telemetry, timing data, and race analysis. 
            Experience every lap, every sector, every moment.
          </p>
        </motion.div>

        {/* Live Session Card */}
        {isLiveSession && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Card className="relative overflow-hidden border-accent/50 bg-accent/5">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-accent/10 animate-pulse" />
              
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-accent rounded-full animate-pulse" />
                    <span className="text-accent font-bold uppercase tracking-wider text-sm">
                      LIVE NOW
                    </span>
                  </div>
                  <Badge variant="default" color="#ef4444" size="sm">
                    Race
                  </Badge>
                </div>
                
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  {currentSession.session_name}
                </h2>
                <p className="text-text-secondary mb-6">
                  {currentSession.circuit_short_name} • {formatDate(currentSession.date_start)}
                </p>

                <Link 
                  href={`/session/${currentSession.session_key}`}
                  className="inline-flex items-center space-x-2 btn-primary hover-lift"
                >
                  <Play size={20} />
                  <span>WATCH LIVE</span>
                </Link>
              </div>
            </Card>
          </motion.div>
        )}

        {/* No Live Session State */}
        {!isLiveSession && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Card className="text-center p-12">
              <Clock size={48} className="mx-auto text-text-secondary mb-4" />
              <h2 className="text-xl font-bold text-text-primary mb-2">
                No Live Session
              </h2>
              <p className="text-text-secondary mb-6">
                No Formula 1 session is currently active. Check out recent recordings below.
              </p>
            </Card>
          </motion.div>
        )}

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="text-center p-6">
            <Database size={32} className="mx-auto text-accent mb-3" />
            <div className="text-2xl font-mono font-bold text-text-primary mb-1">
              {recentSessions.reduce((sum, s) => sum + s.total_data_points, 0).toLocaleString()}
            </div>
            <div className="text-sm text-text-secondary">Total Data Points</div>
          </Card>

          <Card className="text-center p-6">
            <Clock size={32} className="mx-auto text-green-400 mb-3" />
            <div className="text-2xl font-mono font-bold text-text-primary mb-1">
              {recentSessions.length}
            </div>
            <div className="text-sm text-text-secondary">Recent Sessions</div>
          </Card>

          <Card className="text-center p-6">
            <TrendingUp size={32} className="mx-auto text-blue-400 mb-3" />
            <div className="text-2xl font-mono font-bold text-text-primary mb-1">
              99.9%
            </div>
            <div className="text-sm text-text-secondary">Data Accuracy</div>
          </Card>
        </motion.div>

        {/* Recent Sessions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary">Recent Sessions</h2>
            <Link 
              href="/history"
              className="text-accent hover:text-accent/80 text-sm font-medium"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentSessions.map((session, index) => (
              <motion.div
                key={session.session_key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Card className="hover-lift cursor-pointer transition-all hover:border-accent/50 group">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-text-primary group-hover:text-accent transition-colors truncate">
                          {session.name}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {session.circuit} • {formatDate(session.start_time)}
                        </p>
                      </div>
                      <div 
                        className="w-2 h-8 rounded-full ml-2"
                        style={{ backgroundColor: getSessionTypeColor(session.name) }}
                      />
                    </div>

                    <div className="space-y-2 text-xs text-text-secondary mb-4">
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

                    <Link 
                      href={`/replay/${session.session_key}`}
                      className="inline-flex items-center space-x-2 btn-secondary w-full justify-center"
                    >
                      <Play size={16} />
                      <span>REPLAY</span>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
}