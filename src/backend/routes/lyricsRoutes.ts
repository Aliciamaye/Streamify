/**
 * Lyrics Routes - Handle lyrics requests
 */

import express from 'express';
import LyricsService from '../services/LyricsService';
import { asyncHandler, ApiResponse } from '../utils/helpers';
import { Logger } from '../utils/logger';

const router = express.Router();
const logger = new Logger('LyricsRoutes');

/**
 * GET /api/lyrics/:videoId
 * Get lyrics for a song
 */
router.get(
  '/:videoId',
  asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const lyrics = await LyricsService.getLyricsByVideoId(videoId);

    if (!lyrics) {
      return res.status(404).json(ApiResponse.error('Lyrics not found', 404));
    }

    res.json(ApiResponse.success(lyrics, 'Lyrics retrieved successfully'));
  })
);

/**
 * GET /api/lyrics/:videoId/synced
 * Get time-synced lyrics
 */
router.get(
  '/:videoId/synced',
  asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, artist } = req.query;

    if (!title || !artist) {
      return res.status(400).json(ApiResponse.error('Title and artist are required', 400));
    }

    const syncedLyrics = await LyricsService.getSyncedLyrics(videoId, title as string, artist as string);

    if (!syncedLyrics) {
      return res.status(404).json(ApiResponse.error('Synced lyrics not found', 404));
    }

    res.json(ApiResponse.success(syncedLyrics, 'Synced lyrics retrieved successfully'));
  })
);

/**
 * GET /api/lyrics/stats
 * Get lyrics cache statistics
 */
router.get(
  '/cache/stats',
  asyncHandler(async (req, res) => {
    const stats = LyricsService.getStats();
    res.json(ApiResponse.success(stats, 'Lyrics cache statistics'));
  })
);

/**
 * GET /api/lyrics/search?q=
 * Search tracks by lyric text
 */
router.get(
  '/search',
  asyncHandler(async (req, res) => {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json(ApiResponse.error('Query is required', 400));
    }

    const results = await LyricsService.searchLyrics(q);
    res.json(ApiResponse.success(results, 'Lyrics search results'));
  })
);

/**
 * POST /api/lyrics/cache/clear
 * Clear lyrics cache
 */
router.post(
  '/cache/clear',
  asyncHandler(async (req, res) => {
    await LyricsService.clearCache();
    res.json(ApiResponse.success(null, 'Lyrics cache cleared'));
  })
);

export default router;
