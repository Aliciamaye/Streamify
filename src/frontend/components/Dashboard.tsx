/**
 * Enhanced Dashboard Component
 * Main dashboard view with advanced features and real-time updates
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart3, Users, MessageCircle, Settings, Bell, Crown,
  Zap, TrendingUp, Award, Music, Heart, Headphones, Globe,
  Star, Target, Calendar, Eye, Mic, Radio, Volume2, Play,
  Pause, SkipForward, SkipBack, Shuffle, Repeat, Download,
  Share2, Plus, Search, Filter, ChevronDown, X, Maximize2,
  Activity, Clock, Flame, Lightning
} from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import StreamifyWrapped from './Wrapped/StreamifyWrapped';
import AdvancedAnalyticsDashboard from './Analytics/AdvancedAnalyticsDashboard';
import SocialFeatures from './Social/SocialFeatures';
import RealTimeChat from './Social/RealTimeChat';
import AdvancedSearch from './Search/AdvancedSearch';
import AdvancedMusicDiscovery from './Discovery/AdvancedMusicDiscovery';

interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
}

interface LiveActivity {
  id: string;
  type: 'track_play' | 'like' | 'follow' | 'share' | 'discovery';
  message: string;
  timestamp: Date;
  user?: string;
  track?: string;
  artist?: string;
}

export const Dashboard: React.FC = () => {
  const { currentTrack, isPlaying, playTrack, togglePlay, queue } = usePlayer();
  
  const [activeWidget, setActiveWidget] = useState<string | null>(null);
  const [showWrapped, setShowWrapped] = useState(false);
  const [liveActivities, setLiveActivities] = useState<LiveActivity[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize metrics
  useEffect(() => {
    const dashboardMetrics: DashboardMetric[] = [
      {
        id: 'listening_time',
        label: 'Listening Time Today',
        value: '4h 23m',
        change: '+15%',
        trend: 'up',
        icon: Clock,
        color: 'from-blue-500 to-cyan-500'
      },
      {
        id: 'tracks_discovered',
        label: 'New Tracks Discovered',
        value: '12',
        change: '+25%',
        trend: 'up',
        icon: Search,
        color: 'from-purple-500 to-pink-500'
      },
      {
        id: 'social_interactions',
        label: 'Social Interactions',
        value: '67',
        change: '+8%',
        trend: 'up',
        icon: Users,
        color: 'from-green-500 to-teal-500'
      },
      {
        id: 'mood_boost',
        label: 'Mood Boost Score',
        value: '8.4',
        change: '+2.1',
        trend: 'up',
        icon: Heart,
        color: 'from-red-500 to-pink-500'
      },
      {
        id: 'discovery_score',
        label: 'Discovery Score',
        value: '92%',
        change: '+5%',
        trend: 'up',
        icon: Target,
        color: 'from-orange-500 to-yellow-500'
      },
      {
        id: 'streak_days',
        label: 'Listening Streak',
        value: '15 days',
        change: '+1',
        trend: 'up',
        icon: Flame,
        color: 'from-yellow-500 to-orange-500'
      }
    ];

    setMetrics(dashboardMetrics);
  }, []);

  // Generate live activities
  useEffect(() => {
    const generateActivity = (): LiveActivity => {
      const activities = [
        {
          type: 'track_play' as const,
          message: 'Started listening to "Blinding Lights"',
          track: 'Blinding Lights',
          artist: 'The Weeknd'
        },
        {
          type: 'discovery' as const,
          message: 'Discovered a new artist through AI recommendations'
        },
        {
          type: 'like' as const,
          message: 'Liked "Good 4 U" by Olivia Rodrigo'
        },
        {
          type: 'share' as const,
          message: 'Shared playlist "Chill Vibes" with friends'
        },
        {
          type: 'follow' as const,
          message: 'Started following @musiclover123'
        }
      ];

      const activity = activities[Math.floor(Math.random() * activities.length)];
      
      return {
        id: `activity-${Date.now()}-${Math.random()}`,
        ...activity,
        timestamp: new Date(),
        user: 'You'
      };
    };

    // Add initial activities
    const initialActivities = Array.from({ length: 5 }, generateActivity);
    setLiveActivities(initialActivities);

    // Add new activities periodically
    const interval = setInterval(() => {
      const newActivity = generateActivity();
      setLiveActivities(prev => [newActivity, ...prev].slice(0, 20));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const MetricCard = ({ metric }: { metric: DashboardMetric }) => (
    <div className="group relative bg-slate-800/50 hover:bg-slate-800/70 rounded-xl p-6 transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${metric.color} flex items-center justify-center`}>
          <metric.icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${
          metric.trend === 'up' ? 'text-green-400' : 
          metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
        }`}>
          {metric.trend === 'up' && <TrendingUp size={14} />}
          {metric.change}
        </div>
      </div>

      <div className="text-2xl font-bold text-white mb-1">
        {metric.value}
      </div>
      <div className="text-slate-400 text-sm">
        {metric.label}
      </div>
    </div>
  );

  const ActivityItem = ({ activity }: { activity: LiveActivity }) => {
    const getActivityIcon = () => {
      switch (activity.type) {
        case 'track_play': return <Play size={16} />;
        case 'like': return <Heart size={16} />;
        case 'follow': return <Users size={16} />;
        case 'share': return <Share2 size={16} />;
        case 'discovery': return <Search size={16} />;
        default: return <Activity size={16} />;
      }
    };

    const getActivityColor = () => {
      switch (activity.type) {
        case 'track_play': return 'text-green-400';
        case 'like': return 'text-red-400';
        case 'follow': return 'text-blue-400';
        case 'share': return 'text-purple-400';
        case 'discovery': return 'text-yellow-400';
        default: return 'text-gray-400';
      }
    };

    return (
      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/30 transition-colors">
        <div className={`flex-shrink-0 ${getActivityColor()}`}>
          {getActivityIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm">{activity.message}</p>
          <p className="text-slate-400 text-xs mt-1">
            {activity.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  };

  const WidgetSelector = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[
        { id: 'analytics', label: 'Analytics', icon: BarChart3, component: AdvancedAnalyticsDashboard },
        { id: 'social', label: 'Social Hub', icon: Users, component: SocialFeatures },
        { id: 'discovery', label: 'Discovery', icon: Search, component: AdvancedMusicDiscovery },
        { id: 'search', label: 'Advanced Search', icon: Filter, component: AdvancedSearch },
        { id: 'chat', label: 'Live Chat', icon: MessageCircle, component: RealTimeChat }
      ].map(widget => (
        <button
          key={widget.id}
          onClick={() => setActiveWidget(widget.id)}
          className="group p-6 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl transition-all"
        >
          <widget.icon className="w-8 h-8 text-slate-400 group-hover:text-white mb-3 mx-auto" />
          <div className="text-white font-medium text-center">
            {widget.label}
          </div>
        </button>
      ))}
    </div>
  );

  const renderActiveWidget = () => {
    switch (activeWidget) {
      case 'analytics':
        return <AdvancedAnalyticsDashboard />;
      case 'social':
        return <SocialFeatures />;
      case 'discovery':
        return <AdvancedMusicDiscovery />;
      case 'search':
        return <AdvancedSearch />;
      case 'chat':
        return <RealTimeChat className="h-96" />;
      default:
        return null;
    }
  };

  if (isFullscreen && activeWidget) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900">
        <div className="h-full flex flex-col">
          <div className="flex-shrink-0 p-4 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {activeWidget.charAt(0).toUpperCase() + activeWidget.slice(1)}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <Maximize2 size={20} />
              </button>
              <button
                onClick={() => {
                  setActiveWidget(null);
                  setIsFullscreen(false);
                }}
                className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            {renderActiveWidget()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Dashboard 🎵
            </h1>
            <p className="text-slate-400">
              Your personal music command center
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowWrapped(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <Award size={18} />
              Your Wrapped
              <Crown size={14} className="text-yellow-400" />
            </button>

            <button className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </button>

            <button className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metrics.map(metric => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Widgets Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Widget Selector */}
            <div className="bg-slate-800/30 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Quick Access</h2>
              <WidgetSelector />
            </div>

            {/* Active Widget */}
            {activeWidget && (
              <div className="bg-slate-800/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    {activeWidget.charAt(0).toUpperCase() + activeWidget.slice(1)}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsFullscreen(true)}
                      className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
                    >
                      <Maximize2 size={16} />
                    </button>
                    <button
                      onClick={() => setActiveWidget(null)}
                      className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="max-h-96 overflow-hidden">
                  {renderActiveWidget()}
                </div>
              </div>
            )}
          </div>

          {/* Live Activity Sidebar */}
          <div className="bg-slate-800/30 rounded-xl p-6 h-fit">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-bold text-white">Live Activity</h2>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {liveActivities.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <button className="w-full p-3 text-slate-400 hover:text-white text-sm font-medium transition-colors">
                View All Activity
              </button>
            </div>
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
      </div>
    </div>
  );
};

export default Dashboard;