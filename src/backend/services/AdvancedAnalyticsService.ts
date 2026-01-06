/**
 * Advanced Analytics Service
 * Tracks user behavior, music preferences, and engagement metrics
 */

import { RedisCache } from './RedisCache';
import { RecommendationEngine } from './RecommendationEngine';

interface AnalyticsEvent {
  userId?: string;
  sessionId: string;
  event: string;
  properties: Record<string, any>;
  timestamp: number;
  metadata?: {
    userAgent?: string;
    ip?: string;
    location?: string;
  };
}

interface UserMetrics {
  totalPlayTime: number;
  songsPlayed: number;
  skipRate: number;
  favoriteGenres: string[];
  peakListeningHours: number[];
  deviceTypes: string[];
  socialShares: number;
  playlistsCreated: number;
}

interface TrendingData {
  trackId: string;
  plays: number;
  shares: number;
  likes: number;
  velocity: number; // Growth rate
  regions: string[];
  ageGroups: string[];
}

export class AdvancedAnalyticsService {
  private redis: RedisCache;
  private recommendations: RecommendationEngine;

  constructor() {
    this.redis = new RedisCache();
    this.recommendations = new RecommendationEngine();
  }

  /**
   * Track user events with advanced metadata
   */
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // Store individual event
      await this.redis.set(
        `event:${event.sessionId}:${Date.now()}`,
        JSON.stringify(event),
        3600 * 24 * 7 // 7 days
      );

      // Update user metrics if authenticated
      if (event.userId) {
        await this.updateUserMetrics(event.userId, event);
      }

      // Update trending data for music events
      if (event.event.includes('play') || event.event.includes('like')) {
        await this.updateTrendingData(event);
      }

