import React from 'react';
import { Music, Clock, Share2, Heart, Volume2, Zap } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { TRACKS } from '../constants';

export const NowPlayingPanel: React.FC = () => {
  const { currentTrack, queue, currentTime, duration, isPlaying, isLoading, error } = usePlayer();

  // Show error state
  if (error) {
    return (
      <div className="w-[360px] bg-black/40 backdrop-blur-md border-l border-white/10 p-8 flex flex-col items-center justify-center h-screen">
        <div className="text-center max-w-xs">
          <div className="w-20 h-20 rounded-full bg-red-600/20 border border-red-500/30 mx-auto mb-4 flex items-center justify-center">
            <Music className="text-red-400" size={40} />
          </div>
          <p className="text-red-400 text-sm font-semibold">Playback Error</p>
          <p className="text-gray-500 text-xs mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-[360px] bg-black/40 backdrop-blur-md border-l border-white/10 p-8 flex flex-col items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-white/10 mx-auto mb-4 flex items-center justify-center animate-pulse">
            <Music className="text-purple-400" size={40} />
          </div>
          <p className="text-gray-400 text-sm">Loading track...</p>
          <p className="text-gray-500 text-xs mt-2">Fetching playback URL</p>
        </div>
      </div>
    );
  }

  if (!currentTrack) {
    return (
      <div className="w-[360px] bg-black/40 backdrop-blur-md border-l border-white/10 p-8 flex flex-col items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-white/10 mx-auto mb-4 flex items-center justify-center">
            <Music className="text-gray-500" size={40} />
          </div>
          <p className="text-gray-400 text-sm">Nothing playing yet</p>
          <p className="text-gray-500 text-xs mt-2">Play a song to see details</p>
        </div>
      </div>
    );
  }

  const progress = (currentTime / (duration || 1)) * 100;

  return (
    <div className="w-[360px] bg-gradient-to-b from-black/60 to-black/80 backdrop-blur-md border-l border-white/10 p-6 flex flex-col h-screen overflow-y-auto">
      {/* Current Track Display */}
      <div className="mb-8">
        <div className="relative mb-6 aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Music className="text-white opacity-20" size={80} />
          </div>
          
          {/* Playing Indicator */}
          {isPlaying && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="flex gap-1">
                <div className="w-1 h-8 bg-white rounded-full animate-[bounce_0.8s_infinite]" />
                <div className="w-1 h-8 bg-white rounded-full animate-[bounce_0.8s_infinite_0.1s]" />
                <div className="w-1 h-8 bg-white rounded-full animate-[bounce_0.8s_infinite_0.2s]" />
              </div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <h3 className="text-white font-bold text-xl line-clamp-2">{currentTrack.title}</h3>
          <p className="text-gray-400 text-sm mt-1">{currentTrack.artist}</p>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 font-mono">
            <span>{Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}</span>
            <span>{Math.floor((duration || 0) / 60)}:{String(Math.floor((duration || 0) % 60)).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button className="flex-1 py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center gap-2">
            <Heart size={18} />
            Like
          </button>
          <button className="flex-1 py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center gap-2">
            <Share2 size={18} />
            Share
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

      {/* Queue Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} className="text-purple-400" />
          <h4 className="font-bold text-white text-sm">Queue ({queue.length})</h4>
        </div>

        <div className="space-y-2">
          {queue.slice(0, 8).map((track, idx) => (
            <div key={`${track.videoId}-${idx}`} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition border border-transparent hover:border-white/10">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium line-clamp-1">{track.title}</p>
                  <p className="text-gray-500 text-xs line-clamp-1">{track.artist}</p>
                </div>
                <span className="text-gray-500 text-xs ml-2 flex-shrink-0">
                  {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                </span>
              </div>
            </div>
          ))}
          {queue.length > 8 && (
            <p className="text-gray-500 text-xs text-center py-2">+{queue.length - 8} more songs</p>
          )}
        </div>
      </div>

      {/* Premium Badge */}
      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-lg p-3 flex items-start gap-3">
          <Zap size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-white">Go Premium</p>
            <p className="text-xs text-gray-400 mt-1">Ad-free listening & high-quality audio</p>
          </div>
        </div>
      </div>
    </div>
  );
};
