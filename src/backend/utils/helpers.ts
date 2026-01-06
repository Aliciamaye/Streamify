/**
 * Utility Helpers
 * Common functions for the application
 */

import { Request, Response, NextFunction } from 'express';

/**
 * API Response formatter
 * Supports both static methods and constructor
 */
export class ApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data?: any;
  errors?: any;
  timestamp: string;

  constructor(success: boolean, message: string, data: any = null, statusCode: number = 200) {
    this.success = success;
    this.message = message;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    
    if (success) {
      this.data = data;
    } else {
      this.errors = data;
    }
  }

  static success(message: string, data: any = null, statusCode: number = 200) {
    return {
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message: string, statusCode: number = 400, errors: any = null) {
    return {
      success: false,
      statusCode,
      message,
      errors,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Async handler wrapper
 * Eliminates need for try-catch in route handlers
 */
export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * Rate limiter using memory (for simple cases)
 * Use Redis for production
 */
export class SimpleRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Cleanup old entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = req.ip || req.socket.remoteAddress || 'unknown';

      if (!this.requests.has(key)) {
        this.requests.set(key, []);
      }

      const now = Date.now();
      const timestamps = this.requests.get(key)!;

      // Remove old timestamps
      const recentTimestamps = timestamps.filter(
        (time) => now - time < this.windowMs
      );

      if (recentTimestamps.length >= this.maxRequests) {
        return res.status(429).json(
          ApiResponse.error('Too many requests', 429)
        );
      }

      recentTimestamps.push(now);
      this.requests.set(key, recentTimestamps);

      res.set('X-RateLimit-Limit', this.maxRequests.toString());
      res.set(
        'X-RateLimit-Remaining',
        (this.maxRequests - recentTimestamps.length).toString()
      );

      next();
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.requests.entries()) {
      const recentTimestamps = timestamps.filter(
        (time) => now - time < this.windowMs
      );

      if (recentTimestamps.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recentTimestamps);
      }
    }
  }
}

/**
 * Cache manager
 */
export class CacheManager {
  private cache: Map<string, any> = new Map();
  private ttls: Map<string, number> = new Map();

  set(key: string, value: any, ttl: number = 3600) {
    this.cache.set(key, value);
    this.ttls.set(key, Date.now() + ttl * 1000);
  }

  get(key: string): any {
    const ttl = this.ttls.get(key);

    if (!ttl || Date.now() > ttl) {
      this.cache.delete(key);
      this.ttls.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  has(key: string): boolean {
    const ttl = this.ttls.get(key);

    if (!ttl || Date.now() > ttl) {
      this.cache.delete(key);
      this.ttls.delete(key);
      return false;
    }

    return this.cache.has(key);
  }

  delete(key: string) {
    this.cache.delete(key);
    this.ttls.delete(key);
  }

  clear() {
    this.cache.clear();
    this.ttls.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

/**
 * Validators
 */
export const validators = {
  isValidVideoId: (id: string): boolean => {
    return /^[a-zA-Z0-9_-]{11}$/.test(id);
  },

  isValidChannelId: (id: string): boolean => {
    return /^UC[a-zA-Z0-9_-]{22}$/.test(id);
  },

  isValidBrowseId: (id: string): boolean => {
    return /^[a-zA-Z0-9_-]{22,}$/.test(id);
  },

  isValidQuery: (query: string): boolean => {
    return query && query.length > 0 && query.length <= 500;
  },
};

/**
 * Pagination helper
 */
export class PaginationHelper {
  static getPageParams(query: any, maxLimit: number = 50) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(
      maxLimit,
      Math.max(1, parseInt(query.limit) || 20)
    );

    return {
      page,
      limit,
      skip: (page - 1) * limit,
    };
  }

  static buildMeta(items: any[], page: number, limit: number, total: number) {
    return {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    };
  }
}
