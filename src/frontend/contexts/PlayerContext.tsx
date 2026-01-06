/**
 * Music Player Context
 * Manages music playback state with error handling and loading states
 */

import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react';


export interface Track {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration?: number;
  url?: string;
}

export interface PlayerContextType {
  // Player state
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Track[];
  queueIndex: number;
  isLoading: boolean;
  error: string | null;
  repeatMode: 'off' | 'one' | 'all';
  shuffleMode: boolean;
  isMuted: boolean;

  // Playback controls
  play: (track: Track) => Promise<void>;
  playTrack: (track: Track) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  togglePlay: () => void;
  togglePlayPause: () => void;
  toggleMute: () => void;

  // Queue management
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrevious: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  prevTrack: () => void;
  setRepeat: (mode: 'off' | 'one' | 'all') => void;
  setShuffle: (enabled: boolean) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;

  // Playlist management
  playlists: any[];
  createPlaylist: (playlist: any) => void;
  addToPlaylist: (track: Track, playlistId: string) => void;
  deletePlaylist: (playlistId: string) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [playlists, setPlaylists] = useState<any[]>([]);

  // Media Session API integration (OS-level playback controls)
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: 'Streamify',
        artwork: currentTrack.thumbnail ? [
          { src: currentTrack.thumbnail, sizes: '512x512', type: 'image/jpeg' },
        ] : [],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        if (currentTrack) resume();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        pause();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        playPrevious();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        playNext();
      });
      navigator.mediaSession.setActionHandler('seekbackward', () => {
        seek(Math.max(0, currentTime - 10));
      });
      navigator.mediaSession.setActionHandler('seekforward', () => {
        seek(Math.min(duration, currentTime + 10));
      });
    }
  }, [currentTrack, isPlaying, currentTime, duration]);

  // Update playback state in Media Session
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  const play = useCallback(async (track: Track, retryCount = 0) => {
    const MAX_RETRIES = 3;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch playback URL from API
      const apiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_SERVER || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/music/${track.videoId}/stream`, {
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Update track with playback URL
        track.url = result.data.url;

        // Set track with loaded URL
        setCurrentTrack({ ...track });
        setIsPlaying(true);
        setCurrentTime(0);

        // Set duration if available
        if (track.duration) {
          setDuration(track.duration);
        }

        setIsLoading(false);
      } else {
        throw new Error(result.message || 'Failed to get playback URL');
      }
    } catch (error: any) {
      console.error('Error fetching playback URL:', error);

      // Retry logic for transient failures
      if (retryCount < MAX_RETRIES && (
        error.name === 'AbortError' ||
        error.message?.includes('Failed to fetch')
      )) {
        console.log(`Retrying playback (${retryCount + 1}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return play(track, retryCount + 1);
      }

      // Set user-friendly error message
      let errorMessage = 'Unable to play this track';
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout - please check your connection';
      } else if (error.message?.includes('HTTP')) {
        errorMessage = 'Server error - please try again later';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setIsLoading(false);

      // Still set the track for UI display
      setCurrentTrack(track);
      setIsPlaying(false);
    }
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    if (currentTrack) {
      setIsPlaying(true);
    }
  }, [currentTrack]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setCurrentTrack(null);
    setCurrentTime(0);
  }, []);

  const seek = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleSetVolume = useCallback((vol: number) => {
    setVolume(Math.max(0, Math.min(1, vol)));
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueue((prev) => [...prev, track]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setQueueIndex(-1);
  }, []);

  const playNext = useCallback(() => {
    const nextIndex = queueIndex + 1;
    if (nextIndex < queue.length) {
      setQueueIndex(nextIndex);
      play(queue[nextIndex]);
    }
  }, [queueIndex, queue, play]);

  const playPrevious = useCallback(() => {
    const prevIndex = queueIndex - 1;
    if (prevIndex >= 0) {
      setQueueIndex(prevIndex);
      play(queue[prevIndex]);
    }
  }, [queueIndex, queue, play]);

  const handleSetRepeat = useCallback((mode: 'off' | 'one' | 'all') => {
    setRepeatMode(mode);
  }, []);

  const handleSetShuffle = useCallback((enabled: boolean) => {
    setShuffleEnabled(enabled);
  }, []);

  // Additional missing methods
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [isPlaying, pause, resume]);

  const togglePlayPause = useCallback(() => {
    togglePlay();
  }, [togglePlay]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  }, [isMuted, volume, previousVolume]);

  const nextTrack = useCallback(() => {
    playNext();
  }, [playNext]);

  const previousTrack = useCallback(() => {
    playPrevious();
  }, [playPrevious]);

  const prevTrack = useCallback(() => {
    playPrevious();
  }, [playPrevious]);

  const toggleRepeat = useCallback(() => {
    const modes: Array<'off' | 'one' | 'all'> = ['off', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    handleSetRepeat(nextMode);
  }, [repeatMode, handleSetRepeat]);

  const toggleShuffle = useCallback(() => {
    handleSetShuffle(!shuffleEnabled);
  }, [shuffleEnabled, handleSetShuffle]);

  const playTrack = useCallback(async (track: Track) => {
    await play(track);
  }, [play]);

  const createPlaylist = useCallback((playlist: any) => {
    setPlaylists(prev => [...prev, playlist]);
  }, []);

  const addToPlaylist = useCallback((track: Track, playlistId: string) => {
    setPlaylists(prev => prev.map(playlist => 
      playlist.id === playlistId 
        ? { ...playlist, tracks: [...playlist.tracks, track] }
        : playlist
    ));
  }, []);

  const deletePlaylist = useCallback((playlistId: string) => {
    setPlaylists(prev => prev.filter(playlist => playlist.id !== playlistId));
  }, []);

  const value: PlayerContextType = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    queue,
    queueIndex,
    isLoading,
    error,
    repeatMode,
    shuffleMode: shuffleEnabled,
    isMuted,
    play,
    playTrack,
    pause,
    resume,
    stop,
    seek,
    setVolume: handleSetVolume,
    togglePlay,
    togglePlayPause,
    toggleMute,
    addToQueue,
    removeFromQueue,
    clearQueue,
    playNext,
    playPrevious,
    nextTrack,
    previousTrack,
    prevTrack,
    setRepeat: handleSetRepeat,
    setShuffle: handleSetShuffle,
    toggleRepeat,
    toggleShuffle,
    playlists,
    createPlaylist,
    addToPlaylist,
    deletePlaylist,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = (): PlayerContextType => {
  const context = React.useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};
