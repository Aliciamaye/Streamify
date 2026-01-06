/**
 * Social Routes - Handle social interactions
 */

import express from 'express';
import SocialService from '../services/SocialService';
import { asyncHandler, ApiResponse } from '../utils/helpers';
import { authenticateToken, optionalAuth } from '../middleware/authMiddleware';
import { Logger } from '../utils/logger';

const router = express.Router();
const logger = new Logger('SocialRoutes');

/**
 * GET /api/social/profile/:userId
 * Get user profile
 */
router.get(
  '/profile/:userId',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const profile = await SocialService.getUserProfile(userId);
    res.json(ApiResponse.success(profile, 'Profile retrieved'));
  })
);

/**
 * PUT /api/social/profile
 * Update own profile
 */
router.put(
  '/profile',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = (req as any).user?.id;
    const updates = req.body;
    
    const profile = await SocialService.updateProfile(userId, updates);
    res.json(ApiResponse.success(profile, 'Profile updated'));
  })
);

/**
 * POST /api/social/follow/:userId
 * Follow a user
 */
router.post(
  '/follow/:userId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const followerId = (req as any).user?.id;
    const { userId } = req.params;
    
    const result = await SocialService.followUser(followerId, userId);
    res.json(ApiResponse.success(result, 'User followed'));
  })
);

/**
 * POST /api/social/unfollow/:userId
 * Unfollow a user
 */
router.post(
  '/unfollow/:userId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const followerId = (req as any).user?.id;
    const { userId } = req.params;
    
    const result = await SocialService.unfollowUser(followerId, userId);
    res.json(ApiResponse.success(result, 'User unfollowed'));
  })
);

/**
 * GET /api/social/followers
 * Get user's followers
 */
router.get(
  '/followers',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = (req as any).user?.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const followers = await SocialService.getFollowers(userId, limit, offset);
    res.json(ApiResponse.success(followers, 'Followers retrieved'));
  })
);

/**
 * GET /api/social/following
 * Get users that user is following
 */
router.get(
  '/following',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = (req as any).user?.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const following = await SocialService.getFollowing(userId, limit, offset);
    res.json(ApiResponse.success(following, 'Following retrieved'));
  })
);

/**
 * GET /api/social/is-following/:userId
 * Check if following a user
 */
router.get(
  '/is-following/:userId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const followerId = (req as any).user?.id;
    const { userId } = req.params;
    
    const isFollowing = await SocialService.isFollowing(followerId, userId);
    res.json(ApiResponse.success({ isFollowing }, 'Follow status retrieved'));
  })
);

/**
 * GET /api/social/suggestions
 * Get suggested users to follow
 */
router.get(
  '/suggestions',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = (req as any).user?.id;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const suggestions = await SocialService.getSuggestedUsers(userId, limit);
    res.json(ApiResponse.success(suggestions, 'Suggestions retrieved'));
  })
);

/**
 * GET /api/social/popular
 * Get popular users
 */
router.get(
  '/popular',
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const popular = await SocialService.getPopularUsers(limit);
    res.json(ApiResponse.success(popular, 'Popular users retrieved'));
  })
);

/**
 * GET /api/social/feed
 * Get activity feed from followed users
 */
router.get(
  '/feed',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = (req as any).user?.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const feed = await SocialService.getSocialFeed(userId, limit, offset);
    res.json(ApiResponse.success(feed, 'Feed retrieved'));
  })
);

/**
 * GET /api/social/activity/:userId
 * Get user's public activity
 */
router.get(
  '/activity/:userId',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const activity = await SocialService.getUserActivity(userId, limit, offset);
    res.json(ApiResponse.success(activity, 'Activity retrieved'));
  })
);

/**
 * POST /api/social/share
 * Share content
 */
router.post(
  '/share',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = (req as any).user?.id;
    const { type, itemId, platform, message } = req.body;
    
    if (!type || !itemId || !platform) {
      return res.status(400).json(ApiResponse.error('Missing required fields', 400));
    }
    
    const share = await SocialService.shareContent(userId, type, itemId, platform, message);
    res.json(ApiResponse.success(share, 'Content shared'));
  })
);

/**
 * GET /api/social/trending
 * Get trending activities
 */
router.get(
  '/trending',
  asyncHandler(async (req, res) => {
    const hours = parseInt(req.query.hours as string) || 24;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const trending = await SocialService.getTrendingActivities(hours, limit);
    res.json(ApiResponse.success(trending, 'Trending activities retrieved'));
  })
);

/**
 * GET /api/social/stats
 * Get own social statistics
 */
router.get(
  '/stats',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = (req as any).user?.id;
    const stats = await SocialService.getUserStats(userId);
    res.json(ApiResponse.success(stats, 'Stats retrieved'));
  })
);

/**
 * GET /api/social/search
 * Search users
 */
router.get(
  '/search',
  asyncHandler(async (req, res) => {
    const { q } = req.query;
    const limit = parseInt(req.query.limit as string) || 20;
    
    if (!q) {
      return res.status(400).json(ApiResponse.error('Search query required', 400));
    }
    
    const results = await SocialService.searchUsers(q as string, limit);
    res.json(ApiResponse.success(results, 'Search results'));
  })
);

/**
 * GET /api/social/mutual/:userId
 * Get mutual followers with another user
 */
router.get(
  '/mutual/:userId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId1 = (req as any).user?.id;
    const { userId } = req.params;
    
    const mutuals = await SocialService.getMutualFollowers(userId1, userId);
    res.json(ApiResponse.success(mutuals, 'Mutual followers retrieved'));
  })
);

export default router;
