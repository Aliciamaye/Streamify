/**
 * Last.fm Controller
 */

import { Request, Response } from 'express';
import LastFmService from '../services/LastFmService';
import { ApiResponse, asyncHandler } from '../utils/helpers';
import { Logger } from '../utils/logger';

const logger = new Logger('LastFmController');

export const connect = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  const callbackUrl = req.query.callback as string || `${req.protocol}://${req.get('host')}/api/lastfm/callback`;
  const url = LastFmService.getAuthUrl(callbackUrl);
  res.json(ApiResponse.success('Last.fm authorization URL generated', { url }));
});

export const callback = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const token = (req.body.token as string) || (req.query.token as string);

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  if (!token) {
    return res.status(400).json(ApiResponse.error('Missing token', 400));
  }

  const session = await LastFmService.getSession(token);
  await LastFmService.storeSession(userId, session);

  res.json(ApiResponse.success('Last.fm connected', { username: session.username }));
});

export const disconnect = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  await LastFmService.disconnect(userId);
  res.json(ApiResponse.success('Last.fm disconnected'));
});

export const status = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  const connection = await LastFmService.getConnectionStatus(userId);
  res.json(ApiResponse.success('Last.fm connection status', connection));
});

export const scrobble = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { artist, title, album, timestamp, duration } = req.body;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  if (!artist || !title) {
    return res.status(400).json(ApiResponse.error('Missing artist or title', 400));
  }

  await LastFmService.scrobble(userId, { artist, title, album, timestamp, duration });
  res.json(ApiResponse.success('Track scrobbled'));
});

export const updateNowPlaying = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { artist, title, album, duration } = req.body;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  if (!artist || !title) {
    return res.status(400).json(ApiResponse.error('Missing artist or title', 400));
  }

  await LastFmService.updateNowPlaying(userId, { artist, title, album, duration });
  res.json(ApiResponse.success('Now playing updated'));
});

export const getRecentTracks = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const limit = parseInt(req.query.limit as string) || 50;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  const tracks = await LastFmService.getRecentTracks(userId, limit);
  res.json(ApiResponse.success('Recent tracks retrieved', { tracks }));
});

export const getTopTracks = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const period = (req.query.period as any) || 'overall';
  const limit = parseInt(req.query.limit as string) || 50;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  const tracks = await LastFmService.getTopTracks(userId, period, limit);
  res.json(ApiResponse.success('Top tracks retrieved', { tracks }));
});

export const getTopArtists = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const period = (req.query.period as any) || 'overall';
  const limit = parseInt(req.query.limit as string) || 50;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  const artists = await LastFmService.getTopArtists(userId, period, limit);
  res.json(ApiResponse.success('Top artists retrieved', { artists }));
});

export const getSimilarTracks = asyncHandler(async (req: Request, res: Response) => {
  const { artist, track } = req.query;
  const limit = parseInt(req.query.limit as string) || 30;

  if (!artist || !track) {
    return res.status(400).json(ApiResponse.error('Missing artist or track', 400));
  }

  const tracks = await LastFmService.getSimilarTracks(artist as string, track as string, limit);
  res.json(ApiResponse.success('Similar tracks retrieved', { tracks }));
});
