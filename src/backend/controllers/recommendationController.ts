/**
 * Recommendation Controller - Handle recommendation requests
 */

import { Request, Response } from 'express';
import RecommendationEngine from '../services/RecommendationEngine';
import { asyncHandler, ApiResponse } from '../utils/helpers';
import { Logger } from '../utils/logger';

const logger = new Logger('RecommendationController');

/**
 * Get personalized recommendations for user
 */
export const getPersonalizedRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const limit = parseInt(req.query.limit as string) || 20;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  const recommendations = await RecommendationEngine.getPersonalizedRecommendations(userId, limit);

  res.json(ApiResponse.success(recommendations, 'Personalized recommendations retrieved'));
});

/**
 * Get radio recommendations based on seed track
 */
export const getRadioRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const { seedTrackId } = req.params;
  const limit = parseInt(req.query.limit as string) || 50;

  if (!seedTrackId) {
    return res.status(400).json(ApiResponse.error('Seed track ID is required', 400));
  }

  const recommendations = await RecommendationEngine.getRadioRecommendations(seedTrackId, limit);

  res.json(ApiResponse.success(recommendations, 'Radio recommendations retrieved'));
});

/**
 * Track user listening behavior
 */
export const trackListening = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { trackId, completed, skipped, duration } = req.body;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  if (!trackId) {
    return res.status(400).json(ApiResponse.error('Track ID is required', 400));
  }

  RecommendationEngine.trackListening(
    userId,
    trackId,
    completed || false,
    skipped || false,
    duration || 0
  );

  res.json(ApiResponse.success(null, 'Listening tracked'));
});

/**
 * Add track to favorites
 */
export const addToFavorites = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { trackId } = req.body;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  if (!trackId) {
    return res.status(400).json(ApiResponse.error('Track ID is required', 400));
  }

  RecommendationEngine.addToFavorites(userId, trackId);

  res.json(ApiResponse.success(null, 'Added to favorites'));
});

/**
 * Register track for recommendations
 */
export const registerTrack = asyncHandler(async (req: Request, res: Response) => {
  const { videoId, title, artist, genre, mood, tempo } = req.body;

  if (!videoId || !title || !artist) {
    return res.status(400).json(ApiResponse.error('Missing required fields', 400));
  }

  RecommendationEngine.registerTrack({
    videoId,
    title,
    artist,
    genre,
    mood,
    tempo,
  });

  res.json(ApiResponse.success(null, 'Track registered'));
});

/**
 * Get user statistics
 */
export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  const stats = RecommendationEngine.getUserStats(userId);

  if (!stats) {
    return res.status(404).json(ApiResponse.error('User stats not found', 404));
  }

  res.json(ApiResponse.success(stats, 'User stats retrieved'));
});