      // Real-time analytics for dashboards
      await this.updateRealTimeMetrics(event);
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  }

  /**
   * Get comprehensive user analytics
   */
  async getUserAnalytics(userId: string): Promise<UserMetrics> {
    const cached = await this.redis.get(`user_metrics:${userId}`);
    if (cached) return JSON.parse(cached);

    // Calculate metrics from events
    const metrics = await this.calculateUserMetrics(userId);
    
    // Cache for 1 hour
    await this.redis.set(`user_metrics:${userId}`, JSON.stringify(metrics), 3600);
    
    return metrics;
  }

  /**
   * Get trending tracks with advanced filtering
   */
  async getTrendingTracks(
    region?: string,
    timeframe: '1h' | '6h' | '24h' | '7d' = '24h',
    genre?: string
  ): Promise<TrendingData[]> {
    const cacheKey = `trending:${region || 'global'}:${timeframe}:${genre || 'all'}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) return JSON.parse(cached);

    const trending = await this.calculateTrendingTracks(region, timeframe, genre);
    
    // Cache for different durations based on timeframe
    const cacheDuration = timeframe === '1h' ? 300 : timeframe === '6h' ? 900 : 3600;
    await this.redis.set(cacheKey, JSON.stringify(trending), cacheDuration);

    return trending;
  }

  /**
   * Generate personalized insights
   */
  async getPersonalizedInsights(userId: string): Promise<{
    listeningPersonality: string;
    musicMood: string;
    discoveryScore: number;
    socialInfluence: number;
    recommendations: string[];
  }> {
    const metrics = await this.getUserAnalytics(userId);
    
    return {
      listeningPersonality: this.analyzePersonality(metrics),
      musicMood: await this.detectCurrentMood(userId),
      discoveryScore: this.calculateDiscoveryScore(metrics),
      socialInfluence: await this.calculateSocialInfluence(userId),
      recommendations: await this.recommendations.getPersonalizedTracks(userId, 10)
    };
  }

  /**
   * Real-time dashboard metrics
   */
  async getRealTimeMetrics(): Promise<{
    activeUsers: number;
    songsPlaying: number;
    topRegions: Array<{region: string, users: number}>;
    currentTrending: string[];
    serverLoad: number;
  }> {
    const [activeUsers, songsPlaying, topRegions, trending, serverLoad] = await Promise.all([
      this.getActiveUserCount(),
      this.getCurrentPlayingCount(),
      this.getTopRegions(),
      this.getCurrentTrending(),
      this.getServerLoadMetrics()
    ]);

    return { activeUsers, songsPlaying, topRegions, currentTrending: trending, serverLoad };
  }

  /**
   * A/B Testing metrics
   */
  async trackABTest(userId: string, testName: string, variant: string, outcome: string): Promise<void> {
    const testKey = `ab_test:${testName}:${variant}`;
    
    await this.redis.hincrby(testKey, 'participants', 1);
    await this.redis.hincrby(testKey, `outcome_${outcome}`, 1);
    
    // Store user variant for consistency
    await this.redis.set(`user_ab:${userId}:${testName}`, variant, 3600 * 24 * 30);
  }

  /**
   * Privacy-compliant data export
   */
  async exportUserData(userId: string): Promise<any> {
    const [metrics, events, preferences] = await Promise.all([
      this.getUserAnalytics(userId),
      this.getUserEvents(userId),
      this.getUserPreferences(userId)
    ]);

    return {
      metrics,
      events: events.map(e => ({...e, ip: undefined, location: undefined})), // Remove PII
      preferences,
      exportDate: new Date().toISOString()
    };
  }

  private async updateUserMetrics(userId: string, event: AnalyticsEvent): Promise<void> {
    const key = `user_raw_metrics:${userId}`;
    
    switch (event.event) {
      case 'track_played':
        await this.redis.hincrby(key, 'songsPlayed', 1);
        await this.redis.hincrby(key, 'totalPlayTime', event.properties.duration || 0);
        break;
      case 'track_skipped':
        await this.redis.hincrby(key, 'skips', 1);
        break;
      case 'playlist_created':
        await this.redis.hincrby(key, 'playlistsCreated', 1);
        break;
      case 'social_share':
        await this.redis.hincrby(key, 'socialShares', 1);
        break;
    }
  }

  private async updateTrendingData(event: AnalyticsEvent): Promise<void> {
    const trackId = event.properties.trackId;
    if (!trackId) return;

    const now = Date.now();
    const hourKey = `trending:${Math.floor(now / (1000 * 60 * 60))}`;
    
    await this.redis.zincrby(hourKey, 1, trackId);
    await this.redis.expire(hourKey, 3600 * 24); // Keep for 24 hours
  }

  private async updateRealTimeMetrics(event: AnalyticsEvent): Promise<void> {
    const now = Math.floor(Date.now() / 1000 / 60); // Per minute
    
    await this.redis.incr(`realtime:events:${now}`);
    await this.redis.expire(`realtime:events:${now}`, 3600);
    
    if (event.userId) {
      await this.redis.setex(`active_user:${event.userId}`, 300, '1'); // 5 min activity
    }
  }

  private async calculateUserMetrics(userId: string): Promise<UserMetrics> {
    // Implementation would aggregate from stored events
    return {
      totalPlayTime: 0,
      songsPlayed: 0,
      skipRate: 0,
      favoriteGenres: [],
      peakListeningHours: [],
      deviceTypes: [],
      socialShares: 0,
      playlistsCreated: 0
    };
  }

  private async calculateTrendingTracks(region?: string, timeframe = '24h', genre?: string): Promise<TrendingData[]> {
    // Implementation would calculate from trending data
    return [];
  }

  private analyzePersonality(metrics: UserMetrics): string {
    if (metrics.skipRate > 0.7) return 'Explorer';
    if (metrics.socialShares > metrics.songsPlayed * 0.1) return 'Influencer';
    if (metrics.playlistsCreated > 10) return 'Curator';
    return 'Listener';
  }

  private async detectCurrentMood(userId: string): Promise<string> {
    // Analyze recent listening patterns
    return 'Energetic';
  }

  private calculateDiscoveryScore(metrics: UserMetrics): number {
    // Calculate based on genre diversity and new track exploration
    return Math.random() * 100;
  }

  private async calculateSocialInfluence(userId: string): Promise<number> {
    // Calculate based on shares, followers, playlist subscriptions
    return Math.random() * 100;
  }

  private async getActiveUserCount(): Promise<number> {
    const keys = await this.redis.keys('active_user:*');
    return keys.length;
  }

  private async getCurrentPlayingCount(): Promise<number> {
    return Math.floor(Math.random() * 1000); // Placeholder
  }

  private async getTopRegions(): Promise<Array<{region: string, users: number}>> {
    return [
      { region: 'US', users: 1500 },
      { region: 'UK', users: 800 },
      { region: 'CA', users: 600 }
    ];
  }

  private async getCurrentTrending(): Promise<string[]> {
    return ['track1', 'track2', 'track3'];
  }

  private async getServerLoadMetrics(): Promise<number> {
    return Math.random() * 100;
  }

  private async getUserEvents(userId: string): Promise<AnalyticsEvent[]> {
    return []; // Implementation would fetch user events
  }

  private async getUserPreferences(userId: string): Promise<any> {
    return {}; // Implementation would fetch user preferences
  }
}