/**
 * YouTube Music Engine - Advanced Reverse Engineering
 * Production-grade implementation inspired by SimplMusic
 * Optimized for web with robust player extraction and signature handling
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Logger } from '../utils/logger';
const signatureCipherModule = require('./SignatureCipher');

const logger = new Logger('YouTubeMusicEngine');

export interface MusicTrack {
  videoId: string;
  title: string;
  artist: string;
  album?: string;
  thumbnails: Thumbnail[];
  duration: number;
  year?: number;
  isExplicit?: boolean;
  category?: string;
}

export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export interface StreamingFormat {
  itag: number;
  url?: string;
  signatureCipher?: string;
  mimeType: string;
  bitrate: number;
  qualityLabel?: string;
  audioQuality?: string;
  audioSampleRate?: string;
  audioChannels?: number;
  contentLength?: string;
}

export interface PlaybackData {
  formats: StreamingFormat[];
  expiresInSeconds: number;
  adaptiveFormats: StreamingFormat[];
}

export interface InnerTubeContext {
  client: {
    clientName: string;
    clientVersion: string;
    gl?: string;
    hl?: string;
  };
  user?: {
    lockedSafetyMode: boolean;
  };
}

/**
 * YouTube Music Engine with advanced reverse engineering
 */
export class YouTubeMusicEngine {
  private axios: AxiosInstance;
  private signatureCipher: any;
  private playerCache: Map<string, { code: string; timestamp: number }> = new Map();
  
  private readonly BASE_URL = 'https://music.youtube.com/youtubei/v1';
  private readonly API_KEY = 'AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30';
  
  // Multiple client contexts for fallback
  private readonly CONTEXTS: Record<string, InnerTubeContext> = {
    WEB_REMIX: {
      client: {
        clientName: 'WEB_REMIX',
        clientVersion: '1.20231214.01.00',
        gl: 'US',
        hl: 'en',
      },
    },
    WEB: {
      client: {
        clientName: 'WEB',
        clientVersion: '2.20231214.01.00',
        gl: 'US',
        hl: 'en',
      },
    },
    ANDROID_MUSIC: {
      client: {
        clientName: 'ANDROID_MUSIC',
        clientVersion: '6.42.52',
        gl: 'US',
        hl: 'en',
      },
    },
    IOS_MUSIC: {
      client: {
        clientName: 'IOS_MUSIC',
        clientVersion: '6.42',
        gl: 'US',
        hl: 'en',
      },
    },
  };

