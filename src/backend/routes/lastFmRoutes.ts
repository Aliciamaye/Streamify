/**
 * Last.fm Routes
 */

import express from 'express';
import * as lastFmController from '../controllers/lastFmController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Connection management
router.get('/connect', lastFmController.connect);
router.post('/callback', lastFmController.callback);
router.get('/callback', lastFmController.callback);
router.post('/disconnect', lastFmController.disconnect);
router.get('/status', lastFmController.status);

// Scrobbling
router.post('/scrobble', lastFmController.scrobble);
router.post('/now-playing', lastFmController.updateNowPlaying);

// User data
router.get('/recent-tracks', lastFmController.getRecentTracks);
router.get('/top-tracks', lastFmController.getTopTracks);
router.get('/top-artists', lastFmController.getTopArtists);

// Recommendations
router.get('/similar-tracks', lastFmController.getSimilarTracks);

export default router;
