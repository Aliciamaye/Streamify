/**
 * Playlist Service - Advanced Playlist Management
 * Supports creating, editing, sharing, and collaborative playlists
 */

import { Logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const logger = new Logger('PlaylistService');

export interface PlaylistTrack {
  videoId: string;
  title: string;
  artist: string;
  duration: number;
  thumbnail: string;
  addedBy: string;
  addedAt: Date;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  tracks: PlaylistTrack[];
  isPublic: boolean;
  isCollaborative: boolean;
  collaborators: string[]; // user IDs
  coverImage?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  followers: string[]; // user IDs following this playlist
  playCount: number;
  likeCount: number;
}

export interface SmartPlaylistCriteria {
  genres?: string[];
  artists?: string[];
  minDuration?: number;
  maxDuration?: number;
  mood?: string;
  tempo?: string;
  yearRange?: [number, number];
  excludeExplicit?: boolean;
  maxTracks?: number;
}

class PlaylistService {
  private playlists: Map<string, Playlist> = new Map();
  private userPlaylists: Map<string, string[]> = new Map(); // userId -> playlist IDs

  /**
   * Create a new playlist
   */
  async createPlaylist(
    userId: string,
    name: string,
    description: string = '',
    isPublic: boolean = false,
    isCollaborative: boolean = false
  ): Promise<Playlist> {
    logger.info(`Creating playlist "${name}" for user: ${userId}`);

    const playlist: Playlist = {
      id: uuidv4(),
      name,
      description,
      ownerId: userId,
      tracks: [],
      isPublic,
      isCollaborative,
      collaborators: [],
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      followers: [],
      playCount: 0,
      likeCount: 0,
    };

    this.playlists.set(playlist.id, playlist);

    // Add to user's playlists
    const userPlaylistIds = this.userPlaylists.get(userId) || [];
    userPlaylistIds.push(playlist.id);
    this.userPlaylists.set(userId, userPlaylistIds);

    logger.info(`Playlist created: ${playlist.id}`);
    return playlist;
  }

  /**
   * Get playlist by ID
   */
  async getPlaylist(playlistId: string, userId?: string): Promise<Playlist | null> {
    const playlist = this.playlists.get(playlistId);

    if (!playlist) {
      return null;
    }

    // Check permissions
    if (!playlist.isPublic && playlist.ownerId !== userId && !playlist.collaborators.includes(userId || '')) {
      logger.warn(`User ${userId} tried to access private playlist: ${playlistId}`);
      return null;
    }

    return playlist;
  }

  /**
   * Get user's playlists
   */
  async getUserPlaylists(userId: string): Promise<Playlist[]> {
    const playlistIds = this.userPlaylists.get(userId) || [];
    const playlists: Playlist[] = [];

    for (const id of playlistIds) {
      const playlist = this.playlists.get(id);
      if (playlist) {
        playlists.push(playlist);
      }
    }

    // Add collaborated playlists
    for (const playlist of this.playlists.values()) {
      if (playlist.collaborators.includes(userId) && !playlistIds.includes(playlist.id)) {
        playlists.push(playlist);
      }
    }

    return playlists.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  /**
   * Update playlist metadata
   */
  async updatePlaylist(
    playlistId: string,
    userId: string,
    updates: {
      name?: string;
      description?: string;
      isPublic?: boolean;
      isCollaborative?: boolean;
      coverImage?: string;
      tags?: string[];
    }
  ): Promise<Playlist | null> {
    const playlist = this.playlists.get(playlistId);

    if (!playlist) {
      return null;
    }

    // Only owner can update
    if (playlist.ownerId !== userId) {
      logger.warn(`User ${userId} tried to update playlist they don't own: ${playlistId}`);
      return null;
    }

    // Apply updates
    if (updates.name) playlist.name = updates.name;
    if (updates.description !== undefined) playlist.description = updates.description;
    if (updates.isPublic !== undefined) playlist.isPublic = updates.isPublic;
    if (updates.isCollaborative !== undefined) playlist.isCollaborative = updates.isCollaborative;
    if (updates.coverImage) playlist.coverImage = updates.coverImage;
    if (updates.tags) playlist.tags = updates.tags;

    playlist.updatedAt = new Date();

    logger.info(`Playlist updated: ${playlistId}`);
    return playlist;
  }

  /**
   * Delete playlist
   */
  async deletePlaylist(playlistId: string, userId: string): Promise<boolean> {
    const playlist = this.playlists.get(playlistId);

    if (!playlist) {
      return false;
    }

    // Only owner can delete
    if (playlist.ownerId !== userId) {
      logger.warn(`User ${userId} tried to delete playlist they don't own: ${playlistId}`);
      return false;
    }

    this.playlists.delete(playlistId);

    // Remove from user's playlists
    const userPlaylistIds = this.userPlaylists.get(userId) || [];
    this.userPlaylists.set(
      userId,
      userPlaylistIds.filter(id => id !== playlistId)
    );

    logger.info(`Playlist deleted: ${playlistId}`);
    return true;
  }

  /**
   * Add track to playlist
   */
  async addTrack(
    playlistId: string,
    userId: string,
    track: {
      videoId: string;
      title: string;
      artist: string;
      duration: number;
      thumbnail: string;
    }
  ): Promise<Playlist | null> {
    const playlist = this.playlists.get(playlistId);

    if (!playlist) {
      return null;
    }

    // Check permissions
    if (playlist.ownerId !== userId && !playlist.collaborators.includes(userId)) {
      logger.warn(`User ${userId} tried to add track to playlist without permission: ${playlistId}`);
      return null;
    }

    // Check if track already exists
    if (playlist.tracks.some(t => t.videoId === track.videoId)) {
      logger.warn(`Track ${track.videoId} already exists in playlist: ${playlistId}`);
      return playlist;
    }

    const playlistTrack: PlaylistTrack = {
      ...track,
      addedBy: userId,
      addedAt: new Date(),
    };

    playlist.tracks.push(playlistTrack);
    playlist.updatedAt = new Date();

    logger.info(`Track added to playlist ${playlistId}: ${track.videoId}`);
    return playlist;
  }

  /**
   * Remove track from playlist
   */
  async removeTrack(playlistId: string, userId: string, videoId: string): Promise<Playlist | null> {
    const playlist = this.playlists.get(playlistId);

    if (!playlist) {
      return null;
    }

    // Check permissions
    const track = playlist.tracks.find(t => t.videoId === videoId);
    if (!track) {
      return playlist;
    }

    // Owner, collaborator, or the person who added the track can remove it
    if (
      playlist.ownerId !== userId &&
      !playlist.collaborators.includes(userId) &&
      track.addedBy !== userId
    ) {
      logger.warn(`User ${userId} tried to remove track from playlist without permission: ${playlistId}`);
      return null;
    }

    playlist.tracks = playlist.tracks.filter(t => t.videoId !== videoId);
    playlist.updatedAt = new Date();

    logger.info(`Track removed from playlist ${playlistId}: ${videoId}`);
    return playlist;
  }

  /**
   * Reorder tracks in playlist
   */
  async reorderTracks(
    playlistId: string,
    userId: string,
    fromIndex: number,
    toIndex: number
  ): Promise<Playlist | null> {
    const playlist = this.playlists.get(playlistId);

    if (!playlist) {
      return null;
    }

    // Check permissions
    if (playlist.ownerId !== userId && !playlist.collaborators.includes(userId)) {
      logger.warn(`User ${userId} tried to reorder playlist without permission: ${playlistId}`);
      return null;
    }

    if (fromIndex < 0 || fromIndex >= playlist.tracks.length || toIndex < 0 || toIndex >= playlist.tracks.length) {
      return null;
    }

    const [track] = playlist.tracks.splice(fromIndex, 1);
    playlist.tracks.splice(toIndex, 0, track);
    playlist.updatedAt = new Date();

    logger.info(`Playlist ${playlistId} tracks reordered: ${fromIndex} -> ${toIndex}`);
    return playlist;
  }

  /**
   * Add collaborator to playlist
   */
  async addCollaborator(playlistId: string, ownerId: string, collaboratorId: string): Promise<Playlist | null> {
    const playlist = this.playlists.get(playlistId);

    if (!playlist) {
      return null;
    }

    // Only owner can add collaborators
    if (playlist.ownerId !== ownerId) {
      logger.warn(`User ${ownerId} tried to add collaborator to playlist they don't own: ${playlistId}`);
      return null;
    }

    // Playlist must be collaborative
    if (!playlist.isCollaborative) {
      logger.warn(`Playlist ${playlistId} is not collaborative`);
      return null;
    }

    if (!playlist.collaborators.includes(collaboratorId)) {
      playlist.collaborators.push(collaboratorId);
      playlist.updatedAt = new Date();
      logger.info(`Collaborator ${collaboratorId} added to playlist: ${playlistId}`);
    }

    return playlist;
  }

  /**
   * Remove collaborator from playlist
   */
  async removeCollaborator(playlistId: string, ownerId: string, collaboratorId: string): Promise<Playlist | null> {
    const playlist = this.playlists.get(playlistId);

    if (!playlist) {
      return null;
    }

    // Only owner can remove collaborators
    if (playlist.ownerId !== ownerId) {
      logger.warn(`User ${ownerId} tried to remove collaborator from playlist they don't own: ${playlistId}`);
      return null;
    }

    playlist.collaborators = playlist.collaborators.filter(id => id !== collaboratorId);
    playlist.updatedAt = new Date();

    logger.info(`Collaborator ${collaboratorId} removed from playlist: ${playlistId}`);
    return playlist;
  }

  /**
   * Follow/unfollow playlist
   */
  async toggleFollow(playlistId: string, userId: string): Promise<{ followed: boolean; count: number }> {
    const playlist = this.playlists.get(playlistId);

    if (!playlist) {
      throw new Error('Playlist not found');
    }

    if (!playlist.isPublic) {
      throw new Error('Cannot follow private playlist');
    }

    const isFollowing = playlist.followers.includes(userId);

    if (isFollowing) {
      playlist.followers = playlist.followers.filter(id => id !== userId);
      logger.info(`User ${userId} unfollowed playlist: ${playlistId}`);
    } else {
      playlist.followers.push(userId);
      logger.info(`User ${userId} followed playlist: ${playlistId}`);
    }

    return {
      followed: !isFollowing,
      count: playlist.followers.length,
    };
  }

  /**
   * Like/unlike playlist
   */
  async toggleLike(playlistId: string, userId: string): Promise<{ liked: boolean; count: number }> {
    const playlist = this.playlists.get(playlistId);

    if (!playlist) {
      throw new Error('Playlist not found');
    }

    // For simplicity, using followers as likes (in real app, separate storage)
    const isLiked = playlist.followers.includes(userId);

    if (isLiked) {
      playlist.likeCount = Math.max(0, playlist.likeCount - 1);
    } else {
      playlist.likeCount++;
    }

    return {
      liked: !isLiked,
      count: playlist.likeCount,
    };
  }

  /**
   * Duplicate playlist
   */
  async duplicatePlaylist(playlistId: string, userId: string, newName?: string): Promise<Playlist | null> {
    const original = this.playlists.get(playlistId);

    if (!original) {
      return null;
    }

    // Can only duplicate public playlists or owned playlists
    if (!original.isPublic && original.ownerId !== userId) {
      logger.warn(`User ${userId} tried to duplicate private playlist: ${playlistId}`);
      return null;
    }

    const duplicate: Playlist = {
      ...original,
      id: uuidv4(),
      name: newName || `${original.name} (Copy)`,
      ownerId: userId,
      tracks: [...original.tracks],
      collaborators: [],
      followers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      playCount: 0,
      likeCount: 0,
      isPublic: false, // New playlist starts as private
      isCollaborative: false,
    };

    this.playlists.set(duplicate.id, duplicate);

    // Add to user's playlists
    const userPlaylistIds = this.userPlaylists.get(userId) || [];
    userPlaylistIds.push(duplicate.id);
    this.userPlaylists.set(userId, userPlaylistIds);

    logger.info(`Playlist duplicated: ${playlistId} -> ${duplicate.id}`);
    return duplicate;
  }

  /**
   * Get public playlists
   */
  async getPublicPlaylists(limit: number = 50, offset: number = 0): Promise<Playlist[]> {
    const publicPlaylists = Array.from(this.playlists.values())
      .filter(p => p.isPublic)
      .sort((a, b) => b.likeCount - a.likeCount); // Sort by popularity

    return publicPlaylists.slice(offset, offset + limit);
  }

  /**
   * Search playlists
   */
  async searchPlaylists(query: string, userId?: string): Promise<Playlist[]> {
    const lowerQuery = query.toLowerCase();
    const results: Playlist[] = [];

    for (const playlist of this.playlists.values()) {
      // Only show public playlists or user's own playlists
      if (!playlist.isPublic && playlist.ownerId !== userId) {
        continue;
      }

      // Search in name, description, and tags
      if (
        playlist.name.toLowerCase().includes(lowerQuery) ||
        playlist.description.toLowerCase().includes(lowerQuery) ||
        playlist.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      ) {
        results.push(playlist);
      }
    }

    return results.sort((a, b) => b.likeCount - a.likeCount);
  }

  /**
   * Get playlist statistics
   */
  getPlaylistStats(playlistId: string): any {
    const playlist = this.playlists.get(playlistId);

    if (!playlist) {
      return null;
    }

    const totalDuration = playlist.tracks.reduce((sum, track) => sum + track.duration, 0);
    const uniqueArtists = new Set(playlist.tracks.map(t => t.artist)).size;

    return {
      trackCount: playlist.tracks.length,
      totalDuration,
      uniqueArtists,
      followers: playlist.followers.length,
      likes: playlist.likeCount,
      playCount: playlist.playCount,
      collaborators: playlist.collaborators.length,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt,
    };
  }

  /**
   * Increment play count
   */
  async incrementPlayCount(playlistId: string): Promise<void> {
    const playlist = this.playlists.get(playlistId);
    if (playlist) {
      playlist.playCount++;
    }
  }

  /**
   * Create smart playlist based on criteria
   */
  async createSmartPlaylist(
    userId: string,
    name: string,
    criteria: SmartPlaylistCriteria,
    allTracks: PlaylistTrack[]
  ): Promise<Playlist> {
    logger.info(`Creating smart playlist with criteria: ${JSON.stringify(criteria)}`);

    // Filter tracks based on criteria
    let filteredTracks = [...allTracks];

    if (criteria.genres && criteria.genres.length > 0) {
      // Genre filtering would need genre data
    }

    if (criteria.artists && criteria.artists.length > 0) {
      filteredTracks = filteredTracks.filter(t =>
        criteria.artists!.some(artist => t.artist.toLowerCase().includes(artist.toLowerCase()))
      );
    }

    if (criteria.minDuration) {
      filteredTracks = filteredTracks.filter(t => t.duration >= criteria.minDuration!);
    }

    if (criteria.maxDuration) {
      filteredTracks = filteredTracks.filter(t => t.duration <= criteria.maxDuration!);
    }

    if (criteria.maxTracks) {
      filteredTracks = filteredTracks.slice(0, criteria.maxTracks);
    }

    // Create playlist with filtered tracks
    const playlist = await this.createPlaylist(userId, name, 'Smart Playlist', false, false);
    playlist.tracks = filteredTracks;
    playlist.tags.push('smart');

    logger.info(`Smart playlist created with ${filteredTracks.length} tracks`);
    return playlist;
  }
}

export default new PlaylistService();
