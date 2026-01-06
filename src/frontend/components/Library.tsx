import React, { useState } from 'react';
import { Heart, Music, Clock, Star, Shuffle, Play } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { TRACKS } from '../constants';

export const LibraryView: React.FC = () => {
  const { playTrack } = usePlayer();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'artist' | 'likes'>('recent');
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all');

  const favoriteTracks = TRACKS.filter(t => favorites.has(t.id));

  const getSortedTracks = () => {
    const tracks = viewMode === 'favorites' ? favoriteTracks : TRACKS;
    return [...tracks].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'artist':
          return a.artist.localeCompare(b.artist);
        case 'likes':
          return b.likeCount - a.likeCount;
        default:
          return 0;
      }
    });
  };

  const sortedTracks = getSortedTracks();

  const toggleFavorite = (trackId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(trackId)) {
      newFavorites.delete(trackId);
    } else {
      newFavorites.add(trackId);
    }
    setFavorites(newFavorites);
  };

  return (
    <div className="pb-48 pt-8 px-8 overflow-y-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Heart size={32} className="text-white" fill="currentColor" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Playlist</p>
            <h1 className="text-4xl font-black text-white">Liked Songs</h1>
          </div>
        </div>
        <p className="text-gray-400">
          {favoriteTracks.length === 0
            ? 'No liked songs yet. Start adding your favorite tracks!'
            : `${favoriteTracks.length} song${favoriteTracks.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Playlist Actions */}
      {favoriteTracks.length > 0 && (
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => playTrack(favoriteTracks[0])}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full font-bold flex items-center gap-2 transition-all shadow-lg"
          >
            <Play size={20} fill="currentColor" />
            Play
          </button>
          <button className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full font-bold flex items-center gap-2 transition-all">
            <Shuffle size={20} />
            Shuffle
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              viewMode === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            All Tracks ({TRACKS.length})
          </button>
          <button
            onClick={() => setViewMode('favorites')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1 ${
              viewMode === 'favorites'
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Heart size={14} />
            Favorites ({favoriteTracks.length})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-400 font-medium">Sort:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="recent">Recently Added</option>
            <option value="title">Title (A-Z)</option>
            <option value="artist">Artist (A-Z)</option>
            <option value="likes">Most Liked</option>
          </select>
        </div>
      </div>

      {/* Tracks Table */}
      {sortedTracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <Music size={64} className="text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-400">No songs yet</h3>
          <p className="text-gray-500 mt-2">Like songs to see them here</p>
        </div>
      ) : (
        <div className="space-y-1">
          {/* Table Header */}
          <div className="grid grid-cols-[50px_4fr_2fr_minmax(120px,1fr)_50px] gap-4 px-4 py-3 text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 border-b border-white/10">
            <span className="text-center">#</span>
            <span>Title</span>
            <span>Artist</span>
            <span className="text-right">Duration</span>
            <span className="text-center" />
          </div>

          {/* Tracks */}
          {sortedTracks.map((track, idx) => (
            <div
              key={track.id}
              className="group grid grid-cols-[50px_4fr_2fr_minmax(120px,1fr)_50px] gap-4 items-center px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-white/10"
              onClick={() => playTrack(track)}
            >
              {/* Number */}
              <span className="text-center text-gray-400 group-hover:text-white transition">
                {String(idx + 1).padStart(2, '0')}
              </span>

              {/* Title */}
              <h4 className="text-white font-medium line-clamp-1 group-hover:text-pink-400 transition cursor-pointer">
                {track.title}
              </h4>

              {/* Artist */}
              <p className="text-gray-400 text-sm line-clamp-1">{track.artist}</p>

              {/* Duration */}
              <span className="text-gray-500 text-sm font-mono text-right">
                {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
              </span>

              {/* Favorite Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(track.id);
                }}
                className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Heart
                  size={18}
                  className={favorites.has(track.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}
                  fill={favorites.has(track.id) ? 'currentColor' : 'none'}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
