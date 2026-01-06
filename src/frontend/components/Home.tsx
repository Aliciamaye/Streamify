import React, { useState, useEffect } from 'react';
import { 
  PlayCircle, Heart, MoreHorizontal, TrendingUp, Flame, Music, Radio, Volume2,
  Award, BarChart3, Users, MessageCircle, Crown, Compass, Search, Library,
  Settings, Bell, Home as HomeIcon, Plus, Shuffle, Repeat, Download,
  Share2, Clock, Star, Headphones, Zap, Calendar, Globe, Target, Eye,
  Mic, ChevronRight, X
} from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { TRACKS, ALBUMS } from '../constants';

// Import all our new advanced components
import StreamifyWrapped from './Wrapped/StreamifyWrapped';
import { MusicVisualizer } from './Player/MusicVisualizer';
import EnhancedPlayerControls from './Player/EnhancedPlayerControls';
import AdvancedPlaylistManager from './Playlists/AdvancedPlaylistManager';
import SocialFeatures from './Social/SocialFeatures';
import AdvancedSearch from './Search/AdvancedSearch';
import AdvancedMusicDiscovery from './Discovery/AdvancedMusicDiscovery';
import RealTimeChat from './Social/RealTimeChat';
import AdvancedAnalyticsDashboard from './Analytics/AdvancedAnalyticsDashboard';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  action: () => void;
  badge?: string;
}

interface FeaturedSection {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  icon: React.ElementType;
  color: string;
  isNew?: boolean;
  isPremium?: boolean;
}

