/**
 * YouTube Music API Client
 * Reverse engineering YouTube Music InnerTube API
 * Production-grade implementation
 */

import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import signatureDecipher from './SignatureDecipher';

interface YouTubeMusic {
  id: string;
  title: string;
  artist: string;
  album: string;
  thumbnail: string;
  duration: number;
  year?: number;
  playlistId?: string;
}

interface PlaybackContext {
  videoId: string;
  signatureTimestamp: number;
  signatureCipher?: string;
}

class YouTubeMusicClient {
  private client: AxiosInstance;
  private readonly BASE_URL = 'https://music.youtube.com/youtubei/v1';
  private readonly CONTEXT = {
    context: {
      client: {
        clientName: 'WEB_REMIX',
        clientVersion: '1.20240101.00.00',
      },
    },
  };

  constructor() {
    this.client = axios.create({
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/json',
        'X-Origin': 'https://music.youtube.com',
      },
      timeout: 10000,
    });
  }

  /**
   * Search for songs on YouTube Music
   */
  async searchSongs(query: string): Promise<YouTubeMusic[]> {
    try {
      const response = await this.client.post(`${this.BASE_URL}/search`, {
        ...this.CONTEXT,
        query,
        params: 'EgWKAQIIAWoKEAoIBAgDEAoQBA%3D%3D',
      });

      return this.parseSearchResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Failed to search songs');
    }
  }

  /**
   * Get song details
   */
  async getSongDetails(videoId: string): Promise<YouTubeMusic> {
    try {
      const response = await this.client.post(`${this.BASE_URL}/player`, {
        ...this.CONTEXT,
        videoId,
      });

      return this.parseSongDetails(response.data);
    } catch (error) {
      console.error('Get song details error:', error);
      throw new Error('Failed to get song details');
    }
  }

  /**
   * Get playback URL with streaming capability
   * Enhanced with adaptive quality selection and proper signature deciphering
   */
  async getPlaybackUrl(videoId: string, preferredQuality: 'high' | 'medium' | 'low' = 'high'): Promise<{
    url: string;
    quality: string;
    mimeType: string;
    bitrate: number;
  }> {
    try {
      const response = await this.client.post(`${this.BASE_URL}/player`, {
        ...this.CONTEXT,
        videoId,
        playbackContext: {
          contentPlaybackContext: {
            signatureTimestamp: Math.floor(Date.now() / 1000),
          },
        },
      });

      // Check for streaming data
      const streamingData = response.data?.streamingData;
      if (!streamingData) {
        throw new Error('No streaming data available');
      }

      // Get all available formats
      const formats = [
        ...(streamingData.formats || []),
        ...(streamingData.adaptiveFormats || [])
      ];

      if (formats.length === 0) {
        throw new Error('No playback formats available');
      }

      // Filter audio-only formats
      const audioFormats = formats.filter((f: any) =>
        f.mimeType?.includes('audio') || !f.mimeType?.includes('video')
      );

      // Select best format based on quality preference
      const selectedFormat = this.selectBestFormat(audioFormats, preferredQuality);

      if (!selectedFormat) {
        throw new Error('No suitable audio format found');
      }

      // Handle signature cipher
      let playbackUrl = selectedFormat.url;

      if (selectedFormat.signatureCipher) {
        playbackUrl = await signatureDecipher.decipher(selectedFormat.signatureCipher, videoId);
      }

      if (!playbackUrl) {
        throw new Error('Failed to extract playback URL');
      }

      return {
        url: playbackUrl,
        quality: selectedFormat.qualityLabel || selectedFormat.quality || 'unknown',
        mimeType: selectedFormat.mimeType || 'audio/unknown',
        bitrate: selectedFormat.bitrate || 0,
      };

    } catch (error) {
      console.error('Get playback URL error:', error);
      throw new Error(`Failed to get playback URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Select best audio format based on quality preference
   */
  private selectBestFormat(formats: any[], quality: 'high' | 'medium' | 'low'): any {
    if (formats.length === 0) return null;

    // Define bitrate preferences
    const bitratePreferences = {
      high: 256000,   // 256 kbps
      medium: 128000, // 128 kbps
      low: 64000,     // 64 kbps
    };

    const targetBitrate = bitratePreferences[quality];

    // Sort by closest to target bitrate
    const sorted = formats.sort((a, b) => {
      const aDiff = Math.abs((a.bitrate || 0) - targetBitrate);
      const bDiff = Math.abs((b.bitrate || 0) - targetBitrate);
      return aDiff - bDiff;
    });

    // Return closest match
    return sorted[0];
  }

  /**
   * Get trending songs
   */
  async getTrending(): Promise<YouTubeMusic[]> {
    try {
      const response = await this.client.post(`${this.BASE_URL}/browse`, {
        ...this.CONTEXT,
        browseId: 'FEmusic_chart_content_feed_charts',
      });

      return this.parseBrowseResults(response.data);
    } catch (error) {
      console.error('Get trending error:', error);
      throw new Error('Failed to get trending songs');
    }
  }

  /**
   * Get playlist
   */
  async getPlaylist(playlistId: string): Promise<YouTubeMusic[]> {
    try {
      const response = await this.client.post(`${this.BASE_URL}/browse`, {
        ...this.CONTEXT,
        browseId: playlistId,
      });

      return this.parseBrowseResults(response.data);
    } catch (error) {
      console.error('Get playlist error:', error);
      throw new Error('Failed to get playlist');
    }
  }

  /**
   * Get artist details
   */
  async getArtist(channelId: string): Promise<any> {
    try {
      const response = await this.client.post(`${this.BASE_URL}/browse`, {
        ...this.CONTEXT,
        browseId: channelId,
      });

      return this.parseArtistDetails(response.data);
    } catch (error) {
      console.error('Get artist error:', error);
      throw new Error('Failed to get artist details');
    }
  }

  /**
   * Get album
   */
  async getAlbum(browseId: string): Promise<any> {
    try {
      const response = await this.client.post(`${this.BASE_URL}/browse`, {
        ...this.CONTEXT,
        browseId,
      });

      return this.parseAlbumDetails(response.data);
    } catch (error) {
      console.error('Get album error:', error);
      throw new Error('Failed to get album details');
    }
  }

  /**
   * Get recommendations based on song
   */
  async getRecommendations(videoId: string): Promise<YouTubeMusic[]> {
    try {
      const response = await this.client.post(`${this.BASE_URL}/player`, {
        ...this.CONTEXT,
        videoId,
      });

      return this.parseRecommendations(response.data);
    } catch (error) {
      console.error('Get recommendations error:', error);
      return [];
    }
  }

  /**
   * Parse search results from API response
   */
  private parseSearchResults(data: any): YouTubeMusic[] {
    const results: YouTubeMusic[] = [];

    try {
      const contents = data?.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.
        tabRenderer?.content?.sectionListRenderer?.contents || [];

      for (const section of contents) {
        const items =
          section?.musicShelfRenderer?.contents ||
          section?.musicResponsiveListItemRenderer?.contents ||
          [];

        for (const item of items) {
          const song = this.extractSongFromItem(item);
          if (song) results.push(song);
        }
      }
    } catch (error) {
      console.error('Parse error:', error);
    }

    return results;
  }

  /**
   * Extract song information from API item
   */
  private extractSongFromItem(item: any): YouTubeMusic | null {
    try {
      const videoId = item?.musicResponsiveListItemRenderer?.flexColumns?.[0]?.
        musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.navigationEndpoint?.
        watchPlaylistEndpoint?.videoId ||
        item?.videoId;

      if (!videoId) return null;

      const title = item?.musicResponsiveListItemRenderer?.flexColumns?.[0]?.
        musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text ||
        item?.title?.simpleText ||
        'Unknown';

      const artist = item?.musicResponsiveListItemRenderer?.flexColumns?.[1]?.
        musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text ||
        item?.subtitle?.runs?.[0]?.text ||
        'Unknown Artist';

      const thumbnail = item?.musicResponsiveListItemRenderer?.thumbnail?.
        musicThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.url ||
        item?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.url ||
        '';

      return {
        id: videoId,
        title,
        artist,
        album: this.extractAlbum(item),
        thumbnail,
        duration: this.extractDuration(item),
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract album from item
   */
  private extractAlbum(item: any): string {
    try {
      return (
        item?.musicResponsiveListItemRenderer?.flexColumns?.[1]?.
          musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[2]?.text ||
        item?.album ||
        'Unknown Album'
      );
    } catch {
      return 'Unknown Album';
    }
  }

  /**
   * Extract duration from item
   */
  private extractDuration(item: any): number {
    try {
      const durationText = item?.musicResponsiveListItemRenderer?.fixedColumns?.[0]?.
        musicResponsiveListItemFixedColumnRenderer?.text?.runs?.[0]?.text ||
        '0:00';

      const [minutes, seconds] = durationText.split(':').map(Number);
      return minutes * 60 + (seconds || 0);
    } catch {
      return 0;
    }
  }



  /**
   * Parse browse results
   */
  private parseBrowseResults(data: any): YouTubeMusic[] {
    const results: YouTubeMusic[] = [];

    try {
      const contents = data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.
        tabRenderer?.content?.sectionListRenderer?.contents || [];

      for (const section of contents) {
        const items = section?.musicShelfRenderer?.contents || [];

        for (const item of items) {
          const song = this.extractSongFromItem(item);
          if (song) results.push(song);
        }
      }
    } catch (error) {
      console.error('Parse browse error:', error);
    }

    return results;
  }

  /**
   * Parse song details
   */
  private parseSongDetails(data: any): YouTubeMusic {
    const videoId = data?.videoDetails?.videoId || '';
    const title = data?.videoDetails?.title || 'Unknown';
    const artist = data?.videoDetails?.author || 'Unknown Artist';
    const thumbnail = data?.videoDetails?.thumbnail?.thumbnails?.[0]?.url || '';
    const duration = parseInt(data?.videoDetails?.lengthSeconds) || 0;

    return {
      id: videoId,
      title,
      artist,
      album: 'Unknown Album',
      thumbnail,
      duration,
    };
  }

  /**
   * Parse artist details
   */
  private parseArtistDetails(data: any): any {
    try {
      return {
        name: data?.metadata?.channelMetadataRenderer?.title || 'Unknown',
        description: data?.metadata?.channelMetadataRenderer?.description || '',
        thumbnail: data?.metadata?.channelMetadataRenderer?.avatar?.thumbnails?.[0]?.url || '',
        subscribers: data?.header?.musicResponsiveHeaderRenderer?.subtitle?.runs?.[2]?.text || 'N/A',
      };
    } catch {
      return null;
    }
  }

  /**
   * Parse album details
   */
  private parseAlbumDetails(data: any): any {
    try {
      return {
        name: data?.metadata?.playlistMetadataRenderer?.title || 'Unknown',
        artist: data?.header?.musicResponsiveHeaderRenderer?.subtitle?.runs?.[2]?.text || 'Unknown',
        year: data?.header?.musicResponsiveHeaderRenderer?.subtitle?.runs?.[4]?.text || 'N/A',
        songs: this.parseBrowseResults(data),
      };
    } catch {
      return null;
    }
  }

  /**
   * Parse recommendations
   */
  private parseRecommendations(data: any): YouTubeMusic[] {
    try {
      const contents = data?.contents?.twoColumnWatchNextResults?.secondaryContents?.
        secondaryResults?.results || [];

      const results: YouTubeMusic[] = [];

      for (const item of contents) {
        const song = this.extractSongFromItem(item);
        if (song) results.push(song);
      }

      return results;
    } catch {
      return [];
    }
  }
}

export default YouTubeMusicClient;
