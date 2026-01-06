/**
 * Redis Cache Service
 * Production-grade caching with fallback to memory
 */

import { Logger } from '../utils/logger';

const logger = new Logger('RedisCache');

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class RedisCache {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private redisAvailable = false;
  private redisClient: any = null;

  constructor() {
    this.initializeRedis();

    // Cleanup interval for memory cache
    setInterval(() => this.cleanup(), 60_000);
  }

  /**
   * Initialize Redis connection. Respects:
   * - REDIS_ENABLED=true
   * - REDIS_URL (e.g. redis://default:password@host:port)
   * - REDIS_HOST / REDIS_PORT / REDIS_PASSWORD
   */
  private async initializeRedis(): Promise<void> {
    try {
      const redisEnabled = process.env.REDIS_ENABLED === 'true';
      if (!redisEnabled) {
        logger.info('Redis disabled, using memory cache');
        return;
      }

      const { REDIS_URL, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env as Record<string, string | undefined>;
      const url = REDIS_URL || this.buildUrl(REDIS_HOST, REDIS_PORT, REDIS_PASSWORD);
      if (!url) {
        logger.warn('Redis enabled but no URL/host provided; falling back to memory');
        return;
      }

      // Lazy import to avoid hard dependency when disabled
      const redis = await import('redis');
      this.redisClient = redis.createClient({ url });
      this.redisClient.on('error', (err: any) => logger.warn('Redis client error:', err?.message || err));
      await this.redisClient.connect();
      this.redisAvailable = true;
      logger.info('Redis connected');
    } catch (error: any) {
      logger.warn('Redis connection failed, using memory cache:', error?.message || error);
      this.redisAvailable = false;
    }
  }

  private buildUrl(host?: string, port?: string, password?: string): string | null {
    if (!host) return null;
    const safePort = port || '6379';
    if (password) {
      return `redis://:${encodeURIComponent(password)}@${host}:${safePort}`;
    }
    return `redis://${host}:${safePort}`;
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
    const expiresAt = Date.now() + (ttlSeconds * 1000);

    if (this.redisAvailable && this.redisClient) {
      try {
        await this.redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
        return;
      } catch (error) {
        logger.warn('Redis set failed, falling back to memory:', error);
      }
    }

    // Fallback to memory cache
    this.memoryCache.set(key, { value, expiresAt });
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (this.redisAvailable && this.redisClient) {
      try {
        const data = await this.redisClient.get(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        logger.warn('Redis get failed, falling back to memory:', error);
      }
    }

    // Fallback to memory cache
    const entry = this.memoryCache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Delete key from cache
   */
  async delete(key: string): Promise<void> {
    if (this.redisAvailable && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (error) {
        logger.warn('Redis delete failed:', error);
      }
    }

    this.memoryCache.delete(key);
  }

  /**
   * Check if key exists
   */
  async has(key: string): Promise<boolean> {
    if (this.redisAvailable && this.redisClient) {
      try {
        const exists = await this.redisClient.exists(key);
        return exists === 1;
      } catch (error) {
        logger.warn('Redis exists check failed:', error);
      }
    }

    const entry = this.memoryCache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    if (this.redisAvailable && this.redisClient) {
      try {
        await this.redisClient.flushAll();
      } catch (error) {
        logger.warn('Redis flush failed:', error);
      }
    }

    this.memoryCache.clear();
    logger.info('Cache cleared');
  }

  /**
   * Cleanup expired entries (memory cache only)
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expiresAt) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`Cleaned ${cleaned} expired cache entries`);
    }
  }

  /**
   * Get cache stats
   */
  getStats(): {
    type: 'redis' | 'memory';
    size: number;
  } {
    return {
      type: this.redisAvailable ? 'redis' : 'memory',
      size: this.memoryCache.size,
    };
  }
}
