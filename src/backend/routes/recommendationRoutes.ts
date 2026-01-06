/**
 * Recommendation Routes - Handle recommendation requests
 */

import express from 'express';
import {
  getPersonalizedRecommendations,
  getRadioRecommendations,
  trackListening,
  addToFavorites,
  registerTrack,
  getUserStats,
} from '../controllers/recommendationController';
import { authenticateToken, optionalAuth } from '../middleware/authMiddleware';

const router = express.Router();

// Get personalized recommendations (requires auth)
router.get('/personalized', authenticateToken, getPersonalizedRecommendations);

// Get radio recommendations (public)
router.get('/radio/:seedTrackId', optionalAuth, getRadioRecommendations);

// Track listening behavior (requires auth)
router.post('/track-listening', authenticateToken, trackListening);

// Add to favorites (requires auth)
router.post('/favorites', authenticateToken, addToFavorites);

// Register track (public)
router.post('/register-track', registerTrack);

// Get user stats (requires auth)
router.get('/stats', authenticateToken, getUserStats);

export default router;
