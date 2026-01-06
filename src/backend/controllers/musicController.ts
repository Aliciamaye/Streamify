/**
 * Music Controller - Production Grade
 * Handles HTTP requests for music operations
 */

import { Request, Response } from 'express';
import * as MusicService from '../services/MusicService';
import YouTubeMusicClient from '../services/YouTubeMusicClient';
import { Logger } from '../utils/logger';
import { ApiResponse, asyncHandler } from '../utils/helpers';

const logger = new Logger('MusicController');
const youtubeClient = new YouTubeMusicClient();

/**
 * Search music
 */
export const searchMusic = asyncHandler(async (req: Request, res: Response) => {
  const { q, limit = '20' } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json(new ApiResponse(false, 'Search query required', null, 400));
  }

  try {
    const results = await MusicService.searchSongs(q, Math.min(parseInt(limit as string) || 20, 100));
    logger.info(`Search completed for: "${q}" - ${results.length} results`);

    return res.status(200).json(
      new ApiResponse(true, 'Search successful', {
        query: q,
        count: results.length,
        results,
      })
    );
  } catch (error) {
    logger.error(`Search error for "${q}":`, error);
    return res.status(500).json(new ApiResponse(false, 'Search failed', null, 500));
  }
});

/**
 * Get trending music
 */
export const getTrendingMusic = asyncHandler(async (req: Request, res: Response) => {
  const { limit = '50' } = req.query;

  try {
    const results = await MusicService.getTrending(Math.min(parseInt(limit as string) || 50, 200));
    logger.info(`Trending fetched - ${results.length} items`);

    return res.status(200).json(
      new ApiResponse(true, 'Trending music', {
        count: results.length,
        results,
      })
    );
  } catch (error) {
    logger.error('Trending fetch error:', error);
    return res.status(500).json(new ApiResponse(false, 'Failed to fetch trending', null, 500));
  }
});

/**
 * Get music details
 */
export const getMusicDetails = asyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;

  if (!videoId) {
    return res.status(400).json(new ApiResponse(false, 'Video ID required', null, 400));
  }

  try {
    const details = await MusicService.getSongDetails(videoId);
    logger.info(`Details fetched for video: ${videoId}`);

    return res.status(200).json(new ApiResponse(true, 'Music details', details));
  } catch (error) {
    logger.error(`Details fetch error for ${videoId}:`, error);
    return res.status(500).json(new ApiResponse(false, 'Failed to fetch details', null, 500));
  }
});

/**
 * Get playback URL
 */
export const getPlaybackUrl = asyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;

  if (!videoId) {
    return res.status(400).json(new ApiResponse(false, 'Video ID required', null, 400));
  }

  try {
    const playbackUrl = await MusicService.getPlaybackUrl(videoId);
    logger.info(`Playback URL generated for: ${videoId}`);

    return res.status(200).json(
      new ApiResponse(true, 'Playback URL', {
        videoId,
        ...playbackUrl,
      })
    );
  } catch (error) {
    logger.error(`Playback URL error for ${videoId}:`, error);
    return res.status(500).json(new ApiResponse(false, 'Failed to generate playback URL', null, 500));
  }
});

/**
 * Get artist information
 */
export const getArtist = asyncHandler(async (req: Request, res: Response) => {
  const { channelId } = req.params;

  if (!channelId) {
    return res.status(400).json(new ApiResponse(false, 'Channel ID required', null, 400));
  }

  try {
    const artist = await youtubeClient.getArtist(channelId);
    logger.info(`Artist info fetched: ${channelId}`);

    return res.status(200).json(new ApiResponse(true, 'Artist information', artist));
  } catch (error) {
    logger.error(`Artist fetch error for ${channelId}:`, error);
    return res.status(500).json(new ApiResponse(false, 'Failed to fetch artist', null, 500));
  }
});

/**
 * Get album information
 */
export const getAlbum = asyncHandler(async (req: Request, res: Response) => {
  const { browseId } = req.params;

  if (!browseId) {
    return res.status(400).json(new ApiResponse(false, 'Browse ID required', null, 400));
  }

  try {
    const album = await youtubeClient.getAlbum(browseId);
    logger.info(`Album info fetched: ${browseId}`);

    return res.status(200).json(new ApiResponse(true, 'Album information', album));
  } catch (error) {
    logger.error(`Album fetch error for ${browseId}:`, error);
    return res.status(500).json(new ApiResponse(false, 'Failed to fetch album', null, 500));
  }
});

/**
 * Get cache statistics
 */
export const getCacheStats = asyncHandler(async (req: Request, res: Response) => {
  try {
    const stats = MusicService.getCacheStats();
    logger.info('Cache stats retrieved');

    return res.status(200).json(new ApiResponse(true, 'Cache statistics', stats));
  } catch (error) {
    logger.error('Cache stats error:', error);
    return res.status(500).json(new ApiResponse(false, 'Failed to get cache stats', null, 500));
  }
});

/**
 * Clear cache
 */
export const clearCache = asyncHandler(async (req: Request, res: Response) => {
  try {
    MusicService.clearCache();
    logger.info('Cache cleared');

    return res.status(200).json(new ApiResponse(true, 'Cache cleared successfully', null));
  } catch (error) {
    logger.error('Cache clear error:', error);
    return res.status(500).json(new ApiResponse(false, 'Failed to clear cache', null, 500));
  }
});


