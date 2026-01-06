import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Music, Lock, Unlock, Users, Heart, Play, Trash2, 
  Edit2, Share2, Copy, MoreVertical, UserPlus, X, Search
} from 'lucide-react';
import { apiClient } from '../../utils/apiClient';
import toast from 'react-hot-toast';

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  thumbnailUrl: string;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  isCollaborative: boolean;
  owner: {
    id: string;
    username: string;
    displayName: string;
  };
  tracks: Track[];
  collaborators: string[];
  followers: string[];
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

const PlaylistManager: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [collaboratorUsername, setCollaboratorUsername] = useState('');

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getUserPlaylists();
      setPlaylists(res.data.playlists || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async () => {
    if (!playlistName.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }

    try {
      const res = await apiClient.createPlaylist({
        name: playlistName,
        description: playlistDescription,
        isPublic,
        isCollaborative
      });

      setPlaylists([...playlists, res.data.playlist]);
      setShowCreateModal(false);
      resetForm();
      toast.success('Playlist created!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create playlist');
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    try {
      await apiClient.deletePlaylist(playlistId);
      setPlaylists(playlists.filter(p => p.id !== playlistId));
      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist(null);
      }
      toast.success('Playlist deleted');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete playlist');
    }
  };

  const togglePlaylistVisibility = async (playlistId: string) => {
    try {
      const playlist = playlists.find(p => p.id === playlistId);
      if (!playlist) return;

      const res = await apiClient.updatePlaylist(playlistId, {
        isPublic: !playlist.isPublic
      });

      setPlaylists(playlists.map(p => 
        p.id === playlistId ? res.data.playlist : p
      ));

      toast.success(res.data.playlist.isPublic ? 'Playlist is now public' : 'Playlist is now private');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update playlist');
    }
  };

  const likePlaylist = async (playlistId: string) => {
    try {
      await apiClient.likePlaylist(playlistId);
      
      setPlaylists(playlists.map(p => 
        p.id === playlistId ? { ...p, likes: p.likes + 1 } : p
      ));

      toast.success('Liked!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to like playlist');
    }
  };

  const addCollaborator = async () => {
    if (!selectedPlaylist || !collaboratorUsername.trim()) return;

    try {
      const res = await apiClient.addCollaborator(selectedPlaylist.id, collaboratorUsername);
      
      setPlaylists(playlists.map(p => 
        p.id === selectedPlaylist.id ? res.data.playlist : p
      ));
      
      setSelectedPlaylist(res.data.playlist);
      setCollaboratorUsername('');
      toast.success(`Added ${collaboratorUsername} as collaborator`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add collaborator');
    }
  };

  const copyShareLink = (playlistId: string) => {
    const link = `${window.location.origin}/playlist/${playlistId}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  const resetForm = () => {
    setPlaylistName('');
    setPlaylistDescription('');
    setIsPublic(true);
    setIsCollaborative(false);
  };

  const filteredPlaylists = playlists.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const PlaylistCard = ({ playlist }: { playlist: Playlist }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="group bg-surface/40 hover:bg-surface/60 backdrop-blur-sm rounded-xl p-4 border border-white/5 hover:border-primary/30 transition-all cursor-pointer"
      onClick={() => setSelectedPlaylist(playlist)}
    >
      {/* Cover */}
      <div className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
        {playlist.tracks[0]?.thumbnailUrl ? (
          <img 
            src={playlist.tracks[0].thumbnailUrl} 
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music className="w-12 h-12 text-white/20" />
          </div>
        )}
        
        {/* Play button overlay */}
        <button className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="p-3 bg-primary rounded-full">
            <Play className="w-6 h-6 text-white" fill="white" />
          </div>
        </button>

        {/* Privacy badge */}
        <div className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm rounded-full">
          {playlist.isPublic ? (
            <Unlock className="w-4 h-4 text-white" />
          ) : (
            <Lock className="w-4 h-4 text-white" />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2">
        <h3 className="font-bold text-white truncate">{playlist.name}</h3>
        
        <p className="text-sm text-white/60 line-clamp-2 min-h-[2.5rem]">
          {playlist.description || 'No description'}
        </p>

        <div className="flex items-center justify-between text-xs text-white/40">
          <span>{playlist.tracks.length} tracks</span>
          <div className="flex items-center gap-2">
            {playlist.isCollaborative && (
              <Users className="w-3 h-3" />
            )}
            <Heart className="w-3 h-3" />
            <span>{playlist.likes}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlaylistVisibility(playlist.id);
          }}
          className="flex-1 py-1.5 px-3 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold text-white transition-colors"
        >
          {playlist.isPublic ? 'Make Private' : 'Make Public'}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            deletePlaylist(playlist.id);
          }}
          className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Music className="w-8 h-8 text-primary" />
            Playlists
          </h1>
          <p className="text-white/60">Organize your music</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Playlist
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search playlists..."
          className="w-full pl-12 pr-4 py-3 bg-surface/40 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Playlists Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : filteredPlaylists.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredPlaylists.map(playlist => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Music className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 mb-2">No playlists found</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-primary hover:underline"
          >
            Create your first playlist
          </button>
        </div>
      )}

      {/* Create Playlist Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface rounded-xl p-6 max-w-md w-full border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Create Playlist</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    placeholder="My Awesome Playlist"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Description
                  </label>
                  <textarea
                    value={playlistDescription}
                    onChange={(e) => setPlaylistDescription(e.target.value)}
                    placeholder="What's this playlist about?"
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary/50 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-white/80">Public</label>
                  <button
                    onClick={() => setIsPublic(!isPublic)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      isPublic ? 'bg-primary' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        isPublic ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-white/80">Collaborative</label>
                  <button
                    onClick={() => setIsCollaborative(!isCollaborative)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      isCollaborative ? 'bg-primary' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        isCollaborative ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={createPlaylist}
                  className="w-full py-3 bg-primary hover:bg-primary/80 text-white rounded-lg font-semibold transition-colors"
                >
                  Create Playlist
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playlist Details Modal */}
      <AnimatePresence>
        {selectedPlaylist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPlaylist(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Music className="w-12 h-12 text-white/40" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{selectedPlaylist.name}</h2>
                    <p className="text-white/60 text-sm mb-2">{selectedPlaylist.description}</p>
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span>{selectedPlaylist.tracks.length} tracks</span>
                      <span>•</span>
                      <span>{selectedPlaylist.likes} likes</span>
                      {selectedPlaylist.isCollaborative && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Collaborative
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPlaylist(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => copyShareLink(selectedPlaylist.id)}
                  className="flex-1 py-2 px-4 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={() => likePlaylist(selectedPlaylist.id)}
                  className="flex-1 py-2 px-4 bg-white/5 hover:bg-white/10 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  Like
                </button>
              </div>

              {selectedPlaylist.tracks.length > 0 ? (
                <div className="space-y-2">
                  {selectedPlaylist.tracks.map((track, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <span className="text-white/40 text-sm w-6">{index + 1}</span>
                      <img
                        src={track.thumbnailUrl}
                        alt={track.title}
                        className="w-12 h-12 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{track.title}</p>
                        <p className="text-sm text-white/60 truncate">{track.artist}</p>
                      </div>
                      <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <Play className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Music className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/60">No tracks in this playlist yet</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlaylistManager;
