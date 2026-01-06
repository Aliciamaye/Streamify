/**
 * Apple Music Controller
 */

import { Request, Response } from 'express';
import AppleMusicService from '../services/AppleMusicService';
import { ApiResponse, asyncHandler } from '../utils/helpers';
import { Logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { backgroundQueue } from '../services/JobQueue';
import { RedisCache } from '../services/RedisCache';

const logger = new Logger('AppleMusicController');
const jobCache = new RedisCache();

// Register processor for Apple Music import jobs
backgroundQueue.setProcessor(async (job) => {
  if (job.name !== 'applemusic-import') return;
  const { userId, playlistId } = job.payload as { userId: string; playlistId: string };
  const statusKey = `applemusic:job:${job.id}`;
  try {
    await jobCache.set(statusKey, { status: 'processing', playlistId }, 3600);
    const result = await AppleMusicService.importPlaylist(userId, playlistId);
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

  // Apple Music uses client-side MusicKit authentication
  // Server receives the Music User Token from client
  res.json(
    ApiResponse.success('Use MusicKit JS on client to get Music User Token', {
      instructions: 'Implement Apple MusicKit.configure() on client and send musicUserToken to /api/applemusic/token',
    })
  );
});

export const storeToken = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { musicUserToken } = req.body;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  if (!musicUserToken) {
    return res.status(400).json(ApiResponse.error('Missing musicUserToken', 400));
  }

  await AppleMusicService.storeUserToken(userId, musicUserToken);
  res.json(ApiResponse.success('Apple Music connected'));
});

export const disconnect = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  await AppleMusicService.disconnect(userId);
  res.json(ApiResponse.success('Apple Music disconnected'));
});

export const status = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  const connection = await AppleMusicService.getConnectionStatus(userId);
  res.json(ApiResponse.success('Apple Music connection status', connection));
});

export const listPlaylists = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  const playlists = await AppleMusicService.listPlaylists(userId);
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

  const result = await AppleMusicService.importPlaylist(userId, playlistId);
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
  const statusKey = `applemusic:job:${jobId}`;
  await jobCache.set(statusKey, { status: 'queued', playlistId }, 3600);
  backgroundQueue.enqueue({ id: jobId, name: 'applemusic-import', payload: { userId, playlistId } });

  res.json(ApiResponse.success('Playlist import enqueued', { jobId, status: 'queued' }));
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

  const result = await AppleMusicService.syncPlaylist(userId, playlistId);
  res.json(ApiResponse.success('Playlist sync complete', result));
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

  const status = await jobCache.get<any>(`applemusic:job:${jobId}`);
  if (!status) {
    return res.status(404).json(ApiResponse.error('Job not found', 404));
  }

  res.json(ApiResponse.success('Job status', { jobId, ...status }));
});
