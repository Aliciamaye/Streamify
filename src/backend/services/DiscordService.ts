/**
 * DiscordService
 * Handles Discord Rich Presence and webhook notifications
 */

import axios from 'axios';
import { Logger } from '../utils/logger';
import { RedisCache } from './RedisCache';

interface DiscordPresence {
  details: string;
  state: string;
  largeImageUrl?: string;
  largeImageText?: string;
  smallImageUrl?: string;
  smallImageText?: string;
  startTimestamp?: number;
  endTimestamp?: number;
}

class DiscordService {
  private logger = new Logger('DiscordService');
  private cache = new RedisCache();

  /**
   * Send Rich Presence data via Discord RPC
   * Note: This requires a Discord RPC bridge running on client side
   * or a WebSocket connection to user's Discord client
   */
  async updateRichPresence(userId: string, presence: DiscordPresence): Promise<void> {
    try {
      // Store presence for client polling
      await this.cache.set(`discord:presence:${userId}`, presence, 300); // 5 min TTL
      this.logger.info(`Discord Rich Presence updated for user ${userId}`);
    } catch (error: any) {
      this.logger.error('Failed to update Discord Rich Presence:', error.message);
    }
  }

  /**
   * Get current Rich Presence for user
   */
  async getRichPresence(userId: string): Promise<DiscordPresence | null> {
    return await this.cache.get<DiscordPresence>(`discord:presence:${userId}`);
  }

  /**
   * Update presence for currently playing track
   */
  async updateNowPlaying(userId: string, track: { title: string; artist: string; duration?: number; thumbnail?: string }): Promise<void> {
    const presence: DiscordPresence = {
      details: track.title,
      state: `by ${track.artist}`,
      largeImageUrl: track.thumbnail || 'https://streamify.app/icon-512.png',
      largeImageText: 'Streamify',
      smallImageUrl: 'https://streamify.app/play-icon.png',
      smallImageText: 'Playing',
      startTimestamp: Date.now(),
    };

    if (track.duration) {
      presence.endTimestamp = Date.now() + track.duration * 1000;
    }

    await this.updateRichPresence(userId, presence);
  }

  /**
   * Clear Rich Presence (user stopped playback)
   */
  async clearPresence(userId: string): Promise<void> {
    await this.cache.delete(`discord:presence:${userId}`);
  }

  /**
   * Send webhook notification to Discord channel
   */
  async sendWebhook(webhookUrl: string, message: { content?: string; embeds?: any[] }): Promise<void> {
    if (!webhookUrl || !webhookUrl.includes('discord.com/api/webhooks/')) {
      throw new Error('Invalid Discord webhook URL');
    }

    try {
      await axios.post(webhookUrl, message, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
      });
      this.logger.info('Discord webhook sent successfully');
    } catch (error: any) {
      this.logger.error('Failed to send Discord webhook:', error.message);
      throw error;
    }
  }

  /**
   * Share track to Discord channel
   */
  async shareTrack(webhookUrl: string, track: { title: string; artist: string; url?: string; thumbnail?: string }): Promise<void> {
    const embed = {
      title: '🎵 Now Playing',
      description: `**${track.title}**\nby ${track.artist}`,
      color: 0x764ba2,
      thumbnail: track.thumbnail ? { url: track.thumbnail } : undefined,
      footer: {
        text: 'Streamify Music',
        icon_url: 'https://streamify.app/icon-192.png',
      },
      timestamp: new Date().toISOString(),
    };

    if (track.url) {
      embed.description += `\n\n[Listen on Streamify](${track.url})`;
    }

    await this.sendWebhook(webhookUrl, { embeds: [embed] });
  }

  /**
   * Share playlist to Discord channel
   */
  async sharePlaylist(webhookUrl: string, playlist: { name: string; trackCount: number; url?: string; thumbnail?: string }): Promise<void> {
    const embed = {
      title: '🎶 Check out this playlist!',
      description: `**${playlist.name}**\n${playlist.trackCount} tracks`,
      color: 0x667eea,
      thumbnail: playlist.thumbnail ? { url: playlist.thumbnail } : undefined,
      footer: {
        text: 'Streamify Music',
        icon_url: 'https://streamify.app/icon-192.png',
      },
      timestamp: new Date().toISOString(),
    };

    if (playlist.url) {
      embed.description += `\n\n[Open Playlist](${playlist.url})`;
    }

    await this.sendWebhook(webhookUrl, { embeds: [embed] });
  }

  /**
   * Store user's Discord webhook URL
   */
  async storeWebhookUrl(userId: string, webhookUrl: string): Promise<void> {
    await this.cache.set(`discord:webhook:${userId}`, webhookUrl, 3600 * 24 * 365); // 1 year
  }

  /**
   * Get user's Discord webhook URL
   */
  async getWebhookUrl(userId: string): Promise<string | null> {
    return await this.cache.get<string>(`discord:webhook:${userId}`);
  }

  /**
   * Remove webhook URL
   */
  async removeWebhookUrl(userId: string): Promise<void> {
    await this.cache.delete(`discord:webhook:${userId}`);
  }

  /**
   * Get Discord integration status
   */
  async getStatus(userId: string): Promise<{ richPresenceEnabled: boolean; webhookConfigured: boolean }> {
    const presence = await this.getRichPresence(userId);
    const webhook = await this.getWebhookUrl(userId);
    return {
      richPresenceEnabled: !!presence,
      webhookConfigured: !!webhook,
    };
  }
}

export default new DiscordService();
