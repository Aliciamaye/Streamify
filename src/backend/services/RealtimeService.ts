/**
 * RealtimeService
 * Lightweight Server-Sent Events (SSE) broadcaster for realtime updates without extra deps.
 */

import { Response } from 'express';
import { EventEmitter } from 'events';
import { Logger } from '../utils/logger';

export type RealtimeEvent =
  | 'social:follow'
  | 'social:unfollow'
  | 'playlist:import'
  | 'lyrics:update'
  | 'system:heartbeat';

class RealtimeService {
  private emitter = new EventEmitter();
  private clients: Set<Response> = new Set();
  private logger = new Logger('RealtimeService');
  private heartbeat: NodeJS.Timer | null = null;

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  register(res: Response): void {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    const listener = (payload: { event: RealtimeEvent; data: any }) => {
      res.write(`event: ${payload.event}\n`);
      res.write(`data: ${JSON.stringify(payload.data || {})}\n\n`);
    };

    this.emitter.on('broadcast', listener as any);
    this.clients.add(res);
    this.logger.info(`Client connected. Active SSE clients: ${this.clients.size}`);

    res.on('close', () => {
      this.emitter.off('broadcast', listener as any);
      this.clients.delete(res);
      this.logger.info(`Client disconnected. Active SSE clients: ${this.clients.size}`);
    });

    this.ensureHeartbeat();
  }

  broadcast(event: RealtimeEvent, data: any = {}): void {
    this.emitter.emit('broadcast', { event, data });
  }

  private ensureHeartbeat(): void {
    if (this.heartbeat) return;
    this.heartbeat = setInterval(() => {
      this.broadcast('system:heartbeat', { ts: Date.now() });
    }, 30_000);
  }
}

export default new RealtimeService();