export const HomeView: React.FC = () => {
  const { playTrack, currentTrack } = usePlayer();

  const [activeSection, setActiveSection] = useState<string>('overview');
  const [showWrapped, setShowWrapped] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);

  // Initialize quick actions
  useEffect(() => {
    const actions: QuickAction[] = [
      {
        id: 'discover',
        label: 'Discover Music',
        icon: Compass,
        color: 'from-purple-500 to-pink-500',
        action: () => setActiveSection('discovery')
      },
      {
        id: 'wrapped',
        label: 'Your Wrapped',
        icon: Award,
        color: 'from-green-500 to-blue-500',
        action: () => setShowWrapped(true),
        badge: 'NEW'
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        color: 'from-blue-500 to-cyan-500',
        action: () => setActiveSection('analytics')
      },
      {
        id: 'social',
        label: 'Social Hub',
        icon: Users,
        color: 'from-orange-500 to-red-500',
        action: () => setActiveSection('social'),
        badge: '5'
      },
      {
        id: 'chat',
        label: 'Live Chat',
        icon: MessageCircle,
        color: 'from-indigo-500 to-purple-500',
        action: () => setShowChat(!showChat),
        badge: '12'
      },
      {
        id: 'playlists',
        label: 'Smart Playlists',
        icon: Library,
        color: 'from-teal-500 to-green-500',
        action: () => setActiveSection('playlists')
      }
    ];

    setQuickActions(actions);
  }, [showChat]);

  const featuredSections: FeaturedSection[] = [
    {
      id: 'discovery',
      title: 'AI Music Discovery',
      description: 'Discover your next favorite song with AI-powered recommendations',
      component: AdvancedMusicDiscovery,
      icon: Compass,
      color: 'from-purple-500 to-pink-500',
      isNew: true
    },
    {
      id: 'analytics',
      title: 'Listening Analytics',
      description: 'Deep insights into your music listening habits and trends',
      component: AdvancedAnalyticsDashboard,
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-500',
      isPremium: true
    },
    {
      id: 'social',
      title: 'Social Features',
      description: 'Connect with friends and discover music together',
      component: SocialFeatures,
      icon: Users,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'search',
      title: 'Advanced Search',
      description: 'Powerful search with filters and smart suggestions',
      component: AdvancedSearch,
      icon: Search,
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 'playlists',
      title: 'Smart Playlists',
      description: 'Create, manage, and collaborate on playlists',
      component: AdvancedPlaylistManager,
      icon: Library,
      color: 'from-indigo-500 to-blue-500'
    }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Good morning';
    if (hour < 18) return '☀️ Good afternoon';
    return '🌙 Good evening';
  };

  const recentTracks = TRACKS.slice(0, 6);
  const popularTracks = TRACKS.filter(t => t.likeCount > 1000000).slice(0, 5);
  const newReleases = ALBUMS.slice(0, 8);

  const QuickActionCard = ({ action }: { action: QuickAction }) => (
    <button
      onClick={action.action}
      className="group relative p-6 bg-slate-800/50 hover:bg-slate-800/70 rounded-xl transition-all transform hover:scale-105"
    >
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-3`}>
        <action.icon className="w-6 h-6 text-white" />
      </div>
      
      <h3 className="text-white font-semibold mb-1">{action.label}</h3>
      
      {action.badge && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          {action.badge}
        </span>
      )}
    </button>
  );

  const StatsCard = ({ 
    icon: Icon, 
    label, 
    value, 
    change, 
    color = 'text-green-400' 
  }: {
    icon: React.ElementType;
    label: string;
    value: string;
    change?: string;
    color?: string;
  }) => (
    <div className="bg-slate-800/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-6 h-6 ${color}`} />
        {change && (
          <span className="text-green-400 text-sm">{change}</span>
        )}
      </div>
      <div className="text-xl font-bold text-white mb-1">{value}</div>
      <div className="text-slate-400 text-sm">{label}</div>
    </div>
  );

  const renderActiveSection = () => {
    const section = featuredSections.find(s => s.id === activeSection);
    if (!section) return null;
    
    const Component = section.component;
    return <Component />;
  };

  // If we're showing a specific section, render it instead of the overview
  if (activeSection !== 'overview') {
    return (
      <div className="relative">
        {/* Back to Overview Button */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700 p-4">
          <button
            onClick={() => setActiveSection('overview')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight size={20} className="rotate-180" />
            Back to Home
          </button>
        </div>

        <div className="p-6">
          {renderActiveSection()}
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="fixed top-0 right-0 w-80 h-full z-20">
            <RealTimeChat className="h-full" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pb-48 pt-8 px-8 overflow-y-auto relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />
      
      {/* Quick Access Header */}
      <div className="relative z-10 mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-3 leading-tight tracking-tight">
              {getGreeting()}
            </h1>
            <p className="text-gray-400 text-lg font-light">What do you want to listen to today?</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowWrapped(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <Award size={18} />
              Your Wrapped
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">NEW</span>
            </button>

            <button className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors">
              <Bell size={20} />
            </button>

            <button className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveSection('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeSection === 'overview'
                ? 'bg-green-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HomeIcon size={18} />
            Overview
          </button>

          {featuredSections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeSection === section.id
                  ? 'bg-green-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <section.icon size={18} />
              {section.title.split(' ')[0]}
              {section.isNew && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  NEW
                </span>
              )}
              {section.isPremium && (
                <Crown size={14} className="text-yellow-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <section className="relative z-10 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map(action => (
            <QuickActionCard key={action.id} action={action} />
          ))}
        </div>
      </section>

      {/* Stats Overview */}
      <section className="relative z-10 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Your Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            icon={Clock}
            label="Hours Listened"
            value="127h"
            change="+12%"
          />
          <StatsCard
            icon={Music}
            label="Tracks Played"
            value="1,847"
            change="+8%"
          />
          <StatsCard
            icon={Heart}
            label="Songs Liked"
            value="234"
            change="+15%"
          />
          <StatsCard
            icon={Users}
            label="Artists Discovered"
            value="89"
            change="+25%"
          />
        </div>
      </section>

      {/* Enhanced Player */}
      <section className="relative z-10 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Enhanced Player</h2>
        <EnhancedPlayerControls />
      </section>

      {/* Featured Sections Preview */}
      <section className="relative z-10 mb-16">
        <h2 className="text-2xl font-bold text-white mb-6">Explore Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredSections.map(section => (
            <div
              key={section.id}
              className="group relative p-6 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl transition-all cursor-pointer"
              onClick={() => setActiveSection(section.id)}
            >
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {section.isNew && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    NEW
                  </span>
                )}
                {section.isPremium && (
                  <Crown size={16} className="text-yellow-400" />
                )}
              </div>

              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${section.color} flex items-center justify-center mb-4`}>
                <section.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-white font-semibold text-lg mb-2">
                {section.title}
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                {section.description}
              </p>

              <div className="flex items-center text-green-400 text-sm font-medium group-hover:text-green-300">
                Explore
                <ChevronRight size={16} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Header with Greeting - OLD CONTENT PRESERVED */}
      <div className="mb-12">
        {/* This section was replaced above */}
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

      {/* Streamify Wrapped Modal */}
      {showWrapped && (
        <div className="fixed inset-0 z-50">
          <StreamifyWrapped 
            onClose={() => setShowWrapped(false)}
            isVisible={showWrapped}
          />
        </div>
      )}

      {/* Chat Sidebar */}
      {showChat && (
        <div className="fixed top-0 right-0 w-80 h-full z-40">
          <RealTimeChat className="h-full" />
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className={`fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-2xl transition-all transform hover:scale-110 z-30 ${
          showChat 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-green-500 hover:bg-green-600'
        } text-white`}
      >
        {showChat ? <X size={24} /> : <MessageCircle size={24} />}
        {!showChat && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
            12
          </span>
        )}
      </button>
    </div>
  );
};
