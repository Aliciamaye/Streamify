/**
 * Playlist Routes - Handle playlist operations
 */

import express from 'express';
import {
  createPlaylist,
  getPlaylist,
  getUserPlaylists,
  updatePlaylist,
  deletePlaylist,
  addTrack,
  removeTrack,
  reorderTracks,
  addCollaborator,
  removeCollaborator,
  toggleFollow,
  toggleLike,
  duplicatePlaylist,
  getPublicPlaylists,
  searchPlaylists,
  getPlaylistStats,
  incrementPlayCount,
} from '../controllers/playlistController';
import { authenticateToken, optionalAuth } from '../middleware/authMiddleware';

const router = express.Router();

// Get user's playlists
router.get('/', authenticateToken, getUserPlaylists);

// Create new playlist
router.post('/', authenticateToken, createPlaylist);

// Get playlist by ID
router.get('/:playlistId', optionalAuth, getPlaylist);

// Update playlist
router.put('/:playlistId', authenticateToken, updatePlaylist);

// Delete playlist
router.delete('/:playlistId', authenticateToken, deletePlaylist);

// Add track to playlist
router.post('/:playlistId/tracks', authenticateToken, addTrack);

// Remove track from playlist
router.delete('/:playlistId/tracks/:videoId', authenticateToken, removeTrack);

// Reorder tracks
router.put('/:playlistId/reorder', authenticateToken, reorderTracks);

// Add collaborator
router.post('/:playlistId/collaborators', authenticateToken, addCollaborator);

// Remove collaborator
router.delete('/:playlistId/collaborators/:collaboratorId', authenticateToken, removeCollaborator);

// Toggle follow
router.post('/:playlistId/follow', authenticateToken, toggleFollow);

// Toggle like
router.post('/:playlistId/like', authenticateToken, toggleLike);

// Duplicate playlist
router.post('/:playlistId/duplicate', authenticateToken, duplicatePlaylist);

// Get public playlists
router.get('/public/browse', getPublicPlaylists);

// Search playlists
router.get('/search/query', optionalAuth, searchPlaylists);

// Get playlist stats
router.get('/:playlistId/stats', getPlaylistStats);

// Increment play count
router.post('/:playlistId/play', incrementPlayCount);

export default router;
