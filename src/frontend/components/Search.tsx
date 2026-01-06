import React, { useEffect, useMemo, useState, useRef } from 'react';
import { 
  Disc3, Mic2, Music, PlayCircle, Search as SearchIcon, Sparkles, 
  Filter, Clock, TrendingUp, X, History, Zap
} from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { TRACKS, ALBUMS } from '../constants';
import { apiClient } from '../utils/apiClient';
import { useDebounce } from '../utils/hooks';
import { SearchSkeleton, TrackSkeleton, LoadingSpinner } from './UI/LoadingComponents';

interface SearchFilters {
  duration: 'any' | 'short' | 'medium' | 'long';
  quality: 'any' | 'high' | 'medium' | 'low';
  explicit: boolean;
}

export const SearchView: React.FC = () => {
  const { play } = usePlayer();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300); // Faster response
  const [searchType, setSearchType] = useState<'all' | 'tracks' | 'albums' | 'lyrics'>('all');
  const [lyricsResults, setLyricsResults] = useState<any[]>([]);
  const [remoteTracks, setRemoteTracks] = useState<any[]>([]);
  const [isSearchingLyrics, setIsSearchingLyrics] = useState(false);
  const [isSearchingTracks, setIsSearchingTracks] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    duration: 'any',
    quality: 'any',
    explicit: false
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const localResults = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return { tracks: [], albums: [] };
    }
    const query = debouncedQuery.toLowerCase();
    let tracks = Object.values(TRACKS).filter(
      t => t.title.toLowerCase().includes(query) || t.artist.toLowerCase().includes(query)
    );
    let albums = Object.values(ALBUMS).filter(
      a => a.title.toLowerCase().includes(query) || a.artist.toLowerCase().includes(query)
    );

    // Apply filters
    if (filters.duration !== 'any') {
      tracks = tracks.filter(t => {
        const duration = t.duration || 0;
        switch (filters.duration) {
          case 'short': return duration < 180; // < 3 minutes
          case 'medium': return duration >= 180 && duration < 300; // 3-5 minutes
          case 'long': return duration >= 300; // > 5 minutes
          default: return true;
        }
      });
    }

    return { 
      tracks: tracks.slice(0, 30), 
      albums: albums.slice(0, 20) 
    };
  }, [debouncedQuery, filters]);

  const hasLocalResults = localResults.tracks.length > 0 || localResults.albums.length > 0;

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!debouncedQuery.trim()) {
        setRemoteTracks([]);
        return;
      }
      setIsSearchingTracks(true);
      try {
        const res = await apiClient.searchMusic(debouncedQuery, 20);
        if (cancelled) return;
        const apiTracks = (res.data?.results || res.data || []).map((t: any) => ({
          id: t.videoId,
          videoId: t.videoId,
          title: t.title,
          artist: t.artist,
          duration: t.duration,
        }));
        setRemoteTracks(apiTracks);
      } catch (err) {
        if (!cancelled) setRemoteTracks([]);
      } finally {
        if (!cancelled) setIsSearchingTracks(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!debouncedQuery.trim() || searchType !== 'lyrics') {
        setLyricsResults([]);
        return;
      }
      setIsSearchingLyrics(true);
      try {
        const res = await apiClient.searchLyrics(debouncedQuery);
        if (cancelled) return;
        setLyricsResults(res.data || []);
      } catch (err) {
        if (!cancelled) setLyricsResults([]);
      } finally {
        if (!cancelled) setIsSearchingLyrics(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, searchType]);

  const filteredTracks = searchType === 'all' || searchType === 'tracks' ? localResults.tracks : [];
  const filteredAlbums = searchType === 'all' || searchType === 'albums' ? localResults.albums : [];

  return (
    <div className="pb-40 pt-8 px-8 overflow-y-auto">
      <div className="mb-12 sticky top-0 z-10 pt-4 pb-6 bg-gradient-to-b from-slate-900 to-transparent">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-4 text-gray-400" size={24} />
          <input
            type="text"
            placeholder="Search songs, albums, artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-full pl-14 pr-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/15 focus:ring-2 focus:ring-purple-500/50 transition text-lg"
            autoFocus
          />
        </div>
        {searchQuery && (
          <div className="flex gap-2 mt-4">
            <button onClick={() => setSearchType('all')} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${searchType === 'all' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
              All
            </button>
            <button onClick={() => setSearchType('tracks')} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${searchType === 'tracks' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
              Tracks
            </button>
            <button onClick={() => setSearchType('albums')} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${searchType === 'albums' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
              Albums
            </button>
            <button onClick={() => setSearchType('lyrics')} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${searchType === 'lyrics' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
              Lyrics
            </button>
          </div>
        )}
      </div>

      {!searchQuery.trim() ? (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Browse All</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {['Pop', 'Hip-Hop', 'Rock', 'Electronic', 'Jazz', 'Indie', 'R&B', 'Classical'].map((genre, i) => (
              <div
                key={genre}
                className="group relative h-32 rounded-xl p-4 overflow-hidden cursor-pointer"
                style={{ background: `linear-gradient(135deg, hsl(${i * 45}, 70%, 35%) 0%, hsl(${i * 45 + 30}, 70%, 25%) 100%)` }}
              >
                <h3 className="text-white font-bold text-xl relative z-10">{genre}</h3>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
              </div>
            ))}
          </div>
        </div>
      ) : (!hasLocalResults && remoteTracks.length === 0 && lyricsResults.length === 0) ? (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="bg-gradient-to-br from-red-600/20 to-orange-600/20 p-8 rounded-full mb-6 border border-white/10">
            <SearchIcon size={64} className="text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No results found</h3>
          <p className="text-gray-400 max-w-md">Try searching with different keywords</p>
        </div>
      ) : (
        <>
          {searchType === 'lyrics' && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Mic2 size={24} className="text-emerald-400" />
                Lyrics Matches {isSearchingLyrics && <span className="text-xs text-white/60">(searching...)</span>}
              </h2>
              {lyricsResults.length === 0 && !isSearchingLyrics ? (
                <p className="text-gray-400 text-sm">No lyric matches yet.</p>
              ) : (
                <div className="space-y-3">
                  {lyricsResults.map((hit, idx) => (
                    <div
                      key={`${hit.videoId || 'lyric'}-${idx}`}
                      className="p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition cursor-pointer"
                      onClick={() => hit.videoId && play({
                        videoId: hit.videoId,
                        title: hit.title,
                        artist: hit.artist,
                        thumbnail: '',
                        duration: undefined,
                      })}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold line-clamp-1">{hit.title}</p>
                          <p className="text-gray-400 text-sm line-clamp-1">{hit.artist}</p>
                          {hit.highlight && <p className="text-xs text-emerald-300/80 mt-1 line-clamp-2">“{hit.highlight}”</p>}
                        </div>
                        <Mic2 className="text-emerald-400" size={18} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {remoteTracks.length > 0 && (searchType === 'all' || searchType === 'tracks') && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Sparkles size={24} className="text-cyan-400" />
                Search Results {isSearchingTracks && <span className="text-xs text-white/60">(loading...)</span>}
              </h2>
              <div className="space-y-2">
                {remoteTracks.map((track, idx) => (
                  <div
                    key={track.videoId || idx}
                    className="group flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-transparent hover:border-white/20 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                    onClick={() => play({
                      videoId: track.videoId,
                      title: track.title,
                      artist: track.artist,
                      duration: track.duration,
                      thumbnail: '',
                    })}
                  >
                    <div className="text-gray-400 font-semibold w-8 text-center">{String(idx + 1).padStart(2, '0')}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold line-clamp-1 group-hover:text-pink-400 transition-colors">{track.title}</h3>
                      <p className="text-gray-400 text-sm line-clamp-1">{track.artist}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        play({
                          videoId: track.videoId,
                          title: track.title,
                          artist: track.artist,
                          duration: track.duration,
                          thumbnail: '',
                        });
                      }}
                      className="p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-purple-600/50"
                    >
                      <PlayCircle size={24} className="text-white" fill="currentColor" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredAlbums.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Disc3 size={24} className="text-blue-500" />
                Albums
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {filteredAlbums.map(album => (
                  <div key={album.id} className="group cursor-pointer">
                    <div className="relative mb-4 aspect-square rounded-lg bg-gradient-to-br from-gray-800 to-black overflow-hidden border border-white/10 group-hover:border-white/30 transition-all duration-300 shadow-lg">
                      <div className="w-full h-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center">
                        <Disc3 className="text-white/20" size={80} />
                      </div>
                      <button
                        onClick={() => play(Object.values(TRACKS).find(t => t.album === album.title) || Object.values(TRACKS)[0])}
                        className="absolute bottom-3 right-3 p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg"
                      >
                        <PlayCircle size={20} fill="currentColor" />
                      </button>
                    </div>
                    <h3 className="text-white font-semibold text-sm line-clamp-1 group-hover:text-pink-400 transition">{album.title}</h3>
                    <p className="text-gray-400 text-xs line-clamp-1">{album.artist}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredTracks.length > 0 && searchType !== 'lyrics' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Music size={24} className="text-pink-500" />
                Tracks ({filteredTracks.length})
              </h2>
              <div className="space-y-2">
                {filteredTracks.map((track, idx) => (
                  <div
                    key={track.id}
                    className="group flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-transparent hover:border-white/20 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                    onClick={() => play(track)}
                  >
                    <div className="text-gray-400 font-semibold w-8 text-center">{String(idx + 1).padStart(2, '0')}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold line-clamp-1 group-hover:text-pink-400 transition-colors">{track.title}</h3>
                      <p className="text-gray-400 text-sm line-clamp-1">{track.artist}</p>
                    </div>
                    <div className="text-gray-400 text-sm font-mono w-12 text-right">{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        play(track);
                      }}
                      className="p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-purple-600/50"
                    >
                      <PlayCircle size={24} className="text-white" fill="currentColor" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
