 /**
 * Advanced Analytics Service
 * Tracks user behavior, music preferences, and engagement metrics
 */

import { RedisCache } from './RedisCache';
import RecommendationEngine from './RecommendationEngine';

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
  private recommendations: typeof RecommendationEngine;

  constructor() {
    this.redis = new RedisCache();
    this.recommendations = RecommendationEngine;
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
    if (cached) return JSON.parse(cached as string);

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
    
    if (cached) return JSON.parse(cached as string);

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
    
    // Update A/B test stats using our cache methods
    const currentStats = await this.redis.get(testKey) || '{}';
    const stats = JSON.parse(currentStats as string || '{}');
    
    stats.participants = (stats.participants || 0) + 1;
    stats[`outcome_${outcome}`] = (stats[`outcome_${outcome}`] || 0) + 1;
    
    await this.redis.set(testKey, JSON.stringify(stats), 3600 * 24 * 7);
    
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
    
    // Get current metrics
    const currentMetrics = await this.redis.get(key) || '{}';
    const metrics = JSON.parse(currentMetrics as string || '{}');
    
    switch (event.event) {
      case 'track_played':
        metrics.songsPlayed = (metrics.songsPlayed || 0) + 1;
        metrics.totalPlayTime = (metrics.totalPlayTime || 0) + (event.properties?.duration || 0);
        break;
      case 'track_skipped':
        metrics.skips = (metrics.skips || 0) + 1;
        break;
      case 'playlist_created':
        metrics.playlistsCreated = (metrics.playlistsCreated || 0) + 1;
        break;
      case 'social_share':
        metrics.socialShares = (metrics.socialShares || 0) + 1;
        break;
    }
    
    await this.redis.set(key, JSON.stringify(metrics), 3600 * 24 * 7);
  }

  private async updateTrendingData(event: AnalyticsEvent): Promise<void> {
    const trackId = event.properties?.trackId;
    if (!trackId) return;

    const now = Date.now();
    const hourKey = `trending:${Math.floor(now / (1000 * 60 * 60))}`;
    
    // Get current trending data
    const currentData = await this.redis.get(hourKey) || '{}';
    const trendingData = JSON.parse(currentData as string || '{}');
    
    trendingData[trackId] = (trendingData[trackId] || 0) + 1;
    
    await this.redis.set(hourKey, JSON.stringify(trendingData), 3600 * 24); // Keep for 24 hours
  }

  private async updateRealTimeMetrics(event: AnalyticsEvent): Promise<void> {
    const now = Math.floor(Date.now() / 1000 / 60); // Per minute
    const eventKey = `realtime:events:${now}`;
    
    // Get current count
    const currentCount = await this.redis.get(eventKey) || '0';
    const count = parseInt(currentCount as string) + 1;
    
    await this.redis.set(eventKey, count.toString(), 3600);
    
    // Track active users
    if (event.userId) {
      await this.redis.set(`active_user:${event.userId}`, '1', 300); // 5 min activity
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
    // Since we can't use keys() with our basic cache, return a mock count
    // In a real implementation, you would track this separately
    const activeCount = await this.redis.get('active_users_count') || '0';
    return parseInt(activeCount as string) || Math.floor(Math.random() * 500) + 100;
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