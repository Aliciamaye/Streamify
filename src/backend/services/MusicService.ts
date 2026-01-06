/**
 * Music Service - Production Grade
 * Handles all music operations with advanced caching and YouTube reverse engineering
 */

import YouTubeMusicEngine from './YouTubeMusicEngine';
import { RedisCache } from './RedisCache';
import { Logger } from '../utils/logger';

const logger = new Logger('MusicService');

const CACHE_TTL = {
  SEARCH: 3600, // 1 hour
  TRENDING: 1800, // 30 minutes
  ARTIST: 3600, // 1 hour
  ALBUM: 3600, // 1 hour
  RECOMMENDATIONS: 1800, // 30 minutes
  PLAYBACK: 3000, // 50 minutes (before URL expiry)
};

class MusicService {
  private ytEngine: typeof YouTubeMusicEngine;
  private cache: RedisCache;

  constructor() {
    this.ytEngine = YouTubeMusicEngine;
    this.cache = new RedisCache();
  }

  /**
   * Search songs with advanced caching
   */
  async searchSongs(query: string, limit = 20) {
    try {
      const cacheKey = `search:${query}:${limit}`;

      // Check cache
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        logger.info(`Cache hit for search: ${query}`);
        return cached;
      }

      // Fetch from YouTube with advanced engine
      logger.info(`Searching for: ${query}`);
      const results = await this.ytEngine.search(query, limit);

      // Cache results
      await this.cache.set(cacheKey, results, CACHE_TTL.SEARCH);

      return results;
    } catch (error) {
      logger.error(`Search error for query "${query}":`, error);
      throw error;
    }
  }

  /**
   * Get trending songs
   */
  async getTrending(limit = 50) {
    try {
      const cacheKey = 'trending:all';

      // Check cache
      const cached = await this.cache.get<any[]>(cacheKey);
      if (cached && Array.isArray(cached)) {
        logger.info('Cache hit for trending');
        return cached.slice(0, limit);
      }

      // Fetch from YouTube
      logger.info('Fetching trending songs');
      const results = await this.ytEngine.getTrending(limit);

      // Cache results
      await this.cache.set(cacheKey, results, CACHE_TTL.TRENDING);

      return results;
    } catch (error) {
      logger.error('Trending error:', error);
      throw error;
    }
  }

  /**
   * Get song details with new engine
   */
  async getSongDetails(videoId: string) {
    try {
      const cacheKey = `song:${videoId}`;

      // Check cache
      const cached = await this.cache.get<any>(cacheKey);
      if (cached) {
        logger.info(`Cache hit for song: ${videoId}`);
        return cached;
      }

      // Fetch from YouTube using new engine
      logger.info(`Getting details for song: ${videoId}`);
      const details = await this.ytEngine.getTrackDetails(videoId);

      // Cache results
      await this.cache.set(cacheKey, details, CACHE_TTL.SEARCH);

      return details;
    } catch (error) {
      logger.error(`Song details error for ${videoId}:`, error);
      throw error;
    }
  }

  /**
   * Get playback URL with new engine
   */
  async getPlaybackUrl(videoId: string, quality: 'highest' | 'high' | 'medium' | 'low' = 'high') {
    try {
      logger.info(`Getting playback URL for: ${videoId}`);
      
      const playback = await this.ytEngine.getPlaybackStreams(videoId, quality);

      if (!playback || !playback.url) {
        throw new Error('Failed to get playback URL');
      }

      return {
        videoId,
        url: playback.url,
        quality: playback.format.audioQuality || playback.format.qualityLabel,
        expiresAt: playback.expiresAt,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(`Playback URL error for ${videoId}:`, error);
      throw error;
    }
  }

  /**
   * Get artist with new engine
   */
  async getArtist(channelId: string) {
    try {
      const cacheKey = `artist:${channelId}`;

      // Check cache
      const cached = await this.cache.get<any>(cacheKey);
      if (cached) {
        logger.info(`Cache hit for artist: ${channelId}`);
        return cached;
      }

      logger.info(`Getting artist: ${channelId}`);
      const artist = await this.ytEngine.getArtist(channelId);

      if (artist) {
        await this.cache.set(cacheKey, artist, CACHE_TTL.ARTIST);
      }

      return artist;
    } catch (error) {
      logger.error(`Artist error for ${channelId}:`, error);
      throw error;
    }
  }

  /**
   * Get album (placeholder for now)
   */
  async getAlbum(browseId: string) {
    try {
      const cacheKey = `album:${browseId}`;

      // Check cache
      const cached = await this.cache.get<any>(cacheKey);
      if (cached) {
        logger.info(`Cache hit for album: ${browseId}`);
        return cached;
      }

      logger.info(`Getting album: ${browseId}`);
      // TODO: Implement album fetching in YouTubeMusicEngine
      const album = { browseId, message: 'Album fetching not yet implemented' };

      if (album) {
        await this.cache.set(cacheKey, album, CACHE_TTL.ALBUM);
      }

      return album;
    } catch (error) {
      logger.error(`Album error for ${browseId}:`, error);
      throw error;
    }
  }

  /**
   * Clear cache
   */
  async clearCache() {
    await this.cache.clear();
    logger.info('Cache cleared');
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return this.cache.getStats();
  }
}

const musicServiceInstance = new MusicService();

// Export both instance and static methods
export default musicServiceInstance;

// Export static methods for direct use
export const searchSongs = (query: string, limit?: number) => musicServiceInstance.searchSongs(query, limit);
export const getTrending = (limit?: number) => musicServiceInstance.getTrending(limit);
export const getSongDetails = (videoId: string) => musicServiceInstance.getSongDetails(videoId);
export const getPlaybackUrl = (videoId: string) => musicServiceInstance.getPlaybackUrl(videoId);
export const getArtist = (channelId: string) => musicServiceInstance.getArtist(channelId);
export const getAlbum = (browseId: string) => musicServiceInstance.getAlbum(browseId);
export const getCacheStats = () => musicServiceInstance.getCacheStats();
export const clearCache = () => musicServiceInstance.clearCache();
