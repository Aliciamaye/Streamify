/**
 * Streamify Wrapped - Annual Music Summary
 * Like Spotify Wrapped, but better!
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Music, Clock, TrendingUp, Heart, Users, 
  Share2, Trophy, Sparkles, Play, Award, Star,
  BarChart3, PieChart, Activity, Headphones, Volume2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../utils/apiClient';
import { LoadingSpinner, MusicLoader } from '../UI/LoadingComponents';

interface WrappedData {
  year: number;
  totalMinutes: number;
  topTracks: Array<{
    id: string;
    title: string;
    artist: string;
    playCount: number;
    minutes: number;
  }>;
  topArtists: Array<{
    name: string;
    playCount: number;
    minutes: number;
  }>;
  topGenres: Array<{
    name: string;
    percentage: number;
    count: number;
  }>;
  listeningPersonality: string;
  streakDays: number;
  discoveries: number;
  shareCount: number;
  monthlyBreakdown: Array<{
    month: string;
    minutes: number;
  }>;
  peakListeningDay: {
    date: string;
    minutes: number;
  };
  musicMoods: Array<{
    mood: string;
    percentage: number;
  }>;
  achievements: string[];
  ranking: {
    percentile: number;
    category: string;
  };
}

export const StreamifyWrapped: React.FC = () => {
  const { user } = useAuth();
  const [wrappedData, setWrappedData] = useState<WrappedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hasShared, setHasShared] = useState(false);

  const slides = [
    'intro',
    'total-time',
    'top-songs',
    'top-artists',
    'genres',
    'personality',
    'achievements',
    'peak-day',
    'discoveries',
    'ranking',
    'share'
  ];

  useEffect(() => {
    fetchWrappedData();
  }, []);

  const fetchWrappedData = async () => {
    try {
      const response = await apiClient.request('/api/analytics/wrapped/2025', 'GET');
      if (response.success) {
        setWrappedData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch wrapped data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const shareWrapped = async () => {
    if (!wrappedData) return;

    const shareText = `🎵 My Streamify 2025 Wrapped is here!\\n\\n🎧 ${wrappedData.totalMinutes.toLocaleString()} minutes listened\\n🎤 Top artist: ${wrappedData.topArtists[0]?.name}\\n🎶 ${wrappedData.discoveries} new discoveries\\n\\nWhat's your music story? #StreamifyWrapped`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Streamify 2025 Wrapped',
          text: shareText,
          url: window.location.origin
        });
        setHasShared(true);
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText);
      setHasShared(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 flex items-center justify-center">
        <MusicLoader text="Creating your music story..." />
      </div>
    );
  }

  if (!wrappedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <Music className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Wrapped Data Available</h2>
          <p className="text-slate-400">Listen to more music to generate your Wrapped!</p>
        </div>
      </div>
    );
  }

  const renderSlide = () => {
    const slide = slides[currentSlide];

    switch (slide) {
      case 'intro':
        return (
          <div className="text-center">
            <div className="mb-8">
              <Sparkles className="w-20 h-20 text-yellow-400 mx-auto mb-4 animate-pulse" />
              <h1 className="text-6xl font-black text-white mb-2">
                Your 2025
              </h1>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Streamify Wrapped
              </h2>
            </div>
            <p className="text-xl text-slate-300 mb-8">
              Ready to see your music story?
            </p>
            <div className="text-lg text-slate-400">
              Hello, {user?.username || 'Music Lover'}! 👋
            </div>
          </div>
        );

      case 'total-time':
        return (
          <div className="text-center">
            <Clock className="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              You listened to
            </h2>
            <div className="text-8xl font-black text-transparent bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text mb-4">
              {Math.round(wrappedData.totalMinutes / 60).toLocaleString()}
            </div>
            <p className="text-2xl text-slate-300 mb-6">hours of music</p>
            <div className="bg-slate-800/50 rounded-2xl p-6">
              <p className="text-slate-400 text-lg">
                That's like listening to your favorite 3-minute song{' '}
                <span className="text-yellow-400 font-semibold">
                  {Math.round(wrappedData.totalMinutes / 3).toLocaleString()}
                </span>{' '}
                times! 🤯
              </p>
            </div>
          </div>
        );

      case 'top-songs':
        return (
          <div className="text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-8">Your Top Songs</h2>
            <div className="space-y-4">
              {wrappedData.topTracks.slice(0, 5).map((track, index) => (
                <div
                  key={track.id}
                  className="bg-slate-800/50 rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-white font-semibold">{track.title}</p>
                    <p className="text-slate-400">{track.artist}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-semibold">{track.playCount} plays</p>
                    <p className="text-slate-500 text-sm">{track.minutes} min</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'top-artists':
        return (
          <div className="text-center">
            <Star className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-8">Your Top Artists</h2>
            <div className="space-y-6">
              {wrappedData.topArtists.slice(0, 3).map((artist, index) => (
                <div
                  key={artist.name}
                  className={`rounded-2xl p-6 ${
                    index === 0 
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30' 
                      : 'bg-slate-800/50'
                  }`}
                >
                  <div className="text-2xl font-bold text-white mb-2">
                    #{index + 1} {artist.name}
                  </div>
                  <div className="text-lg text-slate-300">
                    {artist.playCount} plays • {Math.round(artist.minutes / 60)} hours
                  </div>
                  {index === 0 && (
                    <div className="mt-3 text-purple-300 font-medium">
                      🎉 Your #1 Artist!
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'genres':
        return (
          <div className="text-center">
            <PieChart className="w-16 h-16 text-green-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-8">Your Music DNA</h2>
            <div className="space-y-4">
              {wrappedData.topGenres.map((genre, index) => (
                <div key={genre.name} className="bg-slate-800/50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-semibold">{genre.name}</span>
                    <span className="text-green-400 font-bold">{genre.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-green-400 to-blue-500"
                      style={{ width: `${genre.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'personality':
        return (
          <div className="text-center">
            <Users className="w-16 h-16 text-orange-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-8">Your Music Personality</h2>
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-2xl p-8 mb-6">
              <div className="text-4xl font-black text-orange-400 mb-4">
                {wrappedData.listeningPersonality}
              </div>
              <p className="text-slate-300 text-lg">
                {getPersonalityDescription(wrappedData.listeningPersonality)}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-400 mb-1">{wrappedData.streakDays}</div>
                <div className="text-slate-400">day streak</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-400 mb-1">{wrappedData.discoveries}</div>
                <div className="text-slate-400">new finds</div>
              </div>
            </div>
          </div>
        );

      case 'achievements':
        return (
          <div className="text-center">
            <Award className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-8">Your Achievements</h2>
            <div className="grid gap-4">
              {wrappedData.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-xl p-4 flex items-center gap-3"
                >
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  <span className="text-white font-medium">{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'share':
        return (
          <div className="text-center">
            <Share2 className="w-16 h-16 text-pink-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-8">Share Your Wrapped</h2>
            <div className="bg-slate-800/50 rounded-2xl p-6 mb-8">
              <p className="text-slate-300 text-lg mb-4">
                Show the world your incredible music journey!
              </p>
              <div className="text-sm text-slate-400">
                🎧 {wrappedData.totalMinutes.toLocaleString()} minutes • 
                🎤 Top artist: {wrappedData.topArtists[0]?.name} • 
                🎶 {wrappedData.discoveries} discoveries
              </div>
            </div>
            
            <button
              onClick={shareWrapped}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all transform hover:scale-105 shadow-lg mb-4"
            >
              {hasShared ? '✨ Shared!' : 'Share My Wrapped'}
            </button>
            
            <p className="text-slate-400 text-sm">
              Thanks for an amazing year of music! 🎵
            </p>
          </div>
        );

      default:
        return <div>Slide not found</div>;
    }
  };

  const getPersonalityDescription = (personality: string): string => {
    const descriptions: Record<string, string> = {
      'Explorer': 'You love discovering new artists and genres!',
      'Curator': 'You carefully craft the perfect playlists.',
      'Loyalist': 'You stick to your favorites and know what you love.',
      'Trendsetter': 'You find the hits before they go viral.',
      'Deep Diver': 'You explore entire discographies and B-sides.',
      'Mood Matcher': 'Your music perfectly matches every moment.'
    };
    return descriptions[personality] || 'You have a unique music taste!';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-black/20 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-white to-purple-200 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            />
          </div>
          <div className="text-center text-white/70 text-sm">
            {currentSlide + 1} of {slides.length}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-8 min-h-[600px] flex items-center justify-center">
          {renderSlide()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentSlide === slides.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreamifyWrapped;