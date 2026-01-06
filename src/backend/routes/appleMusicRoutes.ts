/**
 * Apple Music Routes
 */

import express from 'express';
import * as appleMusicController from '../controllers/appleMusicController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Connection management
router.get('/connect', appleMusicController.connect);
router.post('/token', appleMusicController.storeToken);
router.post('/disconnect', appleMusicController.disconnect);
router.get('/status', appleMusicController.status);

// Playlists
router.get('/playlists', appleMusicController.listPlaylists);
router.post('/playlists/:playlistId/import', appleMusicController.importPlaylist);
router.post('/playlists/:playlistId/import/async', appleMusicController.importPlaylistAsync);
router.post('/playlists/:playlistId/sync', appleMusicController.syncPlaylist);

// Job status
router.get('/jobs/:jobId', appleMusicController.jobStatus);

export default router;
