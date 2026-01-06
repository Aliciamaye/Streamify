/**
 * Enhanced Player Controls
 * Advanced audio controls with better UX
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Volume1,
  Repeat, Shuffle, Heart, MoreHorizontal, Download, Share2,
  Settings, Maximize2, Minimize2, Rewind, FastForward
} from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';
import { MusicVisualizer, VisualizerPresets } from './MusicVisualizer';

interface PlayerControlsProps {
  className?: string;
  compact?: boolean;
}

export const EnhancedPlayerControls: React.FC<PlayerControlsProps> = ({
  className = '',
  compact = false
}) => {
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    repeatMode,
    shuffleMode,
    play,
    pause,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume,
    seek,
    toggleRepeat,
    toggleShuffle
  } = usePlayer();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [visualizerType, setVisualizerType] = useState<'bars' | 'wave' | 'circle' | 'particles'>('bars');
  const [isExpanded, setIsExpanded] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    seek(newTime);
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, pos));
    setVolume(newVolume);
  };

  const getVolumeIcon = () => {
    if (volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Implement like functionality
  };

  const handleShare = async () => {
    if (!currentTrack) return;
    
    const shareData = {
      title: `${currentTrack.title} - ${currentTrack.artist}`,
      text: `Check out this song I'm listening to on Streamify!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback
      navigator.clipboard.writeText(`${shareData.title} - ${shareData.url}`);
    }
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log('Download track:', currentTrack?.id);
  };

  const skipBackward = () => {
    seek(Math.max(0, currentTime - 10));
  };

  const skipForward = () => {
    seek(Math.min(duration || 0, currentTime + 10));
  };

  if (!currentTrack) {
    return (
      <div className={`bg-slate-800/50 rounded-xl p-4 text-center ${className}`}>
        <p className="text-slate-400">No track selected</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`bg-slate-800/50 backdrop-blur-xl rounded-xl p-3 flex items-center gap-3 ${className}`}>
        <button
          onClick={togglePlayPause}
          className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">{currentTrack.title}</p>
          <p className="text-slate-400 text-sm truncate">{currentTrack.artist}</p>
        </div>

        <button
          onClick={handleLike}
          className={`p-2 rounded-full transition-colors ${
            isLiked ? 'text-red-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 ${className}`}>
      {/* Hidden audio element for visualizer */}
      <audio
        ref={audioRef}
        src={currentTrack.url}
        style={{ display: 'none' }}
        crossOrigin="anonymous"
      />

      {/* Track Info */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-slate-700 rounded-xl flex items-center justify-center">
          {currentTrack.thumbnail ? (
            <img 
              src={currentTrack.thumbnail} 
              alt={currentTrack.title}
              className="w-full h-full rounded-xl object-cover"
            />
          ) : (
            <Volume2 className="w-8 h-8 text-slate-400" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">{currentTrack.title}</h3>
          <p className="text-slate-400 truncate">{currentTrack.artist}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            className={`p-2 rounded-full transition-colors ${
              isLiked ? 'text-red-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
          
          <button
            onClick={handleShare}
            className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            <Share2 size={20} />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      {/* Visualizer */}
      {showVisualizer && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-sm">Visualizer</span>
            <div className="flex items-center gap-2">
              {Object.entries(VisualizerPresets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => setVisualizerType(key as any)}
                  className={`p-1.5 rounded transition-colors ${
                    visualizerType === key 
                      ? 'bg-green-500 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={preset.name}
                >
                  <preset.icon size={16} />
                </button>
              ))}
            </div>
          </div>
          <MusicVisualizer
            audioRef={audioRef}
            isPlaying={isPlaying}
            type={visualizerType}
            className="h-24"
          />
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-slate-400 text-sm tabular-nums">
            {formatTime(currentTime)}
          </span>
          
          <div 
            className="flex-1 h-2 bg-slate-700 rounded-full cursor-pointer group"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full relative group-hover:from-green-300 group-hover:to-green-500 transition-colors"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          
          <span className="text-slate-400 text-sm tabular-nums">
            {formatTime(duration || 0)}
          </span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={toggleShuffle}
          className={`p-2 rounded-full transition-colors ${
            shuffleMode ? 'text-green-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Shuffle size={20} />
        </button>

        <button
          onClick={previousTrack}
          className="p-3 text-slate-400 hover:text-white transition-colors"
        >
          <SkipBack size={24} />
        </button>

        <button
          onClick={skipBackward}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <Rewind size={20} />
        </button>

        <button
          onClick={togglePlayPause}
          className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-105"
        >
          {isPlaying ? <Pause size={28} /> : <Play size={28} />}
        </button>

        <button
          onClick={skipForward}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <FastForward size={20} />
        </button>

        <button
          onClick={nextTrack}
          className="p-3 text-slate-400 hover:text-white transition-colors"
        >
          <SkipForward size={24} />
        </button>

        <button
          onClick={toggleRepeat}
          className={`p-2 rounded-full transition-colors ${
            repeatMode !== 'off' ? 'text-green-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Repeat size={20} />
        </button>
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            <Download size={18} />
          </button>

          <button
            onClick={() => setShowVisualizer(!showVisualizer)}
            className={`p-2 rounded-full transition-colors ${
              showVisualizer ? 'text-green-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings size={18} />
          </button>
        </div>

        {/* Volume Control */}
        <div 
          className="flex items-center gap-2"
          onMouseEnter={() => setShowVolume(true)}
          onMouseLeave={() => setShowVolume(false)}
        >
          <button
            onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            {React.createElement(getVolumeIcon(), { size: 18 })}
          </button>
          
          <div className={`transition-all duration-200 overflow-hidden ${
            showVolume ? 'w-20 opacity-100' : 'w-0 opacity-0'
          }`}>
            <div 
              className="h-1 bg-slate-600 rounded-full cursor-pointer"
              onClick={handleVolumeChange}
            >
              <div 
                className="h-full bg-green-400 rounded-full"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Playback Speed */}
        {isExpanded && (
          <select
            value={playbackRate}
            onChange={(e) => setPlaybackRate(Number(e.target.value))}
            className="bg-slate-700 text-white rounded px-2 py-1 text-sm"
          >
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        )}
      </div>
    </div>
  );
};

export default EnhancedPlayerControls;