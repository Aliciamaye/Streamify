/**
 * Lyrics Service - Fetch and sync lyrics for songs
 * Supports time-synced lyrics (LRC format) and static lyrics
 */

import axios from 'axios';
import { Logger } from '../utils/logger';
import { RedisCache } from './RedisCache';
import YouTubeMusicEngine from './YouTubeMusicEngine';

const logger = new Logger('LyricsService');
const LYRICS_TTL_SECONDS = 3600 * 24 * 7; // 1 week
const SEARCH_TTL_SECONDS = 3600 * 24; // 1 day
const lyricsCache = new RedisCache();

export interface LyricsLine {
  time: number; // in seconds
  text: string;
}

export interface LyricsData {
  videoId: string;
  title: string;
  artist: string;
  lyrics: string;
  syncedLyrics?: LyricsLine[];
  language?: string;
  source: string;
  isSynced: boolean;
}

class LyricsService {
  private readonly GENIUS_API_KEY = process.env.GENIUS_API_KEY || '';
  private readonly MUSIXMATCH_API_KEY = process.env.MUSIXMATCH_API_KEY || '';

  /**
   * Convenience wrapper using only videoId
   */
  async getLyricsByVideoId(videoId: string): Promise<LyricsData | null> {
    const cacheKey = `lyrics:${videoId}`;
    const cached = await lyricsCache.get<LyricsData>(cacheKey);
    if (cached) return cached;

    const track = await YouTubeMusicEngine.getTrackDetails(videoId);
    return this.getLyrics(videoId, track.title, track.artist);
  }

  /**
   * Search songs by lyric text (Genius if available, fallback to internal search)
   */
  async searchLyrics(query: string): Promise<Array<{ title: string; artist: string; videoId: string; highlight?: string }>> {
    const cacheKey = `lyrics:search:${query.toLowerCase()}`;
    const cached = await lyricsCache.get<Array<{ title: string; artist: string; videoId: string; highlight?: string }>>(cacheKey);
    if (cached) return cached;

    const results: Array<{ title: string; artist: string; videoId: string; highlight?: string }> = [];

    const geniusToken = process.env.GENIUS_ACCESS_TOKEN || this.GENIUS_API_KEY;
    if (geniusToken) {
      try {
        const resp = await axios.get('https://api.genius.com/search', {
          params: { q: query },
          headers: { Authorization: `Bearer ${geniusToken}` },
          timeout: 8000,
        });

        const hits = resp.data?.response?.hits || [];
        for (const hit of hits.slice(0, 8)) {
          const song = hit.result;
          const title = song?.title_with_featured || song?.full_title || 'Unknown';
          const artist = song?.primary_artist?.name || 'Unknown';
          const mapped = await this.mapToStreamifyTrack(`${artist} ${title}`);
          if (mapped) {
            const highlight = await this.buildHighlight(mapped.videoId, query);
            results.push({ ...mapped, highlight });
          }
        }
      } catch (err) {
        logger.warn('Genius search failed, falling back to Musixmatch/Streamify');
      }
    }

    // Musixmatch web search (reverse engineered) as secondary signal
    if (results.length === 0) {
      const mxmCandidates = await this.searchMusixmatchWeb(query);
      for (const cand of mxmCandidates) {
        const mapped = await this.mapToStreamifyTrack(`${cand.artist} ${cand.title}`);
        if (mapped) {
          const highlight = await this.buildHighlight(mapped.videoId, query);
          results.push({ ...mapped, highlight });
        }
      }
    }

    if (results.length === 0) {
      const mapped = await this.mapToStreamifyTrack(query);
      if (mapped) {
        const highlight = await this.buildHighlight(mapped.videoId, query);
        results.push({ ...mapped, highlight });
      }
    }

    await lyricsCache.set(cacheKey, results, SEARCH_TTL_SECONDS);
    return results;
  }

