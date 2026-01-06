/**
 * Discord Controller
 */

import { Request, Response } from 'express';
import DiscordService from '../services/DiscordService';
import { ApiResponse, asyncHandler } from '../utils/helpers';
import { Logger } from '../utils/logger';

const logger = new Logger('DiscordController');

export const status = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  const status = await DiscordService.getStatus(userId);
  res.json(ApiResponse.success('Discord integration status', status));
});

export const updateNowPlaying = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { title, artist, duration, thumbnail } = req.body;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  if (!title || !artist) {
    return res.status(400).json(ApiResponse.error('Missing title or artist', 400));
  }

  await DiscordService.updateNowPlaying(userId, { title, artist, duration, thumbnail });
  res.json(ApiResponse.success('Discord Rich Presence updated'));
});

export const clearPresence = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  await DiscordService.clearPresence(userId);
  res.json(ApiResponse.success('Discord Rich Presence cleared'));
});

export const getRichPresence = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  const presence = await DiscordService.getRichPresence(userId);
  res.json(ApiResponse.success('Discord Rich Presence', { presence }));
});

export const storeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { webhookUrl } = req.body;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  if (!webhookUrl) {
    return res.status(400).json(ApiResponse.error('Missing webhookUrl', 400));
  }

  await DiscordService.storeWebhookUrl(userId, webhookUrl);
  res.json(ApiResponse.success('Discord webhook configured'));
});

export const removeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  await DiscordService.removeWebhookUrl(userId);
  res.json(ApiResponse.success('Discord webhook removed'));
});

export const shareTrack = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { title, artist, url, thumbnail } = req.body;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  if (!title || !artist) {
    return res.status(400).json(ApiResponse.error('Missing title or artist', 400));
  }

  const webhookUrl = await DiscordService.getWebhookUrl(userId);
  if (!webhookUrl) {
    return res.status(400).json(ApiResponse.error('Discord webhook not configured', 400));
  }

  await DiscordService.shareTrack(webhookUrl, { title, artist, url, thumbnail });
  res.json(ApiResponse.success('Track shared to Discord'));
});

export const sharePlaylist = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { name, trackCount, url, thumbnail } = req.body;

  if (!userId) {
    return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  }

  if (!name || trackCount === undefined) {
    return res.status(400).json(ApiResponse.error('Missing name or trackCount', 400));
  }

  const webhookUrl = await DiscordService.getWebhookUrl(userId);
  if (!webhookUrl) {
    return res.status(400).json(ApiResponse.error('Discord webhook not configured', 400));
  }

  await DiscordService.sharePlaylist(webhookUrl, { name, trackCount, url, thumbnail });
  res.json(ApiResponse.success('Playlist shared to Discord'));
});
