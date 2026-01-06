/**
 * Recommendation Engine - AI-Powered Music Recommendations
 * Advanced recommendation algorithm using user behavior and similarity analysis
 */

import { Logger } from '../utils/logger';
import { musicCache } from '../utils/cache';

const logger = new Logger('RecommendationEngine');

interface Track {
  videoId: string;
  title: string;
  artist: string;
  genre?: string;
  mood?: string;
  tempo?: number;
}

interface UserBehavior {
  userId: string;
  listeningHistory: string[]; // videoIds
  favorites: string[];
  skipped: string[];
  completedTracks: string[];
  genres: Map<string, number>; // genre -> play count
  artists: Map<string, number>; // artist -> play count
  timeOfDay: Map<string, number>; // hour -> play count
  sessionLength: number[];
}

class RecommendationEngine {
  private userBehaviors: Map<string, UserBehavior> = new Map();
  private trackFeatures: Map<string, Track> = new Map();
  private similarityMatrix: Map<string, Map<string, number>> = new Map();

  /**
   * Get personalized recommendations for user
   */
  async getPersonalizedRecommendations(
    userId: string,
    limit: number = 20
  ): Promise<Track[]> {
    logger.info(`Generating recommendations for user: ${userId}`);

    const behavior = this.userBehaviors.get(userId);
    if (!behavior || behavior.listeningHistory.length < 5) {
      // Not enough data, return trending
      return this.getTrendingRecommendations(limit);
    }

    const recommendations: Track[] = [];
    const scores: Map<string, number> = new Map();

    // 1. Collaborative filtering - Similar users
    const similarUsers = this.findSimilarUsers(userId, 10);
    for (const similarUserId of similarUsers) {
      const similarBehavior = this.userBehaviors.get(similarUserId);
      if (similarBehavior) {
        for (const trackId of similarBehavior.favorites) {
          if (!behavior.listeningHistory.includes(trackId)) {
            scores.set(trackId, (scores.get(trackId) || 0) + 0.3);
          }
        }
      }
    }

    // 2. Content-based filtering - Similar tracks
    const recentTracks = behavior.listeningHistory.slice(-10);
    for (const trackId of recentTracks) {
      const similarTracks = this.findSimilarTracks(trackId, 5);
      for (const [similarId, similarity] of similarTracks) {
        if (!behavior.listeningHistory.includes(similarId)) {
          scores.set(similarId, (scores.get(similarId) || 0) + similarity * 0.4);
        }
      }
    }

    // 3. Genre-based recommendations
    const topGenres = this.getTopGenres(behavior, 3);
    for (const genre of topGenres) {
      const genreTracks = this.getTracksByGenre(genre, 10);
      for (const track of genreTracks) {
        if (!behavior.listeningHistory.includes(track.videoId)) {
          scores.set(track.videoId, (scores.get(track.videoId) || 0) + 0.2);
        }
      }
    }

    // 4. Artist-based recommendations
    const topArtists = this.getTopArtists(behavior, 3);
    for (const artist of topArtists) {
      const artistTracks = this.getTracksByArtist(artist, 5);
      for (const track of artistTracks) {
        if (!behavior.listeningHistory.includes(track.videoId)) {
          scores.set(track.videoId, (scores.get(track.videoId) || 0) + 0.15);
        }
      }
    }

    // 5. Time-of-day patterns
    const currentHour = new Date().getHours();
    const timePreferences = behavior.timeOfDay.get(currentHour.toString()) || 0;
    if (timePreferences > 5) {
      // User has patterns for this time
      const timeTracks = this.getTracksForTimeOfDay(userId, currentHour, 5);
      for (const track of timeTracks) {
        scores.set(track.videoId, (scores.get(track.videoId) || 0) + 0.1);
      }
    }

    // 6. Mood-based recommendations
    const mood = this.detectUserMood(behavior);
    const moodTracks = this.getTracksByMood(mood, 10);
    for (const track of moodTracks) {
      if (!behavior.listeningHistory.includes(track.videoId)) {
        scores.set(track.videoId, (scores.get(track.videoId) || 0) + 0.15);
      }
    }

    // Sort by score and convert to tracks
    const sortedIds = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    for (const trackId of sortedIds) {
      const track = this.trackFeatures.get(trackId);
      if (track) {
        recommendations.push(track);
      }
    }

    // Fill with trending if not enough recommendations
    if (recommendations.length < limit) {
      const trending = await this.getTrendingRecommendations(limit - recommendations.length);
      recommendations.push(...trending);
    }

    logger.info(`Generated ${recommendations.length} personalized recommendations`);
    return recommendations.slice(0, limit);
  }