  constructor() {
    this.signatureCipher = signatureCipherModule.default || signatureCipherModule;
    this.axios = axios.create({
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': '*/*',
        'Origin': 'https://music.youtube.com',
        'Referer': 'https://music.youtube.com/',
      },
    });
  }

  /**
   * Search for music with enhanced parsing
   */
  async search(query: string, limit: number = 20): Promise<MusicTrack[]> {
    try {
      logger.info(`Searching for: ${query}`);

      const response = await this.makeRequest('search', {
        query,
        params: 'EgWKAQIIAWoKEAoQAxAEEAkQBQ%3D%3D', // Music filter
      });

      return this.parseSearchResults(response.data, limit);
    } catch (error) {
      logger.error('Search error:', error);
      throw new Error('Failed to search YouTube Music');
    }
  }

  /**
   * Get track details with metadata
   */
  async getTrackDetails(videoId: string): Promise<MusicTrack> {
    try {
      logger.info(`Fetching details for: ${videoId}`);

      // Try next endpoint first (more metadata)
      const response = await this.makeRequest('next', {
        videoId,
        params: 'wAEB', // Music params
      });

      return this.parseTrackDetails(response.data, videoId);
    } catch (error) {
      logger.error('Track details error:', error);
      throw new Error('Failed to get track details');
    }
  }

  /**
   * Get playback streams with signature deciphering
   * This is the core reverse engineering part
   */
  async getPlaybackStreams(
    videoId: string,
    quality: 'highest' | 'high' | 'medium' | 'low' = 'high'
  ): Promise<{
    url: string;
    format: StreamingFormat;
    expiresAt: number;
  }> {
    try {
      logger.info(`Getting playback for: ${videoId}, quality: ${quality}`);

      // Try multiple contexts for best compatibility
      let playbackData: PlaybackData | null = null;
      let lastError: any = null;

      for (const contextName of ['ANDROID_MUSIC', 'WEB_REMIX', 'IOS_MUSIC', 'WEB']) {
        try {
          playbackData = await this.getPlayerData(videoId, contextName);
          if (playbackData) {
            logger.info(`Success with context: ${contextName}`);
            break;
          }
        } catch (error) {
          lastError = error;
          logger.warn(`Context ${contextName} failed, trying next...`);
        }
      }

      if (!playbackData) {
        throw lastError || new Error('All contexts failed');
      }

      // Select best format
      const format = await this.selectBestFormat(playbackData, quality);
      
      if (!format) {
        throw new Error('No suitable audio format found');
      }

      // Decipher URL if needed
      let streamUrl = format.url;
      
      if (!streamUrl && format.signatureCipher) {
        logger.info('Deciphering signature...');
        streamUrl = await this.decipherSignature(format.signatureCipher, videoId);
      }

      if (!streamUrl) {
        throw new Error('Failed to extract stream URL');
      }

      // Add throttle parameter bypass if needed
      streamUrl = this.bypassThrottle(streamUrl);

      return {
        url: streamUrl,
        format,
        expiresAt: Date.now() + (playbackData.expiresInSeconds * 1000),
      };
    } catch (error) {
      logger.error('Playback error:', error);
      throw new Error(`Failed to get playback: ${error}`);
    }
  }

  /**
   * Get player data from YouTube
   */
  private async getPlayerData(
    videoId: string,
    contextName: string = 'ANDROID_MUSIC'
  ): Promise<PlaybackData> {
    const context = this.CONTEXTS[contextName];
    
    const payload = {
      context,
      videoId,
      playbackContext: {
        contentPlaybackContext: {
          signatureTimestamp: await this.getSignatureTimestamp(),
        },
      },
    };

    const response = await this.makeRequest('player', payload, contextName);
    
    const streamingData = response.data?.streamingData;
    
    if (!streamingData) {
      throw new Error('No streaming data available');
    }

    return {
      formats: streamingData.formats || [],
      adaptiveFormats: streamingData.adaptiveFormats || [],
      expiresInSeconds: parseInt(streamingData.expiresInSeconds || '3600'),
    };
  }

  /**
   * Make InnerTube API request
   */
  private async makeRequest(
    endpoint: string,
    payload: any,
    contextName: string = 'WEB_REMIX'
  ): Promise<any> {
    const context = this.CONTEXTS[contextName];
    const url = `${this.BASE_URL}/${endpoint}?key=${this.API_KEY}`;

    const fullPayload = {
      context,
      ...payload,
    };

    return await this.axios.post(url, fullPayload);
  }

  /**
   * Select best audio format based on quality preference
   */
  private async selectBestFormat(
    playbackData: PlaybackData,
    quality: 'highest' | 'high' | 'medium' | 'low'
  ): Promise<StreamingFormat | null> {
    // Combine all formats
    const allFormats = [
      ...playbackData.formats,
      ...playbackData.adaptiveFormats,
    ];

    // Filter audio-only formats
    const audioFormats = allFormats.filter(f => 
      f.mimeType?.includes('audio') && !f.mimeType?.includes('video')
    );

    if (audioFormats.length === 0) {
      logger.warn('No audio-only formats, using all formats');
      return allFormats[0] || null;
    }

    // Sort by bitrate
    audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

    // Select based on quality
    switch (quality) {
      case 'highest':
        return audioFormats[0];
      
      case 'high':
        // 192kbps or higher
        return audioFormats.find(f => (f.bitrate || 0) >= 192000) || audioFormats[0];
      
      case 'medium':
        // 128kbps
        return audioFormats.find(f => (f.bitrate || 0) >= 128000) || audioFormats[Math.floor(audioFormats.length / 2)];
      
      case 'low':
        // Lowest quality
        return audioFormats[audioFormats.length - 1];
      
      default:
        return audioFormats[0];
    }
  }

  /**
   * Decipher signature cipher
   */
  private async decipherSignature(
    signatureCipher: string,
    videoId: string
  ): Promise<string> {
    return await this.signatureCipher.decipher(signatureCipher, videoId);
  }

  /**
   * Get signature timestamp from player
   */
  private async getSignatureTimestamp(): Promise<number> {
    try {
      // Get from player if available
      const playerCode = await this.getPlayerCode();
      const match = playerCode.match(/signatureTimestamp[=:](\d+)/);
      
      if (match) {
        return parseInt(match[1]);
      }
    } catch (error) {
      logger.warn('Failed to get signature timestamp:', error);
    }

    // Fallback to current time
    return Math.floor(Date.now() / 1000);
  }

  /**
   * Get YouTube player code
   */
  private async getPlayerCode(): Promise<string> {
    // Check cache (valid for 1 hour)
    const cached = this.playerCache.get('player');
    if (cached && Date.now() - cached.timestamp < 3600000) {
      return cached.code;
    }

    try {
      // Get player URL from embed page
      const embedUrl = 'https://www.youtube.com/iframe_api';
      const embedResponse = await axios.get(embedUrl);
      
      const playerUrlMatch = embedResponse.data.match(/"jsUrl":"([^"]+)"/);
      
      if (!playerUrlMatch) {
        throw new Error('Could not find player URL');
      }

      const playerUrl = 'https://www.youtube.com' + playerUrlMatch[1].replace(/\\u0026/g, '&');
      
      // Fetch player code
      const playerResponse = await axios.get(playerUrl);
      const code = playerResponse.data;

      // Cache it
      this.playerCache.set('player', {
        code,
        timestamp: Date.now(),
      });

      return code;
    } catch (error) {
      logger.error('Failed to get player code:', error);
      return '';
    }
  }

  /**
   * Bypass YouTube throttling
   */
  private bypassThrottle(url: string): string {
    // Add n parameter bypass
    const urlObj = new URL(url);
    
    // Remove ratebypass if exists and add our own parameters
    urlObj.searchParams.delete('ratebypass');
    urlObj.searchParams.set('ratebypass', 'yes');
    
    // Add range parameter for better streaming
    if (!urlObj.searchParams.has('range')) {
      urlObj.searchParams.set('range', '0-');
    }

    return urlObj.toString();
  }

  /**
   * Parse search results from InnerTube response
   */
  private parseSearchResults(data: any, limit: number): MusicTrack[] {
    const tracks: MusicTrack[] = [];

    try {
      const contents = data?.contents?.tabbedSearchResultsRenderer?.tabs?.[0]
        ?.tabRenderer?.content?.sectionListRenderer?.contents;

      if (!contents) {
        logger.warn('No search contents found');
        return tracks;
      }

      for (const section of contents) {
        const musicShelf = section.musicShelfRenderer;
        if (!musicShelf) continue;

        for (const item of musicShelf.contents || []) {
          const renderer = item.musicResponsiveListItemRenderer;
          if (!renderer) continue;

          try {
            const track = this.parseTrackRenderer(renderer);
            if (track) {
              tracks.push(track);
              if (tracks.length >= limit) break;
            }
          } catch (error) {
            logger.warn('Failed to parse track:', error);
          }
        }

        if (tracks.length >= limit) break;
      }
    } catch (error) {
      logger.error('Parse search results error:', error);
    }

    return tracks;
  }

  /**
   * Parse track from renderer
   */
  private parseTrackRenderer(renderer: any): MusicTrack | null {
    try {
      // Video ID
      const videoId = renderer.playlistItemData?.videoId || 
                      renderer.overlay?.musicItemThumbnailOverlayRenderer?.content
                        ?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint?.videoId;

      if (!videoId) return null;

      // Title
      const titleRuns = renderer.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer
        ?.text?.runs || [];
      const title = titleRuns.map((r: any) => r.text).join('');

      // Artist
      const artistRuns = renderer.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer
        ?.text?.runs || [];
      const artist = artistRuns
        .filter((r: any) => r.navigationEndpoint)
        .map((r: any) => r.text)
        .join(', ') || artistRuns[0]?.text || 'Unknown Artist';

      // Album
      const album = artistRuns.find((r: any) => 
        r.navigationEndpoint?.browseEndpoint?.browseEndpointContextSupportedConfigs
          ?.browseEndpointContextMusicConfig?.pageType === 'MUSIC_PAGE_TYPE_ALBUM'
      )?.text;

      // Thumbnails
      const thumbnails = renderer.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];

      // Duration
      const durationText = renderer.flexColumns?.[renderer.flexColumns.length - 1]
        ?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
      const duration = this.parseDuration(durationText);

      return {
        videoId,
        title,
        artist,
        album,
        thumbnails,
        duration,
        isExplicit: renderer.badges?.some((b: any) => 
          b.musicInlineBadgeRenderer?.icon?.iconType === 'MUSIC_EXPLICIT_BADGE'
        ),
      };
    } catch (error) {
      logger.warn('Parse track renderer error:', error);
      return null;
    }
  }

  /**
   * Parse track details from next response
   */
  private parseTrackDetails(data: any, videoId: string): MusicTrack {
    try {
      const tabs = data?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer?.tabs;
      
      if (!tabs) {
        throw new Error('No track data found');
      }

      // Get track from first tab
      const trackTab = tabs[0]?.tabRenderer?.content?.musicQueueRenderer?.content?.playlistPanelRenderer?.contents?.[0];
      const renderer = trackTab?.playlistPanelVideoRenderer;

      if (!renderer) {
        throw new Error('No track renderer found');
      }

      return {
        videoId,
        title: renderer.title?.runs?.[0]?.text || 'Unknown',
        artist: renderer.longBylineText?.runs?.[0]?.text || 'Unknown',
        album: renderer.longBylineText?.runs?.[2]?.text,
        thumbnails: renderer.thumbnail?.thumbnails || [],
        duration: parseInt(renderer.lengthText?.runs?.[0]?.text) || 0,
      };
    } catch (error) {
      logger.error('Parse track details error:', error);
      throw error;
    }
  }

  /**
   * Parse duration string to seconds
   */
  private parseDuration(duration: string | undefined): number {
    if (!duration) return 0;

    const parts = duration.split(':').map(Number);
    
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    return 0;
  }

  /**
   * Get trending/popular tracks
   */
  async getTrending(limit: number = 50): Promise<MusicTrack[]> {
    try {
      logger.info('Fetching trending tracks');

      const response = await this.makeRequest('browse', {
        browseId: 'FEmusic_trending',
      });

      return this.parseSearchResults(response.data, limit);
    } catch (error) {
      logger.error('Trending error:', error);
      throw new Error('Failed to get trending tracks');
    }
  }

  /**
   * Get artist info and tracks
   */
  async getArtist(browseId: string): Promise<{
    name: string;
    thumbnails: Thumbnail[];
    tracks: MusicTrack[];
  }> {
    try {
      const response = await this.makeRequest('browse', {
        browseId,
      });

      // Parse artist data
      const header = response.data?.header?.musicImmersiveHeaderRenderer || 
                     response.data?.header?.musicVisualHeaderRenderer;

      const name = header?.title?.runs?.[0]?.text || 'Unknown';
      const thumbnails = header?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];

      // Parse tracks
      const tracks = this.parseSearchResults(response.data, 50);

      return { name, thumbnails, tracks };
    } catch (error) {
      logger.error('Artist error:', error);
      throw new Error('Failed to get artist');
    }
  }
}

export default new YouTubeMusicEngine();
