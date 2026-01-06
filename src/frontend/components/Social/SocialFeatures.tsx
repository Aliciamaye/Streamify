/**
 * Social Features Component
 * Advanced social sharing, following, and community features
 */

import React, { useState, useEffect } from 'react';
import {
  Users, MessageCircle, Heart, Share2, UserPlus, UserMinus,
  Settings, Bell, Globe, Lock, Eye, EyeOff, Music,
  Play, Pause, SkipForward, Repeat, Shuffle, Download,
  Send, MoreVertical, Star, TrendingUp, Calendar,
  Search, Filter, Grid, List, X, Check, Clock
} from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';

interface SocialFeaturesProps {
  className?: string;
}

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  isFollowing: boolean;
  followers: number;
  following: number;
  totalPlays: number;
  joinDate: Date;
  isOnline: boolean;
  lastSeen?: Date;
}

interface Activity {
  id: string;
  user: User;
  type: 'play' | 'like' | 'playlist_create' | 'playlist_follow' | 'follow' | 'share';
  content: {
    track?: any;
    playlist?: any;
    message?: string;
  };
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
}

interface Comment {
  id: string;
  user: User;
  content: string;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

export const SocialFeatures: React.FC<SocialFeaturesProps> = ({ className = '' }) => {
  const { currentTrack } = usePlayer();
  
  const [activeTab, setActiveTab] = useState<'feed' | 'friends' | 'discover' | 'messages'>('feed');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  // Mock data
  const mockUsers: User[] = [
    {
      id: '1',
      username: 'musiclover123',
      displayName: 'Alex Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      isFollowing: true,
      followers: 1250,
      following: 890,
      totalPlays: 45000,
      joinDate: new Date('2023-06-15'),
      isOnline: true
    },
    {
      id: '2',
      username: 'beatmaster',
      displayName: 'Sam Wilson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
      isFollowing: false,
      followers: 3400,
      following: 1200,
      totalPlays: 120000,
      joinDate: new Date('2023-03-20'),
      isOnline: false,
      lastSeen: new Date(Date.now() - 3600000) // 1 hour ago
    }
  ];

  const mockActivities: Activity[] = [
    {
      id: '1',
      user: mockUsers[0],
      type: 'play',
      content: {
        track: {
          id: '1',
          title: 'Bohemian Rhapsody',
          artist: 'Queen',
          thumbnail: 'https://example.com/queen-thumbnail.jpg'
        }
      },
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      likes: 23,
      comments: 5,
      isLiked: false
    },
    {
      id: '2',
      user: mockUsers[1],
      type: 'playlist_create',
      content: {
        playlist: {
          id: '1',
          name: 'Chill Vibes 2024',
          description: 'Perfect for relaxing evenings',
          trackCount: 32
        }
      },
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      likes: 45,
      comments: 12,
      isLiked: true
    }
  ];

  useEffect(() => {
    setActivities(mockActivities);
    setFriends(mockUsers);
  }, []);

  const handleLikeActivity = (activityId: string) => {
    setActivities(prev => prev.map(activity => 
      activity.id === activityId 
        ? { 
            ...activity, 
            isLiked: !activity.isLiked,
            likes: activity.isLiked ? activity.likes - 1 : activity.likes + 1
          }
        : activity
    ));
  };

  const handleFollowUser = (userId: string) => {
    setFriends(prev => prev.map(user =>
      user.id === userId 
        ? { 
            ...user, 
            isFollowing: !user.isFollowing,
            followers: user.isFollowing ? user.followers - 1 : user.followers + 1
          }
        : user
    ));
  };

  const handleShare = async (activity: Activity) => {
    const shareData = {
      title: `Check out what ${activity.user.displayName} is listening to!`,
      text: activity.content.track ? 
        `${activity.content.track.title} by ${activity.content.track.artist}` :
        'Amazing music discovery on Streamify!',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(`${shareData.title} - ${shareData.url}`);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = Date.now();
    const diff = now - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const ActivityCard = ({ activity }: { activity: Activity }) => (
    <div className="bg-slate-800/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all">
      {/* User Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              {activity.user.avatar ? (
                <img 
                  src={activity.user.avatar} 
                  alt={activity.user.displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-medium">
                  {activity.user.displayName.charAt(0)}
                </span>
              )}
            </div>
            {activity.user.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-800" />
            )}
          </div>
          
          <div>
            <p className="text-white font-medium">{activity.user.displayName}</p>
            <p className="text-slate-400 text-sm">@{activity.user.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <span>{formatTimeAgo(activity.timestamp)}</span>
          <button className="p-1 hover:text-white transition-colors">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Activity Content */}
      <div className="mb-4">
        {activity.type === 'play' && activity.content.track && (
          <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-lg">
            <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
              {activity.content.track.thumbnail ? (
                <img 
                  src={activity.content.track.thumbnail} 
                  alt={activity.content.track.title}
                  className="w-full h-full rounded-lg object-cover"
                />
              ) : (
                <Music className="w-6 h-6 text-slate-400" />
              )}
            </div>
            
            <div className="flex-1">
              <p className="text-white font-medium">{activity.content.track.title}</p>
              <p className="text-slate-400">{activity.content.track.artist}</p>
            </div>

            <button className="p-2 text-green-400 hover:text-green-300 rounded-full transition-colors">
              <Play size={20} />
            </button>
          </div>
        )}

        {activity.type === 'playlist_create' && activity.content.playlist && (
          <div className="p-4 bg-slate-900/50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center text-white font-bold text-sm">
                {activity.content.playlist.name.charAt(0)}
              </div>
              <div>
                <p className="text-white font-medium">Created playlist: {activity.content.playlist.name}</p>
                <p className="text-slate-400 text-sm">{activity.content.playlist.trackCount} tracks</p>
              </div>
            </div>
            
            {activity.content.playlist.description && (
              <p className="text-slate-300 text-sm mt-2">{activity.content.playlist.description}</p>
            )}
          </div>
        )}
      </div>

      {/* Engagement Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => handleLikeActivity(activity.id)}
            className={`flex items-center gap-2 transition-colors ${
              activity.isLiked ? 'text-red-400' : 'text-slate-400 hover:text-red-400'
            }`}
          >
            <Heart size={18} fill={activity.isLiked ? 'currentColor' : 'none'} />
            <span className="text-sm">{activity.likes}</span>
          </button>

          <button
            onClick={() => setSelectedActivity(activity)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <MessageCircle size={18} />
            <span className="text-sm">{activity.comments}</span>
          </button>

          <button
            onClick={() => handleShare(activity)}
            className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors"
          >
            <Share2 size={18} />
          </button>
        </div>

        <button className="text-slate-400 hover:text-green-400 transition-colors">
          <Star size={18} />
        </button>
      </div>
    </div>
  );

  const FriendCard = ({ user }: { user: User }) => (
    <div className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-800/70 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-medium text-lg">
                  {user.displayName.charAt(0)}
                </span>
              )}
            </div>
            {user.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-800" />
            )}
          </div>
          
          <div>
            <p className="text-white font-medium">{user.displayName}</p>
            <p className="text-slate-400 text-sm">@{user.username}</p>
            <p className="text-slate-500 text-xs">
              {user.isOnline ? 'Online' : user.lastSeen ? `Last seen ${formatTimeAgo(user.lastSeen)}` : 'Offline'}
            </p>
          </div>
        </div>

        <button
          onClick={() => handleFollowUser(user.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            user.isFollowing
              ? 'bg-slate-700 text-white hover:bg-slate-600'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {user.isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4 text-center">
        <div>
          <div className="text-white font-semibold">{user.followers}</div>
          <div className="text-slate-400 text-xs">Followers</div>
        </div>
        <div>
          <div className="text-white font-semibold">{user.following}</div>
          <div className="text-slate-400 text-xs">Following</div>
        </div>
        <div>
          <div className="text-white font-semibold">{(user.totalPlays / 1000).toFixed(1)}K</div>
          <div className="text-slate-400 text-xs">Plays</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Social Hub</h2>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowShareModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-colors"
          >
            <Share2 size={18} />
            Share
          </button>
          
          <button className="p-2 text-slate-400 hover:text-white rounded-full transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
        {[
          { key: 'feed', label: 'Feed', icon: Globe },
          { key: 'friends', label: 'Friends', icon: Users },
          { key: 'discover', label: 'Discover', icon: TrendingUp },
          { key: 'messages', label: 'Messages', icon: MessageCircle }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${
              activeTab === tab.key 
                ? 'bg-green-500 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <tab.icon size={18} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-full pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'feed' && (
          <div className="space-y-4">
            {activities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map(user => (
              <FriendCard key={user.id} user={user} />
            ))}
          </div>
        )}

        {activeTab === 'discover' && (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Discover New Music</h3>
            <p className="text-slate-400">Find trending tracks and artists in your network</p>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Messages</h3>
            <p className="text-slate-400">Connect with friends about music</p>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && currentTrack && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Share Current Track</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-lg mb-6">
              <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-slate-400" />
              </div>
              
              <div>
                <p className="text-white font-medium">{currentTrack.title}</p>
                <p className="text-slate-400">{currentTrack.artist}</p>
              </div>
            </div>

            <textarea
              placeholder="Add a message..."
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent h-20 resize-none mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-full transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-full transition-colors flex items-center justify-center gap-2">
                <Send size={18} />
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialFeatures;