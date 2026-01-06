/**
 * Email Service
 * Handles OTP generation and email sending (using console for development)
 */

import crypto from 'crypto';
import { logger } from '../utils/logger';
import { Cache } from '../utils/cache';

const otpCache = new Cache();

interface OTPData {
  code: string;
  email: string;
  expiresAt: number;
}

export class EmailService {
  /**
   * Generate a 6-digit OTP
   */
  private static generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Send OTP via email (console log for development)
   * In production, integrate with SendGrid, AWS SES, or similar
   */
  static async sendOTP(email: string, purpose: 'registration' | 'login' | 'reset'): Promise<string> {
    try {
      const otp = this.generateOTP();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Store OTP in cache
      const otpKey = `otp:${email}:${purpose}`;
      otpCache.set(otpKey, { code: otp, email, expiresAt }, 600); // 10 minutes TTL

      // Log OTP to console (for development)
      logger.info(`📧 OTP for ${email} (${purpose}): ${otp}`);
      console.log('\n' + '='.repeat(60));
      console.log(`🔐 OTP VERIFICATION CODE`);
      console.log('='.repeat(60));
      console.log(`Email: ${email}`);
      console.log(`Purpose: ${purpose}`);
      console.log(`Code: ${otp}`);
      console.log(`Expires: ${new Date(expiresAt).toLocaleTimeString()}`);
      console.log('='.repeat(60) + '\n');

      // In production, send actual email:
      // await sendGridClient.send({
      //   to: email,
      //   from: 'noreply@streamify.app',
      //   subject: `Your Streamify verification code`,
      //   text: `Your verification code is: ${otp}. Valid for 10 minutes.`,
      //   html: `<strong>Your verification code is: ${otp}</strong><br/>Valid for 10 minutes.`
      // });

      return otp;
    } catch (error) {
      logger.error('Failed to send OTP:', error);
      throw new Error('Failed to send OTP');
    }
  }

  /**
   * Verify OTP
   */
  static verifyOTP(email: string, otp: string, purpose: 'registration' | 'login' | 'reset'): boolean {
    try {
      const otpKey = `otp:${email}:${purpose}`;
      const stored = otpCache.get<OTPData>(otpKey);

      if (!stored) {
        logger.warn(`OTP verification failed: No OTP found for ${email} (${purpose})`);
        return false;
      }

      if (stored.expiresAt < Date.now()) {
        otpCache.delete(otpKey);
        logger.warn(`OTP verification failed: Expired for ${email}`);
        return false;
      }

      if (stored.code !== otp) {
        logger.warn(`OTP verification failed: Invalid code for ${email}`);
        return false;
      }

      // OTP is valid, delete it
      otpCache.delete(otpKey);
      logger.info(`✅ OTP verified successfully for ${email}`);
      return true;
    } catch (error) {
      logger.error('OTP verification error:', error);
      return false;
    }
  }

  /**
   * Check if OTP exists for email
   */
  static hasOTP(email: string, purpose: 'registration' | 'login' | 'reset'): boolean {
    const otpKey = `otp:${email}:${purpose}`;
    return otpCache.has(otpKey);
  }

  /**
   * Resend OTP (with rate limiting)
   */
  static async resendOTP(email: string, purpose: 'registration' | 'login' | 'reset'): Promise<string> {
    const rateLimitKey = `otp:ratelimit:${email}`;
    const lastSent = otpCache.get<number>(rateLimitKey);

    if (lastSent && Date.now() - lastSent < 60000) {
      throw new Error('Please wait 60 seconds before requesting a new code');
    }

    otpCache.set(rateLimitKey, Date.now(), 60);
    return this.sendOTP(email, purpose);
  }
}
