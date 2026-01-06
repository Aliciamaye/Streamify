/**
 * Social Service - User interactions, following, and social features
 * Supports following artists/users, sharing, and social feed
 */

import { Logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import RealtimeService from './RealtimeService';

const logger = new Logger('SocialService');

export interface UserProfile {
  userId: string;
  username: string;
  displayName: string;
  bio?: string;
  profilePicture?: string;
  followers: string[]; // user IDs
  following: string[]; // user IDs
  publicPlaylists: string[]; // playlist IDs
  recentActivity: Activity[];
  stats: {
    totalPlays: number;
    totalPlaylists: number;
    totalFavorites: number;
    joinedDate: Date;
  };
}

export interface Activity {
  id: string;
  userId: string;
  type: 'play' | 'like' | 'playlist_create' | 'playlist_update' | 'follow' | 'share';
  timestamp: Date;
  data: any;
}

export interface Share {
  id: string;
  userId: string;
  type: 'track' | 'album' | 'playlist' | 'artist';
  itemId: string;
  message?: string;
  platform: string; // twitter, facebook, link
  timestamp: Date;
}

class SocialService {
  private userProfiles: Map<string, UserProfile> = new Map();
  private activities: Activity[] = [];
  private shares: Map<string, Share[]> = new Map(); // userId -> shares

  /**
   * Get or create user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    let profile = this.userProfiles.get(userId);

    if (!profile) {
      profile = {
        userId,
        username: `user_${userId.substring(0, 8)}`,
        displayName: 'Music Lover',
        followers: [],
        following: [],
        publicPlaylists: [],
        recentActivity: [],
        stats: {
          totalPlays: 0,
          totalPlaylists: 0,
          totalFavorites: 0,
          joinedDate: new Date(),
        },
      };

      this.userProfiles.set(userId, profile);
      logger.info(`Created profile for user: ${userId}`);
    }

    return profile;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: {
      username?: string;
      displayName?: string;
      bio?: string;
      profilePicture?: string;
    }
  ): Promise<UserProfile> {
    const profile = await this.getUserProfile(userId);

    if (updates.username) profile.username = updates.username;
    if (updates.displayName) profile.displayName = updates.displayName;
    if (updates.bio !== undefined) profile.bio = updates.bio;
    if (updates.profilePicture) profile.profilePicture = updates.profilePicture;

    logger.info(`Profile updated for user: ${userId}`);
    return profile;
  }

  /**
   * Follow user
   */
  async followUser(followerId: string, targetUserId: string): Promise<{ success: boolean; followersCount: number }> {
    if (followerId === targetUserId) {
      throw new Error('Cannot follow yourself');
    }

    const followerProfile = await this.getUserProfile(followerId);
    const targetProfile = await this.getUserProfile(targetUserId);

    // Check if already following
    if (followerProfile.following.includes(targetUserId)) {
      return { success: false, followersCount: targetProfile.followers.length };
    }

    // Add to following list
    followerProfile.following.push(targetUserId);

    // Add to target's followers
    targetProfile.followers.push(followerId);

    // Create activity
    await this.addActivity(followerId, 'follow', { targetUserId, targetUsername: targetProfile.username });

    RealtimeService.broadcast('social:follow', {
      followerId,
      targetUserId,
      targetUsername: targetProfile.username,
      followersCount: targetProfile.followers.length,
    });

    logger.info(`User ${followerId} followed ${targetUserId}`);
    return { success: true, followersCount: targetProfile.followers.length };
  }

  /**
   * Unfollow user
   */
  async unfollowUser(followerId: string, targetUserId: string): Promise<{ success: boolean; followersCount: number }> {
    const followerProfile = await this.getUserProfile(followerId);
    const targetProfile = await this.getUserProfile(targetUserId);

    // Remove from following list
    followerProfile.following = followerProfile.following.filter(id => id !== targetUserId);

    // Remove from target's followers
    targetProfile.followers = targetProfile.followers.filter(id => id !== followerId);

    RealtimeService.broadcast('social:unfollow', {
      followerId,
      targetUserId,
      followersCount: targetProfile.followers.length,
    });

    logger.info(`User ${followerId} unfollowed ${targetUserId}`);
    return { success: true, followersCount: targetProfile.followers.length };
  }

  /**
   * Get user's followers
   */
  async getFollowers(userId: string, limit: number = 50, offset: number = 0): Promise<UserProfile[]> {
    const profile = await this.getUserProfile(userId);
    const followerIds = profile.followers.slice(offset, offset + limit);

    const followers: UserProfile[] = [];
    for (const followerId of followerIds) {
      const followerProfile = await this.getUserProfile(followerId);
      followers.push(followerProfile);
    }

    return followers;
  }

  /**
   * Get users that user is following
   */
  async getFollowing(userId: string, limit: number = 50, offset: number = 0): Promise<UserProfile[]> {
    const profile = await this.getUserProfile(userId);
    const followingIds = profile.following.slice(offset, offset + limit);

    const following: UserProfile[] = [];
    for (const followingId of followingIds) {
      const followingProfile = await this.getUserProfile(followingId);
      following.push(followingProfile);
    }

    return following;
  }

  /**
   * Check if user follows another user
   */
  async isFollowing(followerId: string, targetUserId: string): Promise<boolean> {
    const profile = await this.getUserProfile(followerId);
    return profile.following.includes(targetUserId);
  }

  /**
   * Get suggested users to follow
   */
  async getSuggestedUsers(userId: string, limit: number = 10): Promise<UserProfile[]> {
    const userProfile = await this.getUserProfile(userId);
    const suggestions: UserProfile[] = [];

    // Get users followed by people you follow (friends of friends)
    const friendsOfFriends = new Set<string>();

    for (const followingId of userProfile.following) {
      const followingProfile = await this.getUserProfile(followingId);
      for (const theirFollowing of followingProfile.following) {
        if (theirFollowing !== userId && !userProfile.following.includes(theirFollowing)) {
          friendsOfFriends.add(theirFollowing);
        }
      }
    }

    // Convert to profiles
    for (const suggestedId of Array.from(friendsOfFriends).slice(0, limit)) {
      const profile = await this.getUserProfile(suggestedId);
      suggestions.push(profile);
    }

    // Fill with popular users if not enough suggestions
    if (suggestions.length < limit) {
      const popular = await this.getPopularUsers(limit - suggestions.length);
      suggestions.push(...popular.filter(p => p.userId !== userId && !userProfile.following.includes(p.userId)));
    }

    return suggestions.slice(0, limit);
  }

  /**
   * Get popular users (most followers)
   */
  async getPopularUsers(limit: number = 10): Promise<UserProfile[]> {
    const allProfiles = Array.from(this.userProfiles.values());
    return allProfiles
      .sort((a, b) => b.followers.length - a.followers.length)
      .slice(0, limit);
  }

  /**
   * Add activity
   */
  async addActivity(userId: string, type: Activity['type'], data: any): Promise<Activity> {
    const activity: Activity = {
      id: uuidv4(),
      userId,
      type,
      timestamp: new Date(),
      data,
    };

    this.activities.push(activity);

    // Add to user's recent activity
    const profile = await this.getUserProfile(userId);
    profile.recentActivity.unshift(activity);

    // Keep only last 100 activities per user
    if (profile.recentActivity.length > 100) {
      profile.recentActivity = profile.recentActivity.slice(0, 100);
    }

    // Keep global activities manageable
    if (this.activities.length > 10000) {
      this.activities = this.activities.slice(-10000);
    }

    logger.debug(`Activity added: ${type} by ${userId}`);
    return activity;
  }

  /**
   * Get user's activity feed
   */
  async getUserActivity(userId: string, limit: number = 20, offset: number = 0): Promise<Activity[]> {
    const profile = await this.getUserProfile(userId);
    return profile.recentActivity.slice(offset, offset + limit);
  }

  /**
   * Get social feed (activities from followed users)
   */
  async getSocialFeed(userId: string, limit: number = 50, offset: number = 0): Promise<Activity[]> {
    const profile = await this.getUserProfile(userId);
    const feedActivities: Activity[] = [];

    // Get activities from followed users
    for (const followingId of profile.following) {
      const followingProfile = await this.getUserProfile(followingId);
      feedActivities.push(...followingProfile.recentActivity);
    }

    // Sort by timestamp (most recent first)
    feedActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return feedActivities.slice(offset, offset + limit);
  }

  /**
   * Share content
   */
  async shareContent(
    userId: string,
    type: Share['type'],
    itemId: string,
    platform: string,
    message?: string
  ): Promise<Share> {
    const share: Share = {
      id: uuidv4(),
      userId,
      type,
      itemId,
      message,
      platform,
      timestamp: new Date(),
    };

    const userShares = this.shares.get(userId) || [];
    userShares.push(share);
    this.shares.set(userId, userShares);

    // Add to activity
    await this.addActivity(userId, 'share', {
      type,
      itemId,
      platform,
    });

    logger.info(`Content shared: ${type}/${itemId} by ${userId} on ${platform}`);
    return share;
  }

  /**
   * Get share link for content
   */
  getShareLink(type: string, itemId: string): string {
    const baseUrl = process.env.APP_URL || 'https://streamify.app';
    return `${baseUrl}/${type}/${itemId}`;
  }

  /**
   * Generate share text
   */
  generateShareText(type: string, itemName: string, artistName?: string): string {
    switch (type) {
      case 'track':
        return `🎵 Check out "${itemName}" by ${artistName} on Streamify!`;
      case 'album':
        return `💿 Check out the album "${itemName}" by ${artistName} on Streamify!`;
      case 'playlist':
        return `🎶 Check out my playlist "${itemName}" on Streamify!`;
      case 'artist':
        return `🎤 Check out ${itemName} on Streamify!`;
      default:
        return `Check this out on Streamify!`;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<any> {
    const profile = await this.getUserProfile(userId);

    // Calculate additional stats
    const playActivities = profile.recentActivity.filter(a => a.type === 'play');
    const likeActivities = profile.recentActivity.filter(a => a.type === 'like');

    return {
      ...profile.stats,
      followers: profile.followers.length,
      following: profile.following.length,
      recentPlays: playActivities.slice(0, 10),
      recentLikes: likeActivities.slice(0, 10),
      activityCount: profile.recentActivity.length,
    };
  }

  /**
   * Search users
   */
  async searchUsers(query: string, limit: number = 20): Promise<UserProfile[]> {
    const lowerQuery = query.toLowerCase();
    const results: UserProfile[] = [];

    for (const profile of this.userProfiles.values()) {
      if (
        profile.username.toLowerCase().includes(lowerQuery) ||
        profile.displayName.toLowerCase().includes(lowerQuery) ||
        (profile.bio && profile.bio.toLowerCase().includes(lowerQuery))
      ) {
        results.push(profile);
      }

      if (results.length >= limit) break;
    }

    return results.sort((a, b) => b.followers.length - a.followers.length);
  }

  /**
   * Get trending activities (popular content)
   */
  async getTrendingActivities(hours: number = 24, limit: number = 50): Promise<Activity[]> {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const recentActivities = this.activities.filter(a => a.timestamp >= cutoffTime);

    // Count occurrences of each item
    const itemCounts = new Map<string, number>();
    const activityMap = new Map<string, Activity>();

    for (const activity of recentActivities) {
      if (activity.type === 'play' || activity.type === 'like') {
        const key = `${activity.type}_${activity.data.videoId || activity.data.itemId}`;
        itemCounts.set(key, (itemCounts.get(key) || 0) + 1);
        activityMap.set(key, activity);
      }
    }

    // Sort by count and return
    const trending = Array.from(itemCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key]) => activityMap.get(key)!)
      .filter(a => a !== undefined);

    return trending;
  }

  /**
   * Get mutual followers
   */
  async getMutualFollowers(userId1: string, userId2: string): Promise<UserProfile[]> {
    const profile1 = await this.getUserProfile(userId1);
    const profile2 = await this.getUserProfile(userId2);

    const mutualIds = profile1.followers.filter(id => profile2.followers.includes(id));

    const mutuals: UserProfile[] = [];
    for (const id of mutualIds) {
      mutuals.push(await this.getUserProfile(id));
    }

    return mutuals;
  }

  /**
   * Update user stats
   */
  async updateStats(
    userId: string,
    updates: {
      totalPlays?: number;
      totalPlaylists?: number;
      totalFavorites?: number;
    }
  ): Promise<void> {
    const profile = await this.getUserProfile(userId);

    if (updates.totalPlays !== undefined) {
      profile.stats.totalPlays = updates.totalPlays;
    }
    if (updates.totalPlaylists !== undefined) {
      profile.stats.totalPlaylists = updates.totalPlaylists;
    }
    if (updates.totalFavorites !== undefined) {
      profile.stats.totalFavorites = updates.totalFavorites;
    }

    logger.debug(`Stats updated for user: ${userId}`);
  }

  /**
   * Increment user stat
   */
  async incrementStat(userId: string, stat: 'totalPlays' | 'totalPlaylists' | 'totalFavorites'): Promise<void> {
    const profile = await this.getUserProfile(userId);
    profile.stats[stat]++;
  }
}

export default new SocialService();
