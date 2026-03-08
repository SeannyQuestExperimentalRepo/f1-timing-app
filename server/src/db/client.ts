import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { RecordedData, SessionRecord, DataChannel } from '@f1-timing/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class DatabaseClient {
  private db: Database.Database;
  
  // Prepared statements for performance
  private insertRecordedDataStmt: Database.Statement;
  private insertSessionStmt: Database.Statement;
  private updateSessionStmt: Database.Statement;
  private getSessionStmt: Database.Statement;
  private getSessionsStmt: Database.Statement;
  private getRecordedDataStmt: Database.Statement;
  private getLatestDataStmt: Database.Statement;
  private getSessionSummaryStmt: Database.Statement;

  constructor(dbPath: string = './f1-timing.db') {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('cache_size = 1000');
    this.db.pragma('temp_store = memory');
    
    this.initializeSchema();
    this.prepareSatements();
  }

  private initializeSchema(): void {
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Execute schema (split by semicolons and filter empty statements)
    const statements = schema.split(';').filter(stmt => stmt.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        this.db.exec(statement);
      }
    }
  }

  private prepareSatements(): void {
    this.insertRecordedDataStmt = this.db.prepare(`
      INSERT INTO recorded_data (session_key, timestamp_ms, channel, data)
      VALUES (?, ?, ?, ?)
    `);

    this.insertSessionStmt = this.db.prepare(`
      INSERT OR REPLACE INTO sessions (session_key, name, circuit, start_time, status)
      VALUES (?, ?, ?, ?, ?)
    `);

    this.updateSessionStmt = this.db.prepare(`
      UPDATE sessions 
      SET name = ?, circuit = ?, end_time = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE session_key = ?
    `);

    this.getSessionStmt = this.db.prepare(`
      SELECT * FROM sessions WHERE session_key = ?
    `);

    this.getSessionsStmt = this.db.prepare(`
      SELECT * FROM session_summary 
      ORDER BY start_time DESC 
      LIMIT ? OFFSET ?
    `);

    this.getRecordedDataStmt = this.db.prepare(`
      SELECT id, session_key, timestamp_ms, channel, data, created_at
      FROM recorded_data 
      WHERE session_key = ? 
        AND timestamp_ms >= ? 
        AND timestamp_ms <= ?
        AND (? IS NULL OR channel = ?)
      ORDER BY timestamp_ms ASC 
      LIMIT ? OFFSET ?
    `);

    this.getLatestDataStmt = this.db.prepare(`
      SELECT channel, driver_number, timestamp_ms, data
      FROM latest_data
      WHERE session_key = ?
        AND (? IS NULL OR channel = ?)
      ORDER BY timestamp_ms DESC
    `);

    this.getSessionSummaryStmt = this.db.prepare(`
      SELECT * FROM session_summary WHERE session_key = ?
    `);
  }

  // Session management
  async createSession(session: Omit<SessionRecord, 'total_data_points'>): Promise<void> {
    this.insertSessionStmt.run(
      session.session_key,
      session.name,
      session.circuit,
      session.start_time,
      session.status
    );
  }

  async updateSession(sessionKey: string, updates: Partial<SessionRecord>): Promise<void> {
    this.updateSessionStmt.run(
      updates.name || '',
      updates.circuit || '',
      updates.end_time || null,
      updates.status || 'recording',
      sessionKey
    );
  }

  async getSession(sessionKey: string): Promise<SessionRecord | null> {
    const result = this.getSessionStmt.get(sessionKey) as SessionRecord | undefined;
    return result || null;
  }

  async getSessions(limit = 50, offset = 0): Promise<any[]> {
    return this.getSessionsStmt.all(limit, offset) as any[];
  }

  async getSessionSummary(sessionKey: string): Promise<any | null> {
    const result = this.getSessionSummaryStmt.get(sessionKey) as any | undefined;
    return result || null;
  }

  // Data recording
  async recordData(data: Omit<RecordedData, 'id' | 'created_at'>): Promise<number> {
    const result = this.insertRecordedDataStmt.run(
      data.session_key,
      data.timestamp_ms,
      data.channel,
      JSON.stringify(data.data)
    );
    return result.lastInsertRowid as number;
  }

  async recordDataBatch(dataPoints: Array<Omit<RecordedData, 'id' | 'created_at'>>): Promise<void> {
    const transaction = this.db.transaction((points: Array<Omit<RecordedData, 'id' | 'created_at'>>) => {
      for (const point of points) {
        this.insertRecordedDataStmt.run(
          point.session_key,
          point.timestamp_ms,
          point.channel,
          JSON.stringify(point.data)
        );
      }
    });

    transaction(dataPoints);
  }

  // Data retrieval for playback
  async getRecordedData(
    sessionKey: string,
    fromTimestamp = 0,
    toTimestamp = Date.now(),
    channel: DataChannel | null = null,
    limit = 1000,
    offset = 0
  ): Promise<RecordedData[]> {
    const results = this.getRecordedDataStmt.all(
      sessionKey,
      fromTimestamp,
      toTimestamp, 
      channel,
      channel,
      limit,
      offset
    ) as any[];

    return results.map(row => ({
      ...row,
      data: JSON.parse(row.data)
    }));
  }

  async getLatestData(sessionKey: string, channel: DataChannel | null = null): Promise<any[]> {
    const results = this.getLatestDataStmt.all(sessionKey, channel, channel) as any[];
    return results.map(row => ({
      ...row,
      data: JSON.parse(row.data)
    }));
  }

  // Utility methods
  async getDataCount(sessionKey: string, channel?: DataChannel): Promise<number> {
    const query = channel
      ? this.db.prepare('SELECT COUNT(*) as count FROM recorded_data WHERE session_key = ? AND channel = ?')
      : this.db.prepare('SELECT COUNT(*) as count FROM recorded_data WHERE session_key = ?');
    
    const params = channel ? [sessionKey, channel] : [sessionKey];
    const result = query.get(...params) as { count: number };
    return result.count;
  }

  async getTimeRange(sessionKey: string): Promise<{ start: number; end: number } | null> {
    const query = this.db.prepare(`
      SELECT MIN(timestamp_ms) as start, MAX(timestamp_ms) as end
      FROM recorded_data 
      WHERE session_key = ?
    `);
    
    const result = query.get(sessionKey) as { start: number; end: number } | undefined;
    return result && result.start && result.end ? result : null;
  }

  // Cleanup methods
  async deleteOldSessions(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const deleteStmt = this.db.prepare(`
      DELETE FROM sessions 
      WHERE created_at < ? AND status = 'archived'
    `);
    
    const result = deleteStmt.run(cutoffDate.toISOString());
    return result.changes;
  }

  async vacuum(): Promise<void> {
    this.db.exec('VACUUM');
  }

  close(): void {
    this.db.close();
  }
}