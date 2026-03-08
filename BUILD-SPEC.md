# F1 Live Timing App — Full Build Specification

## Overview
Real-time F1 timing application with session recording/playback (DVR mode), live telemetry, strategy analysis, and modern dark UI. Built as a monorepo with Next.js frontend and Python data pipeline.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App (Frontend)                 │
│  Track Map │ Telemetry │ Strategy │ Race Control │ DVR   │
└──────────────────────┬──────────────────────────────────┘
                       │ WebSocket + REST
┌──────────────────────▼──────────────────────────────────┐
│              Fastify Server (backend/)                    │
│  WebSocket Hub │ REST API │ Session Playback Engine       │
└──────────┬───────────────────────┬──────────────────────┘
           │                       │
┌──────────▼──────────┐  ┌────────▼─────────────────────┐
│  Python Pipeline     │  │  SQLite Database              │
│  (data-pipeline/)    │  │  - recorded sessions          │
│  - OpenF1 poller     │  │  - telemetry snapshots        │
│  - SignalR client    │  │  - lap times, sectors         │
│  - FastF1 historical │  │  - race control messages      │
│  - Session recorder  │  │  - weather, tire data         │
└─────────────────────┘  └───────────────────────────────┘
```

## Monorepo Structure

```
f1-timing-app/
├── package.json              # Root workspace config
├── BUILD-SPEC.md
├── docker-compose.yml        # Local dev (optional)
│
├── web/                      # Next.js 14 frontend
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── public/
│   │   └── tracks/           # SVG track maps per circuit
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # Dashboard home
│   │   │   ├── session/
│   │   │   │   └── [id]/page.tsx # Live session view
│   │   │   ├── replay/
│   │   │   │   └── [id]/page.tsx # Session replay/DVR
│   │   │   └── history/
│   │   │       └── page.tsx      # Past sessions browser
│   │   ├── components/
│   │   │   ├── track-map/
│   │   │   │   ├── TrackMap.tsx
│   │   │   │   ├── CarMarker.tsx
│   │   │   │   └── TrackMap.test.tsx
│   │   │   ├── telemetry/
│   │   │   │   ├── SpeedTrace.tsx
│   │   │   │   ├── ThrottleBrakeGauge.tsx
│   │   │   │   ├── GearIndicator.tsx
│   │   │   │   ├── DRSIndicator.tsx
│   │   │   │   └── TelemetryPanel.test.tsx
│   │   │   ├── timing/
│   │   │   │   ├── TimingBoard.tsx
│   │   │   │   ├── DriverRow.tsx
│   │   │   │   ├── SectorTimes.tsx
│   │   │   │   ├── GapDisplay.tsx
│   │   │   │   └── TimingBoard.test.tsx
│   │   │   ├── strategy/
│   │   │   │   ├── TireStrategy.tsx
│   │   │   │   ├── TireDegChart.tsx
│   │   │   │   ├── PitWindowPredictor.tsx
│   │   │   │   ├── StintTimeline.tsx
│   │   │   │   └── Strategy.test.tsx
│   │   │   ├── race-control/
│   │   │   │   ├── RaceControlFeed.tsx
│   │   │   │   ├── FlagIndicator.tsx
│   │   │   │   ├── TeamRadioPlayer.tsx
│   │   │   │   └── RaceControl.test.tsx
│   │   │   ├── weather/
│   │   │   │   ├── WeatherPanel.tsx
│   │   │   │   └── Weather.test.tsx
│   │   │   ├── head-to-head/
│   │   │   │   ├── DriverComparison.tsx
│   │   │   │   ├── SectorComparison.tsx
│   │   │   │   └── HeadToHead.test.tsx
│   │   │   ├── dvr/
│   │   │   │   ├── PlaybackControls.tsx
│   │   │   │   ├── SessionBrowser.tsx
│   │   │   │   ├── TimelineSlider.tsx
│   │   │   │   └── DVR.test.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Panel.tsx
│   │   │   └── ui/              # Shared primitives
│   │   │       ├── Card.tsx
│   │   │       ├── Badge.tsx
│   │   │       ├── Tooltip.tsx
│   │   │       └── Chart.tsx
│   │   ├── hooks/
│   │   │   ├── useF1WebSocket.ts
│   │   │   ├── useSessionData.ts
│   │   │   ├── usePlayback.ts
│   │   │   ├── useTelemetry.ts
│   │   │   └── useDriverSelection.ts
│   │   ├── lib/
│   │   │   ├── api.ts            # REST client
│   │   │   ├── constants.ts      # Team colors, driver codes
│   │   │   ├── types.ts          # All TypeScript types
│   │   │   ├── utils.ts          # Formatting, time helpers
│   │   │   └── track-coords.ts   # Track SVG path data
│   │   └── stores/
│   │       ├── session-store.ts  # Zustand store
│   │       └── playback-store.ts
│   └── __tests__/
│       └── e2e/                  # Playwright E2E tests
│
├── server/                   # Fastify backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── sessions.ts      # GET /sessions, GET /sessions/:id
│   │   │   ├── telemetry.ts     # GET /telemetry/:session/:driver
│   │   │   ├── replay.ts        # GET /replay/:session (playback API)
│   │   │   └── health.ts
│   │   ├── ws/
│   │   │   ├── hub.ts           # WebSocket connection manager
│   │   │   └── channels.ts      # Channel routing (live vs playback)
│   │   ├── services/
│   │   │   ├── recording.ts     # Session recording service
│   │   │   ├── playback.ts      # Playback engine (speed control)
│   │   │   └── cache.ts         # In-memory latest state cache
│   │   ├── db/
│   │   │   ├── schema.sql
│   │   │   ├── client.ts        # better-sqlite3 wrapper
│   │   │   └── migrations/
│   │   └── lib/
│   │       ├── types.ts
│   │       └── f1-constants.ts
│   └── __tests__/
│       ├── sessions.test.ts
│       ├── replay.test.ts
│       └── recording.test.ts
│
├── data-pipeline/            # Python data ingestion
│   ├── pyproject.toml
│   ├── requirements.txt
│   ├── src/
│   │   ├── __init__.py
│   │   ├── main.py              # Entry point
│   │   ├── openf1_client.py     # OpenF1 API poller
│   │   ├── signalr_client.py    # F1 Live Timing SignalR
│   │   ├── fastf1_loader.py     # Historical data loader
│   │   ├── recorder.py          # Writes all data to SQLite with timestamps
│   │   ├── broadcaster.py       # Pushes to Fastify via WebSocket
│   │   └── models.py            # Data models
│   └── tests/
│       ├── test_openf1.py
│       ├── test_recorder.py
│       └── test_models.py
│
└── shared/                   # Shared types/constants
    ├── types.ts
    └── constants.ts
