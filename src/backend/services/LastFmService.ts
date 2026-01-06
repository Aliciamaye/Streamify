/**
 * LastFmService
 * Handles Last.fm scrobbling, authentication, and listening stats
 */

import axios from 'axios';
import crypto from 'crypto';
import { Logger } from '../utils/logger';
import { RedisCache } from './RedisCache';

interface LastFmTokens {
  sessionKey: string;
  username: string;
}

class LastFmService {
  private logger = new Logger('LastFmService');
  private cache = new RedisCache();
  private readonly apiKey = process.env.LASTFM_API_KEY || '';
  private readonly apiSecret = process.env.LASTFM_API_SECRET || '';
  private readonly baseUrl = 'https://ws.audioscrobbler.com/2.0/';

  /**
   * Generate authentication URL for user to authorize
   */
  getAuthUrl(callbackUrl: string): string {
    return `http://www.last.fm/api/auth/?api_key=${this.apiKey}&cb=${encodeURIComponent(callbackUrl)}`;
  }

  /**
   * Exchange auth token for session key
   */
  async getSession(token: string): Promise<{ sessionKey: string; username: string }> {
    const params = {
      method: 'auth.getSession',
      api_key: this.apiKey,
      token,
    };

    const signature = this.generateSignature(params);
    const resp = await axios.get(this.baseUrl, {
      params: { ...params, api_sig: signature, format: 'json' },
      timeout: 8000,
    });

    if (resp.data.error) {
      throw new Error(resp.data.message || 'Last.fm authentication failed');
    }

    return {
      sessionKey: resp.data.session.key,
      username: resp.data.session.name,
    };
  }

  /**
   * Store session for user
   */
  async storeSession(userId: string, tokens: LastFmTokens): Promise<void> {
    await this.cache.set(`lastfm:session:${userId}`, tokens, 3600 * 24 * 365); // 1 year
  }

  async getSessionKey(userId: string): Promise<LastFmTokens | null> {
    return await this.cache.get<LastFmTokens>(`lastfm:session:${userId}`);
  }

  async ensureSession(userId: string): Promise<LastFmTokens> {
    const session = await this.getSessionKey(userId);
    if (!session) {
      throw new Error('Not connected to Last.fm');
    }
    return session;
  }

  /**
   * Scrobble a track (mark as played)
   */
  async scrobble(userId: string, track: { artist: string; title: string; album?: string; timestamp?: number; duration?: number }): Promise<void> {
    const session = await this.ensureSession(userId);

    const params: any = {
      method: 'track.scrobble',
      api_key: this.apiKey,
      sk: session.sessionKey,
      artist: track.artist,
      track: track.title,
      timestamp: track.timestamp || Math.floor(Date.now() / 1000),
    };

    if (track.album) params.album = track.album;
    if (track.duration) params.duration = Math.floor(track.duration);

    const signature = this.generateSignature(params);

    await axios.post(
      this.baseUrl,
      new URLSearchParams({ ...params, api_sig: signature, format: 'json' }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 8000,
      }
    );

    this.logger.info(`Scrobbled: ${track.artist} - ${track.title} for user ${session.username}`);
  }

  /**
   * Update "Now Playing" status
   */
  async updateNowPlaying(userId: string, track: { artist: string; title: string; album?: string; duration?: number }): Promise<void> {
    const session = await this.ensureSession(userId);

    const params: any = {
      method: 'track.updateNowPlaying',
      api_key: this.apiKey,
      sk: session.sessionKey,
      artist: track.artist,
      track: track.title,
    };

    if (track.album) params.album = track.album;
    if (track.duration) params.duration = Math.floor(track.duration);

    const signature = this.generateSignature(params);

    await axios.post(
      this.baseUrl,
      new URLSearchParams({ ...params, api_sig: signature, format: 'json' }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 8000,
      }
    );
  }

  /**
   * Get user's recent tracks
   */
  async getRecentTracks(userId: string, limit: number = 50): Promise<any[]> {
    const session = await this.ensureSession(userId);

    const resp = await axios.get(this.baseUrl, {
      params: {
        method: 'user.getRecentTracks',
        api_key: this.apiKey,
        user: session.username,
        limit,
        format: 'json',
      },
      timeout: 8000,
    });

    return resp.data?.recenttracks?.track || [];
  }

  /**
   * Get user's top tracks
   */
  async getTopTracks(userId: string, period: 'overall' | '7day' | '1month' | '3month' | '6month' | '12month' = 'overall', limit: number = 50): Promise<any[]> {
    const session = await this.ensureSession(userId);

    const resp = await axios.get(this.baseUrl, {
      params: {
        method: 'user.getTopTracks',
        api_key: this.apiKey,
        user: session.username,
        period,
        limit,
        format: 'json',
      },
      timeout: 8000,
    });

    return resp.data?.toptracks?.track || [];
  }

  /**
   * Get user's top artists
   */
  async getTopArtists(userId: string, period: 'overall' | '7day' | '1month' | '3month' | '6month' | '12month' = 'overall', limit: number = 50): Promise<any[]> {
    const session = await this.ensureSession(userId);

    const resp = await axios.get(this.baseUrl, {
      params: {
        method: 'user.getTopArtists',
        api_key: this.apiKey,
        user: session.username,
        period,
        limit,
        format: 'json',
      },
      timeout: 8000,
    });

    return resp.data?.topartists?.artist || [];
  }

  /**
   * Get similar tracks
   */
  async getSimilarTracks(artist: string, track: string, limit: number = 30): Promise<any[]> {
    const resp = await axios.get(this.baseUrl, {
      params: {
        method: 'track.getSimilar',
        api_key: this.apiKey,
        artist,
        track,
        limit,
        format: 'json',
      },
      timeout: 8000,
    });

    return resp.data?.similartracks?.track || [];
  }

  /**
   * Disconnect Last.fm
   */
  async disconnect(userId: string): Promise<void> {
    await this.cache.delete(`lastfm:session:${userId}`);
  }

  /**
   * Get connection status
   */
  async getConnectionStatus(userId: string): Promise<{ connected: boolean; username?: string }> {
    const session = await this.getSessionKey(userId);
    return {
      connected: !!session,
      username: session?.username,
    };
  }

  /**
   * Generate API signature for authenticated requests
   */
  private generateSignature(params: Record<string, any>): string {
    const sorted = Object.keys(params)
      .filter(k => k !== 'format' && k !== 'callback')
      .sort()
      .map(k => `${k}${params[k]}`)
      .join('');

    return crypto
      .createHash('md5')
      .update(sorted + this.apiSecret)
      .digest('hex');
  }
}

export default new LastFmService();
