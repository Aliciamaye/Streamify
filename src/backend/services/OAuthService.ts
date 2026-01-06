/**
 * OAuth Service
 * Handles Google OAuth authentication
 */

import { logger } from '../utils/logger';

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export class OAuthService {
  private static readonly GOOGLE_TOKEN_INFO_URL = 'https://oauth2.googleapis.com/tokeninfo';

  /**
   * Verify Google OAuth token and get user info
   */
  static async verifyGoogleToken(token: string): Promise<GoogleUser | null> {
    try {
      const response = await fetch(`${this.GOOGLE_TOKEN_INFO_URL}?id_token=${token}`);
      
      if (!response.ok) {
        logger.warn('Google token verification failed');
        return null;
      }

      const data = await response.json();

      // Verify token is valid
      if (!data.email || !data.email_verified) {
        logger.warn('Google token email not verified');
        return null;
      }

      return {
        id: data.sub,
        email: data.email,
        name: data.name || data.email.split('@')[0],
        picture: data.picture,
        given_name: data.given_name,
        family_name: data.family_name,
      };
    } catch (error) {
      logger.error('Google OAuth verification error:', error);
      return null;
    }
  }

  /**
   * Get Google OAuth URL for frontend redirect
   */
  static getGoogleAuthUrl(clientId: string, redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'token id_token',
      scope: 'openid email profile',
      nonce: Math.random().toString(36).substring(7),
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }
}