  /**
   * Get lyrics for a song
   */
  async getLyrics(videoId: string, title: string, artist: string): Promise<LyricsData | null> {
    logger.info(`Fetching lyrics for: ${artist} - ${title}`);

    // Check cache first
    const cacheKey = `lyrics:${videoId}`;
    const cached = await lyricsCache.get<LyricsData>(cacheKey);
    if (cached) {
      logger.info('Lyrics found in cache');
      return cached;
    }

    try {
      // Try multiple sources prioritized for quality and sync
      let lyricsData: LyricsData | null = null;

      // 1. LRCLIB (time-synced where available)
      lyricsData = await this.fetchFromLRCLIB(title, artist, videoId);

      // 2. Musixmatch (API if key, otherwise web-scrape)
      if (!lyricsData) {
        lyricsData = await this.fetchFromMusixmatchApi(title, artist, videoId);
      }

      if (!lyricsData) {
        lyricsData = await this.fetchFromMusixmatchWeb(title, artist, videoId);
      }

      // 3. Lyrics.ovh (simple plain lyrics)
      if (!lyricsData) {
        lyricsData = await this.fetchFromLyricsOvh(title, artist, videoId);
      }

      // 4. Genius (scraping)
      if (!lyricsData) {
        lyricsData = await this.fetchFromGenius(title, artist, videoId);
      }

      // 5. AZLyrics (scraping)
      if (!lyricsData) {
        lyricsData = await this.fetchFromAZLyrics(title, artist, videoId);
      }

      // 6. Streamify Music Database (rarely available)
      if (!lyricsData) {
        lyricsData = await this.fetchFromStreamifyMusicDB(videoId, title, artist);
      }

      // 7. Transcript service (last resort)
      if (!lyricsData) {
        lyricsData = await this.fetchFromTranscript(videoId, title, artist);
      }

      if (lyricsData) {
        await lyricsCache.set(cacheKey, lyricsData, LYRICS_TTL_SECONDS);
        logger.info(`Lyrics found from source: ${lyricsData.source}`);
        return lyricsData;
      }

      logger.warn(`No lyrics found for: ${artist} - ${title}`);
      return null;
    } catch (error: any) {
      logger.error('Error fetching lyrics:', error);
      return null;
    }
  }

  /**
   * Get synced lyrics (time-stamped)
   */
  async getSyncedLyrics(videoId: string, title: string, artist: string): Promise<LyricsLine[] | null> {
    const lyricsData = await this.getLyrics(videoId, title, artist);

    if (!lyricsData || !lyricsData.isSynced || !lyricsData.syncedLyrics) {
      return null;
    }

    return lyricsData.syncedLyrics;
  }

  /**
   * Fetch lyrics from Genius (PUBLIC SCRAPING - NO API KEY NEEDED!)
   */
  private async fetchFromGenius(title: string, artist: string, videoId: string): Promise<LyricsData | null> {
    try {
      // Search Genius publicly (no API key needed!)
      const query = `${artist} ${title}`;
      const searchUrl = `https://genius.com/api/search/multi?q=${encodeURIComponent(query)}`;

      const searchResponse = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const sections = searchResponse.data.response.sections;
      const hits = sections.find((s: any) => s.type === 'song')?.hits;
      
      if (!hits || hits.length === 0) {
        return null;
      }

      const song = hits[0].result;
      const lyricsUrl = song.url;

      // Scrape lyrics from Genius page
      const lyricsResponse = await axios.get(lyricsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      
      const lyricsHtml = lyricsResponse.data;

      // Extract lyrics from new Genius HTML structure
      let lyrics = '';
      
      // Try multiple selectors (Genius changes their HTML)
      const patterns = [
        /<div[^>]*class="[^"]*Lyrics__Container[^"]*"[^>]*>(.*?)<\/div>/gs,
        /<div[^>]*data-lyrics-container="true"[^>]*>(.*?)<\/div>/gs,
        /<div class="lyrics">(.*?)<\/div>/s,
      ];

      for (const pattern of patterns) {
        const matches = lyricsHtml.matchAll(pattern);
        for (const match of matches) {
          lyrics += match[1];
        }
        if (lyrics) break;
      }

      if (!lyrics) {
        return null;
      }

      // Clean HTML tags
      lyrics = lyrics
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/?[^>]+(>|$)/g, '')
        .replace(/\[.*?\]/g, '') // Remove [Verse 1], [Chorus], etc.
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      if (!lyrics || lyrics.length < 50) {
        return null;
      }

      return {
        videoId,
        title,
        artist,
        lyrics,
        source: 'Genius (FREE)',
        isSynced: false,
      };
    } catch (error: any) {
      logger.error('Error fetching from Genius:', error.message);
      return null;
    }
  }