```

## Data Sources & Integration

### OpenF1 API (Primary — Free, No Auth)
- **Base URL:** `https://api.openf1.org/v1/`
- **Endpoints used:**
  - `/car_data` — speed, RPM, gear, throttle, brake, DRS (per car, ~3.7Hz)
  - `/location` — x, y, z coordinates per car (~3.7Hz)
  - `/position` — race position per driver
  - `/intervals` — gap to leader, gap to car ahead
  - `/laps` — lap times, sector times, pit in/out
  - `/pit` — pit stop events with duration
  - `/stints` — tire compound, tire age, stint number
  - `/weather` — air temp, track temp, humidity, pressure, wind speed/direction, rainfall
  - `/team_radio` — radio clip URLs
  - `/race_control` — flags, penalties, investigations, DRS enabled/disabled
  - `/sessions` — session list (FP1, FP2, FP3, Quali, Sprint, Race)
  - `/drivers` — driver info, team, number, abbreviation
- **Polling:** Every 1-2 seconds for car_data/location, 5s for everything else
- **Session filter:** `?session_key=latest` for current session

### F1 Live Timing SignalR (Real-time Supplement)
- Provides speed traps, mini-sectors, race control in true real-time (push, not poll)
- Library: `signalr-client` (Python)
- Use as enhancement when available, fall back to OpenF1

### FastF1 (Historical / Post-Session)
- Python library for post-session analysis
- Full telemetry at ~4Hz sample rate
- Used for: session replay enrichment, historical comparisons, tire deg analysis

## Session Recording (DVR Feature)

### Recording
Every data point from OpenF1/SignalR gets written to SQLite with:
```sql
CREATE TABLE recorded_data (
  id INTEGER PRIMARY KEY,
  session_key TEXT NOT NULL,
  timestamp_ms INTEGER NOT NULL,  -- epoch ms when data was received
  channel TEXT NOT NULL,           -- 'car_data', 'location', 'position', etc.
  data JSON NOT NULL,              -- raw JSON payload
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_session_ts ON recorded_data(session_key, timestamp_ms);
CREATE INDEX idx_session_channel ON recorded_data(session_key, channel);

CREATE TABLE sessions (
  session_key TEXT PRIMARY KEY,
  name TEXT,                       -- "2025 Bahrain GP - Race"
  circuit TEXT,
  start_time DATETIME,
  end_time DATETIME,
  status TEXT DEFAULT 'recording', -- recording, completed, archived
  total_data_points INTEGER DEFAULT 0
);
```

### Playback Engine
- REST endpoint: `GET /replay/:sessionKey?speed=1&from=0`
- WebSocket channel: same format as live, but reads from DB
- Speed control: 1x, 2x, 4x, 8x, 16x, pause
- Seek: jump to any timestamp in the session
- The frontend uses the same components for live AND replay — just different data source

## UI Design Specification

### Theme: Dark Cockpit
- **Background:** `#0a0a0f` (near-black with slight blue)
- **Surface:** `#12121a` (cards, panels)
- **Surface elevated:** `#1a1a2e` (hover, active states)
- **Border:** `#ffffff10` (subtle glass borders)
- **Text primary:** `#e4e4e7`
- **Text secondary:** `#71717a`
- **Accent:** `#e10600` (F1 red, used sparingly)

