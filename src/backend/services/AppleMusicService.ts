/**
 * AppleMusicService
 * Handles Apple Music OAuth, playlist import, and library sync
 */

import axios from 'axios';
import { Logger } from '../utils/logger';
import { RedisCache } from './RedisCache';
import YouTubeMusicEngine from './YouTubeMusicEngine';

interface AppleMusicTokens {
  musicUserToken: string;
  expiresAt: number;
}

interface AppleMusicUser {
  id: string;
}

class AppleMusicService {
  private logger = new Logger('AppleMusicService');
  private cache = new RedisCache();
  private readonly teamId = process.env.APPLE_MUSIC_TEAM_ID || '';
  private readonly keyId = process.env.APPLE_MUSIC_KEY_ID || '';
  private readonly privateKey = process.env.APPLE_MUSIC_PRIVATE_KEY || '';

  /**
   * Generate Apple Music developer token (JWT)
   * Valid for 6 months, should be cached
   */
  async getDeveloperToken(): Promise<string> {
    const cacheKey = 'applemusic:devtoken';
    const cached = await this.cache.get<string>(cacheKey);
    if (cached) return cached;

    try {
      // JWT generation requires crypto
      const jwt = require('jsonwebtoken');
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iss: this.teamId,
        iat: now,
        exp: now + 15552000, // 6 months
      };

      const token = jwt.sign(payload, this.privateKey, {
        algorithm: 'ES256',
        header: {
          alg: 'ES256',
          kid: this.keyId,
        },
      });

      await this.cache.set(cacheKey, token, 15552000); // Cache for 6 months
      return token;
    } catch (error: any) {
      this.logger.error('Failed to generate Apple Music developer token:', error.message);
      throw new Error('Apple Music authentication failed');
    }
  }

  /**
   * Store user token (Music User Token from client)
   */
  async storeUserToken(userId: string, musicUserToken: string, expiresInSeconds: number = 86400): Promise<void> {
    const tokens: AppleMusicTokens = {
      musicUserToken,
      expiresAt: Date.now() + expiresInSeconds * 1000,
    };
    await this.cache.set(`applemusic:tokens:${userId}`, tokens, expiresInSeconds);
  }

  async getUserToken(userId: string): Promise<AppleMusicTokens | null> {
    const tokens = await this.cache.get<AppleMusicTokens>(`applemusic:tokens:${userId}`);
    if (!tokens || tokens.expiresAt < Date.now()) {
      return null;
    }
    return tokens;
  }

  async ensureTokens(userId: string): Promise<{ devToken: string; userToken: string }> {
    const devToken = await this.getDeveloperToken();
    const userTokens = await this.getUserToken(userId);
    if (!userTokens) {
      throw new Error('Not connected to Apple Music');
    }
    return { devToken, userToken: userTokens.musicUserToken };
  }

  async listPlaylists(userId: string): Promise<any[]> {
    const { devToken, userToken } = await this.ensureTokens(userId);
    const resp = await axios.get('https://api.music.apple.com/v1/me/library/playlists', {
      headers: {
        Authorization: `Bearer ${devToken}`,
        'Music-User-Token': userToken,
      },
      timeout: 8000,
    });
    return resp.data.data || [];
  }

  async getPlaylistTracks(userId: string, playlistId: string): Promise<any[]> {
    const { devToken, userToken } = await this.ensureTokens(userId);
    const items: any[] = [];
    let url: string | null = `https://api.music.apple.com/v1/me/library/playlists/${playlistId}/tracks`;

    while (url) {
      const resp = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${devToken}`,
          'Music-User-Token': userToken,
        },
        timeout: 10000,
      });
      items.push(...(resp.data.data || []));
      url = resp.data.next || null;
    }
    return items;
  }

  async importPlaylist(userId: string, playlistId: string): Promise<{ imported: number; total: number; failures: number; items: any[] }> {
    const tracks = await this.getPlaylistTracks(userId, playlistId);
    const mapped: any[] = [];

    for (const item of tracks) {
      const track = item.attributes;
      if (!track) continue;

      const title = track.name || 'Unknown';
      const artist = track.artistName || 'Unknown';
      const album = track.albumName || '';
      const searchQuery = `${artist} ${title}`;
      const match = await this.findBestStreamifyMatch(searchQuery, track.durationInMillis);

      mapped.push({
        title,
        artist,
        album,
        appleMusicId: item.id,
        streamifyVideoId: match?.videoId || null,
        confidence: match?.score || 0,
      });
    }

    const imported = mapped.filter(m => m.streamifyVideoId).length;
    const total = mapped.length;

    return {
      imported,
      total,
      failures: total - imported,
      items: mapped,
    };
  }

  async syncPlaylist(userId: string, playlistId: string): Promise<{ imported: number; total: number; failures: number; items: any[] }> {
    return this.importPlaylist(userId, playlistId);
  }

  async disconnect(userId: string): Promise<void> {
    await this.cache.delete(`applemusic:tokens:${userId}`);
  }

  async getConnectionStatus(userId: string): Promise<{ connected: boolean; expiresAt?: number }> {
    const tokens = await this.getUserToken(userId);
    return {
      connected: !!tokens,
      expiresAt: tokens?.expiresAt,
    };
  }

  private async findBestStreamifyMatch(query: string, durationMs?: number): Promise<{ videoId: string; score: number } | null> {
    const results = await YouTubeMusicEngine.search(query, 5);
    if (!results || results.length === 0) return null;

    let best = results[0];
    let bestScore = this.scoreMatch(query, best.title, best.artist, durationMs, best.duration);

    for (const candidate of results.slice(1)) {
      const score = this.scoreMatch(query, candidate.title, candidate.artist, durationMs, candidate.duration);
      if (score > bestScore) {
        best = candidate;
        bestScore = score;
      }
    }

    return { videoId: best.videoId, score: bestScore };
  }

  private scoreMatch(query: string, title: string, artist: string, targetDuration?: number, candidateDuration?: number): number {
    let score = 0;
    const q = query.toLowerCase();
    if (title && q.includes(title.toLowerCase())) score += 30;
    if (artist && q.includes(artist.toLowerCase())) score += 20;

    if (targetDuration && candidateDuration) {
      const delta = Math.abs(targetDuration - candidateDuration * 1000);
      const pct = Math.max(0, 1 - delta / (targetDuration + 1));
      score += pct * 30;
    }

    score += this.simpleSimilarity(`${artist} ${title}`.toLowerCase(), q) * 20;
    return score;
  }

  private simpleSimilarity(a: string, b: string): number {
    const setA = new Set(a.split(/\s+/));
    const setB = new Set(b.split(/\s+/));
    const intersection = [...setA].filter(x => setB.has(x)).length;
    const union = new Set([...setA, ...setB]).size || 1;
    return intersection / union;
  }
}

export default new AppleMusicService();
