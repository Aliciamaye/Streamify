/**
 * Advanced Music Controller
 * Production-grade endpoints with YouTube reverse engineering
 */

import { Request, Response } from 'express';
import YouTubeMusicEngine from '../services/YouTubeMusicEngine';
import StreamingProxyService from '../services/StreamingProxyService';
import { Logger } from '../utils/logger';
import { ApiResponse } from '../utils/helpers';

const logger = new Logger('AdvancedMusicController');

/**
 * Search music with advanced engine
 */
export const searchMusic = async (req: Request, res: Response) => {
  try {
    const { q, limit = '20' } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json(
        ApiResponse.error('Search query required', 400)
      );
    }

    const results = await YouTubeMusicEngine.search(
      q,
      Math.min(parseInt(limit as string) || 20, 100)
    );

    logger.info(`Search: "${q}" - ${results.length} results`);

    return res.json(
      ApiResponse.success('Search completed', {
        query: q,
        count: results.length,
        results,
      })
    );
  } catch (error: any) {
    logger.error('Search error:', error);
    return res.status(500).json(
      ApiResponse.error('Search failed', 500, error.message)
    );
  }
};

/**
 * Get trending tracks
 */
export const getTrending = async (req: Request, res: Response) => {
  try {
    const { limit = '50' } = req.query;

    const results = await YouTubeMusicEngine.getTrending(
      Math.min(parseInt(limit as string) || 50, 200)
    );

    logger.info(`Trending: ${results.length} tracks`);

    return res.json(
      ApiResponse.success('Trending tracks', {
        count: results.length,
        results,
      })
    );
  } catch (error: any) {
    logger.error('Trending error:', error);
    return res.status(500).json(
      ApiResponse.error('Failed to fetch trending', 500, error.message)
    );
  }
};

/**
 * Get track details
 */
export const getTrackDetails = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res.status(400).json(
        ApiResponse.error('Video ID required', 400)
      );
    }

    const track = await YouTubeMusicEngine.getTrackDetails(videoId);

    logger.info(`Track details: ${videoId}`);

    return res.json(
      ApiResponse.success('Track details', track)
    );
  } catch (error: any) {
    logger.error('Track details error:', error);
    return res.status(500).json(
      ApiResponse.error('Failed to fetch track', 500, error.message)
    );
  }
};

/**
 * Get playback streams (advanced)
 */
export const getPlaybackStreams = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const { quality = 'high' } = req.query;

    if (!videoId) {
      return res.status(400).json(
        ApiResponse.error('Video ID required', 400)
      );
    }

    const playback = await YouTubeMusicEngine.getPlaybackStreams(
      videoId,
      quality as any
    );

    logger.info(`Playback: ${videoId} - ${playback.format.audioQuality || playback.format.qualityLabel}`);

    return res.json(
      ApiResponse.success('Playback streams', {
        videoId,
        url: playback.url,
        format: {
          mimeType: playback.format.mimeType,
          bitrate: playback.format.bitrate,
          audioQuality: playback.format.audioQuality,
          audioSampleRate: playback.format.audioSampleRate,
        },
        expiresAt: playback.expiresAt,
      })
    );
  } catch (error: any) {
    logger.error('Playback error:', error);
    return res.status(500).json(
      ApiResponse.error('Failed to get playback', 500, error.message)
    );
  }
};

/**
 * Stream proxy endpoint with range support
 */
export const streamProxy = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const { quality = 'high' } = req.query;

    if (!videoId) {
      return res.status(400).json(
        ApiResponse.error('Video ID required', 400)
      );
    }

    // Get stream URL
    const playback = await YouTubeMusicEngine.getPlaybackStreams(
      videoId,
      quality as any
    );

    // Proxy the stream
    await StreamingProxyService.proxyStream(req, res, playback.url);

  } catch (error: any) {
    logger.error('Stream proxy error:', error);
    
    if (!res.headersSent) {
      return res.status(500).json(
        ApiResponse.error('Streaming failed', 500, error.message)
      );
    }
  }
};

/**
 * Get artist info
 */
export const getArtist = async (req: Request, res: Response) => {
  try {
    const { browseId } = req.params;

    if (!browseId) {
      return res.status(400).json(
        ApiResponse.error('Browse ID required', 400)
      );
    }

    const artist = await YouTubeMusicEngine.getArtist(browseId);

    logger.info(`Artist: ${artist.name}`);

    return res.json(
      ApiResponse.success('Artist info', artist)
    );
  } catch (error: any) {
    logger.error('Artist error:', error);
    return res.status(500).json(
      ApiResponse.error('Failed to fetch artist', 500, error.message)
    );
  }
};

/**
 * Health check for music engine
 */
export const healthCheck = async (req: Request, res: Response) => {
  try {
    const streamingStats = {
      activeStreams: StreamingProxyService.getActiveStreamsCount(),
    };

    return res.json(
      ApiResponse.success('Music engine healthy', {
        status: 'operational',
        engine: 'YouTubeMusicEngine',
        streaming: streamingStats,
        timestamp: new Date().toISOString(),
      })
    );
  } catch (error: any) {
    return res.status(500).json(
      ApiResponse.error('Health check failed', 500, error.message)
    );
  }
};