### Team Colors (2025)
```ts
const TEAM_COLORS = {
  'Red Bull': '#3671C6',
  'Mercedes': '#6CD3BF',
  'Ferrari': '#E8002D',
  'McLaren': '#FF8000',
  'Aston Martin': '#358C75',
  'Alpine': '#2293D1',
  'Williams': '#37BEDD',
  'Haas': '#B6BABD',
  'RB': '#6692FF',
  'Sauber': '#52E252',
} as const;
```

### Layout
- **Desktop:** Sidebar (driver list) | Main (track map + timing) | Right panel (telemetry/strategy)
- **Tablet:** Collapsible sidebar, stacked panels
- **Mobile:** Single column, swipeable sections
- **All panels** are draggable/resizable (react-grid-layout or similar)

### Key Visual Elements
- Track map with animated car dots (team colored, driver number labels)
- Glassmorphism cards with subtle backdrop blur
- Smooth number transitions (animated counters for lap times, gaps)
- Tire compound badges: Soft (red), Medium (yellow), Hard (white), Inter (green), Wet (blue)
- Flag indicators: Green glow, Yellow pulse, Red flash, SC amber strobe
- Speed traces: smooth line charts with gradient fills under the line

### Fonts
- **Display:** `F1 Bold` or fallback to `Inter` weight 800
- **Body:** `Inter` or `Geist Sans`
- **Mono (timing):** `JetBrains Mono` or `Geist Mono`

## Testing Strategy

### Unit Tests (Vitest)
- All utility functions, data transformers, time formatters
- React components with React Testing Library
- Backend route handlers
- Python data models and parsers
- **Target: 80%+ coverage on business logic**

### Integration Tests
- WebSocket connection/reconnection
- Database recording and retrieval
- API endpoint responses
- Playback engine timing accuracy

### E2E Tests (Playwright)
- Full session view loads with mock data
- DVR playback controls work
- Driver selection and head-to-head comparison
- Responsive layout breakpoints

### Mock Data
Create realistic mock datasets for development/testing:
- `server/__tests__/fixtures/mock-session.json` — full session recording
- Use OpenF1 API to capture one real session and save as test fixture

## API Contracts

### REST Endpoints (Fastify)

```
GET  /api/health
GET  /api/sessions                    — list all recorded sessions
GET  /api/sessions/:key               — session metadata
GET  /api/sessions/:key/laps          — all laps for session
GET  /api/sessions/:key/stints        — tire stint data
GET  /api/sessions/:key/race-control  — race control messages
GET  /api/sessions/:key/weather       — weather data points
GET  /api/drivers                     — current driver list
GET  /api/replay/:key/data            — paginated recorded data for playback
```

### WebSocket Events

```
Client → Server:
  subscribe    { session: string, channels: string[] }
  unsubscribe  { session: string }
  playback     { action: 'play'|'pause'|'seek'|'speed', value?: number }

Server → Client:
  car_data     { driver: number, speed: number, rpm: number, gear: number, throttle: number, brake: number, drs: number }
  location     { driver: number, x: number, y: number, z: number }
  position     { driver: number, position: number }
  interval     { driver: number, gap_to_leader: number, interval: number }
  lap          { driver: number, lap_number: number, lap_time: number, sector_1: number, sector_2: number, sector_3: number, is_pit_out: boolean }
  pit          { driver: number, lap: number, duration: number, tire_in: string, tire_out: string }
  stint        { driver: number, compound: string, tire_age: number, stint_number: number }
  weather      { air_temp: number, track_temp: number, humidity: number, wind_speed: number, wind_direction: number, rainfall: boolean }
  race_control { category: string, message: string, flag: string, driver?: number }
  team_radio   { driver: number, url: string }
  session      { status: string, type: string, name: string }
  playback_state { playing: boolean, speed: number, current_ts: number, total_ts: number }
```

## Implementation Priority

Build in this exact order. Each phase must have tests passing before moving on.

1. **Shared types + constants** → ensures type safety across all layers
2. **Database schema + migrations** → foundation for recording
3. **Python OpenF1 client + recorder** → start capturing data immediately
4. **Fastify server + REST API** → serve recorded data
5. **WebSocket hub** → real-time data push
6. **Next.js shell + layout** → app skeleton with routing
7. **Timing board** → most essential F1 view
8. **Track map** → signature visual feature
9. **Telemetry panels** → speed, throttle, brake, gear, DRS
10. **DVR playback controls** → timeline, speed control, seek
11. **Tire strategy views** → compounds, deg curves, pit predictor
12. **Race control + team radio** → messages, flags, audio
13. **Weather panel** → conditions overlay
14. **Head-to-head comparison** → driver picker, sector overlay
15. **Session history browser** → past sessions list, click to replay
16. **Polish** — animations, transitions, responsive, performance

## Performance Targets

- **First paint:** < 1.5s
- **WebSocket latency:** < 100ms from pipeline to browser
- **Track map:** 60fps animations (requestAnimationFrame, not React re-renders)
- **Bundle size:** < 300KB initial JS
- **Recording overhead:** < 50MB per full race session in SQLite
