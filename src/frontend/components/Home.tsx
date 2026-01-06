import React from 'react';
import { PlayCircle, Heart, MoreHorizontal, TrendingUp, Flame, Music, Radio, Volume2 } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { TRACKS, ALBUMS } from '../constants';

export const HomeView: React.FC = () => {
  const { playTrack, currentTrack } = usePlayer();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Good morning';
    if (hour < 18) return '☀️ Good afternoon';
    return '🌙 Good evening';
  };

  const recentTracks = TRACKS.slice(0, 6);
  const popularTracks = TRACKS.filter(t => t.likeCount > 1000000).slice(0, 5);
  const newReleases = ALBUMS.slice(0, 8);

  return (
    <div className="pb-48 pt-8 px-8 overflow-y-auto">
      {/* Header with Greeting */}
      <div className="mb-12">
        <h1 className="text-5xl md:text-6xl font-black text-white mb-3 leading-tight tracking-tight">
          {getGreeting()}
        </h1>
        <p className="text-gray-400 text-lg font-light">What do you want to listen to today?</p>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {/* Liked Songs */}
        <div className="group relative bg-gradient-to-br from-purple-900/30 to-transparent backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:bg-gradient-to-br hover:from-purple-900/50 transition-all duration-300 cursor-pointer overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -z-10" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                <Heart size={16} className="text-red-500" fill="currentColor" />
                Your Library
              </p>
              <h3 className="text-white font-bold text-xl">Liked Songs</h3>
            </div>
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Heart size={32} className="text-white" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Recent Plays */}
        <div className="group relative bg-gradient-to-br from-blue-900/30 to-transparent backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:bg-gradient-to-br hover:from-blue-900/50 transition-all duration-300 cursor-pointer overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                <Music size={16} />
                Recently Played
              </p>
              <h3 className="text-white font-bold text-xl">Your Mix</h3>
            </div>
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Music size={32} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Recently Played */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Recently Played</h2>
          <a href="#" className="text-sm text-gray-400 hover:text-white transition">See all</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentTracks.map((track, idx) => (
            <div
              key={track.id}
              className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/5 hover:border-white/20 rounded-xl p-4 transition-all duration-300 cursor-pointer overflow-hidden"
              onClick={() => playTrack(track)}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
              <div className="flex items-start justify-between mb-3 relative z-10">
                <div className="flex-1">
                  <p className="text-gray-400 text-xs mb-1">{String(idx + 1).padStart(2, '0')}</p>
                  <h4 className="text-white font-bold line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition">
                    {track.title}
                  </h4>
                  <p className="text-gray-500 text-xs line-clamp-1 mt-1">{track.artist}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playTrack(track);
                  }}
                  className="ml-2 p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white opacity-0 group-hover:opacity-100 transform group-hover:scale-110 transition-all duration-300 shadow-lg flex-shrink-0"
                >
                  <PlayCircle size={20} fill="currentColor" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Now */}
      <div className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <Flame className="text-orange-500" size={24} />
          <h2 className="text-2xl font-bold text-white">Trending Now</h2>
        </div>
        <div className="space-y-2">
          {popularTracks.map((track, idx) => (
            <div
              key={track.id}
              onClick={() => playTrack(track)}
              className="group flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-300 cursor-pointer"
            >
              <span className="text-gray-500 font-bold w-8 text-center text-lg">#{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold line-clamp-1 group-hover:text-pink-400 transition">
                  {track.title}
                </h4>
                <p className="text-gray-400 text-sm line-clamp-1">{track.artist}</p>
              </div>
              <span className="text-gray-500 text-sm font-mono flex-shrink-0">
                {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playTrack(track);
                }}
                className="p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
              >
                <PlayCircle size={20} className="text-white" fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* New Releases */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Radio className="text-purple-400" size={24} />
          <h2 className="text-2xl font-bold text-white">New Releases</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {newReleases.map((album) => (
            <div
              key={album.id}
              className="group cursor-pointer"
            >
              <div className="relative mb-4 aspect-square rounded-xl bg-gradient-to-br from-gray-800 to-black overflow-hidden border border-white/10 group-hover:border-white/30 transition-all duration-300 shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                  <Music className="text-white/30" size={64} />
                </div>
                <button
                  onClick={() => playTrack(TRACKS.find(t => t.album === album.title) || TRACKS[0])}
                  className="absolute bottom-3 right-3 p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg"
                >
                  <PlayCircle size={20} fill="currentColor" />
                </button>
              </div>
              <h4 className="text-white font-bold text-sm line-clamp-1 group-hover:text-pink-400 transition">{album.title}</h4>
              <p className="text-gray-400 text-xs line-clamp-1 mt-1">{album.artist}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
