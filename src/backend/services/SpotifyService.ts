/**
 * SpotifyService
 * Handles OAuth, playlist import, and history sync
 */

import axios from 'axios';
import { Logger } from '../utils/logger';
import { RedisCache } from './RedisCache';
import YouTubeMusicEngine from './YouTubeMusicEngine';

interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface SpotifyUser {
  id: string;
  displayName: string;
}

class SpotifyService {
  private logger = new Logger('SpotifyService');
  private cache = new RedisCache();
  private readonly clientId = process.env.SPOTIFY_CLIENT_ID || '';
  private readonly clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
  private readonly redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:5000/api/spotify/callback';

  getAuthUrl(state: string): string {
    const scopes = [
      'user-read-email',
      'user-read-private',
      'playlist-read-private',
      'playlist-read-collaborative',
      'user-read-recently-played',
      'user-top-read',
      'user-library-read',
    ];

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      scope: scopes.join(' '),
      redirect_uri: this.redirectUri,
      state,
      show_dialog: 'false',
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<SpotifyTokens> {
    const tokens = await this.tokenRequest({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
    });
    return tokens;
  }

  async refresh(refreshToken: string): Promise<SpotifyTokens> {
    return this.tokenRequest({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
  }

  private async tokenRequest(body: Record<string, string>): Promise<SpotifyTokens> {
    const resp = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams(body), {
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 8000,
    });

    const data = resp.data;
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || body.refresh_token || '',
      expiresAt: Date.now() + data.expires_in * 1000,
    };
  }

  async storeTokens(userId: string, tokens: SpotifyTokens): Promise<void> {
    // Persist for 30 days; refresh flow will keep it alive.
    await this.cache.set(`spotify:tokens:${userId}`, tokens, 3600 * 24 * 30);
  }

  async getTokens(userId: string): Promise<SpotifyTokens | null> {
    const tokens = await this.cache.get<SpotifyTokens>(`spotify:tokens:${userId}`);
    if (!tokens) return null;
    if (tokens.expiresAt < Date.now() + 60_000 && tokens.refreshToken) {
      const refreshed = await this.refresh(tokens.refreshToken);
      const merged: SpotifyTokens = {
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken || tokens.refreshToken,
        expiresAt: refreshed.expiresAt,
      };
      await this.storeTokens(userId, merged);
      return merged;
    }
    return tokens;
  }

  async ensureTokens(userId: string): Promise<SpotifyTokens> {
    const tokens = await this.getTokens(userId);
    if (!tokens) {
      throw new Error('Not connected to Spotify');
    }
    return tokens;
  }

  async getCurrentUser(accessToken: string): Promise<SpotifyUser> {
    const resp = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 8000,
    });
    return { id: resp.data.id, displayName: resp.data.display_name };
  }

  async listPlaylists(accessToken: string): Promise<any[]> {
    const resp = await axios.get('https://api.spotify.com/v1/me/playlists?limit=50', {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 8000,
    });
    return resp.data.items || [];
  }

  async getPlaylistTracks(accessToken: string, playlistId: string): Promise<any[]> {
    const items: any[] = [];
    let url: string | null = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;
    while (url) {
      const resp: any = await axios.get(url, { headers: { Authorization: `Bearer ${accessToken}` }, timeout: 10000 });
      items.push(...(resp.data.items || []));
      url = resp.data.next;
    }
    return items;
  }

  async importPlaylist(userId: string, playlistId: string): Promise<{ imported: number; total: number; failures: number; items: any[] }> {
    const tokens = await this.ensureTokens(userId);

    const tracks = await this.getPlaylistTracks(tokens.accessToken, playlistId);
    const mapped: any[] = [];

    for (const item of tracks) {
      const track = item.track;
      if (!track) continue;
      const title = track.name;
      const artist = track.artists?.map((a: any) => a.name).join(', ') || 'Unknown';
      const searchQuery = `${artist} ${title}`;
      const match = await this.findBestYouTubeMatch(searchQuery, track.duration_ms);
      mapped.push({
        title,
        artist,
        spotifyId: track.id,
        youtubeVideoId: match?.videoId || null,
        confidence: match?.score || 0,
      });
    }

    const imported = mapped.filter(m => m.youtubeVideoId).length;
    const total = mapped.length;

    return {
      imported,
      total,
      failures: total - imported,
      items: mapped,
    };
  }

  async getRecentlyPlayed(accessToken: string): Promise<any[]> {
    const resp = await axios.get('https://api.spotify.com/v1/me/player/recently-played?limit=50', {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 8000,
    });
    return resp.data.items || [];
  }

  async getTop(accessToken: string, type: 'tracks' | 'artists' = 'tracks'): Promise<any[]> {
    const resp = await axios.get(`https://api.spotify.com/v1/me/top/${type}?limit=20`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 8000,
    });
    return resp.data.items || [];
  }

  async syncPlaylist(userId: string, playlistId: string): Promise<{ imported: number; total: number; failures: number; items: any[] }> {
    // For now, sync is equivalent to re-import; queueing/persistence can layer on top later.
    return this.importPlaylist(userId, playlistId);
  }

  async disconnect(userId: string): Promise<void> {
    await this.cache.delete(`spotify:tokens:${userId}`);
  }

  async getConnectionStatus(userId: string): Promise<{ connected: boolean; expiresAt?: number }> {
    const tokens = await this.getTokens(userId);
    return {
      connected: !!tokens,
      expiresAt: tokens?.expiresAt,
    };
  }

  private async findBestYouTubeMatch(query: string, durationMs?: number): Promise<{ videoId: string; score: number } | null> {
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

    // Duration proximity
    if (targetDuration && candidateDuration) {
      const delta = Math.abs(targetDuration - candidateDuration * 1000);
      const pct = Math.max(0, 1 - delta / (targetDuration + 1));
      score += pct * 30;
    }

    // String similarity (simple)
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

export default new SpotifyService();
