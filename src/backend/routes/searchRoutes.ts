/**
 * Search Routes
 * Provides lyrics search endpoint
 */

import express, { Request, Response } from 'express';
import { asyncHandler, ApiResponse } from '../utils/helpers';
import LyricsService from '../services/LyricsService';

const router = express.Router();

router.get(
  '/lyrics',
  asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json(ApiResponse.error('Query is required', 400));
    }

    const results = await LyricsService.searchLyrics(q);
    res.json(ApiResponse.success('Lyrics search results', results));
  })
);

export default router;
