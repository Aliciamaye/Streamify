/**
 * Streaming Proxy Service
 * Handles YouTube stream proxying with range requests
 * Optimized for web playback
 */

import axios, { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { Logger } from '../utils/logger';
import { RedisCache } from './RedisCache';

const logger = new Logger('StreamingProxy');

export class StreamingProxyService {
  private cache: RedisCache;
  private activeStreams: Map<string, number> = new Map();

  constructor() {
    this.cache = new RedisCache();
  }

  /**
   * Proxy stream with range support
   */
  async proxyStream(
    req: Request,
    res: Response,
    streamUrl: string
  ): Promise<void> {
    try {
      const range = req.headers.range;
      logger.info(`Proxying stream with range: ${range}`);

      // Track active stream
      const streamId = this.generateStreamId(streamUrl);
      this.activeStreams.set(streamId, Date.now());

      // Build headers
      const headers: any = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://music.youtube.com',
        'Referer': 'https://music.youtube.com/',
      };

      // Add range header if provided
      if (range) {
        headers['Range'] = range;
      }

      // Make request to YouTube
      const response = await axios.get(streamUrl, {
        headers,
        responseType: 'stream',
        validateStatus: (status) => status < 500,
      });

      // Set response headers
      this.setResponseHeaders(res, response, range);

      // Pipe the stream
      response.data.pipe(res);

      // Handle stream events
      response.data.on('error', (error: Error) => {
        logger.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Streaming error' });
        }
      });

      res.on('close', () => {
        this.activeStreams.delete(streamId);
        logger.info('Stream closed');
      });

    } catch (error: any) {
      logger.error('Proxy stream error:', error);
      
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Failed to proxy stream',
          message: error.message,
        });
      }
    }
  }

  /**
   * Set appropriate response headers
   */
  private setResponseHeaders(
    res: Response,
    youtubeResponse: AxiosResponse,
    range?: string
  ): void {
    // Content type
    const contentType = youtubeResponse.headers['content-type'] || 'audio/webm';
    res.setHeader('Content-Type', contentType);

    // Content length
    if (youtubeResponse.headers['content-length']) {
      res.setHeader('Content-Length', youtubeResponse.headers['content-length']);
    }

    // Range headers
    if (range && youtubeResponse.status === 206) {
      res.status(206);
      
      if (youtubeResponse.headers['content-range']) {
        res.setHeader('Content-Range', youtubeResponse.headers['content-range']);
      }
      
      res.setHeader('Accept-Ranges', 'bytes');
    } else {
      res.status(200);
      res.setHeader('Accept-Ranges', 'bytes');
    }

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Type');

    // Cache headers
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // Connection headers
    res.setHeader('Connection', 'keep-alive');
  }

  /**
   * Generate stream ID
   */
  private generateStreamId(url: string): string {
    return Buffer.from(url).toString('base64').substring(0, 32);
  }

  /**
   * Get active streams count
   */
  getActiveStreamsCount(): number {
    return this.activeStreams.size;
  }

  /**
   * Cleanup old streams
   */
  cleanupStreams(): void {
    const now = Date.now();
    const timeout = 600000; // 10 minutes

    for (const [id, timestamp] of this.activeStreams.entries()) {
      if (now - timestamp > timeout) {
        this.activeStreams.delete(id);
      }
    }
  }
}

export default new StreamingProxyService();
