/**
 * Spotify Routes
 */

import { Router } from 'express';
import {
  connect,
  callback,
  disconnect,
  status,
  listPlaylists,
  importPlaylist,
  syncPlaylist,
  history,
  importPlaylistAsync,
  jobStatus,
} from '../controllers/spotifyController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/connect', authenticateToken, connect);
router.get('/callback', callback);
router.post('/callback', callback);
router.post('/disconnect', authenticateToken, disconnect);
router.get('/status', authenticateToken, status);
router.get('/playlists', authenticateToken, listPlaylists);
router.post('/playlists/:playlistId/import', authenticateToken, importPlaylist);
router.post('/playlists/:playlistId/import/async', authenticateToken, importPlaylistAsync);
router.post('/playlists/:playlistId/sync', authenticateToken, syncPlaylist);
router.get('/history', authenticateToken, history);
router.get('/jobs/:jobId', authenticateToken, jobStatus);

export default router;