  /**
   * Get recommendations based on seed track
   */
  async getRadioRecommendations(seedTrackId: string, limit: number = 50): Promise<Track[]> {
    logger.info(`Generating radio for seed: ${seedTrackId}`);

    const recommendations: Track[] = [];
    const seedTrack = this.trackFeatures.get(seedTrackId);

    if (!seedTrack) {
      return this.getTrendingRecommendations(limit);
    }

    // Find similar tracks
    const similarTracks = this.findSimilarTracks(seedTrackId, limit * 2);
    
    // Mix similar tracks with some variety
    let similarCount = 0;
    let varietyCount = 0;
    const maxVariety = Math.floor(limit * 0.3); // 30% variety

    for (const [trackId, similarity] of similarTracks) {
      const track = this.trackFeatures.get(trackId);
      if (!track) continue;

      if (similarity > 0.7) {
        // Very similar tracks
        recommendations.push(track);
        similarCount++;
      } else if (varietyCount < maxVariety && Math.random() > 0.5) {
        // Add some variety
        recommendations.push(track);
        varietyCount++;
      }

      if (recommendations.length >= limit) break;
    }

    logger.info(`Generated radio: ${recommendations.length} tracks`);
    return recommendations;
  }

  /**
   * Track user behavior
   */
  trackListening(
    userId: string,
    trackId: string,
    completed: boolean,
    skipped: boolean,
    duration: number
  ): void {
    let behavior = this.userBehaviors.get(userId);

    if (!behavior) {
      behavior = {
        userId,
        listeningHistory: [],
        favorites: [],
        skipped: [],
        completedTracks: [],
        genres: new Map(),
        artists: new Map(),
        timeOfDay: new Map(),
        sessionLength: [],
      };
      this.userBehaviors.set(userId, behavior);
    }

    // Add to history
    behavior.listeningHistory.push(trackId);
    if (behavior.listeningHistory.length > 1000) {
      behavior.listeningHistory = behavior.listeningHistory.slice(-1000); // Keep last 1000
    }

    // Track completion
    if (completed) {
      behavior.completedTracks.push(trackId);
    }

    // Track skips
    if (skipped) {
      behavior.skipped.push(trackId);
    }

    // Track time of day
    const hour = new Date().getHours().toString();
    behavior.timeOfDay.set(hour, (behavior.timeOfDay.get(hour) || 0) + 1);

    // Update track features
    const track = this.trackFeatures.get(trackId);
    if (track) {
      // Update genre count
      if (track.genre) {
        behavior.genres.set(track.genre, (behavior.genres.get(track.genre) || 0) + 1);
      }

      // Update artist count
      behavior.artists.set(track.artist, (behavior.artists.get(track.artist) || 0) + 1);
    }

    logger.debug(`Tracked listening for user ${userId}: ${trackId}`);
  }

  /**
   * Add track to favorites
   */
  addToFavorites(userId: string, trackId: string): void {
    const behavior = this.userBehaviors.get(userId);
    if (behavior && !behavior.favorites.includes(trackId)) {
      behavior.favorites.push(trackId);
      logger.debug(`Added to favorites: ${trackId}`);
    }
  }

  /**
   * Register track features
   */
  registerTrack(track: Track): void {
    this.trackFeatures.set(track.videoId, track);
  }

  // ==================== PRIVATE METHODS ====================

