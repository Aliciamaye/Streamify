/**
 * Advanced Music Discovery Engine
 * AI-powered recommendations and music exploration
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Compass, TrendingUp, Zap, Heart, Star, Play, Pause,
  Shuffle, SkipForward, Plus, Share2, Bookmark, Clock,
  Calendar, Users, Music, Album, Headphones, Radio,
  Sparkles, Target, Filter, RefreshCw, Eye, Flame,
  Award, Crown, Globe, MapPin, Search, ChevronRight,
  X, Check, MoreHorizontal, Volume2, Download
} from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';

interface DiscoveryProps {
  className?: string;
}

interface RecommendationTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  thumbnail?: string;
  url?: string;
  releaseDate: Date;
  genre: string[];
  mood: string[];
  energy: number; // 0-100
  valence: number; // 0-100 (happiness)
  danceability: number; // 0-100
  instrumentalness: number; // 0-100
  acousticness: number; // 0-100
  popularity: number;
  discoveryScore: number;
  matchReason: string[];
  similarTo?: string[];
}

interface MoodCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: React.ElementType;
  tracks: RecommendationTrack[];
}

interface PersonalizedSection {
  id: string;
  title: string;
  description: string;
  type: 'trending' | 'recommended' | 'mood' | 'genre' | 'activity' | 'discovery';
  tracks: RecommendationTrack[];
  refreshable: boolean;
}

export const AdvancedMusicDiscovery: React.FC<DiscoveryProps> = ({ className = '' }) => {
  const { currentTrack, isPlaying, playTrack, addToQueue, addToPlaylist } = usePlayer();
  
  const [activeSection, setActiveSection] = useState<string>('for-you');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [discoveryFilters, setDiscoveryFilters] = useState({
    energy: [0, 100],
    valence: [0, 100],
    danceability: [0, 100],
    genres: [] as string[],
    moods: [] as string[],
    timeOfDay: 'any' as 'any' | 'morning' | 'afternoon' | 'evening' | 'night',
    activity: 'any' as 'any' | 'focus' | 'workout' | 'relax' | 'party' | 'sleep'
  });
  
  const [personalizedSections, setPersonalizedSections] = useState<PersonalizedSection[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for recommendations
  const moodCategories: MoodCategory[] = [
    {
      id: 'energetic',
      name: 'Energetic',
      description: 'High-energy tracks to pump you up',
      color: 'from-red-500 to-orange-500',
      icon: Zap,
      tracks: []
    },
    {
      id: 'chill',
      name: 'Chill',
      description: 'Relaxing vibes for unwinding',
      color: 'from-blue-500 to-cyan-500',
      icon: Headphones,
      tracks: []
    },
    {
      id: 'focus',
      name: 'Focus',
      description: 'Perfect for concentration and productivity',
      color: 'from-purple-500 to-pink-500',
      icon: Target,
      tracks: []
    },
    {
      id: 'party',
      name: 'Party',
      description: 'Dance-worthy hits for celebrations',
      color: 'from-green-500 to-emerald-500',
      icon: Sparkles,
      tracks: []
    }
  ];

  const mockTracks: RecommendationTrack[] = [
    {
      id: '1',
      title: 'Midnight City',
      artist: 'M83',
      album: 'Hurry Up, We\'re Dreaming',
      duration: 243,
      releaseDate: new Date('2011-10-18'),
      genre: ['Electronic', 'Synth-pop'],
      mood: ['Energetic', 'Nostalgic'],
      energy: 85,
      valence: 75,
      danceability: 70,
      instrumentalness: 20,
      acousticness: 10,
      popularity: 88,
      discoveryScore: 92,
      matchReason: ['Similar to your recent listens', 'High energy match'],
      similarTo: ['Daft Punk', 'Justice']
    },
    {
      id: '2',
      title: 'Resonance',
      artist: 'HOME',
      album: 'Odyssey',
      duration: 213,
      releaseDate: new Date('2014-05-15'),
      genre: ['Synthwave', 'Chillwave'],
      mood: ['Chill', 'Nostalgic'],
      energy: 45,
      valence: 65,
      danceability: 40,
      instrumentalness: 95,
      acousticness: 15,
      popularity: 76,
      discoveryScore: 89,
      matchReason: ['Perfect for focus time', 'Instrumental preference'],
      similarTo: ['Carpenter Brut', 'Power Trip']
    }
  ];

  // Initialize personalized sections
  useEffect(() => {
    const sections: PersonalizedSection[] = [
      {
        id: 'discover-weekly',
        title: 'Discover Weekly',
        description: 'Fresh finds curated just for you',
        type: 'discovery',
        tracks: mockTracks,
        refreshable: true
      },
      {
        id: 'trending-now',
        title: 'Trending Now',
        description: 'What\'s hot in your music network',
        type: 'trending',
        tracks: mockTracks.slice(0, 6),
        refreshable: true
      },
      {
        id: 'because-you-liked',
        title: 'Because You Liked "Bohemian Rhapsody"',
        description: 'More tracks you might enjoy',
        type: 'recommended',
        tracks: mockTracks,
        refreshable: true
      },
      {
        id: 'mood-booster',
        title: 'Mood Booster',
        description: 'Uplifting tracks to brighten your day',
        type: 'mood',
        tracks: mockTracks.filter(t => t.valence > 70),
        refreshable: true
      }
    ];

    setPersonalizedSections(sections);
  }, []);

  const handleRefreshSection = async (sectionId: string) => {
    setIsRefreshing(sectionId);
    
    // Simulate API call
    setTimeout(() => {
      setPersonalizedSections(prev => 
        prev.map(section => 
          section.id === sectionId 
            ? { ...section, tracks: [...mockTracks].sort(() => Math.random() - 0.5) }
            : section
        )
      );
      setIsRefreshing(null);
    }, 1500);
  };

  const handlePlayTrack = (track: RecommendationTrack) => {
    playTrack(track as any);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEnergyColor = (energy: number): string => {
    if (energy >= 80) return 'text-red-400';
    if (energy >= 60) return 'text-orange-400';
    if (energy >= 40) return 'text-yellow-400';
    return 'text-blue-400';
  };

  const TrackCard = ({ track, compact = false }: { track: RecommendationTrack; compact?: boolean }) => (
    <div className={`group relative ${compact ? 'p-3' : 'p-4'} bg-slate-800/30 hover:bg-slate-800/60 rounded-xl transition-all`}>
      <div className="flex items-center gap-3">
        <div className={`relative flex-shrink-0 ${compact ? 'w-12 h-12' : 'w-16 h-16'}`}>
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            {track.thumbnail ? (
              <img 
                src={track.thumbnail} 
                alt={track.title}
                className="w-full h-full rounded-lg object-cover"
              />
            ) : (
              <Music className="w-1/2 h-1/2 text-white" />
            )}
          </div>
          
          <button
            onClick={() => handlePlayTrack(track)}
            className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Play className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className={`text-white font-medium truncate ${compact ? 'text-sm' : ''}`}>
            {track.title}
          </h4>
          <p className={`text-slate-400 truncate ${compact ? 'text-xs' : 'text-sm'}`}>
            {track.artist}
          </p>
          
          {!compact && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Clock size={10} />
                {formatDuration(track.duration)}
              </div>
              
              <div className={`flex items-center gap-1 text-xs ${getEnergyColor(track.energy)}`}>
                <Zap size={10} />
                {track.energy}% energy
              </div>
              
              <div className="text-xs text-slate-500">
                {track.popularity}% popular
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => addToQueue(track as any)}
            className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
            title="Add to Queue"
          >
            <Plus size={16} />
          </button>
          
          <button className="p-2 text-slate-400 hover:text-red-400 rounded-full transition-colors">
            <Heart size={16} />
          </button>
          
          <button className="p-2 text-slate-400 hover:text-white rounded-full transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Match Reasons */}
      {!compact && track.matchReason.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {track.matchReason.slice(0, 2).map((reason, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full"
            >
              {reason}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const SectionHeader = ({ section }: { section: PersonalizedSection }) => (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-xl font-bold text-white">{section.title}</h3>
        <p className="text-slate-400 text-sm">{section.description}</p>
      </div>
      
      <div className="flex items-center gap-2">
        {section.refreshable && (
          <button
            onClick={() => handleRefreshSection(section.id)}
            disabled={isRefreshing === section.id}
            className="p-2 text-slate-400 hover:text-white rounded-full transition-colors disabled:opacity-50"
          >
            <RefreshCw 
              size={18} 
              className={isRefreshing === section.id ? 'animate-spin' : ''} 
            />
          </button>
        )}
        
        <button className="text-green-400 hover:text-green-300 text-sm font-medium">
          See all
        </button>
      </div>
    </div>
  );

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <Compass className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Discover Music</h1>
            <p className="text-slate-400">AI-powered recommendations tailored for you</p>
          </div>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
        >
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Quick Mood Selection */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {moodCategories.map(mood => (
          <button
            key={mood.id}
            onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
            className={`p-4 rounded-xl transition-all ${
              selectedMood === mood.id 
                ? 'bg-gradient-to-r ' + mood.color + ' text-white shadow-lg scale-105'
                : 'bg-slate-800/50 hover:bg-slate-800/70 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <mood.icon size={24} />
              <div className="text-left">
                <h3 className="font-semibold">{mood.name}</h3>
                <p className="text-sm opacity-80">{mood.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-slate-800/30 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-white font-medium mb-3">Time of Day</label>
              <select
                value={discoveryFilters.timeOfDay}
                onChange={(e) => setDiscoveryFilters(prev => ({ ...prev, timeOfDay: e.target.value as any }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="any">Any Time</option>
                <option value="morning">Morning Vibes</option>
                <option value="afternoon">Afternoon Energy</option>
                <option value="evening">Evening Chill</option>
                <option value="night">Night Moods</option>
              </select>
            </div>

            <div>
              <label className="block text-white font-medium mb-3">Activity</label>
              <select
                value={discoveryFilters.activity}
                onChange={(e) => setDiscoveryFilters(prev => ({ ...prev, activity: e.target.value as any }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="any">Any Activity</option>
                <option value="focus">Focus & Work</option>
                <option value="workout">Workout</option>
                <option value="relax">Relaxation</option>
                <option value="party">Party & Social</option>
                <option value="sleep">Sleep & Rest</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setDiscoveryFilters({
                  energy: [0, 100],
                  valence: [0, 100],
                  danceability: [0, 100],
                  genres: [],
                  moods: [],
                  timeOfDay: 'any',
                  activity: 'any'
                })}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Personalized Sections */}
      <div className="space-y-10">
        {personalizedSections.map(section => (
          <div key={section.id} className="space-y-4">
            <SectionHeader section={section} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.tracks.slice(0, 6).map(track => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Discovery Insights */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-bold text-white">Your Discovery Stats</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-white">247</div>
            <div className="text-slate-400 text-sm">New tracks discovered</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">18</div>
            <div className="text-slate-400 text-sm">Genres explored</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">89%</div>
            <div className="text-slate-400 text-sm">Match accuracy</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">12h</div>
            <div className="text-slate-400 text-sm">Discovery time</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedMusicDiscovery;