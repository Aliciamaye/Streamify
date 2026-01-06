/**
 * Enhanced Security Service
 * Comprehensive security features for user protection and system integrity
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { RedisCache } from './RedisCache';
import crypto from 'crypto';

interface SecurityConfig {
  maxLoginAttempts: number;
  lockoutDuration: number;
  passwordStrengthRequirement: number;
  sessionTimeout: number;
  twoFactorRequired: boolean;
}

interface LoginAttempt {
  ip: string;
  email: string;
  timestamp: number;
  success: boolean;
  userAgent?: string;
  location?: string;
}

interface SecurityEvent {
  userId?: string;
  type: 'login_success' | 'login_failure' | 'password_change' | 'suspicious_activity' | '2fa_enabled' | 'account_locked';
  ip: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

export class EnhancedSecurityService {
  private redis: RedisCache;
  private config: SecurityConfig;
  private suspiciousPatterns: RegExp[];

  constructor() {
    this.redis = new RedisCache();
    this.config = {
      maxLoginAttempts: 5,
      lockoutDuration: 900, // 15 minutes
      passwordStrengthRequirement: 8,
      sessionTimeout: 3600 * 24, // 24 hours
      twoFactorRequired: false
    };
    
    this.suspiciousPatterns = [
      /bot|crawler|spider/i,
      /automation|headless/i,
      /curl|wget|python/i
    ];
  }

  /**
   * Enhanced password hashing with adaptive cost
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = await this.getAdaptiveSaltRounds();
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Password strength validation
   */
  validatePasswordStrength(password: string): { 
    valid: boolean; 
    score: number; 
    feedback: string[] 
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) score += 25;
    else feedback.push('Password must be at least 8 characters');

    if (password.length >= 12) score += 10;

    // Complexity checks
    if (/[a-z]/.test(password)) score += 15;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score += 15;
    else feedback.push('Include uppercase letters');

    if (/\d/.test(password)) score += 15;
    else feedback.push('Include numbers');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20;
    else feedback.push('Include special characters');

    // Common password check
    if (this.isCommonPassword(password)) {
      score -= 30;
      feedback.push('Avoid common passwords');
    }

    return {
      valid: score >= 70 && feedback.length === 0,
      score: Math.max(0, Math.min(100, score)),
      feedback
    };
  }

  /**
   * Rate limiting for login attempts
   */
  async checkRateLimit(ip: string, email: string): Promise<{
    allowed: boolean;
    attemptsRemaining?: number;
    lockoutTimeRemaining?: number;
  }> {
    const ipKey = `rate_limit:ip:${ip}`;
    const emailKey = `rate_limit:email:${email}`;

    const [ipAttempts, emailAttempts] = await Promise.all([
      this.redis.get(ipKey),
      this.redis.get(emailKey)
    ]);

    const ipCount = parseInt(ipAttempts || '0');
    const emailCount = parseInt(emailAttempts || '0');

    if (ipCount >= this.config.maxLoginAttempts) {
      const ttl = await this.redis.ttl(ipKey);
      return { allowed: false, lockoutTimeRemaining: ttl };
    }

    if (emailCount >= this.config.maxLoginAttempts) {
      const ttl = await this.redis.ttl(emailKey);
      return { allowed: false, lockoutTimeRemaining: ttl };
    }

    return {
      allowed: true,
      attemptsRemaining: this.config.maxLoginAttempts - Math.max(ipCount, emailCount)
    };
  }

  /**
   * Record login attempt
   */
  async recordLoginAttempt(attempt: LoginAttempt): Promise<void> {
    const ipKey = `rate_limit:ip:${attempt.ip}`;
    const emailKey = `rate_limit:email:${attempt.email}`;

    if (!attempt.success) {
      await Promise.all([
        this.redis.incr(ipKey),
        this.redis.incr(emailKey),
        this.redis.expire(ipKey, this.config.lockoutDuration),
        this.redis.expire(emailKey, this.config.lockoutDuration)
      ]);
    } else {
      // Clear on successful login
      await Promise.all([
        this.redis.del(ipKey),
        this.redis.del(emailKey)
      ]);
    }

    // Log security event
    await this.logSecurityEvent({
      type: attempt.success ? 'login_success' : 'login_failure',
      ip: attempt.ip,
      userAgent: attempt.userAgent,
      timestamp: Date.now(),
      metadata: { email: attempt.email }
    });
  }

  /**
   * Detect suspicious activity
   */
  async detectSuspiciousActivity(
    ip: string,
    userAgent?: string,
    userId?: string
  ): Promise<{ suspicious: boolean; reasons: string[] }> {
    const reasons: string[] = [];

    // Check for bot-like user agents
    if (userAgent && this.suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
      reasons.push('Bot-like user agent detected');
    }

    // Check for rapid requests from same IP
    const recentRequests = await this.redis.get(`requests:${ip}`);
    if (recentRequests && parseInt(recentRequests) > 100) {
      reasons.push('Unusually high request rate');
    }

    // Check for login from new location (if user provided)
    if (userId) {
      const isNewLocation = await this.isNewLocationForUser(userId, ip);
      if (isNewLocation) {
        reasons.push('Login from new location');
      }
    }

    // Check for known malicious IPs (you'd have a database of these)
    const isKnownBadIP = await this.checkMaliciousIP(ip);
    if (isKnownBadIP) {
      reasons.push('IP flagged as suspicious');
    }

    return {
      suspicious: reasons.length > 0,
      reasons
    };
  }

  /**
   * Generate 2FA setup for user
   */
  async setup2FA(userId: string, email: string): Promise<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  }> {
    const secret = speakeasy.generateSecret({
      name: `Streamify (${email})`,
      issuer: 'Streamify'
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);
    
    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    // Store temporarily until verified
    await this.redis.set(`2fa_setup:${userId}`, JSON.stringify({
      secret: secret.base32,
      backupCodes,
      verified: false
    }), 600); // 10 minutes

    return {
      secret: secret.base32,
      qrCode,
      backupCodes
    };
  }

  /**
   * Verify 2FA token
   */
  async verify2FA(userId: string, token: string): Promise<boolean> {
    const setup = await this.redis.get(`2fa_setup:${userId}`);
    if (!setup) return false;

    const { secret } = JSON.parse(setup);

    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps of variance
    });

    if (verified) {
      // Move from setup to permanent storage
      await this.redis.set(`2fa:${userId}`, JSON.stringify({ secret, enabled: true }));
      await this.redis.del(`2fa_setup:${userId}`);
      
      await this.logSecurityEvent({
        userId,
        type: '2fa_enabled',
        ip: '',
        timestamp: Date.now()
      });
    }

    return verified;
  }

  /**
   * Generate secure session token with metadata
   */
  async generateSecureToken(userId: string, metadata: {
    ip: string;
    userAgent?: string;
    deviceId?: string;
  }): Promise<{ token: string; refreshToken: string; expiresAt: number }> {
    const sessionId = crypto.randomUUID();
    const expiresAt = Date.now() + this.config.sessionTimeout * 1000;

    const payload = {
      userId,
      sessionId,
      metadata,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(expiresAt / 1000)
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!);
    const refreshToken = crypto.randomBytes(32).toString('hex');

    // Store session info
    await this.redis.set(`session:${sessionId}`, JSON.stringify({
      userId,
      metadata,
      refreshToken,
      createdAt: Date.now(),
      expiresAt
    }), this.config.sessionTimeout);

    return { token, refreshToken, expiresAt };
  }

  /**
   * Session validation with security checks
   */
  async validateSession(token: string, currentIP: string): Promise<{
    valid: boolean;
    userId?: string;
    securityFlags?: string[];
  }> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const session = await this.redis.get(`session:${decoded.sessionId}`);
      
      if (!session) return { valid: false };

      const sessionData = JSON.parse(session);
      const securityFlags: string[] = [];

      // Check for IP change
      if (sessionData.metadata.ip !== currentIP) {
        securityFlags.push('IP_CHANGED');
      }

      // Check session age
      const sessionAge = Date.now() - sessionData.createdAt;
      if (sessionAge > this.config.sessionTimeout * 1000) {
        securityFlags.push('SESSION_EXPIRED');
      }

      return {
        valid: true,
        userId: decoded.userId,
        securityFlags: securityFlags.length > 0 ? securityFlags : undefined
      };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Get user security overview
   */
  async getSecurityOverview(userId: string): Promise<{
    has2FA: boolean;
    lastPasswordChange: number;
    activeSessions: number;
    recentSecurityEvents: SecurityEvent[];
    securityScore: number;
  }> {
    const [has2FA, activeSessions, recentEvents] = await Promise.all([
      this.redis.exists(`2fa:${userId}`),
      this.getActiveSessionCount(userId),
      this.getRecentSecurityEvents(userId, 10)
    ]);

    const lastPasswordChange = await this.getLastPasswordChange(userId);
    const securityScore = this.calculateSecurityScore({
      has2FA: !!has2FA,
      passwordAge: Date.now() - lastPasswordChange,
      activeSessions,
      recentFailures: recentEvents.filter(e => e.type === 'login_failure').length
    });

    return {
      has2FA: !!has2FA,
      lastPasswordChange,
      activeSessions,
      recentSecurityEvents: recentEvents,
      securityScore
    };
  }

  private async getAdaptiveSaltRounds(): Promise<number> {
    // Adjust based on server load
    return 12; // Default, could be dynamic
  }

  private isCommonPassword(password: string): boolean {
    const common = ['password', '123456', 'qwerty', 'admin', 'welcome'];
    return common.includes(password.toLowerCase());
  }

  private async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const key = `security_events:${event.userId || 'anonymous'}`;
    await this.redis.lpush(key, JSON.stringify(event));
    await this.redis.ltrim(key, 0, 99); // Keep last 100 events
    await this.redis.expire(key, 3600 * 24 * 30); // 30 days
  }

  private async isNewLocationForUser(userId: string, ip: string): Promise<boolean> {
    const knownIPs = await this.redis.smembers(`known_ips:${userId}`);
    return !knownIPs.includes(ip);
  }

  private async checkMaliciousIP(ip: string): Promise<boolean> {
    // In production, this would check against threat intelligence feeds
    return false;
  }

  private async getActiveSessionCount(userId: string): Promise<number> {
    const keys = await this.redis.keys(`session:*`);
    let count = 0;
    
    for (const key of keys) {
      const session = await this.redis.get(key);
      if (session) {
        const data = JSON.parse(session);
        if (data.userId === userId) count++;
      }
    }
    
    return count;
  }

  private async getRecentSecurityEvents(userId: string, limit: number): Promise<SecurityEvent[]> {
    const events = await this.redis.lrange(`security_events:${userId}`, 0, limit - 1);
    return events.map(e => JSON.parse(e));
  }

  private async getLastPasswordChange(userId: string): Promise<number> {
    const timestamp = await this.redis.get(`password_changed:${userId}`);
    return timestamp ? parseInt(timestamp) : 0;
  }

  private calculateSecurityScore(factors: {
    has2FA: boolean;
    passwordAge: number;
    activeSessions: number;
    recentFailures: number;
  }): number {
    let score = 50; // Base score

    if (factors.has2FA) score += 30;
    if (factors.passwordAge < 90 * 24 * 60 * 60 * 1000) score += 10; // Recent password
    if (factors.activeSessions <= 3) score += 10; // Reasonable session count
    if (factors.recentFailures === 0) score += 10; // No recent failures

    return Math.min(100, Math.max(0, score));
  }
}