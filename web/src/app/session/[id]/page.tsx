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
import { TireDegChart } from '@/components/strategy/TireDegChart';
import { PitWindowPredictor } from '@/components/strategy/PitWindowPredictor';
import { RaceControlFeed } from '@/components/race-control/RaceControlFeed';
import { FlagIndicator } from '@/components/race-control/FlagIndicator';
import { TeamRadioPlayer } from '@/components/race-control/TeamRadioPlayer';
import { WeatherPanel } from '@/components/weather/WeatherPanel';
import { DriverComparison } from '@/components/head-to-head/DriverComparison';
import { SectorComparison } from '@/components/head-to-head/SectorComparison';
import { mockTimingData } from '@/lib/mock-data';

interface SessionPageProps {
  params: { id: string };
}

export default function SessionPage({ params }: SessionPageProps) {
  const [selectedDrivers, setSelectedDrivers] = useState<number[]>([1]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'telemetry' | 'strategy' | 'race-control' | 'weather' | 'head-to-head'>('telemetry');

  const handleDriverSelect = (driverNumber: number) => {
    setSelectedDrivers(prev => 
      prev.includes(driverNumber)
        ? prev.filter(d => d !== driverNumber)
        : [...prev, driverNumber].slice(0, 2) // Max 2 drivers
    );
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
      <Header sessionName="2025 Bahrain GP - Race" currentLap={24} totalLaps={57} />
      
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
            <Panel
              title="Live Data"
              className="overflow-hidden"
            >
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
                  <>
                    <TireStrategy drivers={mockTimingData} />
                    <TireDegChart />
                    <PitWindowPredictor />
                  </>
                )}

                {activeTab === 'race-control' && (
                  <>
                    <FlagIndicator currentFlag="GREEN" />
                    <RaceControlFeed />
                    <TeamRadioPlayer />
                  </>
                )}

                {activeTab === 'weather' && (
                  <>
                    <WeatherPanel />
                  </>
                )}

                {activeTab === 'head-to-head' && selectedDrivers.length >= 2 && (
                  <>
                    <DriverComparison drivers={mockTimingData} />
                    <SectorComparison />
                  </>
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
      </div>
    </div>
  );
}