  private findSimilarUsers(userId: string, limit: number): string[] {
    const userBehavior = this.userBehaviors.get(userId);
    if (!userBehavior) return [];

    const similarities: Array<[string, number]> = [];

    for (const [otherUserId, otherBehavior] of this.userBehaviors) {
      if (otherUserId === userId) continue;

      const similarity = this.calculateUserSimilarity(userBehavior, otherBehavior);
      similarities.push([otherUserId, similarity]);
    }

    return similarities
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);
  }

  private calculateUserSimilarity(user1: UserBehavior, user2: UserBehavior): number {
    let similarity = 0;

    // Jaccard similarity on listening history
    const set1 = new Set(user1.listeningHistory);
    const set2 = new Set(user2.listeningHistory);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    if (union.size > 0) {
      similarity += (intersection.size / union.size) * 0.5;
    }

    // Genre overlap
    const genreOverlap = this.calculateMapOverlap(user1.genres, user2.genres);
    similarity += genreOverlap * 0.3;

    // Artist overlap
    const artistOverlap = this.calculateMapOverlap(user1.artists, user2.artists);
    similarity += artistOverlap * 0.2;

    return similarity;
  }

  private calculateMapOverlap(map1: Map<string, number>, map2: Map<string, number>): number {
    let overlap = 0;
    let total = 0;

    for (const [key, count1] of map1) {
      const count2 = map2.get(key) || 0;
      overlap += Math.min(count1, count2);
      total += Math.max(count1, count2);
    }

    for (const [key, count2] of map2) {
      if (!map1.has(key)) {
        total += count2;
      }
    }

    return total > 0 ? overlap / total : 0;
  }

  private findSimilarTracks(trackId: string, limit: number): Array<[string, number]> {
    const similarities = this.similarityMatrix.get(trackId);
    if (!similarities) return [];

    return Array.from(similarities.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  }

  private getTopGenres(behavior: UserBehavior, limit: number): string[] {
    return Array.from(behavior.genres.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([genre]) => genre);
  }

  private getTopArtists(behavior: UserBehavior, limit: number): string[] {
    return Array.from(behavior.artists.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([artist]) => artist);
  }

  private getTracksByGenre(genre: string, limit: number): Track[] {
    const tracks: Track[] = [];
    for (const track of this.trackFeatures.values()) {
      if (track.genre === genre) {
        tracks.push(track);
        if (tracks.length >= limit) break;
      }
    }
    return tracks;
  }

  private getTracksByArtist(artist: string, limit: number): Track[] {
    const tracks: Track[] = [];
    for (const track of this.trackFeatures.values()) {
      if (track.artist === artist) {
        tracks.push(track);
        if (tracks.length >= limit) break;
      }
    }
    return tracks;
  }

  private getTracksForTimeOfDay(userId: string, hour: number, limit: number): Track[] {
    // Find tracks user listened to at this hour
    const behavior = this.userBehaviors.get(userId);
    if (!behavior) return [];

    const tracks: Track[] = [];
    // Simplified: return random tracks from history
    const historyTracks = behavior.listeningHistory
      .slice(-50)
      .map(id => this.trackFeatures.get(id))
      .filter(t => t !== undefined) as Track[];

    return historyTracks.slice(0, limit);
  }

  private detectUserMood(behavior: UserBehavior): string {
    // Simplified mood detection
    const recentSkips = behavior.skipped.slice(-10).length;
    const recentCompleted = behavior.completedTracks.slice(-10).length;

    if (recentCompleted > recentSkips * 2) {
      return 'happy';
    } else if (recentSkips > recentCompleted) {
      return 'searching';
    }

    return 'neutral';
  }

  private getTracksByMood(mood: string, limit: number): Track[] {
    // Simplified: return tracks based on mood
    const tracks: Track[] = [];
    for (const track of this.trackFeatures.values()) {
      if (track.mood === mood || !track.mood) {
        tracks.push(track);
        if (tracks.length >= limit) break;
      }
    }
    return tracks;
  }

  private async getTrendingRecommendations(limit: number): Promise<Track[]> {
    // Fallback to trending tracks
    return Array.from(this.trackFeatures.values()).slice(0, limit);
  }

  /**
   * Calculate track similarity matrix (run periodically)
   */
  calculateSimilarityMatrix(): void {
    logger.info('Calculating track similarity matrix...');

    const tracks = Array.from(this.trackFeatures.values());

    for (let i = 0; i < tracks.length; i++) {
      const track1 = tracks[i];
      const similarities = new Map<string, number>();

      for (let j = 0; j < tracks.length; j++) {
        if (i === j) continue;

        const track2 = tracks[j];
        const similarity = this.calculateTrackSimilarity(track1, track2);

        if (similarity > 0.3) {
          // Only store significant similarities
          similarities.set(track2.videoId, similarity);
        }
      }

      this.similarityMatrix.set(track1.videoId, similarities);
    }

    logger.info(`Similarity matrix calculated for ${tracks.length} tracks`);
  }

  private calculateTrackSimilarity(track1: Track, track2: Track): number {
    let similarity = 0;

    // Same artist - very similar
    if (track1.artist === track2.artist) {
      similarity += 0.5;
    }

    // Same genre
    if (track1.genre && track2.genre && track1.genre === track2.genre) {
      similarity += 0.3;
    }

    // Similar tempo
    if (track1.tempo && track2.tempo) {
      const tempoDiff = Math.abs(track1.tempo - track2.tempo);
      if (tempoDiff < 20) {
        similarity += 0.2 * (1 - tempoDiff / 20);
      }
    }

    return Math.min(similarity, 1.0);
  }

  /**
   * Get user statistics
   */
  getUserStats(userId: string) {
    const behavior = this.userBehaviors.get(userId);
    if (!behavior) return null;

    return {
      totalListens: behavior.listeningHistory.length,
      totalFavorites: behavior.favorites.length,
      topGenres: this.getTopGenres(behavior, 5),
      topArtists: this.getTopArtists(behavior, 5),
      completionRate: behavior.completedTracks.length / Math.max(behavior.listeningHistory.length, 1),
      skipRate: behavior.skipped.length / Math.max(behavior.listeningHistory.length, 1),
    };
  }
}

export default new RecommendationEngine();
