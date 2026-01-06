import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { PlayerProvider, usePlayer } from './contexts/PlayerContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { Home, Search, ListMusic, Settings, LogOut, Music2, SkipBack, Play, Pause, SkipForward, Volume2, VolumeX, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { LoginView, SignupView } from './components/Auth/SimpleAuthViews';
import { HomeView } from './components/Home';
import { SearchView } from './components/Search';
import { LibraryView } from './components/Library';
import { SettingsView } from './components/Settings';
import { NowPlayingPanel } from './components/NowPlayingPanel';
import { TermsOfService } from './components/TermsOfService';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { Credits } from './components/Credits';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/UI/ErrorBoundary';

// Sidebar Component
const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navClass = (path: string) =>
    `flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 cursor-pointer mb-1 ${
      isActive(path)
        ? 'bg-white/10 text-white font-bold shadow-lg backdrop-blur-md border border-white/5'
        : 'text-zinc-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <div className="w-[280px] bg-black/20 flex flex-col h-full shrink-0 z-20 border-r border-white/5 backdrop-blur-xl p-8">
      {/* Logo */}
      <div className="flex items-center gap-3 text-white mb-10 px-1">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg ring-1 ring-white/20">
          <Music2 size={22} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          Streamify
        </h1>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        <div onClick={() => navigate('/')} className={navClass('/')}>
          <Home size={22} />
          <span className="text-sm">Home</span>
        </div>
        <div onClick={() => navigate('/search')} className={navClass('/search')}>
          <Search size={22} />
          <span className="text-sm">Search</span>
        </div>
        <div onClick={() => navigate('/library')} className={navClass('/library')}>
          <ListMusic size={22} />
          <span className="text-sm">Your Library</span>
        </div>
        <div onClick={() => navigate('/settings')} className={navClass('/settings')}>
          <Settings size={22} />
          <span className="text-sm">Settings</span>
        </div>
      </nav>

      {/* Footer - Coming Soon */}
      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="text-center">
          <p className="text-xs text-gray-500 font-medium">Streamify v2.0</p>
          <p className="text-xs text-gray-600 mt-2">Made with ♪ for music lovers</p>
        </div>
      </div>
    </div>
  );
};

// Player Bar Component
const PlayerBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    currentTime,
    duration,
    seek,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    nextTrack,
    prevTrack,
  } = usePlayer();

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-black/40 border-t border-white/10 backdrop-blur-xl px-8 py-4 z-40">
      {/* Progress Bar */}
      <div className="flex items-center gap-3 mb-4 group/timeline">
        <span className="text-xs font-bold text-gray-500 w-10 text-right font-mono">
          {formatTime(currentTime)}
        </span>
        <div className="relative flex-1 h-1 bg-white/10 rounded-full group-hover/timeline:h-1.5 transition-all">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            disabled={!currentTrack}
          />
          <div
            className="absolute top-0 left-0 h-full bg-white rounded-full transition-all z-10 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
          />
        </div>
        <span className="text-xs font-bold text-gray-500 w-10 font-mono">
          {formatTime(duration)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Track Info */}
        <div className="flex-1 flex items-center gap-4 min-w-0">
          {currentTrack ? (
            <>
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex-shrink-0 shadow-lg" />
              <div className="min-w-0">
                <p className="text-white font-semibold line-clamp-1 text-sm">{currentTrack.title}</p>
                <p className="text-gray-400 text-xs line-clamp-1">{currentTrack.artist}</p>
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-sm">No song playing</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 flex-1">
          <button
            onClick={prevTrack}
            disabled={!currentTrack}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition disabled:opacity-50"
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={togglePlay}
            disabled={!currentTrack}
            className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </button>

          <button
            onClick={nextTrack}
            disabled={!currentTrack}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition disabled:opacity-50"
          >
            <SkipForward size={20} />
          </button>
        </div>

        {/* Volume */}
        <div className="flex-1 flex items-center justify-end gap-3">
          <button
            onClick={toggleMute}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <div className="w-24 h-1 bg-white/10 rounded-full relative flex items-center">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className="absolute top-0 left-0 h-full bg-white rounded-full transition-all"
              style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Authenticated App Layout
const AuthenticatedApp: React.FC = () => {
  const { user, logout } = useAuth();
  const [showPanel, setShowPanel] = useState(true);

  return (
    <div className="flex h-screen bg-transparent text-white font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 backdrop-blur-md bg-black/20">
          <div className="flex gap-2">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => window.history.forward()}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600" />
              <span className="text-sm font-semibold">{user?.username || 'User'}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Content Area with optional right panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/search" element={<SearchView />} />
              <Route path="/library" element={<LibraryView />} />
              <Route path="/settings" element={<SettingsView />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/credits" element={<Credits />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>

          {/* Now Playing Panel */}
          {showPanel && <NowPlayingPanel />}
        </div>
        
        {/* Footer */}
        <Footer />
      </main>

      <PlayerBar />
    </div>
  );
};

// Auth Routes
const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginView />} />
      <Route path="/signup" element={user ? <Navigate to="/" /> : <SignupView />} />
      <Route path="/*" element={user ? <AuthenticatedApp /> : <Navigate to="/login" />} />
    </Routes>
  );
};

// Main App
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <PlayerProvider>
            <HashRouter>
              <AppRoutes />
            </HashRouter>
          </PlayerProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
