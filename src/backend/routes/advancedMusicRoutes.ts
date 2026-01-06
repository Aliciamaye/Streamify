/**
 * Advanced Music Routes
 * Production-grade endpoints with reverse engineered YouTube Music API
 */

import express from 'express';
import * as advancedMusicController from '../controllers/advancedMusicController';
import { optionalAuth } from '../middleware/authMiddleware';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many search requests, please try again later',
});

const streamLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100, // 100 streams per minute
  message: 'Too many streaming requests, please try again later',
});

/**
 * @route   GET /api/music/v2/search
 * @desc    Search for music tracks
 * @query   q (required) - Search query
 * @query   limit (optional) - Number of results (default: 20, max: 100)
 * @access  Public
 */
router.get('/search', searchLimiter, optionalAuth, advancedMusicController.searchMusic);

/**
 * @route   GET /api/music/v2/trending
 * @desc    Get trending music tracks
 * @query   limit (optional) - Number of results (default: 50, max: 200)
 * @access  Public
 */
router.get('/trending', optionalAuth, advancedMusicController.getTrending);

/**
 * @route   GET /api/music/v2/track/:videoId
 * @desc    Get track details
 * @param   videoId - YouTube video ID
 * @access  Public
 */
router.get('/track/:videoId', optionalAuth, advancedMusicController.getTrackDetails);

/**
 * @route   GET /api/music/v2/playback/:videoId
 * @desc    Get playback streams for a track
 * @param   videoId - YouTube video ID
 * @query   quality (optional) - highest|high|medium|low (default: high)
 * @access  Public
 */
router.get('/playback/:videoId', optionalAuth, advancedMusicController.getPlaybackStreams);

/**
 * @route   GET /api/music/v2/stream/:videoId
 * @desc    Proxy stream with range support
 * @param   videoId - YouTube video ID
 * @query   quality (optional) - highest|high|medium|low (default: high)
 * @access  Public
 * @note    Supports HTTP range requests for seeking
 */
router.get('/stream/:videoId', streamLimiter, advancedMusicController.streamProxy);

/**
 * @route   GET /api/music/v2/artist/:browseId
 * @desc    Get artist information and tracks
 * @param   browseId - YouTube browse ID
 * @access  Public
 */
router.get('/artist/:browseId', optionalAuth, advancedMusicController.getArtist);

/**
 * @route   GET /api/music/v2/health
 * @desc    Music engine health check
 * @access  Public
 */
router.get('/health', advancedMusicController.healthCheck);

export default router;
