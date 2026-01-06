import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Type,
  Volume2,
  Zap,
  Shield,
  Bell,
  Eye,
  Grid3x3,
  Sliders,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserPreferences {
  // Display Customization
  theme: 'midnight' | 'nebula' | 'sunset' | 'ocean' | 'custom';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  layoutDensity: 'compact' | 'normal' | 'spacious';
  coverArtSize: 'small' | 'medium' | 'large';
  
  // Audio Preferences
  audioQuality: 'low' | 'normal' | 'high' | 'lossless';
  autoplayEnabled: boolean;
  crossfadeDuration: number;
  normalization: boolean;
  
  // Privacy & Security
  privateSession: boolean;
  shareActivity: boolean;
  allowRecommendations: boolean;
  dataCollection: boolean;
  
  // Notifications
  notifyNewReleases: boolean;
  notifyArtistUpdates: boolean;
  notifyPlaylistUpdates: boolean;
  notifyFollowerActivity: boolean;
  
  // Advanced Features
  gaplessPlayback: boolean;
  showLyrics: boolean;
  enableAnalytics: boolean;
  enableAnimations: boolean;
  accentAnimations: boolean;
  glassmorphismIntensity: number;
  roundedCorners: number;
}

export default function UserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'midnight',
    accentColor: '#10b981',
    fontSize: 'medium',
    layoutDensity: 'normal',
    coverArtSize: 'medium',
    audioQuality: 'high',
    autoplayEnabled: true,
    crossfadeDuration: 0,
    normalization: true,
    privateSession: false,
    shareActivity: true,
    allowRecommendations: true,
    dataCollection: false,
    notifyNewReleases: true,
    notifyArtistUpdates: true,
    notifyPlaylistUpdates: true,
    notifyFollowerActivity: false,
    gaplessPlayback: true,
    showLyrics: true,
    enableAnalytics: true,
    enableAnimations: true,
    accentAnimations: true,
    glassmorphismIntensity: 100,
    roundedCorners: 12,
  });

  const [activeTab, setActiveTab] = useState<'display' | 'audio' | 'privacy' | 'notifications' | 'advanced'>('display');

  const handleSavePreferences = () => {
    localStorage.setItem('user_preferences', JSON.stringify(preferences));
    toast.success('Preferences saved successfully!');
  };

  const handleResetPreferences = () => {
    if (confirm('Are you sure you want to reset all preferences to default?')) {
      // Reset logic
      toast.success('Preferences reset to default!');
    }
  };

  const tabs = [
    { id: 'display', label: 'Display', icon: Palette },
    { id: 'audio', label: 'Audio', icon: Volume2 },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'advanced', label: 'Advanced', icon: Zap },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface/50 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-primary to-primary-hover bg-clip-text text-transparent mb-2">
          Customize Your Experience
        </h1>
        <p className="text-text-secondary">Fine-tune Streamify to match your preferences perfectly</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-4">
        {tabs.map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === id
                ? 'bg-primary text-black shadow-lg shadow-primary/50'
                : 'bg-surface text-text-secondary hover:bg-surface/80'
            }`}
          >
            <Icon size={20} />
            {label}
          </motion.button>
        ))}
      </div>

      {/* Content Sections */}
      <AnimatePresence mode="wait">
        {/* Display Settings */}
        {activeTab === 'display' && (
          <motion.div
            key="display"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Theme Selector */}
            <div className="bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Palette size={20} className="text-primary" />
                Theme Selection
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['midnight', 'nebula', 'sunset', 'ocean', 'custom'].map((theme) => (
                  <motion.button
                    key={theme}
                    onClick={() => setPreferences({ ...preferences, theme: theme as any })}
                    whileHover={{ scale: 1.05 }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      preferences.theme === theme
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 hover:border-primary/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg mb-2 ${
                      theme === 'midnight'
                        ? 'bg-gradient-to-br from-purple-900 to-black'
                        : theme === 'nebula'
                        ? 'bg-gradient-to-br from-pink-500 to-purple-600'
                        : theme === 'sunset'
                        ? 'bg-gradient-to-br from-orange-500 to-red-600'
                        : theme === 'ocean'
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
                        : 'bg-gradient-to-br from-primary to-primary-hover'
                    }`} />
                    <p className="text-sm font-semibold text-white capitalize">{theme}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Accent Color */}
            <div className="bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Accent Color</h3>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={preferences.accentColor}
                  onChange={(e) => setPreferences({ ...preferences, accentColor: e.target.value })}
                  className="w-16 h-16 rounded-xl cursor-pointer border-2 border-white/10"
                />
                <div>
                  <p className="text-white font-semibold">{preferences.accentColor}</p>
                  <p className="text-text-secondary text-sm">Custom accent color</p>
                </div>
              </div>
            </div>

            {/* Font Size */}
            <div className="bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Type size={20} className="text-primary" />
                Font Size
              </h3>
              <div className="flex gap-3">
                {['small', 'medium', 'large', 'xlarge'].map((size) => (
                  <motion.button
                    key={size}
                    onClick={() => setPreferences({ ...preferences, fontSize: size as any })}
                    whileHover={{ scale: 1.05 }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      preferences.fontSize === size
                        ? 'bg-primary text-black'
                        : 'bg-surface text-text-secondary hover:bg-surface/80'
                    }`}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Layout Density */}
            <div className="bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Grid3x3 size={20} className="text-primary" />
                Layout Density
              </h3>
              <div className="flex gap-3">
                {['compact', 'normal', 'spacious'].map((density) => (
                  <motion.button
                    key={density}
                    onClick={() => setPreferences({ ...preferences, layoutDensity: density as any })}
                    whileHover={{ scale: 1.05 }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      preferences.layoutDensity === density
                        ? 'bg-primary text-black'
                        : 'bg-surface text-text-secondary hover:bg-surface/80'
                    }`}
                  >
                    {density.charAt(0).toUpperCase() + density.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Glassmorphism & Rounded Corners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Glassmorphism Intensity</h3>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={preferences.glassmorphismIntensity}
                  onChange={(e) =>
                    setPreferences({ ...preferences, glassmorphismIntensity: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-surface rounded-full cursor-pointer accent-primary"
                />
                <p className="text-text-secondary text-sm mt-2">{preferences.glassmorphismIntensity}%</p>
              </div>

              <div className="bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Corner Radius</h3>
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={preferences.roundedCorners}
                  onChange={(e) =>
                    setPreferences({ ...preferences, roundedCorners: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-surface rounded-full cursor-pointer accent-primary"
                />
                <p className="text-text-secondary text-sm mt-2">{preferences.roundedCorners}px</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Audio Settings */}
        {activeTab === 'audio' && (
          <motion.div
            key="audio"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Audio Quality */}
            <div className="bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Volume2 size={20} className="text-primary" />
                Audio Quality
              </h3>
              <div className="flex gap-3">
                {['low', 'normal', 'high', 'lossless'].map((quality) => (
                  <motion.button
                    key={quality}
                    onClick={() => setPreferences({ ...preferences, audioQuality: quality as any })}
                    whileHover={{ scale: 1.05 }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      preferences.audioQuality === quality
                        ? 'bg-primary text-black'
                        : 'bg-surface text-text-secondary hover:bg-surface/80'
                    }`}
                  >
                    {quality.charAt(0).toUpperCase() + quality.slice(1)}
                  </motion.button>
                ))}
              </div>
              <p className="text-text-secondary text-sm mt-3">Higher quality uses more data</p>
            </div>

            {/* Crossfade Duration */}
            <div className="bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Crossfade Between Tracks</h3>
              <input
                type="range"
                min="0"
                max="12"
                value={preferences.crossfadeDuration}
                onChange={(e) =>
                  setPreferences({ ...preferences, crossfadeDuration: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-surface rounded-full cursor-pointer accent-primary"
              />
              <p className="text-text-secondary text-sm mt-2">{preferences.crossfadeDuration}s</p>
            </div>

            {/* Toggle Options */}
            <div className="space-y-4">
              {[
                { key: 'autoplayEnabled', label: 'Autoplay Similar Songs' },
                { key: 'normalization', label: 'Audio Normalization' },
                { key: 'gaplessPlayback', label: 'Gapless Playback' },
                { key: 'showLyrics', label: 'Show Lyrics' },
              ].map(({ key, label }) => (
                <div key={key} className="bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                  <span className="text-white font-semibold">{label}</span>
                  <motion.button
                    onClick={() =>
                      setPreferences({
                        ...preferences,
                        [key]: !(preferences as any)[key],
                      })
                    }
                    whileHover={{ scale: 1.05 }}
                    className={`w-12 h-7 rounded-full transition-all ${
                      (preferences as any)[key] ? 'bg-primary' : 'bg-surface'
                    }`}
                  >
                    <motion.div
                      layout
                      className={`w-6 h-6 rounded-full bg-white transition-all ${
                        (preferences as any)[key] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </motion.button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Privacy Settings */}
        {activeTab === 'privacy' && (
          <motion.div
            key="privacy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {[
              {
                key: 'privateSession',
                label: 'Private Session',
                description: 'Your listening history will not be saved',
              },
              {
                key: 'shareActivity',
                label: 'Share Activity with Friends',
                description: 'Let your friends see what you\'re listening to',
              },
              {
                key: 'allowRecommendations',
                label: 'Personalized Recommendations',
                description: 'Get recommendations based on your listening habits',
              },
              {
                key: 'dataCollection',
                label: 'Allow Data Collection',
                description: 'Help us improve by sharing anonymized listening data',
              },
            ].map(({ key, label, description }) => (
              <div key={key} className="bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{label}</h3>
                    <p className="text-text-secondary text-sm mt-1">{description}</p>
                  </div>
                  <motion.button
                    onClick={() =>
                      setPreferences({
                        ...preferences,
                        [key]: !(preferences as any)[key],
                      })
                    }
                    whileHover={{ scale: 1.05 }}
                    className={`w-12 h-7 rounded-full transition-all flex-shrink-0 ${
                      (preferences as any)[key] ? 'bg-primary' : 'bg-surface'
                    }`}
                  >
                    <motion.div
                      layout
                      className={`w-6 h-6 rounded-full bg-white transition-all ${
                        (preferences as any)[key] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </motion.button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {[
              { key: 'notifyNewReleases', label: 'New Releases', description: 'Notify me of new releases from artists I follow' },
              { key: 'notifyArtistUpdates', label: 'Artist Updates', description: 'Notify me when artists post updates' },
              { key: 'notifyPlaylistUpdates', label: 'Playlist Updates', description: 'Notify me when playlists I follow are updated' },
              { key: 'notifyFollowerActivity', label: 'Follower Activity', description: 'Notify me of activity from my followers' },
            ].map(({ key, label, description }) => (
              <div key={key} className="bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{label}</h3>
                    <p className="text-text-secondary text-sm mt-1">{description}</p>
                  </div>
                  <motion.button
                    onClick={() =>
                      setPreferences({
                        ...preferences,
                        [key]: !(preferences as any)[key],
                      })
                    }
                    whileHover={{ scale: 1.05 }}
                    className={`w-12 h-7 rounded-full transition-all flex-shrink-0 ${
                      (preferences as any)[key] ? 'bg-primary' : 'bg-surface'
                    }`}
                  >
                    <motion.div
                      layout
                      className={`w-6 h-6 rounded-full bg-white transition-all ${
                        (preferences as any)[key] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </motion.button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Advanced Settings */}
        {activeTab === 'advanced' && (
          <motion.div
            key="advanced"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {[
              { key: 'enableAnimations', label: 'Enable Animations', description: 'Smooth transitions and motion effects' },
              { key: 'accentAnimations', label: 'Accent Color Animations', description: 'Animated accent color effects' },
              { key: 'enableAnalytics', label: 'Enable Analytics', description: 'Help us understand user behavior' },
            ].map(({ key, label, description }) => (
              <div key={key} className="bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{label}</h3>
                    <p className="text-text-secondary text-sm mt-1">{description}</p>
                  </div>
                  <motion.button
                    onClick={() =>
                      setPreferences({
                        ...preferences,
                        [key]: !(preferences as any)[key],
                      })
                    }
                    whileHover={{ scale: 1.05 }}
                    className={`w-12 h-7 rounded-full transition-all flex-shrink-0 ${
                      (preferences as any)[key] ? 'bg-primary' : 'bg-surface'
                    }`}
                  >
                    <motion.div
                      layout
                      className={`w-6 h-6 rounded-full bg-white transition-all ${
                        (preferences as any)[key] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </motion.button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8 sticky bottom-0 pt-6 bg-gradient-to-t from-background to-transparent">
        <motion.button
          onClick={handleSavePreferences}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 bg-gradient-to-r from-primary to-primary-hover text-black font-bold py-3 rounded-xl shadow-lg shadow-primary/50 hover:shadow-primary/70 transition-all"
        >
          Save Preferences
        </motion.button>
        <motion.button
          onClick={handleResetPreferences}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 bg-surface text-white font-bold py-3 rounded-xl hover:bg-surface/80 transition-all border border-white/10"
        >
          Reset to Default
        </motion.button>
      </div>
    </div>
  );
}
