'use client';


import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Panel } from '@/components/layout/Panel';
import { TimingBoard } from '@/components/timing/TimingBoard';
import { TrackMap } from '@/components/track-map/TrackMap';
import { SpeedTrace } from '@/components/telemetry/SpeedTrace';
import { ThrottleBrakeGauge } from '@/components/telemetry/ThrottleBrakeGauge';
import { GearIndicator } from '@/components/telemetry/GearIndicator';
import { DRSIndicator } from '@/components/telemetry/DRSIndicator';
import { TireStrategy } from '@/components/strategy/TireStrategy';
import { RaceControlFeed } from '@/components/race-control/RaceControlFeed';
import { WeatherPanel } from '@/components/weather/WeatherPanel';
import { DriverComparison } from '@/components/head-to-head/DriverComparison';
import { PlaybackControls } from '@/components/dvr/PlaybackControls';
import { Badge } from '@/components/ui/Badge';
import { mockTimingData } from '@/lib/mock-data';

interface ReplayPageProps {
  params: { id: string };
}

export default function ReplayPage({ params }: ReplayPageProps) {
  const [selectedDrivers, setSelectedDrivers] = useState<number[]>([1]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'telemetry' | 'strategy' | 'race-control' | 'weather' | 'head-to-head'>('telemetry');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const handleDriverSelect = (driverNumber: number) => {
    setSelectedDrivers(prev => 
      prev.includes(driverNumber)
        ? prev.filter(d => d !== driverNumber)
        : [...prev, driverNumber].slice(0, 2)
    );
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  const tabs = [
    { id: 'telemetry', label: 'Telemetry' },
    { id: 'strategy', label: 'Strategy' },
    { id: 'race-control', label: 'Race Control' },
    { id: 'weather', label: 'Weather' },
    { id: 'head-to-head', label: 'Head-to-Head' }
  ] as const;

  const selectedDriver = selectedDrivers[0] ? 
    mockTimingData.find(d => d.driver_number === selectedDrivers[0]) : 
    mockTimingData[0];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with Replay Badge */}
      <div className="relative">
        <Header sessionName="2025 Bahrain GP - Race" currentLap={24} totalLaps={57} />
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <Badge variant="flag" color="#f59e0b" size="md">
            REPLAY
          </Badge>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          drivers={mockTimingData}
          selectedDrivers={selectedDrivers}
          onDriverSelect={handleDriverSelect}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-w-0">
            {/* Center Column */}
            <div className="flex-1 space-y-4">
              {/* Timing Board */}
              <TimingBoard
                data={mockTimingData}
                selectedDrivers={selectedDrivers}
                onDriverSelect={handleDriverSelect}
              />

              {/* Track Map */}
              <TrackMap
                trackName="bahrain"
                drivers={mockTimingData}
                showSectors={true}
                showDRSZones={true}
              />
            </div>

            {/* Right Panel */}
            <div className="lg:w-96 xl:w-[26rem] space-y-4">
              <Panel title="Replay Data" className="overflow-hidden">
                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-1 mb-4 p-1 bg-surface/40 rounded-lg">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-2 py-1 text-2xs font-medium rounded transition-colors ${
                        activeTab === tab.id
                          ? 'bg-accent text-white'
                          : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-4">
                  {activeTab === 'telemetry' && (
                    <>
                      <SpeedTrace
                        driverNumber={selectedDriver?.driver_number}
                        teamColor={selectedDriver?.team_color}
                        currentSpeed={298}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <ThrottleBrakeGauge throttle={85} brake={0} />
                        <div className="space-y-4">
                          <GearIndicator
                            gear={6}
                            rpm={12500}
                            teamColor={selectedDriver?.team_color}
                          />
                          <DRSIndicator status="ELIGIBLE" />
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'strategy' && (
                    <TireStrategy drivers={mockTimingData} />
                  )}

                  {activeTab === 'race-control' && (
                    <RaceControlFeed />
                  )}

                  {activeTab === 'weather' && (
                    <WeatherPanel />
                  )}

                  {activeTab === 'head-to-head' && selectedDrivers.length >= 2 && (
                    <DriverComparison drivers={mockTimingData} />
                  )}

                  {activeTab === 'head-to-head' && selectedDrivers.length < 2 && (
                    <div className="text-center py-8 text-text-secondary">
                      <p>Select 2 drivers from the sidebar to compare</p>
                    </div>
                  )}
                </div>
              </Panel>
            </div>
          </div>

          {/* Timeline Slider */}
          <div className="px-4 pb-2">
            <div className="relative h-8 bg-surface/80 rounded-lg border border-white/10 overflow-hidden">
              {/* Timeline background */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-yellow-500/20 to-green-500/20" />
              
              {/* Progress indicator */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-accent shadow-lg"
                style={{ left: '42%' }} // Mock current position
              />
              
              {/* Lap markers */}
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 w-px bg-white/20"
                  style={{ left: `${(i + 1) * 10}%` }}
                />
              ))}

              {/* Time labels */}
              <div className="absolute inset-0 flex items-center justify-between px-4 text-2xs text-white/60">
                <span>0:00</span>
                <span>30:00</span>
                <span>1:00:00</span>
                <span>1:30:00</span>
                <span>2:00:00</span>
              </div>
            </div>
          </div>

          {/* Playback Controls */}
          <PlaybackControls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onRewind={() => console.log('Rewind')}
            onFastForward={() => console.log('Fast forward')}
            currentTime={2534} // seconds
            totalTime={7200} // 2 hours
            playbackSpeed={playbackSpeed}
            onSpeedChange={handleSpeedChange}
            className="border-t border-white/10"
          />
        </div>
      </div>
    </div>
  );
}