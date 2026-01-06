/**
 * Authentication Service
 * Handles user authentication, JWT tokens, password hashing, etc.
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Logger } from '../utils/logger';

const logger = new Logger('AuthService');

export interface UserPayload {
  id: string;
  email: string;
  username: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

class AuthService {
  private jwtSecret = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
  private jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
  private accessTokenExpiry = '15m'; // 15 minutes
  private refreshTokenExpiry = '7d'; // 7 days

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      logger.debug('Password hashed successfully');
      return hashed;
    } catch (error) {
      logger.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Compare password with hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, hash);
      logger.debug(`Password comparison: ${isMatch ? 'match' : 'no match'}`);
      return isMatch;
    } catch (error) {
      logger.error('Error comparing password:', error);
      throw new Error('Failed to compare password');
    }
  }

  /**
   * Generate access token
   */
  generateAccessToken(user: UserPayload): string {
    try {
      const token = jwt.sign(user, this.jwtSecret, {
        expiresIn: this.accessTokenExpiry,
        algorithm: 'HS256',
      });
      logger.debug(`Access token generated for user: ${user.id}`);
      return token;
    } catch (error) {
      logger.error('Error generating access token:', error);
      throw new Error('Failed to generate access token');
    }
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(user: UserPayload): string {
    try {
      const token = jwt.sign(user, this.jwtRefreshSecret, {
        expiresIn: this.refreshTokenExpiry,
        algorithm: 'HS256',
      });
      logger.debug(`Refresh token generated for user: ${user.id}`);
      return token;
    } catch (error) {
      logger.error('Error generating refresh token:', error);
      throw new Error('Failed to generate refresh token');
    }
  }

  /**
   * Generate token pair (access + refresh)
   */
  generateTokenPair(user: UserPayload): TokenPair {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): UserPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        algorithms: ['HS256'],
      }) as UserPayload;
      logger.debug(`Access token verified for user: ${decoded.id}`);
      return decoded;
    } catch (error) {
      if ((error as any).name === 'TokenExpiredError') {
        logger.warn('Access token has expired');
      } else {
        logger.warn(`Invalid access token: ${(error as Error).message}`);
      }
      return null;
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): UserPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtRefreshSecret, {
        algorithms: ['HS256'],
      }) as UserPayload;
      logger.debug(`Refresh token verified for user: ${decoded.id}`);
      return decoded;
    } catch (error) {
      logger.warn(`Invalid refresh token: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * Refresh access token
   */
  refreshAccessToken(refreshToken: string): TokenPair | null {
    const decoded = this.verifyRefreshToken(refreshToken);

    if (!decoded) {
      logger.warn('Failed to refresh access token - invalid refresh token');
      return null;
    }

    try {
      const user: UserPayload = {
        id: decoded.id,
        email: decoded.email,
        username: decoded.username,
      };

      const tokens = this.generateTokenPair(user);
      logger.info(`Access token refreshed for user: ${user.id}`);
      return tokens;
    } catch (error) {
      logger.error('Error refreshing access token:', error);
      return null;
    }
  }

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  isValidPassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      return parts[1];
    }

    return null;
  }

  /**
   * Generate password reset token
   */
  generateResetToken(): string {
    return jwt.sign(
      { reset: true, timestamp: Date.now() },
      this.jwtSecret,
      { expiresIn: '1h' }
    );
  }

  /**
   * Verify password reset token
   */
  verifyResetToken(token: string): boolean {
    try {
      jwt.verify(token, this.jwtSecret);
      return true;
    } catch {
      return false;
    }
  }
}

export default new AuthService();
