/**
 * API Client - Enhanced
 * Frontend utility for communicating with the backend API
 * with retry logic, better error handling, and automatic token refresh
 */

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ||
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (import.meta as any).env?.VITE_API_SERVER ||
  'http://localhost:5000';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: any;
}

interface LyricsResponse {
  videoId: string;
  title: string;
  artist: string;
  lyrics: string;
  syncedLyrics?: Array<{ time: number; text: string }>;
  source?: string;
  isSynced?: boolean;
}

interface SpotifyPlaylistImportResult {
  imported: number;
  total: number;
  failures: number;
  items: any[];
}

interface SpotifyJobStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  playlistId?: string;
  result?: SpotifyPlaylistImportResult;
  error?: string;
}


class ApiClientClass {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken(): void {
    this.token = localStorage.getItem('accessToken');
  }

  private saveToken(token: string): void {
    this.token = token;
    localStorage.setItem('accessToken', token);
  }

  private saveRefreshToken(token: string): void {
    localStorage.setItem('refreshToken', token);
  }

  /**
   * Determine if a user is currently authenticated based on a valid access token.
   * Performs a lightweight JWT exp check and clears tokens if expired/invalid.
   */
  isAuthenticated(): boolean {
    if (!this.token) {
      this.loadToken();
    }

    const token = this.token;
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1] || '')) as { exp?: number };
      if (payload?.exp && Date.now() >= payload.exp * 1000) {
        this.logout();
        return false;
      }
    } catch {
      // If token is malformed, treat as unauthenticated and clear stored tokens
      this.logout();
      return false;
    }

    return true;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Make an HTTP request with automatic retry and better error handling
   */
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    options: {
      timeout?: number;
      retries?: number;
      skipAuth?: boolean;
    } = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = 30000, // 30 second default timeout
      retries = 2,  // Lower number for faster response
      skipAuth = false,
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const url = `${this.baseURL}${endpoint}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const requestOptions: RequestInit = {
          method,
          headers: skipAuth ? { 'Content-Type': 'application/json' } : this.getHeaders(),
          signal: controller.signal,
        };

        if (data && method !== 'GET') {
          requestOptions.body = JSON.stringify(data);
        }

        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);

        // Handle HTTP errors
        if (!response.ok) {
          if (response.status === 401 && !skipAuth) {
            // Try to refresh token
            const refreshed = await this.refreshAccessToken();
            if (refreshed && refreshed.success) {
              // Retry the request with new token
              return this.request<T>(endpoint, method, data, { ...options, retries: 0 });
            }
          }

          // Parse error response
          let errorData: ApiResponse<T>;
          try {
            errorData = await response.json();
          } catch {
            errorData = {
              success: false,
              message: `HTTP ${response.status}: ${response.statusText}`,
              statusCode: response.status,
            };
          }

          throw new Error(errorData.message || `Request failed with status ${response.status}`);
        }

        // Parse successful response
        const result: ApiResponse<T> = await response.json();

        // Validate response structure
        if (typeof result !== 'object' || result === null) {
          throw new Error('Invalid response format from server');
        }

        return result;
      } catch (error: any) {
        lastError = error;

        // Don't retry on certain errors
        const shouldNotRetry =
          error.name === 'AbortError' || // Timeout
          error.message?.includes('401') || // Auth errors
          error.message?.includes('403') || // Forbidden
          error.message?.includes('404') || // Not found
          attempt >= retries; // Max retries reached

        if (shouldNotRetry) {
          break;
        }

        // Exponential backoff before retry
        const backoffDelay = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.warn(`Request failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${backoffDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }

    // All retries failed
    console.error(`API Error (${endpoint}):`, lastError);

    return {
      success: false,
      message: lastError?.message || 'Request failed after multiple retries',
      statusCode: 500,
    };
  }

  async register(
    email: string,
    username: string,
    password: string,
    firstName?: string,
    lastName?: string,
    otp?: string
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/api/auth/register', 'POST', {
      email,
      username,
      password,
      firstName,
      lastName,
      otp,
    });

    if (response.success && response.data) {
      this.saveToken(response.data.accessToken);
      this.saveRefreshToken(response.data.refreshToken);
    }

    return response;
  }

  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/api/auth/login', 'POST', {
      email,
      password,
    });

    if (response.success && response.data) {
      this.saveToken(response.data.accessToken);
      this.saveRefreshToken(response.data.refreshToken);
    }

    return response;
  }

  async refreshAccessToken(): Promise<ApiResponse<AuthResponse> | null> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    const response = await this.request<AuthResponse>('/api/auth/refresh', 'POST', {
      refreshToken,
    });

    if (response.success && response.data) {
      this.saveToken(response.data.accessToken);
      if (response.data.refreshToken) {
        this.saveRefreshToken(response.data.refreshToken);
      }
    }

    return response;
  }

  async getCurrentUser(): Promise<any> {
    return this.request('/api/auth/me', 'GET');
  }

  async updateProfile(updates: Record<string, any>): Promise<ApiResponse<any>> {
    return this.request('/api/social/profile', 'PUT', updates);
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.token = null;
  }

  async searchMusic(query: string, limit: number = 20): Promise<any> {
    return this.request(`/api/music/search?q=${encodeURIComponent(query)}&limit=${limit}`, 'GET');
  }

  async getTrendingMusic(limit: number = 50): Promise<any> {
    return this.request(`/api/music/trending?limit=${limit}`, 'GET');
  }

  async getMusicDetails(videoId: string): Promise<any> {
    return this.request(`/api/music/${videoId}`, 'GET');
  }

  async getPlaybackUrl(videoId: string): Promise<any> {
    return this.request(`/api/music/${videoId}/stream`, 'GET');
  }

  async searchLyrics(query: string): Promise<ApiResponse<any>> {
    return this.request(`/api/lyrics/search?q=${encodeURIComponent(query)}`, 'GET');
  }

  async getLyricsByVideoId(videoId: string): Promise<ApiResponse<LyricsResponse>> {
    return this.request(`/api/lyrics/${videoId}`, 'GET');
  }

  async getSpotifyStatus(): Promise<ApiResponse<any>> {
    return this.request('/api/spotify/status', 'GET');
  }

  async getSpotifyConnectUrl(): Promise<ApiResponse<any>> {
    return this.request('/api/spotify/connect', 'GET');
  }

  async listSpotifyPlaylists(): Promise<ApiResponse<any>> {
    return this.request('/api/spotify/playlists', 'GET');
  }

  async disconnectSpotify(): Promise<ApiResponse<any>> {
    return this.request('/api/spotify/disconnect', 'POST');
  }

  async importSpotifyPlaylist(playlistId: string): Promise<ApiResponse<SpotifyPlaylistImportResult>> {
    return this.request(`/api/spotify/playlists/${playlistId}/import`, 'POST');
  }

  async importSpotifyPlaylistAsync(playlistId: string): Promise<ApiResponse<{ jobId: string }>> {
    return this.request(`/api/spotify/playlists/${playlistId}/import/async`, 'POST');
  }

  async getSpotifyJobStatus(jobId: string): Promise<ApiResponse<SpotifyJobStatus>> {
    return this.request(`/api/spotify/jobs/${jobId}`, 'GET');
  }

  // ==================== APPLE MUSIC ====================

  async getAppleMusicConnectUrl(): Promise<ApiResponse<any>> {
    return this.request('/api/applemusic/connect', 'GET');
  }

  async storeAppleMusicToken(musicUserToken: string): Promise<ApiResponse<any>> {
    return this.request('/api/applemusic/token', 'POST', { musicUserToken });
  }

  async getAppleMusicStatus(): Promise<ApiResponse<any>> {
    return this.request('/api/applemusic/status', 'GET');
  }

  async listAppleMusicPlaylists(): Promise<ApiResponse<any>> {
    return this.request('/api/applemusic/playlists', 'GET');
  }

  async disconnectAppleMusic(): Promise<ApiResponse<any>> {
    return this.request('/api/applemusic/disconnect', 'POST');
  }

  async importAppleMusicPlaylist(playlistId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/applemusic/playlists/${playlistId}/import`, 'POST');
  }

  async importAppleMusicPlaylistAsync(playlistId: string): Promise<ApiResponse<{ jobId: string }>> {
    return this.request(`/api/applemusic/playlists/${playlistId}/import/async`, 'POST');
  }

  async getAppleMusicJobStatus(jobId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/applemusic/jobs/${jobId}`, 'GET');
  }

  // ==================== LAST.FM ====================

  async getLastFmConnectUrl(callbackUrl?: string): Promise<ApiResponse<{ url: string }>> {
    const url = callbackUrl ? `/api/lastfm/connect?callback=${encodeURIComponent(callbackUrl)}` : '/api/lastfm/connect';
    return this.request(url, 'GET');
  }

  async lastFmCallback(token: string): Promise<ApiResponse<any>> {
    return this.request('/api/lastfm/callback', 'POST', { token });
  }

  async getLastFmStatus(): Promise<ApiResponse<any>> {
    return this.request('/api/lastfm/status', 'GET');
  }

  async disconnectLastFm(): Promise<ApiResponse<any>> {
    return this.request('/api/lastfm/disconnect', 'POST');
  }

  async scrobbleLastFm(track: { artist: string; title: string; album?: string; timestamp?: number; duration?: number }): Promise<ApiResponse<any>> {
    return this.request('/api/lastfm/scrobble', 'POST', track);
  }

  async updateLastFmNowPlaying(track: { artist: string; title: string; album?: string; duration?: number }): Promise<ApiResponse<any>> {
    return this.request('/api/lastfm/now-playing', 'POST', track);
  }

  async getLastFmRecentTracks(limit: number = 50): Promise<ApiResponse<any>> {
    return this.request(`/api/lastfm/recent-tracks?limit=${limit}`, 'GET');
  }

  async getLastFmTopTracks(period: string = 'overall', limit: number = 50): Promise<ApiResponse<any>> {
    return this.request(`/api/lastfm/top-tracks?period=${period}&limit=${limit}`, 'GET');
  }

  async getLastFmTopArtists(period: string = 'overall', limit: number = 50): Promise<ApiResponse<any>> {
    return this.request(`/api/lastfm/top-artists?period=${period}&limit=${limit}`, 'GET');
  }

  async getLastFmSimilarTracks(artist: string, track: string, limit: number = 30): Promise<ApiResponse<any>> {
    return this.request(`/api/lastfm/similar-tracks?artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&limit=${limit}`, 'GET');
  }

  // ==================== DISCORD ====================

  async getDiscordStatus(): Promise<ApiResponse<any>> {
    return this.request('/api/discord/status', 'GET');
  }

  async updateDiscordPresence(track: { title: string; artist: string; duration?: number; thumbnail?: string }): Promise<ApiResponse<any>> {
    return this.request('/api/discord/presence', 'POST', track);
  }

  async clearDiscordPresence(): Promise<ApiResponse<any>> {
    return this.request('/api/discord/presence', 'DELETE');
  }

  async getDiscordPresence(): Promise<ApiResponse<any>> {
    return this.request('/api/discord/presence', 'GET');
  }

  async storeDiscordWebhook(webhookUrl: string): Promise<ApiResponse<any>> {
    return this.request('/api/discord/webhook', 'POST', { webhookUrl });
  }

  async removeDiscordWebhook(): Promise<ApiResponse<any>> {
    return this.request('/api/discord/webhook', 'DELETE');
  }

  async shareTrackToDiscord(track: { title: string; artist: string; url?: string; thumbnail?: string }): Promise<ApiResponse<any>> {
    return this.request('/api/discord/share/track', 'POST', track);
  }

  async sharePlaylistToDiscord(playlist: { name: string; trackCount: number; url?: string; thumbnail?: string }): Promise<ApiResponse<any>> {
    return this.request('/api/discord/share/playlist', 'POST', playlist);
  }
}

export const apiClient = new ApiClientClass();
export { ApiClientClass as ApiClient };
