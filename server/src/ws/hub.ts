import { FastifyRequest } from 'fastify';
import { WebSocket } from 'ws';
import type { 
  WebSocketMessage, 
  ClientMessage, 
  DataChannel, 
  SubscribeMessage, 
  UnsubscribeMessage, 
  PlaybackMessage 
} from '@f1-timing/shared';

interface ClientConnection {
  id: string;
  socket: WebSocket;
  request: FastifyRequest;
  subscriptions: Set<string>; // Set of "sessionKey:channel" or "sessionKey:*"
  lastPing: number;
  isAlive: boolean;
}

export class WebSocketHub {
  private connections = new Map<string, ClientConnection>();
  private sessionSubscriptions = new Map<string, Set<string>>(); // sessionKey -> Set of connectionIds
  private pingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startPingInterval();
  }

  addConnection(socket: WebSocket, request: FastifyRequest): string {
    const connectionId = this.generateConnectionId();
    
    const connection: ClientConnection = {
      id: connectionId,
      socket,
      request,
      subscriptions: new Set(),
      lastPing: Date.now(),
      isAlive: true
    };

    this.connections.set(connectionId, connection);

    // Set up event handlers
    socket.on('message', (data) => {
      this.handleMessage(connectionId, data);
    });

    socket.on('pong', () => {
      const conn = this.connections.get(connectionId);
      if (conn) {
        conn.isAlive = true;
        conn.lastPing = Date.now();
      }
    });

    socket.on('close', () => {
      this.removeConnection(socket);
    });

    socket.on('error', (error) => {
      console.error(`WebSocket error for connection ${connectionId}:`, error);
      this.removeConnection(socket);
    });

    // Send welcome message
    this.sendToConnection(connectionId, {
      type: 'connection',
      data: {
        connection_id: connectionId,
        status: 'connected',
        timestamp: Date.now()
      }
    });

    console.log(`🔌 New WebSocket connection: ${connectionId} (total: ${this.connections.size})`);
    return connectionId;
  }

  removeConnection(socket: WebSocket): void {
    let connectionId: string | null = null;
    
    // Find connection by socket
    for (const [id, conn] of this.connections.entries()) {
      if (conn.socket === socket) {
        connectionId = id;
        break;
      }
    }

    if (!connectionId) return;

    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Remove from session subscriptions
    for (const subscription of connection.subscriptions) {
      const [sessionKey] = subscription.split(':');
      const sessionSubs = this.sessionSubscriptions.get(sessionKey);
      if (sessionSubs) {
        sessionSubs.delete(connectionId);
        if (sessionSubs.size === 0) {
          this.sessionSubscriptions.delete(sessionKey);
        }
      }
    }

    // Remove connection
    this.connections.delete(connectionId);
    
    console.log(`❌ WebSocket connection closed: ${connectionId} (remaining: ${this.connections.size})`);
  }

  private handleMessage(connectionId: string, data: Buffer | string): void {
    try {
      const message = JSON.parse(data.toString()) as ClientMessage;
      
      switch (message.action) {
        case 'subscribe':
          this.handleSubscribe(connectionId, message);
          break;
        case 'unsubscribe':
          this.handleUnsubscribe(connectionId, message);
          break;
        case 'playback':
          this.handlePlayback(connectionId, message);
          break;
        default:
          this.sendError(connectionId, 'Invalid message action');
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
      this.sendError(connectionId, 'Invalid JSON message');
    }
  }

  private handleSubscribe(connectionId: string, message: SubscribeMessage): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const { session_key, channels } = message;

    // Add session subscription
    if (!this.sessionSubscriptions.has(session_key)) {
      this.sessionSubscriptions.set(session_key, new Set());
    }
    this.sessionSubscriptions.get(session_key)!.add(connectionId);

    // Add channel subscriptions
    for (const channel of channels) {
      const subscriptionKey = `${session_key}:${channel}`;
      connection.subscriptions.add(subscriptionKey);
    }

    this.sendToConnection(connectionId, {
      type: 'connection',
      data: {
        action: 'subscribed',
        session_key,
        channels,
        timestamp: Date.now()
      }
    });

    console.log(`📡 Connection ${connectionId} subscribed to ${session_key} channels: ${channels.join(', ')}`);
  }

  private handleUnsubscribe(connectionId: string, message: UnsubscribeMessage): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const { session_key } = message;

    if (session_key) {
      // Remove specific session subscriptions
      const toRemove = Array.from(connection.subscriptions).filter(sub => 
        sub.startsWith(`${session_key}:`)
      );
      
      for (const subscription of toRemove) {
        connection.subscriptions.delete(subscription);
      }

      // Remove from session subscriptions
      const sessionSubs = this.sessionSubscriptions.get(session_key);
      if (sessionSubs) {
        sessionSubs.delete(connectionId);
        if (sessionSubs.size === 0) {
          this.sessionSubscriptions.delete(session_key);
        }
      }

      this.sendToConnection(connectionId, {
        type: 'connection',
        data: {
          action: 'unsubscribed',
          session_key,
          timestamp: Date.now()
        }
      });
    } else {
      // Unsubscribe from all
      connection.subscriptions.clear();
      
      for (const [sessionKey, sessionSubs] of this.sessionSubscriptions.entries()) {
        sessionSubs.delete(connectionId);
        if (sessionSubs.size === 0) {
          this.sessionSubscriptions.delete(sessionKey);
        }
      }

      this.sendToConnection(connectionId, {
        type: 'connection',
        data: {
          action: 'unsubscribed_all',
          timestamp: Date.now()
        }
      });
    }
  }

  private handlePlayback(connectionId: string, message: PlaybackMessage): void {
    // Forward playback commands to the appropriate service
    // This would be handled by the playback service
    this.sendToConnection(connectionId, {
      type: 'connection',
      data: {
        action: 'playback_command_received',
        command: message.command,
        session_key: message.session_key,
        timestamp: Date.now()
      }
    });
  }

  // Broadcast data to subscribers
  broadcastToSession(sessionKey: string, channel: DataChannel, data: any): void {
    const sessionSubs = this.sessionSubscriptions.get(sessionKey);
    if (!sessionSubs || sessionSubs.size === 0) return;

    const message: WebSocketMessage = {
      type: 'data',
      channel,
      data,
      timestamp: Date.now(),
      session_key: sessionKey
    };

    for (const connectionId of sessionSubs) {
      const connection = this.connections.get(connectionId);
      if (!connection) continue;

      // Check if connection is subscribed to this channel or all channels
      const hasChannelSubscription = connection.subscriptions.has(`${sessionKey}:${channel}`) ||
                                   connection.subscriptions.has(`${sessionKey}:*`);

      if (hasChannelSubscription) {
        this.sendToConnection(connectionId, message);
      }
    }
  }

  // Send playback state updates
  broadcastPlaybackState(sessionKey: string, state: any): void {
    const sessionSubs = this.sessionSubscriptions.get(sessionKey);
    if (!sessionSubs || sessionSubs.size === 0) return;

    const message: WebSocketMessage = {
      type: 'playback_state',
      data: state,
      timestamp: Date.now(),
      session_key: sessionKey
    };

    for (const connectionId of sessionSubs) {
      this.sendToConnection(connectionId, message);
    }
  }

  private sendToConnection(connectionId: string, message: WebSocketMessage): void {
    const connection = this.connections.get(connectionId);
    if (!connection || connection.socket.readyState !== WebSocket.OPEN) return;

    try {
      connection.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Failed to send message to connection ${connectionId}:`, error);
      this.removeConnection(connection.socket);
    }
  }

  private sendError(connectionId: string, error: string): void {
    this.sendToConnection(connectionId, {
      type: 'error',
      data: { error, timestamp: Date.now() }
    });
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      for (const [connectionId, connection] of this.connections.entries()) {
        if (!connection.isAlive) {
          console.log(`🗑️ Removing dead connection: ${connectionId}`);
          this.removeConnection(connection.socket);
          continue;
        }

        if (connection.socket.readyState === WebSocket.OPEN) {
          connection.isAlive = false;
          connection.socket.ping();
        }
      }
    }, 30000); // Ping every 30 seconds
  }

  // Utility methods
  getConnectionCount(): number {
    return this.connections.size;
  }

  getActiveSubscriptions(): Record<string, number> {
    const subscriptions: Record<string, number> = {};
    
    for (const [sessionKey, subscribers] of this.sessionSubscriptions.entries()) {
      subscriptions[sessionKey] = subscribers.size;
    }
    
    return subscriptions;
  }

  closeAll(): void {
    console.log(`🔌 Closing ${this.connections.size} WebSocket connections...`);
    
    for (const [connectionId, connection] of this.connections.entries()) {
      try {
        connection.socket.close();
      } catch (error) {
        console.error(`Error closing connection ${connectionId}:`, error);
      }
    }

    this.connections.clear();
    this.sessionSubscriptions.clear();

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}