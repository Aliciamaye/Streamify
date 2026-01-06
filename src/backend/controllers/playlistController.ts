/**
 * Playlist Controller - Handle playlist operations
 */

import { Request, Response } from 'express';
import PlaylistService from '../services/PlaylistService';
import { asyncHandler, ApiResponse } from '../utils/helpers';
import { Logger } from '../utils/logger';

const logger = new Logger('PlaylistController');

/**
 * Create a new playlist
 */
export const createPlaylist = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { name, description, isPublic, isCollaborative } = req.body;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  if (!name) {
    return res.status(400).json(ApiResponse.error('Playlist name is required', 400));
  }

  const playlist = await PlaylistService.createPlaylist(
    userId,
    name,
    description || '',
    isPublic || false,
    isCollaborative || false
  );

  res.status(201).json(ApiResponse.success(playlist, 'Playlist created'));
});

/**
 * Get playlist by ID
 */
export const getPlaylist = asyncHandler(async (req: Request, res: Response) => {
  const { playlistId } = req.params;
  const userId = (req as any).user?.id;

  const playlist = await PlaylistService.getPlaylist(playlistId, userId);

  if (!playlist) {
    return res.status(404).json(ApiResponse.error('Playlist not found', 404));
  }

  res.json(ApiResponse.success(playlist, 'Playlist retrieved'));
});

/**
 * Get user's playlists
 */
export const getUserPlaylists = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  const playlists = await PlaylistService.getUserPlaylists(userId);

  res.json(ApiResponse.success(playlists, 'Playlists retrieved'));
});

/**
 * Update playlist
 */
export const updatePlaylist = asyncHandler(async (req: Request, res: Response) => {
  const { playlistId } = req.params;
  const userId = (req as any).user?.id;
  const updates = req.body;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  const playlist = await PlaylistService.updatePlaylist(playlistId, userId, updates);

  if (!playlist) {
    return res.status(404).json(ApiResponse.error('Playlist not found or unauthorized', 404));
  }

  res.json(ApiResponse.success(playlist, 'Playlist updated'));
});

/**
 * Delete playlist
 */
export const deletePlaylist = asyncHandler(async (req: Request, res: Response) => {
  const { playlistId } = req.params;
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  const deleted = await PlaylistService.deletePlaylist(playlistId, userId);

  if (!deleted) {
    return res.status(404).json(ApiResponse.error('Playlist not found or unauthorized', 404));
  }

  res.json(ApiResponse.success(null, 'Playlist deleted'));
});

/**
 * Add track to playlist
 */
export const addTrack = asyncHandler(async (req: Request, res: Response) => {
  const { playlistId } = req.params;
  const userId = (req as any).user?.id;
  const { videoId, title, artist, duration, thumbnail } = req.body;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  if (!videoId || !title || !artist) {
    return res.status(400).json(ApiResponse.error('Missing required track information', 400));
  }

  const playlist = await PlaylistService.addTrack(playlistId, userId, {
    videoId,
    title,
    artist,
    duration: duration || 0,
    thumbnail: thumbnail || '',
  });

  if (!playlist) {
    return res.status(404).json(ApiResponse.error('Playlist not found or unauthorized', 404));
  }

  res.json(ApiResponse.success(playlist, 'Track added to playlist'));
});

/**
 * Remove track from playlist
 */
export const removeTrack = asyncHandler(async (req: Request, res: Response) => {
  const { playlistId, videoId } = req.params;
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  const playlist = await PlaylistService.removeTrack(playlistId, userId, videoId);

  if (!playlist) {
    return res.status(404).json(ApiResponse.error('Playlist not found or unauthorized', 404));
  }

  res.json(ApiResponse.success(playlist, 'Track removed from playlist'));
});

/**
 * Reorder tracks
 */