  /**
   * Fetch lyrics from AZLyrics (FREE SCRAPING!)
   */
  private async fetchFromAZLyrics(title: string, artist: string, videoId: string): Promise<LyricsData | null> {
    try {
      // AZLyrics URL format: azlyrics.com/lyrics/artist/title.html
      const cleanArtist = artist.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .replace(/^the/, '');
      
      const cleanTitle = title.toLowerCase()
        .replace(/[^a-z0-9]/g, '');

      const url = `https://www.azlyrics.com/lyrics/${cleanArtist}/${cleanTitle}.html`;

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 5000,
      });

      const html = response.data;

      // AZLyrics has lyrics in a div without class/id
      const match = html.match(/<!-- Usage of azlyrics\.com content.*?-->(.*?)<!--/s);
      
      if (!match) {
        return null;
      }

      const lyrics = match[1]
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/?[^>]+(>|$)/g, '')
        .trim();

      if (!lyrics || lyrics.length < 50) {
        return null;
      }

      return {
        videoId,
        title,
        artist,
        lyrics,
        source: 'AZLyrics (FREE)',
        isSynced: false,
      };
    } catch (error: any) {
      logger.error('Error fetching from AZLyrics:', error.message);
      return null;
    }
  }

  /**
   * Fetch lyrics from Lyrics.ovh (FREE API!)
   */
  private async fetchFromLyricsOvh(title: string, artist: string, videoId: string): Promise<LyricsData | null> {
    try {
      const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;

      const response = await axios.get(url, {
        timeout: 5000,
      });

      if (!response.data.lyrics) {
        return null;
      }

      const lyrics = response.data.lyrics.trim();

      if (lyrics.length < 50) {
        return null;
      }

      return {
        videoId,
        title,
        artist,
        lyrics,
        source: 'Lyrics.ovh (FREE)',
        isSynced: false,
      };
    } catch (error: any) {
      logger.error('Error fetching from Lyrics.ovh:', error.message);
      return null;
    }
  }

  /**
   * Fetch lyrics from LRCLIB (plain + synced)
   */
  private async fetchFromLRCLIB(title: string, artist: string, videoId: string): Promise<LyricsData | null> {
    try {
      const response = await axios.get('https://lrclib.net/api/get', {
        params: {
          track_name: title,
          artist_name: artist,
        },
        timeout: 7000,
      });

      const data = response.data;
      if (!data) return null;

      const plainLyrics: string | undefined = data.plainLyrics;
      const syncedLyricsRaw: string | undefined = data.syncedLyrics;
      const syncedLyrics = syncedLyricsRaw ? this.parseLRC(syncedLyricsRaw) : undefined;

      if (!plainLyrics && (!syncedLyrics || syncedLyrics.length === 0)) {
        return null;
      }

      return {
        videoId,
        title,
        artist,
        lyrics: (plainLyrics || syncedLyricsRaw || '').trim(),
        syncedLyrics,
        language: data?.language || data?.language_id,
        source: 'LRCLIB',
        isSynced: !!syncedLyrics && syncedLyrics.length > 0,
      };
    } catch (error: any) {
      logger.warn('LRCLIB fetch failed:', error.message);
      return null;
    }
  }

  /**
   * Fetch lyrics from Musixmatch (requires API key)
   */
  private async fetchFromMusixmatchApi(title: string, artist: string, videoId: string): Promise<LyricsData | null> {
    if (!this.MUSIXMATCH_API_KEY) return null;

    try {
      const response = await axios.get('https://api.musixmatch.com/ws/1.1/matcher.lyrics.get', {
        params: {
          apikey: this.MUSIXMATCH_API_KEY,
          q_track: title,
          q_artist: artist,
        },
        timeout: 8000,
      });

      const lyricsBody = response.data?.message?.body?.lyrics?.lyrics_body as string | undefined;
      if (!lyricsBody) return null;

      const cleaned = lyricsBody
        .replace(/\*\*\*.+\*\*\*/g, '')
        .replace(/This Lyrics is NOT for Commercial use.*/i, '')
        .trim();

      if (cleaned.length < 50) return null;

      return {
        videoId,
        title,
        artist,
        lyrics: cleaned,
        source: 'Musixmatch',
        isSynced: false,
      };
    } catch (error: any) {
      logger.warn('Musixmatch fetch failed:', error.message);
      return null;
    }
  }

  /**
   * Fetch lyrics from Musixmatch by scraping public web (no API key)
   */
  private async fetchFromMusixmatchWeb(title: string, artist: string, videoId: string): Promise<LyricsData | null> {
    try {
      const query = `${artist} ${title}`;
      const searchHtml = await this.fetchHtml(`https://www.musixmatch.com/search/${encodeURIComponent(query)}`);
      if (!searchHtml) return null;

      const trackPath = this.extractFirstMusixmatchTrackPath(searchHtml);
      if (!trackPath) return null;

      const lyricsPage = await this.fetchHtml(`https://www.musixmatch.com${trackPath}`);
      if (!lyricsPage) return null;

      const lyrics = this.extractMusixmatchLyrics(lyricsPage);
      if (!lyrics) return null;

      return {
        videoId,
        title,
        artist,
        lyrics,
        source: 'Musixmatch (scrape)',
        isSynced: false,
      };
    } catch (error: any) {
      logger.warn('Musixmatch web scrape failed:', error.message);
      return null;
    }
  }

  /**
   * Musixmatch search results parsing (public web)
   */
  private async searchMusixmatchWeb(query: string): Promise<Array<{ title: string; artist: string }>> {
    try {
      const searchHtml = await this.fetchHtml(`https://www.musixmatch.com/search/${encodeURIComponent(query)}`);
      if (!searchHtml) return [];

      const candidates: Array<{ title: string; artist: string }> = [];
      const json = this.extractMusixmatchState(searchHtml);
      const trackList = json?.search?.tracks?.track_list || [];

      for (const item of trackList.slice(0, 5)) {
        const track = item?.track;
        if (track?.track_name && track?.artist_name) {
          candidates.push({ title: track.track_name, artist: track.artist_name });
        }
      }

      return candidates;
    } catch (error: any) {
      logger.warn('Musixmatch search scrape failed:', error.message);
      return [];
    }
  }

  private async fetchHtml(url: string): Promise<string | null> {
    try {
      const resp = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Referer: 'https://www.google.com/',
          Cookie: 'x-mxm-token=12345',
        },
        timeout: 8000,
      });
      return resp.data as string;
    } catch (err: any) {
      logger.warn(`HTML fetch failed for ${url}:`, err.message);
      return null;
    }
  }

  private extractFirstMusixmatchTrackPath(html: string): string | null {
    // Try JSON state first
    const state = this.extractMusixmatchState(html);
    const trackList = state?.search?.tracks?.track_list;
    if (Array.isArray(trackList) && trackList.length > 0) {
      const path = trackList[0]?.track?.track_share_url as string | undefined;
      if (path) {
        const url = new URL(path);
        return url.pathname || null;
      }
    }

    // Fallback to link parsing
    const match = html.match(/href="(\/lyrics\/[^"#?]+)"/i);
    return match ? match[1] : null;
  }

  private extractMusixmatchLyrics(html: string): string | null {
    // Musixmatch embeds JSON state
    const state = this.extractMusixmatchState(html);
    const body = state?.page?.lyrics?.lyrics?.body;
    if (body && typeof body === 'string') {
      const cleaned = body.replace(/\n{3,}/g, '\n\n').trim();
      if (cleaned.length > 50) return cleaned;
    }

    // Fallback to simple HTML scrape
    const match = html.match(/<span class="lyrics__content__ok">([\s\S]*?)<\/span>/i);
    if (match && match[1]) {
      const cleaned = match[1]
        .replace(/<br\s*\/?>(\s*)/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .trim();
      if (cleaned.length > 50) return cleaned;
    }
    return null;
  }

  private extractMusixmatchState(html: string): any | null {
    const match = html.match(/__mxmProps\s*=\s*({[\s\S]*?});\s*<\/script>/i) || html.match(/__mxmState\s*=\s*({[\s\S]*?});\s*<\/script>/i);
    if (!match) return null;
    try {
      return JSON.parse(match[1]);
    } catch (err) {
      return null;
    }
  }

  /**
   * Fetch lyrics from Streamify Music Database
   */
  private async fetchFromStreamifyMusicDB(videoId: string, title: string, artist: string): Promise<LyricsData | null> {
    try {
      // Internal music database API endpoint for lyrics
      const apiKey = 'AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30'; // Internal API key
      const url = 'https://music.youtube.com/youtubei/v1/browse';

      const body = {
        context: {
          client: {
            clientName: 'WEB_REMIX',
            clientVersion: '1.20231101.01.00',
          },
        },
        browseEndpointContextSupportedConfigs: {
          browseEndpointContextMusicConfig: {
            pageType: 'MUSIC_PAGE_TYPE_TRACK_LYRICS',
          },
        },
        browseId: `${videoId}`, // Lyrics browse ID (may need adjustment)
      };

      const response = await axios.post(`${url}?key=${apiKey}`, body, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      // Parse lyrics from response (simplified - actual parsing is complex)
      const lyricsContent = this.extractStreamifyLyrics(response.data);

      if (!lyricsContent) {
        return null;
      }

      return {
        videoId,
        title,
        artist,
        lyrics: lyricsContent,
        source: 'Streamify',
        isSynced: false,
      };
    } catch (error: any) {
      logger.error('Error fetching from Streamify database:', error.message);
      return null;
    }
  }

  /**
   * Fallback to transcript service as approximate lyrics
   */
  private async fetchFromTranscript(videoId: string, title: string, artist: string): Promise<LyricsData | null> {
    try {
      const response = await axios.get(`https://youtubetranscript.com/?server_vid=${videoId}`, {
        timeout: 6000,
      });

      const rows = response.data as Array<{ text: string; start: number; dur?: number }>;
      if (!Array.isArray(rows) || rows.length === 0) return null;

      const syncedLyrics: LyricsLine[] = rows
        .filter(r => r?.text)
        .map(r => ({ time: Number(r.start) || 0, text: r.text.trim() }))
        .filter(l => l.text);

      if (syncedLyrics.length === 0) return null;

      const lyrics = syncedLyrics.map(l => l.text).join('\n');

      return {
        videoId,
        title,
        artist,
        lyrics,
        syncedLyrics,
        source: 'Streamify Transcript',
        language: 'auto',
        isSynced: true,
      };
    } catch (error: any) {
      logger.warn('Transcript fetch failed:', error.message);
      return null;
    }
  }

  /**
   * Extract lyrics from Streamify Music Database response
   */
  private extractStreamifyLyrics(data: any): string | null {
    try {
      // Lyrics are in sectionListRenderer
      const contents = data?.contents?.sectionListRenderer?.contents;
      if (!contents) return null;

      for (const section of contents) {
        const musicDescriptionShelfRenderer = section?.musicDescriptionShelfRenderer;
        if (musicDescriptionShelfRenderer) {
          const description = musicDescriptionShelfRenderer.description;
          if (description?.runs) {
            return description.runs.map((run: any) => run.text).join('');
          }
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Parse LRC format (synced lyrics)
   */
  parseLRC(lrcContent: string): LyricsLine[] {
    const lines: LyricsLine[] = [];
    const lrcLines = lrcContent.split('\n');

    for (const line of lrcLines) {
      // LRC format: [mm:ss.xx]lyrics text
      const match = line.match(/\[(\d+):(\d+)\.(\d+)\](.*)/);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const centiseconds = parseInt(match[3], 10);
        const text = match[4].trim();

        const time = minutes * 60 + seconds + centiseconds / 100;

        lines.push({ time, text });
      }
    }

    return lines.sort((a, b) => a.time - b.time);
  }

  /**
   * Convert plain lyrics to synced format (simple word distribution)
   */
  convertToSynced(lyrics: string, duration: number): LyricsLine[] {
    const lines = lyrics.split('\n').filter(line => line.trim());
    const timePerLine = duration / lines.length;

    return lines.map((text, index) => ({
      time: index * timePerLine,
      text,
    }));
  }

  /**
   * Get current lyric line based on playback time
   */
  getCurrentLine(syncedLyrics: LyricsLine[], currentTime: number): LyricsLine | null {
    if (!syncedLyrics || syncedLyrics.length === 0) {
      return null;
    }

    // Find the line that should be displayed at current time
    for (let i = syncedLyrics.length - 1; i >= 0; i--) {
      if (currentTime >= syncedLyrics[i].time) {
        return syncedLyrics[i];
      }
    }

    return null;
  }

  /**
   * Get upcoming lyric lines (for display)
   */
  getUpcomingLines(syncedLyrics: LyricsLine[], currentTime: number, count: number = 3): LyricsLine[] {
    if (!syncedLyrics || syncedLyrics.length === 0) {
      return [];
    }

    const currentIndex = syncedLyrics.findIndex(line => line.time > currentTime);
    if (currentIndex === -1) {
      return syncedLyrics.slice(-count);
    }

    return syncedLyrics.slice(currentIndex, currentIndex + count);
  }

  /**
   * Search lyrics content
   */
  searchInLyrics(lyrics: string, query: string): { found: boolean; position: number; context: string } {
    const lowerLyrics = lyrics.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const position = lowerLyrics.indexOf(lowerQuery);

    if (position === -1) {
      return { found: false, position: -1, context: '' };
    }

    // Get context (50 chars before and after)
    const start = Math.max(0, position - 50);
    const end = Math.min(lyrics.length, position + query.length + 50);
    const context = lyrics.substring(start, end);

    return { found: true, position, context };
  }

  /**
   * Map a lyric query to a music track
   */
  private async mapToStreamifyTrack(query: string): Promise<{ title: string; artist: string; videoId: string } | null> {
    try {
      const results = await YouTubeMusicEngine.search(query, 3);
      if (!results || results.length === 0) return null;
      const top = results[0];
      return { title: top.title, artist: top.artist, videoId: top.videoId };
    } catch (err) {
      return null;
    }
  }

  /**
   * Build a highlight snippet containing the query
   */
  private async buildHighlight(videoId: string, query: string): Promise<string | undefined> {
    const data = await this.getLyricsByVideoId(videoId);
    if (!data?.lyrics) return undefined;

    const { found, context } = this.searchInLyrics(data.lyrics, query);
    if (!found || !context) return undefined;

    const normalized = context.replace(/\s+/g, ' ').trim();
    if (normalized.length > 140) {
      return `${normalized.slice(0, 140)}…`;
    }
    return normalized;
  }

  /**
   * Get lyrics statistics
   */
  getStats(): any {
    return lyricsCache.getStats();
  }

  /**
   * Clear lyrics cache
   */
  async clearCache(): Promise<void> {
    await lyricsCache.clear();
    logger.info('Lyrics cache cleared');
  }
}

export default new LyricsService();
