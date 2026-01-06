import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Heart, Music, Share2, TrendingUp, 
  Search, UserCheck, Clock, Play, MoreVertical 
} from 'lucide-react';
import { apiClient } from '../../utils/apiClient';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  stats: {
    followers: number;
    following: number;
    playlists: number;
  };
  isFollowing?: boolean;
}

interface Activity {
  id: string;
  type: 'play' | 'like' | 'playlist_create' | 'playlist_update' | 'follow' | 'share';
  user: User;
  timestamp: Date;
  data: any;
}

const SocialPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'trending' | 'discover'>('feed');
  const [feed, setFeed] = useState<Activity[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSocialData();
  }, [activeTab]);

  const loadSocialData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'feed') {
        const feedRes = await apiClient.getSocialFeed();
        setFeed(feedRes.data.feed || []);
      } else if (activeTab === 'trending') {
        const trendingRes = await apiClient.getTrendingContent();
        setTrending(trendingRes.data.trending || []);
      } else if (activeTab === 'discover') {
        const suggestionsRes = await apiClient.getUserSuggestions();
        setSuggestions(suggestionsRes.data.suggestions || []);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const res = await apiClient.searchUsers(searchQuery);
      setSearchResults(res.data.users || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Search failed');
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      await apiClient.followUser(userId);
      toast.success('Followed!');
      
      // Update UI
      setSuggestions(suggestions.map(u => 
        u.id === userId ? { ...u, isFollowing: true } : u
      ));
      setSearchResults(searchResults.map(u => 
        u.id === userId ? { ...u, isFollowing: true } : u
      ));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to follow');
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await apiClient.unfollowUser(userId);
      toast.success('Unfollowed');
      
      // Update UI
      setSuggestions(suggestions.map(u => 
        u.id === userId ? { ...u, isFollowing: false } : u
      ));
      setSearchResults(searchResults.map(u => 
        u.id === userId ? { ...u, isFollowing: false } : u
      ));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to unfollow');
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    
    return 'Just now';
  };

  const ActivityCard = ({ activity, index }: { activity: Activity; index: number }) => {
    const getActivityText = () => {
      switch (activity.type) {
        case 'play':
          return `played "${activity.data.trackTitle}"`;
        case 'like':
          return `liked "${activity.data.trackTitle}"`;
        case 'playlist_create':
          return `created playlist "${activity.data.playlistName}"`;
        case 'playlist_update':
          return `updated playlist "${activity.data.playlistName}"`;
        case 'follow':
          return `followed ${activity.data.followedUser}`;
        case 'share':
          return `shared "${activity.data.itemTitle}"`;
        default:
          return 'performed an action';
      }
    };

    const getActivityIcon = () => {
      switch (activity.type) {
        case 'play':
          return <Play className="w-4 h-4 text-green-400" />;
        case 'like':
          return <Heart className="w-4 h-4 text-red-400" />;
        case 'playlist_create':
        case 'playlist_update':
          return <Music className="w-4 h-4 text-blue-400" />;
        case 'follow':
          return <UserPlus className="w-4 h-4 text-purple-400" />;
        case 'share':
          return <Share2 className="w-4 h-4 text-yellow-400" />;
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-surface/40 hover:bg-surface/60 backdrop-blur-sm rounded-lg p-4 border border-white/5 hover:border-white/10 transition-all"
      >
        <div className="flex items-start gap-3">
          <img
            src={activity.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.user.username}`}
            alt={activity.user.displayName}
            className="w-12 h-12 rounded-full"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-white">{activity.user.displayName}</span>
              <span className="text-white/40">@{activity.user.username}</span>
              <span className="text-white/30 text-sm">•</span>
              <span className="text-white/40 text-sm">{formatTimeAgo(activity.timestamp)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-white/80">
              {getActivityIcon()}
              <span>{getActivityText()}</span>
            </div>

            {activity.data.thumbnailUrl && (
              <div className="mt-3 flex items-center gap-3 bg-black/20 rounded-lg p-3">
                <img
                  src={activity.data.thumbnailUrl}
                  alt=""
                  className="w-12 h-12 rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{activity.data.trackTitle || activity.data.itemTitle}</p>
                  {activity.data.artistName && (
                    <p className="text-sm text-white/60 truncate">{activity.data.artistName}</p>
                  )}
                </div>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <Play className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
          </div>

          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <MoreVertical className="w-4 h-4 text-white/40" />
          </button>
        </div>
      </motion.div>
    );
  };

  const UserCard = ({ user, index }: { user: User; index: number }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="bg-gradient-to-br from-surface/40 to-surface/20 backdrop-blur-sm rounded-xl p-6 border border-white/5 hover:border-white/10 transition-all"
    >
      <div className="flex flex-col items-center text-center">
        <img
          src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
          alt={user.displayName}
          className="w-20 h-20 rounded-full mb-4"
        />
        
        <h3 className="font-bold text-white text-lg">{user.displayName}</h3>
        <p className="text-white/60 text-sm mb-2">@{user.username}</p>
        
        {user.bio && (
          <p className="text-white/70 text-sm mb-4 line-clamp-2">{user.bio}</p>
        )}

        <div className="flex gap-6 mb-4">
          <div className="text-center">
            <p className="font-bold text-white">{user.stats.followers}</p>
            <p className="text-xs text-white/60">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-white">{user.stats.following}</p>
            <p className="text-xs text-white/60">Following</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-white">{user.stats.playlists}</p>
            <p className="text-xs text-white/60">Playlists</p>
          </div>
        </div>

        {user.isFollowing ? (
          <button
            onClick={() => handleUnfollow(user.id)}
            className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            Following
          </button>
        ) : (
          <button
            onClick={() => handleFollow(user.id)}
            className="w-full py-2 px-4 bg-primary hover:bg-primary/80 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Follow
          </button>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          Social
        </h1>
        <p className="text-white/60">Connect with music lovers</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search users..."
          className="w-full pl-12 pr-4 py-3 bg-surface/40 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary/50"
        />
      </div>

      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((user, i) => (
            <UserCard key={user.id} user={user} index={i} />
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-4 py-2 font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'feed'
              ? 'text-primary border-b-2 border-primary'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          Feed
        </button>
        <button
          onClick={() => setActiveTab('trending')}
          className={`px-4 py-2 font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'trending'
              ? 'text-primary border-b-2 border-primary'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Trending
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`px-4 py-2 font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'discover'
              ? 'text-primary border-b-2 border-primary'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Discover
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <>
          {activeTab === 'feed' && (
            <div className="space-y-4">
              {feed.length > 0 ? (
                feed.map((activity, i) => (
                  <ActivityCard key={activity.id} activity={activity} index={i} />
                ))
              ) : (
                <div className="text-center py-20">
                  <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 mb-2">Your feed is empty</p>
                  <p className="text-white/40 text-sm">Follow users to see their activity</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'trending' && (
            <div className="space-y-4">
              {trending.length > 0 ? (
                trending.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-surface/40 rounded-lg p-4 border border-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-primary">#{i + 1}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{item.title}</h4>
                        <p className="text-sm text-white/60">{item.shares} shares</p>
                      </div>
                      <button className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg font-semibold transition-colors">
                        View
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-white/60 text-center py-20">No trending content</p>
              )}
            </div>
          )}

          {activeTab === 'discover' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.length > 0 ? (
                suggestions.map((user, i) => (
                  <UserCard key={user.id} user={user} index={i} />
                ))
              ) : (
                <div className="col-span-full text-center py-20">
                  <UserPlus className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 mb-2">No suggestions available</p>
                  <p className="text-white/40 text-sm">Check back later for recommended users</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SocialPage;