export const reorderTracks = asyncHandler(async (req: Request, res: Response) => {
  const { playlistId } = req.params;
  const userId = (req as any).user?.id;
  const { fromIndex, toIndex } = req.body;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  if (fromIndex === undefined || toIndex === undefined) {
    return res.status(400).json(ApiResponse.error('fromIndex and toIndex are required', 400));
  }

  const playlist = await PlaylistService.reorderTracks(playlistId, userId, fromIndex, toIndex);

  if (!playlist) {
    return res.status(404).json(ApiResponse.error('Playlist not found or unauthorized', 404));
  }

  res.json(ApiResponse.success(playlist, 'Tracks reordered'));
});

/**
 * Add collaborator
 */
export const addCollaborator = asyncHandler(async (req: Request, res: Response) => {
  const { playlistId } = req.params;
  const userId = (req as any).user?.id;
  const { collaboratorId } = req.body;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  if (!collaboratorId) {
    return res.status(400).json(ApiResponse.error('Collaborator ID is required', 400));
  }

  const playlist = await PlaylistService.addCollaborator(playlistId, userId, collaboratorId);

  if (!playlist) {
    return res.status(404).json(ApiResponse.error('Playlist not found or not collaborative', 404));
  }

  res.json(ApiResponse.success(playlist, 'Collaborator added'));
});

/**
 * Remove collaborator
 */
export const removeCollaborator = asyncHandler(async (req: Request, res: Response) => {
  const { playlistId, collaboratorId } = req.params;
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  const playlist = await PlaylistService.removeCollaborator(playlistId, userId, collaboratorId);

  if (!playlist) {
    return res.status(404).json(ApiResponse.error('Playlist not found or unauthorized', 404));
  }

  res.json(ApiResponse.success(playlist, 'Collaborator removed'));
});

/**
 * Toggle follow
 */
export const toggleFollow = asyncHandler(async (req: Request, res: Response) => {
  const { playlistId } = req.params;
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  const result = await PlaylistService.toggleFollow(playlistId, userId);

  res.json(ApiResponse.success(result, result.followed ? 'Playlist followed' : 'Playlist unfollowed'));
});

/**
 * Toggle like
 */
export const toggleLike = asyncHandler(async (req: Request, res: Response) => {
  const { playlistId } = req.params;
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  const result = await PlaylistService.toggleLike(playlistId, userId);

  res.json(ApiResponse.success(result, result.liked ? 'Playlist liked' : 'Playlist unliked'));
});

/**
 * Duplicate playlist
 */
export const duplicatePlaylist = asyncHandler(async (req: Request, res: Response) => {
  const { playlistId } = req.params;
  const userId = (req as any).user?.id;
  const { newName } = req.body;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  const playlist = await PlaylistService.duplicatePlaylist(playlistId, userId, newName);

  if (!playlist) {
    return res.status(404).json(ApiResponse.error('Playlist not found or unauthorized', 404));
  }

  res.status(201).json(ApiResponse.success(playlist, 'Playlist duplicated'));
});

/**
 * Get public playlists
 */
export const getPublicPlaylists = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;

  const playlists = await PlaylistService.getPublicPlaylists(limit, offset);

  res.json(ApiResponse.success(playlists, 'Public playlists retrieved'));
});

/**
 * Search playlists
 */
export const searchPlaylists = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;
  const userId = (req as any).user?.id;

  if (!q) {
    return res.status(400).json(ApiResponse.error('Search query is required', 400));
  }

  const playlists = await PlaylistService.searchPlaylists(q as string, userId);

  res.json(ApiResponse.success(playlists, 'Playlists search results'));
});

/**
 * Get playlist statistics
 */
export const getPlaylistStats = asyncHandler(async (req: Request, res: Response) => {
  const { playlistId } = req.params;

  const stats = PlaylistService.getPlaylistStats(playlistId);

  if (!stats) {
    return res.status(404).json(ApiResponse.error('Playlist not found', 404));
  }

  res.json(ApiResponse.success(stats, 'Playlist statistics retrieved'));
});

/**
 * Increment play count
 */
export const incrementPlayCount = asyncHandler(async (req: Request, res: Response) => {
  const { playlistId } = req.params;

  await PlaylistService.incrementPlayCount(playlistId);

  res.json(ApiResponse.success(null, 'Play count incremented'));
});
