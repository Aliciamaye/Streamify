import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, ChevronDown, ChevronUp, Loader, AlertCircle } from 'lucide-react';
import { apiClient } from '../../utils/apiClient';
import toast from 'react-hot-toast';

interface LyricsLine {
  time?: number;
  text: string;
}

interface LyricsProps {
  trackId?: string;
  trackTitle?: string;
  artistName?: string;
  currentTime?: number;
  isPlaying?: boolean;
}

const LyricsDisplay: React.FC<LyricsProps> = ({
  trackId,
  trackTitle,
  artistName,
  currentTime = 0,
  isPlaying = false
}) => {
  const [lyrics, setLyrics] = useState<LyricsLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSynced, setIsSynced] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const currentLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (trackId) {
      fetchLyrics();
    }
  }, [trackId]);

  useEffect(() => {
    if (isSynced && isPlaying && lyrics.length > 0) {
      updateCurrentLine();
    }
  }, [currentTime, isPlaying, isSynced, lyrics]);

  useEffect(() => {
    if (currentLineRef.current && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;
      const line = currentLineRef.current;
      
      const containerHeight = container.clientHeight;
      const lineTop = line.offsetTop;
      const lineHeight = line.clientHeight;
      
      const scrollTo = lineTop - (containerHeight / 2) + (lineHeight / 2);
      
      container.scrollTo({
        top: scrollTo,
        behavior: 'smooth'
      });
    }
  }, [currentLineIndex]);

  const fetchLyrics = async () => {
    if (!trackId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await apiClient.getLyricsByVideoId(trackId);
      const payload = res.data as any;

      if (payload?.lyrics || payload?.syncedLyrics) {
        const lines: LyricsLine[] = (payload.syncedLyrics || []).map((l: any) => ({
          time: l.time,
          text: l.text,
        }));

        if (!lines.length && payload.lyrics) {
          const plainLines = payload.lyrics.split('\n').map((text: string) => ({ text: text.trim() })).filter((l: any) => l.text);
          lines.push(...plainLines);
        }

        setLyrics(lines);
        setIsSynced(lines.some(line => line.time !== undefined));

        if (payload.source) {
          toast.success(`Lyrics from ${payload.source}`);
        }
      } else {
        setError('Lyrics not found');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load lyrics');
      toast.error('Could not load lyrics');
    } finally {
      setLoading(false);
    }
  };

  const updateCurrentLine = () => {
    if (!isSynced) return;

    let newIndex = 0;
    for (let i = 0; i < lyrics.length; i++) {
      if (lyrics[i].time && lyrics[i].time! <= currentTime) {
        newIndex = i;
      } else {
        break;
      }
    }

    if (newIndex !== currentLineIndex) {
      setCurrentLineIndex(newIndex);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!trackTitle || !artistName) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden"
    >
      {/* Header */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Music className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Lyrics</h3>
            <p className="text-sm text-white/60">
              {trackTitle} - {artistName}
              {isSynced && <span className="ml-2 text-xs text-primary">• Synced</span>}
            </p>
          </div>
        </div>

        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-white/60" />
          ) : (
            <ChevronDown className="w-5 h-5 text-white/60" />
          )}
        </button>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10"
          >
            <div
              ref={lyricsContainerRef}
              className="max-h-96 overflow-y-auto p-6 space-y-3 scroll-smooth"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent'
              }}
            >
              {loading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-white/60">Loading lyrics...</p>
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="p-3 bg-red-500/20 rounded-full">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="text-red-400">{error}</p>
                  <button
                    onClick={fetchLyrics}
                    className="mt-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg font-semibold transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loading && !error && lyrics.length > 0 && (
                <div className="space-y-3">
                  {lyrics.map((line, index) => {
                    const isCurrentLine = isSynced && index === currentLineIndex;
                    const isPastLine = isSynced && index < currentLineIndex;
                    const isFutureLine = isSynced && index > currentLineIndex;

                    return (
                      <motion.div
                        key={index}
                        ref={isCurrentLine ? currentLineRef : null}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ 
                          opacity: isSynced ? (isPastLine ? 0.3 : isFutureLine ? 0.5 : 1) : 1,
                          x: 0,
                          scale: isCurrentLine ? 1.05 : 1
                        }}
                        transition={{ duration: 0.3 }}
                        className={`
                          p-3 rounded-lg transition-all duration-300
                          ${isCurrentLine 
                            ? 'bg-primary/20 border-l-4 border-primary' 
                            : 'hover:bg-white/5'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          {line.time !== undefined && (
                            <span className="text-xs font-mono text-white/40 min-w-[3rem]">
                              {formatTime(line.time)}
                            </span>
                          )}
                          <p 
                            className={`
                              text-lg leading-relaxed transition-all duration-300
                              ${isCurrentLine 
                                ? 'text-white font-semibold' 
                                : isPastLine 
                                  ? 'text-white/40' 
                                  : 'text-white/80'
                              }
                            `}
                          >
                            {line.text || '♪'}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {!loading && !error && lyrics.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="p-3 bg-white/5 rounded-full">
                    <Music className="w-8 h-8 text-white/40" />
                  </div>
                  <p className="text-white/60">No lyrics available</p>
                  <p className="text-sm text-white/40 text-center max-w-xs">
                    Lyrics for this track could not be found in any of our sources
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {lyrics.length > 0 && !loading && !error && (
              <div className="px-6 py-3 bg-black/20 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>{lyrics.length} lines</span>
                  {isSynced && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                      Time-synced lyrics
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LyricsDisplay;
