-- F1 Timing Application Database Schema

-- Sessions table to track recorded sessions
CREATE TABLE IF NOT EXISTS sessions (
  session_key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  circuit TEXT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  status TEXT DEFAULT 'recording' CHECK (status IN ('recording', 'completed', 'archived')),
  total_data_points INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Main recorded data table - stores all telemetry data with timestamps
CREATE TABLE IF NOT EXISTS recorded_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_key TEXT NOT NULL,
  timestamp_ms INTEGER NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN (
    'car_data', 'location', 'position', 'interval', 'lap', 'pit', 
    'stint', 'weather', 'race_control', 'team_radio', 'session', 'drivers'
  )),
  data JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (session_key) REFERENCES sessions(session_key) ON DELETE CASCADE
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_recorded_data_session_ts 
  ON recorded_data(session_key, timestamp_ms);

CREATE INDEX IF NOT EXISTS idx_recorded_data_session_channel 
  ON recorded_data(session_key, channel);

CREATE INDEX IF NOT EXISTS idx_recorded_data_timestamp 
  ON recorded_data(timestamp_ms);

CREATE INDEX IF NOT EXISTS idx_sessions_status 
  ON sessions(status);

CREATE INDEX IF NOT EXISTS idx_sessions_start_time 
  ON sessions(start_time);

-- Latest data cache table for real-time lookups
CREATE TABLE IF NOT EXISTS latest_data (
  session_key TEXT NOT NULL,
  channel TEXT NOT NULL,
  driver_number INTEGER,
  timestamp_ms INTEGER NOT NULL,
  data JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (session_key, channel, COALESCE(driver_number, -1)),
  FOREIGN KEY (session_key) REFERENCES sessions(session_key) ON DELETE CASCADE
);

-- Trigger to update sessions.updated_at on recorded_data insert
CREATE TRIGGER IF NOT EXISTS update_session_timestamp
AFTER INSERT ON recorded_data
BEGIN
  UPDATE sessions 
  SET updated_at = CURRENT_TIMESTAMP,
      total_data_points = total_data_points + 1
  WHERE session_key = NEW.session_key;
END;

-- Trigger to update latest_data cache
CREATE TRIGGER IF NOT EXISTS update_latest_data_cache
AFTER INSERT ON recorded_data
BEGIN
  INSERT OR REPLACE INTO latest_data (
    session_key, channel, driver_number, timestamp_ms, data
  )
  SELECT 
    NEW.session_key,
    NEW.channel,
    CASE 
      WHEN json_extract(NEW.data, '$.driver_number') IS NOT NULL 
      THEN json_extract(NEW.data, '$.driver_number')
      ELSE NULL
    END,
    NEW.timestamp_ms,
    NEW.data;
END;

-- View for session summaries
CREATE VIEW IF NOT EXISTS session_summary AS
SELECT 
  s.session_key,
  s.name,
  s.circuit,
  s.start_time,
  s.end_time,
  s.status,
  s.total_data_points,
  COUNT(DISTINCT rd.channel) as channel_count,
  MIN(rd.timestamp_ms) as first_data_timestamp,
  MAX(rd.timestamp_ms) as last_data_timestamp,
  (MAX(rd.timestamp_ms) - MIN(rd.timestamp_ms)) as duration_ms
FROM sessions s
LEFT JOIN recorded_data rd ON s.session_key = rd.session_key
GROUP BY s.session_key, s.name, s.circuit, s.start_time, s.end_time, s.status, s.total_data_points;

-- View for driver data aggregation
CREATE VIEW IF NOT EXISTS driver_session_data AS
SELECT 
  rd.session_key,
  json_extract(rd.data, '$.driver_number') as driver_number,
  rd.channel,
  COUNT(*) as data_points,
  MIN(rd.timestamp_ms) as first_timestamp,
  MAX(rd.timestamp_ms) as last_timestamp
FROM recorded_data rd
WHERE json_extract(rd.data, '$.driver_number') IS NOT NULL
GROUP BY rd.session_key, json_extract(rd.data, '$.driver_number'), rd.channel;