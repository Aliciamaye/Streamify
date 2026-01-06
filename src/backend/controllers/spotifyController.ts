/**
 * Spotify Controller
 * Handles OAuth connect, playlist import, and history sync
 */

import { Request, Response } from 'express';
import SpotifyService from '../services/SpotifyService';
import { ApiResponse, asyncHandler } from '../utils/helpers';
import { Logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { backgroundQueue } from '../services/JobQueue';
import { RedisCache } from '../services/RedisCache';

const logger = new Logger('SpotifyController');
const jobCache = new RedisCache();

// Register processor once for Spotify import jobs
backgroundQueue.setProcessor(async (job) => {
  if (job.name !== 'spotify-import') return;
  const { userId, playlistId } = job.payload as { userId: string; playlistId: string };
  const statusKey = `spotify:job:${job.id}`;
  try {
    await jobCache.set(statusKey, { status: 'processing', playlistId }, 3600);
    const result = await SpotifyService.importPlaylist(userId, playlistId);
    await jobCache.set(statusKey, { status: 'completed', playlistId, result }, 3600 * 24);
  } catch (err: any) {
    await jobCache.set(statusKey, { status: 'failed', playlistId, error: err?.message || 'Import failed' }, 3600);
  }
});

export const connect = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  const state = uuidv4();
  await jobCache.set(`spotify:state:${state}`, { userId }, 600);
  const url = SpotifyService.getAuthUrl(state);
  res.json(ApiResponse.success('Spotify authorization URL generated', { url, state }));
});

export const callback = asyncHandler(async (req: Request, res: Response) => {
  const code = (req.body.code as string) || (req.query.code as string);
  const state = (req.body.state as string) || (req.query.state as string);

  if (!code || !state) {
    return res.status(400).json(ApiResponse.error('Missing authorization code/state', 400));
  }

  const mapped = await jobCache.get<{ userId: string }>(`spotify:state:${state}`);
  if (!mapped?.userId) {
    return res.status(400).json(ApiResponse.error('Invalid or expired state', 400));
  }

  const userId = mapped.userId;
  const tokens = await SpotifyService.exchangeCode(code);
  await SpotifyService.storeTokens(userId, tokens);

  const profile = await SpotifyService.getCurrentUser(tokens.accessToken);
  res.json(ApiResponse.success('Spotify connected', { profile, expiresAt: tokens.expiresAt }));
});

export const disconnect = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  await SpotifyService.disconnect(userId);
  res.json(ApiResponse.success('Spotify disconnected'));
});

export const status = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  const connection = await SpotifyService.getConnectionStatus(userId);
  res.json(ApiResponse.success('Spotify connection status', connection));
});

export const listPlaylists = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  const tokens = await SpotifyService.ensureTokens(userId);
  const playlists = await SpotifyService.listPlaylists(tokens.accessToken);
  res.json(ApiResponse.success('Playlists retrieved', { playlists }));
});

export const importPlaylist = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { playlistId } = req.params;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  if (!playlistId) {
    return res.status(400).json(ApiResponse.error('Missing playlistId', 400));
  }

  const result = await SpotifyService.importPlaylist(userId, playlistId);
  res.json(ApiResponse.success('Playlist import complete', result));
});

export const importPlaylistAsync = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { playlistId } = req.params;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  if (!playlistId) {
    return res.status(400).json(ApiResponse.error('Missing playlistId', 400));
  }

  const jobId = uuidv4();
  const statusKey = `spotify:job:${jobId}`;
  await jobCache.set(statusKey, { status: 'queued', playlistId }, 3600);
  backgroundQueue.enqueue({ id: jobId, name: 'spotify-import', payload: { userId, playlistId } });

  res.json(ApiResponse.success('Playlist import enqueued', { jobId, status: 'queued' }));
});

export const jobStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { jobId } = req.params;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  if (!jobId) {
    return res.status(400).json(ApiResponse.error('Missing jobId', 400));
  }

  const status = await jobCache.get<any>(`spotify:job:${jobId}`);
  if (!status) {
    return res.status(404).json(ApiResponse.error('Job not found', 404));
  }

  res.json(ApiResponse.success('Job status', { jobId, ...status }));
});

export const syncPlaylist = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { playlistId } = req.params;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  if (!playlistId) {
    return res.status(400).json(ApiResponse.error('Missing playlistId', 400));
  }

  const result = await SpotifyService.syncPlaylist(userId, playlistId);
  res.json(ApiResponse.success('Playlist sync complete', result));
});

export const history = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  const tokens = await SpotifyService.ensureTokens(userId);
  const recentlyPlayed = await SpotifyService.getRecentlyPlayed(tokens.accessToken);
  const topTracks = await SpotifyService.getTop(tokens.accessToken, 'tracks');
  res.json(
    ApiResponse.success('Playback history retrieved', {
      recentlyPlayed,
      topTracks,
    })
  );
});
