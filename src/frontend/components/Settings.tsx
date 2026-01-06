import React, { useEffect, useState } from 'react';
import { Settings, Moon, Sun, Volume2, Zap, Bell, LogOut, User as UserIcon, Palette, RefreshCcw, Link, Loader2, CheckCircle, Music, Activity, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeId } from '../types';
import { apiClient } from '../utils/apiClient';

export const SettingsView: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme: currentTheme, setTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoPlaySimilar, setAutoPlaySimilar] = useState(true);
  const [qualityPreference, setQualityPreference] = useState<'low' | 'medium' | 'high'>('high');
  const [spotifyStatus, setSpotifyStatus] = useState<{ connected: boolean; expiresAt?: number } | null>(null);
  const [spotifyLoading, setSpotifyLoading] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [jobStatus, setJobStatus] = useState<{ jobId?: string; status?: string; result?: any; error?: string } | null>(null);

  // Apple Music state
  const [appleMusicStatus, setAppleMusicStatus] = useState<{ connected: boolean } | null>(null);
  const [appleMusicLoading, setAppleMusicLoading] = useState(false);
  const [appleMusicPlaylists, setAppleMusicPlaylists] = useState<any[]>([]);
  const [appleMusicJobStatus, setAppleMusicJobStatus] = useState<{ jobId?: string; status?: string; result?: any; error?: string } | null>(null);

  // Last.fm state
  const [lastFmStatus, setLastFmStatus] = useState<{ connected: boolean; username?: string } | null>(null);
  const [lastFmLoading, setLastFmLoading] = useState(false);

  // Discord state
  const [discordStatus, setDiscordStatus] = useState<{ webhookConfigured: boolean } | null>(null);
  const [discordLoading, setDiscordLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  const fetchSpotifyStatus = async () => {
    try {
      setSpotifyLoading(true);
      const res = await apiClient.getSpotifyStatus();
      if (res.success) {
        setSpotifyStatus(res.data as any);
        if ((res.data as any)?.connected) {
          await fetchPlaylists();
        } else {
          setPlaylists([]);
        }
      }
    } finally {
      setSpotifyLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    const res = await apiClient.listSpotifyPlaylists();
    if (res.success) {
      setPlaylists(res.data?.playlists || res.data || []);
    }
  };

  useEffect(() => {
    fetchSpotifyStatus();
  }, []);

  const handleConnectSpotify = async () => {
    setIsConnecting(true);
    try {
      const res = await apiClient.getSpotifyConnectUrl();
      const url = (res.data as any)?.url;
      if (url) {
        window.open(url, '_blank', 'width=520,height=700');
      }
    } finally {
      setIsConnecting(false);
      setTimeout(fetchSpotifyStatus, 5000);
    }
  };

  const handleDisconnectSpotify = async () => {
    setSpotifyLoading(true);
    await apiClient.disconnectSpotify();
    setSpotifyStatus({ connected: false });
    setPlaylists([]);
    setSpotifyLoading(false);
  };

  const startImportJob = async (playlistId: string) => {
    setJobStatus({ status: 'queued' });
    const res = await apiClient.importSpotifyPlaylistAsync(playlistId);
    if (res.success && (res.data as any)?.jobId) {
      const jobId = (res.data as any).jobId;
      setJobStatus({ jobId, status: 'queued' });
      pollJob(jobId);
    } else {
      setJobStatus({ status: 'failed', error: res.message });
    }
  };

  const pollJob = async (jobId: string) => {
    const poll = async () => {
      const res = await apiClient.getSpotifyJobStatus(jobId);
      if (!res.success) {
        setJobStatus({ jobId, status: 'failed', error: res.message });
        return true;
      }
      const payload = res.data as any;
      setJobStatus({ jobId, status: payload.status, result: payload.result, error: payload.error });
      return payload.status === 'completed' || payload.status === 'failed';
    };

    let done = await poll();
    let attempts = 0;
    while (!done && attempts < 20) {
      await new Promise((r) => setTimeout(r, 2500));
      done = await poll();
      attempts += 1;
    }
  };

  // ==================== APPLE MUSIC ====================

  const fetchAppleMusicStatus = async () => {
    try {
      setAppleMusicLoading(true);
      const res = await apiClient.getAppleMusicStatus();
      if (res.success) {
        setAppleMusicStatus(res.data as any);
        if ((res.data as any)?.connected) {
          await fetchAppleMusicPlaylists();
        } else {
          setAppleMusicPlaylists([]);
        }
      }
    } finally {
      setAppleMusicLoading(false);
    }
  };

  const fetchAppleMusicPlaylists = async () => {
    const res = await apiClient.listAppleMusicPlaylists();
    if (res.success) {
      setAppleMusicPlaylists(res.data?.playlists || res.data || []);
    }
  };

  const handleConnectAppleMusic = () => {
    alert('Use MusicKit JS on this page to authorize Apple Music. After getting musicUserToken, send it to /api/applemusic/token.');
  };

  const handleDisconnectAppleMusic = async () => {
    await apiClient.disconnectAppleMusic();
    await fetchAppleMusicStatus();
  };

  const startAppleMusicImportJob = async (playlistId: string) => {
    const res = await apiClient.importAppleMusicPlaylistAsync(playlistId);
    if (res.success && res.data?.jobId) {
      pollAppleMusicJob(res.data.jobId);
    }
  };

  const pollAppleMusicJob = async (jobId: string) => {
    const poll = async () => {
      const res = await apiClient.getAppleMusicJobStatus(jobId);
      if (!res.success) {
        setAppleMusicJobStatus({ jobId, status: 'failed', error: res.message });
        return true;
      }
      const payload = res.data as any;
      setAppleMusicJobStatus({ jobId, status: payload.status, result: payload.result, error: payload.error });
      return payload.status === 'completed' || payload.status === 'failed';
    };

    let done = await poll();
    let attempts = 0;
    while (!done && attempts < 20) {
      await new Promise((r) => setTimeout(r, 2500));
      done = await poll();
      attempts += 1;
    }
  };

  // ==================== LAST.FM ====================

  const fetchLastFmStatus = async () => {
    try {
      setLastFmLoading(true);
      const res = await apiClient.getLastFmStatus();
      if (res.success) {
        setLastFmStatus(res.data as any);
      }
    } finally {
      setLastFmLoading(false);
    }
  };

  const handleConnectLastFm = async () => {
    const res = await apiClient.getLastFmConnectUrl();
    if (res.success && res.data?.url) {
      window.open(res.data.url, '_blank', 'width=600,height=700');
    }
  };

  const handleDisconnectLastFm = async () => {
    await apiClient.disconnectLastFm();
    await fetchLastFmStatus();
  };

  // ==================== DISCORD ====================

  const fetchDiscordStatus = async () => {
    try {
      setDiscordLoading(true);
      const res = await apiClient.getDiscordStatus();
      if (res.success) {
        setDiscordStatus(res.data as any);
      }
    } finally {
      setDiscordLoading(false);
    }
  };

  const handleStoreDiscordWebhook = async () => {
    if (!webhookUrl) {
      alert('Please enter a Discord webhook URL');
      return;
    }
    const res = await apiClient.storeDiscordWebhook(webhookUrl);
    if (res.success) {
      alert('Discord webhook configured!');
      await fetchDiscordStatus();
      setWebhookUrl('');
    }
  };

  const handleRemoveDiscordWebhook = async () => {
    await apiClient.removeDiscordWebhook();
    await fetchDiscordStatus();
  };

  useEffect(() => {
    fetchAppleMusicStatus();
    fetchLastFmStatus();
    fetchDiscordStatus();
  }, []);

  const themes: { id: ThemeId; name: string; color: string }[] = [
    { id: 'midnight', name: 'Midnight', color: 'from-slate-900 to-slate-800' },
    { id: 'ocean', name: 'Ocean', color: 'from-blue-900 to-teal-800' },
    { id: 'sunset', name: 'Sunset', color: 'from-orange-900 to-red-800' },
    { id: 'nebula', name: 'Nebula', color: 'from-purple-900 to-pink-800' },
  ];

  return (
    <div className="pb-40 pt-8 px-8 overflow-y-auto max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-full">
            <Settings className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Settings</h1>
            <p className="text-gray-400">Customize your Streamify experience</p>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <UserIcon size={24} className="text-blue-400" />
          Profile
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Email</label>
            <div className="bg-black/20 border border-white/10 rounded-lg p-3 text-white">
              {user?.email || 'Not logged in'}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Username</label>
            <div className="bg-black/20 border border-white/10 rounded-lg p-3 text-white">
              {user?.username || 'Anonymous'}
            </div>
          </div>
        </div>
      </div>

      {/* Spotify Integration */}
      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          Spotify Integration
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 p-4 bg-black/20 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${spotifyStatus?.connected ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                <span className="text-white font-medium">
                  {spotifyStatus?.connected ? 'Connected to Spotify' : 'Not Connected'}
                </span>
              </div>
              <div className="flex gap-2">
                {spotifyStatus?.connected ? (
                  <button
                    onClick={handleDisconnectSpotify}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/10 transition-all"
                    disabled={spotifyLoading}
                  >
                    {spotifyLoading ? 'Disconnecting...' : 'Disconnect'}
                  </button>
                ) : (
                  <button
                    onClick={handleConnectSpotify}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all"
                    disabled={isConnecting}
                  >
                    {isConnecting ? 'Opening...' : 'Connect Spotify'}
                  </button>
                )}
                <button
                  onClick={fetchSpotifyStatus}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                  title="Refresh status"
                >
                  <RefreshCcw size={18} className="text-white" />
                </button>
              </div>
            </div>
            {spotifyStatus?.connected && spotifyStatus.expiresAt && (
              <p className="text-xs text-gray-400">Access token expires: {new Date(spotifyStatus.expiresAt).toLocaleString()}</p>
            )}
          </div>

          {spotifyStatus?.connected && (
            <div className="space-y-3 bg-black/20 p-4 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold flex items-center gap-2">
                  <Link size={18} className="text-emerald-400" /> Playlists
                </p>
                <button
                  onClick={fetchPlaylists}
                  className="text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10"
                >
                  Refresh
                </button>
              </div>
              {playlists.length === 0 ? (
                <p className="text-sm text-gray-400">No playlists loaded yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {playlists.map((pl: any) => (
                    <div key={pl.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-white font-semibold line-clamp-1">{pl.name}</p>
                      <p className="text-xs text-gray-400">{pl.tracks?.total || 0} tracks</p>
                      <button
                        onClick={() => startImportJob(pl.id)}
                        className="mt-2 text-xs px-3 py-2 rounded-md bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold hover:from-emerald-500 hover:to-green-500 transition"
                      >
                        Import asynchronously
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {jobStatus && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-3 text-sm text-white">
                  {jobStatus.status === 'completed' ? (
                    <CheckCircle size={18} className="text-emerald-400" />
                  ) : jobStatus.status === 'failed' ? (
                    <span className="text-red-400">!</span>
                  ) : (
                    <Loader2 size={18} className="animate-spin text-white" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">Import status: {jobStatus.status}</p>
                    {jobStatus.result && (
                      <p className="text-xs text-gray-300">Imported {jobStatus.result.imported}/{jobStatus.result.total} (failures {jobStatus.result.failures})</p>
                    )}
                    {jobStatus.error && <p className="text-xs text-red-400">{jobStatus.error}</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-sm text-gray-400 bg-black/20 p-4 rounded-lg border border-white/10">
            <p className="mb-2">✨ <strong>Import your playlists</strong> from Spotify</p>
            <p className="mb-2">📊 <strong>Sync listening history</strong> and top tracks</p>
            <p>🎨 <strong>Get animated Canvas</strong> backgrounds</p>
          </div>
        </div>
      </div>

      {/* Apple Music Integration */}
      <div className="bg-gradient-to-r from-pink-600/20 to-red-600/20 border border-pink-500/30 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Music size={24} className="text-pink-400" />
          Apple Music Integration
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 p-4 bg-black/20 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${appleMusicStatus?.connected ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                <span className="text-white font-medium">
                  {appleMusicStatus?.connected ? 'Connected to Apple Music' : 'Not Connected'}
                </span>
              </div>
              <div className="flex gap-2">
                {appleMusicStatus?.connected ? (
                  <button
                    onClick={handleDisconnectAppleMusic}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/10 transition-all"
                    disabled={appleMusicLoading}
                  >
                    {appleMusicLoading ? 'Disconnecting...' : 'Disconnect'}
                  </button>
                ) : (
                  <button
                    onClick={handleConnectAppleMusic}
                    className="px-4 py-2 bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white font-semibold rounded-lg transition-all"
                  >
                    Connect Apple Music
                  </button>
                )}
                <button
                  onClick={fetchAppleMusicStatus}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                  title="Refresh status"
                >
                  <RefreshCcw size={18} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          {appleMusicStatus?.connected && (
            <div className="space-y-3 bg-black/20 p-4 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold flex items-center gap-2">
                  <Link size={18} className="text-pink-400" /> Playlists
                </p>
                <button
                  onClick={fetchAppleMusicPlaylists}
                  className="text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10"
                >
                  Refresh
                </button>
              </div>
              {appleMusicPlaylists.length === 0 ? (
                <p className="text-sm text-gray-400">No playlists loaded yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {appleMusicPlaylists.map((pl: any) => (
                    <div key={pl.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-white font-semibold line-clamp-1">{pl.attributes?.name || pl.name}</p>
                      <p className="text-xs text-gray-400">{pl.attributes?.trackCount || 0} tracks</p>
                      <button
                        onClick={() => startAppleMusicImportJob(pl.id)}
                        className="mt-2 text-xs px-3 py-2 rounded-md bg-gradient-to-r from-pink-600 to-red-600 text-white font-semibold hover:from-pink-500 hover:to-red-500 transition"
                      >
                        Import asynchronously
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {appleMusicJobStatus && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-3 text-sm text-white">
                  {appleMusicJobStatus.status === 'completed' ? (
                    <CheckCircle size={18} className="text-emerald-400" />
                  ) : appleMusicJobStatus.status === 'failed' ? (
                    <span className="text-red-400">!</span>
                  ) : (
                    <Loader2 size={18} className="animate-spin text-white" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">Import status: {appleMusicJobStatus.status}</p>
                    {appleMusicJobStatus.result && (
                      <p className="text-xs text-gray-300">Imported {appleMusicJobStatus.result.imported}/{appleMusicJobStatus.result.total}</p>
                    )}
                    {appleMusicJobStatus.error && <p className="text-xs text-red-400">{appleMusicJobStatus.error}</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-sm text-gray-400 bg-black/20 p-4 rounded-lg border border-white/10">
            <p className="mb-2">🎵 <strong>Import playlists</strong> from Apple Music</p>
            <p>🔄 <strong>Sync your library</strong> with Streamify</p>
          </div>
        </div>
      </div>

      {/* Last.fm Integration */}
      <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/30 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Activity size={24} className="text-red-400" />
          Last.fm Integration
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 p-4 bg-black/20 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${lastFmStatus?.connected ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                <span className="text-white font-medium">
                  {lastFmStatus?.connected ? `Connected as ${lastFmStatus.username}` : 'Not Connected'}
                </span>
              </div>
              <div className="flex gap-2">
                {lastFmStatus?.connected ? (
                  <button
                    onClick={handleDisconnectLastFm}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/10 transition-all"
                    disabled={lastFmLoading}
                  >
                    {lastFmLoading ? 'Disconnecting...' : 'Disconnect'}
                  </button>
                ) : (
                  <button
                    onClick={handleConnectLastFm}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-lg transition-all"
                  >
                    Connect Last.fm
                  </button>
                )}
                <button
                  onClick={fetchLastFmStatus}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                  title="Refresh status"
                >
                  <RefreshCcw size={18} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-400 bg-black/20 p-4 rounded-lg border border-white/10">
            <p className="mb-2">📊 <strong>Auto-scrobble</strong> all your plays</p>
            <p className="mb-2">🎯 <strong>Get personalized stats</strong> and insights</p>
            <p>🎵 <strong>Discover similar tracks</strong> based on your taste</p>
          </div>
        </div>
      </div>

      {/* Discord Integration */}
      <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <MessageCircle size={24} className="text-indigo-400" />
          Discord Integration
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 p-4 bg-black/20 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${discordStatus?.webhookConfigured ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                <span className="text-white font-medium">
                  {discordStatus?.webhookConfigured ? 'Webhook Configured' : 'No Webhook'}
                </span>
              </div>
              <div className="flex gap-2">
                {discordStatus?.webhookConfigured && (
                  <button
                    onClick={handleRemoveDiscordWebhook}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/10 transition-all"
                    disabled={discordLoading}
                  >
                    Remove Webhook
                  </button>
                )}
                <button
                  onClick={fetchDiscordStatus}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                  title="Refresh status"
                >
                  <RefreshCcw size={18} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-black/20 p-4 rounded-lg border border-white/10">
            <label className="text-sm text-gray-400 block mb-2">Discord Webhook URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleStoreDiscordWebhook}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
              >
                Save
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-400 bg-black/20 p-4 rounded-lg border border-white/10">
            <p className="mb-2">🎮 <strong>Rich Presence</strong> - Show what you're playing</p>
            <p className="mb-2">📢 <strong>Share tracks</strong> via webhooks</p>
            <p>🎉 <strong>Post to channels</strong> automatically</p>
          </div>
        </div>
      </div>

      {/* Theme Section */}
      <div className="bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Palette size={24} className="text-pink-400" />
          Theme
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {themes.map(theme => (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${currentTheme === theme.id
                  ? 'border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105'
                  : 'border-white/20 hover:border-white/40'
                }`}
            >
              <div className={`w-full h-12 rounded bg-gradient-to-r ${theme.color} mb-2`}></div>
              <p className="text-white text-xs font-semibold text-center">{theme.name}</p>
              {currentTheme === theme.id && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Playback Settings */}
      <div className="bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Volume2 size={24} className="text-green-400" />
          Playback
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-3">Audio Quality</label>
            <div className="flex gap-3">
              {(['low', 'medium', 'high'] as const).map(quality => (
                <button
                  key={quality}
                  onClick={() => setQualityPreference(quality)}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${qualityPreference === quality
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20'
                    }`}
                >
                  {quality.charAt(0).toUpperCase() + quality.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 mt-4">
            <button
              onClick={() => setAutoPlaySimilar(!autoPlaySimilar)}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className="text-white font-medium">Auto-play similar songs</span>
              <div
                className={`w-12 h-7 rounded-full flex items-center transition-all ${autoPlaySimilar ? 'bg-green-500 justify-end' : 'bg-gray-600 justify-start'
                  }`}
              >
                <div className="w-5 h-5 bg-white rounded-full"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Bell size={24} className="text-yellow-400" />
          Notifications
        </h2>
        <button
          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <span className="text-white font-medium">Enable notifications</span>
          <div
            className={`w-12 h-7 rounded-full flex items-center transition-all ${notificationsEnabled ? 'bg-blue-500 justify-end' : 'bg-gray-600 justify-start'
              }`}
          >
            <div className="w-5 h-5 bg-white rounded-full"></div>
          </div>
        </button>
      </div>

      {/* System Settings */}
      <div className="bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Zap size={24} className="text-orange-400" />
          System
        </h2>
        <div className="space-y-3">
          <button className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white font-medium">
            Clear Cache
          </button>
          <button className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white font-medium">
            Check for Updates
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold transition-all shadow-lg mb-8"
      >
        <LogOut size={20} />
        Logout
      </button>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm py-6 border-t border-white/10">
        <p>Streamify v2.0</p>
        <p className="mt-1">© 2026 All rights reserved</p>
      </div>
    </div>
  );
};
