/**
 * Authentication Middleware
 * Verify JWT tokens and attach user info to request
 */

import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/AuthService';
import { logger } from '../utils/logger';

/**
 * Verify JWT token middleware
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = AuthService.extractTokenFromHeader(authHeader);

  if (!token) {
    logger.warn('No authentication token provided');
    return res.status(401).json({
      success: false,
      message: 'No authentication token provided',
      statusCode: 401,
    });
  }

  const decoded = AuthService.verifyAccessToken(token);

  if (!decoded) {
    logger.warn('Invalid or expired authentication token');
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token',
      statusCode: 401,
    });
  }

  // Attach user info to request
  (req as any).userId = decoded.id;
  (req as any).userEmail = decoded.email;
  (req as any).username = decoded.username;

  logger.debug(`Authenticated user: ${decoded.id}`);

  next();
};

/**
 * Optional authentication middleware
 * Doesn't fail if token is missing, but validates if present
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = AuthService.extractTokenFromHeader(authHeader);

  if (token) {
    const decoded = AuthService.verifyAccessToken(token);
    if (decoded) {
      (req as any).userId = decoded.id;
      (req as any).userEmail = decoded.email;
      (req as any).username = decoded.username;
      logger.debug(`Optional auth - authenticated user: ${decoded.id}`);
    } else {
      logger.debug('Optional auth - invalid token (ignored)');
    }
  }

  next();
};

/**
 * Admin role check middleware
 */
export const adminOnly = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!(req as any).userId) {
      logger.warn('Admin access attempted without authentication');
      return res.status(401).json({
        success: false,
        message: 'Admin access required - not authenticated',
        statusCode: 401,
      });
    }

    // Import User model functions
    const { isAdmin } = await import('../models/User');

    // Get user from database (this would be a real DB call in production)
    // For now, we'll check the request object for role info
    const userRole = (req as any).userRole;

    // Create a temporary user object for role checking
    const tempUser = {
      id: (req as any).userId,
      role: userRole,
      isBanned: false,
      isActive: true,
    } as any;

    if (!isAdmin(tempUser)) {
      logger.warn(`Non-admin user ${(req as any).userId} attempted to access admin route`);
      return res.status(403).json({
        success: false,
        message: 'Admin privileges required',
        statusCode: 403,
      });
    }

    logger.debug(`Admin access granted to user: ${(req as any).userId}`);
    next();
  } catch (error) {
    logger.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      statusCode: 500,
    });
  }
};

/**
 * Moderator role check middleware
 */
export const moderatorOnly = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!(req as any).userId) {
      return res.status(401).json({
        success: false,
        message: 'Moderator access required - not authenticated',
        statusCode: 401,
      });
    }

    const { isModerator } = await import('../models/User');
    const userRole = (req as any).userRole;

    const tempUser = {
      id: (req as any).userId,
      role: userRole,
      isBanned: false,
      isActive: true,
    } as any;

    if (!isModerator(tempUser)) {
      logger.warn(`Non-moderator user ${(req as any).userId} attempted to access moderator route`);
      return res.status(403).json({
        success: false,
        message: 'Moderator privileges required',
        statusCode: 403,
      });
    }

    next();
  } catch (error) {
    logger.error('Moderator middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      statusCode: 500,
    });
  }
};

/**
 * Premium user check middleware
 */
export const premiumOnly = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!(req as any).userId) {
      return res.status(401).json({
        success: false,
        message: 'Premium access required - not authenticated',
        statusCode: 401,
      });
    }

    const { isPremium } = await import('../models/User');
    const userRole = (req as any).userRole;

    const tempUser = {
      id: (req as any).userId,
      role: userRole,
      isBanned: false,
      isActive: true,
    } as any;

    if (!isPremium(tempUser)) {
      return res.status(403).json({
        success: false,
        message: 'Premium subscription required',
        statusCode: 403,
      });
    }

    next();
  } catch (error) {
    logger.error('Premium middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      statusCode: 500,
    });
  }
};

/**
 * Permission check middleware factory
 * Creates a middleware that checks for a specific permission
 */
export const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!(req as any).userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          statusCode: 401,
        });
      }

      const { hasPermission, UserPermission } = await import('../models/User');
      const userPermissions = (req as any).userPermissions || [];

      const tempUser = {
        id: (req as any).userId,
        permissions: userPermissions,
        isBanned: false,
        isActive: true,
      } as any;

      if (!hasPermission(tempUser, permission as any)) {
        logger.warn(`User ${(req as any).userId} lacks permission: ${permission}`);
        return res.status(403).json({
          success: false,
          message: `Permission required: ${permission}`,
          statusCode: 403,
        });
      }

      next();
    } catch (error) {
      logger.error('Permission middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        statusCode: 500,
      });
    }
  };
};

/**
 * Ban check middleware
 * Ensures banned users cannot access protected routes
 */
export const checkBanStatus = (req: Request, res: Response, next: NextFunction) => {
  const isBanned = (req as any).userBanned;
  const banReason = (req as any).userBanReason;

  if (isBanned) {
    logger.warn(`Banned user ${(req as any).userId} attempted to access protected route`);
    return res.status(403).json({
      success: false,
      message: `Account banned${banReason ? `: ${banReason}` : ''}`,
      statusCode: 403,
    });
  }

  next();
};

