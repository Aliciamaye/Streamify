/**
 * Music Routes
 */

import { Router } from 'express';
import * as musicController from '../controllers/musicController';
import { optionalAuth } from '../middleware/authMiddleware';

const router = Router();

// Music endpoints (public, but optionally authenticated)
router.get('/search', optionalAuth, musicController.searchMusic);
router.get('/trending', optionalAuth, musicController.getTrendingMusic);
router.get('/:videoId', optionalAuth, musicController.getMusicDetails);
router.get('/:videoId/stream', optionalAuth, musicController.getPlaybackUrl);
router.get('/artist/:channelId', optionalAuth, musicController.getArtist);
router.get('/album/:browseId', optionalAuth, musicController.getAlbum);

// Cache management
router.get('/cache/stats', musicController.getCacheStats);
router.post('/cache/clear', musicController.clearCache);

export default router;
