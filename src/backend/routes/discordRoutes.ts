/**
 * Discord Routes
 */

import express from 'express';
import * as discordController from '../controllers/discordController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Status and configuration
router.get('/status', discordController.status);
router.post('/webhook', discordController.storeWebhook);
router.delete('/webhook', discordController.removeWebhook);

// Rich Presence
router.post('/presence', discordController.updateNowPlaying);
router.delete('/presence', discordController.clearPresence);
router.get('/presence', discordController.getRichPresence);

// Sharing
router.post('/share/track', discordController.shareTrack);
router.post('/share/playlist', discordController.sharePlaylist);

export default router;
