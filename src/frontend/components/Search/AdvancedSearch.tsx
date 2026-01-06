/**
 * Advanced Search Component
 * Multi-faceted search with filters, suggestions, and advanced features
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Filter, Sliders, Clock, TrendingUp, Star,
  Music, Users, Album, PlayCircle, User, Heart,
  X, ChevronDown, Mic, Volume2, Calendar, Globe,
  SortAsc, SortDesc, Grid, List, Eye, Download,
  Share2, Plus, Bookmark, History, MapPin, Tag
} from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';

interface AdvancedSearchProps {
  className?: string;
}

interface SearchFilters {
  type: 'all' | 'tracks' | 'artists' | 'albums' | 'playlists' | 'users';
  genre: string[];
  year: [number, number];
  duration: [number, number]; // in seconds
  quality: 'all' | 'lossy' | 'lossless' | 'hires';
  availability: 'all' | 'streamable' | 'downloadable' | 'premium';
  sortBy: 'relevance' | 'popularity' | 'date' | 'duration' | 'alphabetical';
  sortOrder: 'asc' | 'desc';
}

interface SearchSuggestion {
  id: string;
  type: 'track' | 'artist' | 'album' | 'playlist' | 'query';
  title: string;
  subtitle?: string;
  thumbnail?: string;
  isRecent?: boolean;
  isTrending?: boolean;
}

interface SearchResult {
  id: string;
  type: 'track' | 'artist' | 'album' | 'playlist' | 'user';
  title: string;
  subtitle: string;
  description?: string;
  thumbnail?: string;
  metadata: {
    duration?: number;
    releaseDate?: Date;
    plays?: number;
    likes?: number;
    followers?: number;
    genre?: string[];
    quality?: string;
  };
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ className = '' }) => {
  const { addToQueue, playTrack } = usePlayer();
  
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    genre: [],
    year: [1950, new Date().getFullYear()],
    duration: [0, 3600],
    quality: 'all',
    availability: 'all',
    sortBy: 'relevance',
    sortOrder: 'desc'
  });
  
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isVoiceSearch, setIsVoiceSearch] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchSuggestion[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedResults, setSelectedResults] = useState<string[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Mock data
  const genres = [
    'Rock', 'Pop', 'Hip Hop', 'Jazz', 'Classical', 'Electronic',
    'Country', 'R&B', 'Blues', 'Reggae', 'Folk', 'Metal'
  ];

  const mockSuggestions: SearchSuggestion[] = [
    {
      id: '1',
      type: 'track',
      title: 'Bohemian Rhapsody',
      subtitle: 'Queen',
      thumbnail: 'https://example.com/queen.jpg',
      isTrending: true
    },
    {
      id: '2',
      type: 'artist',
      title: 'The Beatles',
      subtitle: '1.2B monthly listeners',
      thumbnail: 'https://example.com/beatles.jpg'
    },
    {
      id: '3',
      type: 'query',
      title: 'indie rock 2024',
      isRecent: true
    }
  ];

  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'track',
      title: 'Bohemian Rhapsody',
      subtitle: 'Queen',
      thumbnail: 'https://example.com/queen.jpg',
      metadata: {
        duration: 355,
        releaseDate: new Date('1975-10-31'),
        plays: 1500000,
        likes: 125000,
        genre: ['Rock', 'Progressive Rock'],
        quality: 'Lossless'
      }
    },
    {
      id: '2',
      type: 'artist',
      title: 'Queen',
      subtitle: 'British rock band',
      description: 'Legendary rock band formed in London in 1970',
      thumbnail: 'https://example.com/queen-artist.jpg',
      metadata: {
        followers: 45000000,
        genre: ['Rock', 'Pop Rock']
      }
    }
  ];

  const debouncedSearch = useCallback((searchQuery: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        // Simulate API call
        setResults(mockResults.filter(result => 
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
        ));
        setSuggestions([]);
        setShowSuggestions(false);
      } else {
        setResults([]);
      }
    }, 300);
  }, []);

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  useEffect(() => {
    // Load search history and recent searches from localStorage
    const history = localStorage.getItem('searchHistory');
    const recent = localStorage.getItem('recentSearches');
    
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
    
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }
  }, []);

  const handleSearchFocus = () => {
    if (!query) {
      setSuggestions([...recentSearches, ...mockSuggestions]);
      setShowSuggestions(true);
    }
  };

  const handleSearchSubmit = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Add to search history
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    // Add to recent searches
    const recentSearch: SearchSuggestion = {
      id: Date.now().toString(),
      type: 'query',
      title: searchQuery,
      isRecent: true
    };
    
    const newRecent = [recentSearch, ...recentSearches.filter(r => r.title !== searchQuery)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));

    setQuery(searchQuery);
    setShowSuggestions(false);
  };

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      setIsVoiceSearch(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSearchSubmit(transcript);
      };

      recognition.onerror = () => {
        setIsVoiceSearch(false);
      };

      recognition.onend = () => {
        setIsVoiceSearch(false);
      };

      recognition.start();
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleGenreToggle = (genre: string) => {
    setFilters(prev => ({
      ...prev,
      genre: prev.genre.includes(genre)
        ? prev.genre.filter(g => g !== genre)
        : [...prev.genre, genre]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      type: 'all',
      genre: [],
      year: [1950, new Date().getFullYear()],
      duration: [0, 3600],
      quality: 'all',
      availability: 'all',
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const ResultCard = ({ result }: { result: SearchResult }) => (
    <div className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-800/70 transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
          {result.thumbnail ? (
            <img 
              src={result.thumbnail} 
              alt={result.title}
              className="w-full h-full rounded-lg object-cover"
            />
          ) : (
            <Music className="w-8 h-8 text-slate-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">{result.title}</h3>
          <p className="text-slate-400 truncate">{result.subtitle}</p>
          
          {result.description && (
            <p className="text-slate-500 text-sm mt-1 line-clamp-2">{result.description}</p>
          )}

          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            {result.metadata.duration && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {formatDuration(result.metadata.duration)}
              </span>
            )}
            
            {result.metadata.plays && (
              <span className="flex items-center gap-1">
                <PlayCircle size={12} />
                {formatNumber(result.metadata.plays)} plays
              </span>
            )}
            
            {result.metadata.likes && (
              <span className="flex items-center gap-1">
                <Heart size={12} />
                {formatNumber(result.metadata.likes)} likes
              </span>
            )}
            
            {result.metadata.followers && (
              <span className="flex items-center gap-1">
                <Users size={12} />
                {formatNumber(result.metadata.followers)} followers
              </span>
            )}
          </div>

          {result.metadata.genre && (
            <div className="flex flex-wrap gap-1 mt-2">
              {result.metadata.genre.slice(0, 3).map(genre => (
                <span 
                  key={genre}
                  className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {result.type === 'track' && (
            <>
              <button
                onClick={() => playTrack(result as any)}
                className="p-2 text-green-400 hover:text-green-300 rounded-full transition-colors"
                title="Play"
              >
                <PlayCircle size={20} />
              </button>
              
              <button
                onClick={() => addToQueue(result as any)}
                className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
                title="Add to Queue"
              >
                <Plus size={18} />
              </button>
            </>
          )}
          
          <button className="p-2 text-slate-400 hover:text-white rounded-full transition-colors">
            <Heart size={18} />
          </button>
          
          <button className="p-2 text-slate-400 hover:text-white rounded-full transition-colors">
            <Share2 size={18} />
          </button>
          
          <button className="p-2 text-slate-400 hover:text-white rounded-full transition-colors">
            <Bookmark size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Search</h2>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-full transition-colors ${
              showFilters ? 'text-green-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders size={20} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for songs, artists, albums, playlists..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleSearchFocus}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit(query)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-12 pr-16 py-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
          />
          
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              onClick={handleVoiceSearch}
              className={`p-2 rounded-full transition-colors ${
                isVoiceSearch ? 'text-red-400 animate-pulse' : 'text-slate-400 hover:text-white'
              }`}
              title="Voice Search"
            >
              <Mic size={18} />
            </button>
            
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
            {suggestions.map(suggestion => (
              <button
                key={suggestion.id}
                onClick={() => handleSearchSubmit(suggestion.title)}
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-700 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  {suggestion.thumbnail ? (
                    <img 
                      src={suggestion.thumbnail} 
                      alt={suggestion.title}
                      className="w-full h-full rounded-lg object-cover"
                    />
                  ) : suggestion.type === 'track' ? (
                    <Music size={18} className="text-slate-400" />
                  ) : suggestion.type === 'artist' ? (
                    <User size={18} className="text-slate-400" />
                  ) : suggestion.type === 'album' ? (
                    <Album size={18} className="text-slate-400" />
                  ) : (
                    <Search size={18} className="text-slate-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{suggestion.title}</p>
                  {suggestion.subtitle && (
                    <p className="text-slate-400 text-sm truncate">{suggestion.subtitle}</p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {suggestion.isRecent && (
                    <Clock size={14} className="text-slate-500" />
                  )}
                  {suggestion.isTrending && (
                    <TrendingUp size={14} className="text-green-400" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-slate-800/50 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Search Filters</h3>
            <button
              onClick={clearAllFilters}
              className="text-green-400 hover:text-green-300 text-sm"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Content Type */}
            <div>
              <label className="block text-white font-medium mb-3">Content Type</label>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'tracks', label: 'Tracks' },
                  { value: 'artists', label: 'Artists' },
                  { value: 'albums', label: 'Albums' },
                  { value: 'playlists', label: 'Playlists' },
                  { value: 'users', label: 'Users' }
                ].map(option => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="contentType"
                      value={option.value}
                      checked={filters.type === option.value}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="text-green-500 focus:ring-green-500"
                    />
                    <span className="text-slate-300">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Genres */}
            <div>
              <label className="block text-white font-medium mb-3">Genres</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {genres.map(genre => (
                  <label key={genre} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.genre.includes(genre)}
                      onChange={() => handleGenreToggle(genre)}
                      className="text-green-500 focus:ring-green-500 rounded"
                    />
                    <span className="text-slate-300">{genre}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-white font-medium mb-3">Sort By</label>
              <div className="space-y-3">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="relevance">Relevance</option>
                  <option value="popularity">Popularity</option>
                  <option value="date">Release Date</option>
                  <option value="duration">Duration</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                    className={`p-2 rounded-lg transition-colors ${
                      filters.sortOrder === 'asc' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {filters.sortOrder === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
                  </button>
                  <span className="text-slate-300 text-sm">
                    {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-slate-400">
              Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </p>
            
            {selectedResults.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-sm">
                  {selectedResults.length} selected
                </span>
                
                <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors">
                  Add to Queue
                </button>
              </div>
            )}
          </div>

          <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-3'}>
            {results.map(result => (
              <ResultCard key={result.id} result={result} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {query && results.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
          <p className="text-slate-400 mb-4">Try adjusting your search or filters</p>
          
          <div className="flex justify-center gap-3">
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Clear Filters
            </button>
            
            <button
              onClick={() => setQuery('')}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              New Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;