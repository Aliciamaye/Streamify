import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Radio, TrendingUp, Clock, Heart, Music, Play, Plus } from 'lucide-react';
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

interface RadioStation {
  id: string;
  name: string;
  seedType: 'track' | 'artist' | 'genre';
  seed: string;
  tracks: Track[];
}

const RecommendationsPage: React.FC = () => {
  const [personalizedTracks, setPersonizedTracks] = useState<Track[]>([]);
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [radioStations, setRadioStations] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'foryou' | 'trending' | 'radio'>('foryou');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      
      // Load personalized recommendations
      const personalizedRes = await apiClient.getPersonalizedRecommendations(20);
      setPersonizedTracks(personalizedRes.data.recommendations || []);

      // Load trending tracks
      const trendingRes = await apiClient.getTrendingTracks();
      setTrendingTracks(trendingRes.data.trending || []);

      toast.success('Recommendations loaded!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const createRadioStation = async (seed: { type: 'track' | 'artist' | 'genre'; id: string; name: string }) => {
    try {
      const res = await apiClient.createRadioStation(seed.type, seed.id);
      const station: RadioStation = {
        id: `${seed.type}-${seed.id}`,
        name: `${seed.name} Radio`,
        seedType: seed.type,
        seed: seed.id,
        tracks: res.data.radio || []
      };
      
      setRadioStations([...radioStations, station]);
      setActiveTab('radio');
      toast.success(`Created ${station.name}!`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create radio');
    }
  };

  const playTrack = (track: Track) => {
    // Integrate with PlayerContext
    toast.success(`Playing: ${track.title}`);
  };

  const addToQueue = (track: Track) => {
    toast.success(`Added to queue: ${track.title}`);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const TrackCard = ({ track, index }: { track: Track; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-surface/40 hover:bg-surface/60 backdrop-blur-sm rounded-lg p-4 transition-all duration-200 border border-white/5 hover:border-primary/30"
    >
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <img 
            src={track.thumbnailUrl} 
            alt={track.title}
            className="w-full h-full object-cover rounded-md"
          />
          <button
            onClick={() => playTrack(track)}
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md"
          >
            <Play className="w-6 h-6 text-white" fill="white" />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white truncate">{track.title}</h4>
          <p className="text-sm text-white/60 truncate">{track.artist}</p>
          {track.album && (
            <p className="text-xs text-white/40 truncate">{track.album}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-white/40">{formatDuration(track.duration)}</span>
          <button
            onClick={() => addToQueue(track)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
          >
            <Plus className="w-4 h-4 text-white/60" />
          </button>
          <button
            onClick={() => createRadioStation({ type: 'track', id: track.id, name: track.title })}
            className="p-2 hover:bg-white/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
          >
            <Radio className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const RadioStationCard = ({ station, index }: { station: RadioStation; index: number }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm rounded-xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-primary/20 rounded-full">
          <Radio className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-white">{station.name}</h3>
          <p className="text-sm text-white/60">{station.tracks.length} tracks</p>
        </div>
      </div>

      <div className="space-y-2">
        {station.tracks.slice(0, 5).map((track, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="text-white/40">{i + 1}</span>
            <span className="text-white truncate flex-1">{track.title}</span>
            <button
              onClick={() => playTrack(track)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <Play className="w-3 h-3 text-white/60" fill="currentColor" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => playTrack(station.tracks[0])}
        className="mt-4 w-full py-2 bg-primary hover:bg-primary/80 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
      >
        <Play className="w-4 h-4" fill="currentColor" />
        Play Station
      </button>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            Discover
          </h1>
          <p className="text-white/60">Personalized recommendations just for you</p>
        </div>
        
        <button
          onClick={loadRecommendations}
          className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('foryou')}
          className={`px-4 py-2 font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'foryou'
              ? 'text-primary border-b-2 border-primary'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4" />
          For You
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
          onClick={() => setActiveTab('radio')}
          className={`px-4 py-2 font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'radio'
              ? 'text-primary border-b-2 border-primary'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4" />
          Radio Stations ({radioStations.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <>
          {activeTab === 'foryou' && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-primary" />
                Recommended for You
              </h2>
              {personalizedTracks.length > 0 ? (
                personalizedTracks.map((track, i) => (
                  <TrackCard key={track.id} track={track} index={i} />
                ))
              ) : (
                <p className="text-white/60 text-center py-10">
                  Start listening to music to get personalized recommendations
                </p>
              )}
            </div>
          )}

          {activeTab === 'trending' && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Trending Now
              </h2>
              {trendingTracks.length > 0 ? (
                trendingTracks.map((track, i) => (
                  <TrackCard key={track.id} track={track} index={i} />
                ))
              ) : (
                <p className="text-white/60 text-center py-10">No trending tracks available</p>
              )}
            </div>
          )}

          {activeTab === 'radio' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {radioStations.length > 0 ? (
                radioStations.map((station, i) => (
                  <RadioStationCard key={station.id} station={station} index={i} />
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <Radio className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 mb-2">No radio stations yet</p>
                  <p className="text-white/40 text-sm">
                    Click the radio icon on any track to create a station
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecommendationsPage;
