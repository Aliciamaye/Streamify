/**
 * Advanced Playlist Management Component
 * Comprehensive playlist creation, editing, and management
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Search, Filter, MoreVertical, Play, Pause, Heart,
  Edit3, Trash2, Download, Share2, Lock, Unlock, Users,
  Music, Clock, Calendar, Shuffle, ListPlus, X, Check,
  Star, TrendingUp, Eye, EyeOff, Copy
} from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';
import { Track, Playlist } from '../../types';

interface PlaylistManagerProps {
  className?: string;
}

interface PlaylistFormData {
  name: string;
  description: string;
  isPublic: boolean;
  isCollaborative: boolean;
  tags: string[];
  thumbnail?: string;
}

interface PlaylistStats {
  totalDuration: number;
  trackCount: number;
  lastModified: Date;
  playCount: number;
  likes: number;
  collaborators: number;
}

export const AdvancedPlaylistManager: React.FC<PlaylistManagerProps> = ({ className = '' }) => {
  const { currentTrack, isPlaying, playlists, addToPlaylist, createPlaylist, deletePlaylist } = usePlayer();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'modified' | 'duration' | 'tracks'>('name');
  const [filterBy, setFilterBy] = useState<'all' | 'public' | 'private' | 'collaborative'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showStats, setShowStats] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<PlaylistFormData>({
    name: '',
    description: '',
    isPublic: false,
    isCollaborative: false,
    tags: [],
    thumbnail: undefined
  });

  const [currentTag, setCurrentTag] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data - in real app this would come from API
  const mockPlaylists: (Playlist & PlaylistStats)[] = [
    {
      id: '1',
      name: 'My Favorites',
      description: 'All my favorite tracks',
      tracks: [],
      isPublic: false,
      isCollaborative: false,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      totalDuration: 3600,
      trackCount: 25,
      lastModified: new Date('2024-01-20'),
      playCount: 150,
      likes: 45,
      collaborators: 0
    },
    {
      id: '2', 
      name: 'Road Trip Mix',
      description: 'Perfect songs for long drives',
      tracks: [],
      isPublic: true,
      isCollaborative: true,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-22'),
      totalDuration: 7200,
      trackCount: 42,
      lastModified: new Date('2024-01-22'),
      playCount: 89,
      likes: 23,
      collaborators: 3
    }
  ];

  const filteredPlaylists = mockPlaylists
    .filter(playlist => {
      const matchesSearch = playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          playlist.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = 
        filterBy === 'all' ||
        (filterBy === 'public' && playlist.isPublic) ||
        (filterBy === 'private' && !playlist.isPublic) ||
        (filterBy === 'collaborative' && playlist.isCollaborative);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'modified':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case 'duration':
          return b.totalDuration - a.totalDuration;
        case 'tracks':
          return b.trackCount - a.trackCount;
        default:
          return 0;
      }
    });

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      tracks: [],
      isPublic: formData.isPublic,
      isCollaborative: formData.isCollaborative,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    createPlaylist(newPlaylist);
    setFormData({
      name: '',
      description: '',
      isPublic: false,
      isCollaborative: false,
      tags: [],
      thumbnail: undefined
    });
    setShowCreateForm(false);
  };

  const handleAddTag = () => {
    if (currentTag && !formData.tags.includes(currentTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          thumbnail: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const PlaylistCard = ({ playlist }: { playlist: Playlist & PlaylistStats }) => (
    <div className="bg-slate-800/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all group">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
          {playlist.thumbnail ? (
            <img src={playlist.thumbnail} alt={playlist.name} className="w-full h-full rounded-xl object-cover" />
          ) : (
            playlist.name.charAt(0).toUpperCase()
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-semibold truncate">{playlist.name}</h3>
            
            <div className="flex items-center gap-1">
              {playlist.isPublic ? (
                <Eye size={14} className="text-green-400" />
              ) : (
                <EyeOff size={14} className="text-slate-400" />
              )}
              
              {playlist.isCollaborative && (
                <Users size={14} className="text-blue-400" />
              )}
            </div>
          </div>
          
          <p className="text-slate-400 text-sm mb-2 line-clamp-2">
            {playlist.description || 'No description'}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Music size={12} />
              {playlist.trackCount} tracks
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatDuration(playlist.totalDuration)}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp size={12} />
              {playlist.playCount} plays
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowStats(showStats === playlist.id ? null : playlist.id)}
            className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
            title="Show Stats"
          >
            <Star size={16} />
          </button>
          
          <button
            onClick={() => setEditingPlaylist(playlist)}
            className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
            title="Edit Playlist"
          >
            <Edit3 size={16} />
          </button>
          
          <button
            className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
            title="More Options"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Stats Expansion */}
      {showStats === playlist.id && (
        <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-white font-semibold">{playlist.likes}</div>
              <div className="text-slate-400 text-xs">Likes</div>
            </div>
            <div>
              <div className="text-white font-semibold">{playlist.collaborators}</div>
              <div className="text-slate-400 text-xs">Collaborators</div>
            </div>
            <div>
              <div className="text-white font-semibold">
                {playlist.lastModified.toLocaleDateString()}
              </div>
              <div className="text-slate-400 text-xs">Last Modified</div>
            </div>
            <div>
              <div className="text-white font-semibold">
                {playlist.createdAt.toLocaleDateString()}
              </div>
              <div className="text-slate-400 text-xs">Created</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-4">
        <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-full flex items-center justify-center gap-2 transition-colors">
          <Play size={16} />
          Play
        </button>
        
        <button className="p-2 text-slate-400 hover:text-white rounded-full transition-colors">
          <Shuffle size={16} />
        </button>
        
        <button className="p-2 text-slate-400 hover:text-white rounded-full transition-colors">
          <Heart size={16} />
        </button>
        
        <button className="p-2 text-slate-400 hover:text-white rounded-full transition-colors">
          <Share2 size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Playlists</h2>
          <p className="text-slate-400">Manage and organize your music collections</p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          New Playlist
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search playlists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-full pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Playlists</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="collaborative">Collaborative</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="name">Name</option>
            <option value="created">Date Created</option>
            <option value="modified">Last Modified</option>
            <option value="duration">Duration</option>
            <option value="tracks">Track Count</option>
          </select>

          <div className="flex bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Playlist Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
      }>
        {filteredPlaylists.map(playlist => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </div>

      {/* Create Playlist Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Create New Playlist</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              {/* Thumbnail Upload */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                  {formData.thumbnail ? (
                    <img src={formData.thumbnail} alt="Playlist" className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    formData.name.charAt(0).toUpperCase() || '?'
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-green-400 hover:text-green-300 text-sm"
                >
                  Choose Cover Image
                </button>
              </div>

              {/* Basic Info */}
              <div>
                <label className="block text-white font-medium mb-2">Playlist Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter playlist name"
                  required
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent h-20 resize-none"
                  placeholder="Describe your playlist..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-white font-medium mb-2">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-1 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="p-2 text-green-400 hover:text-green-300 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="bg-slate-700 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-slate-400 hover:text-white ml-1"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-white font-medium">Make Public</label>
                    <p className="text-slate-400 text-sm">Others can find and listen to this playlist</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      formData.isPublic ? 'bg-green-500' : 'bg-slate-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      formData.isPublic ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-white font-medium">Collaborative</label>
                    <p className="text-slate-400 text-sm">Let others add songs to this playlist</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isCollaborative: !prev.isCollaborative }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      formData.isCollaborative ? 'bg-green-500' : 'bg-slate-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      formData.isCollaborative ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-full transition-colors"
                >
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedPlaylistManager;