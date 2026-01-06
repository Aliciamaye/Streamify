import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Heart,
  Share2,
  Mic2,
  Radio,
  ListMusic,
} from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  currentTime: number;
}

export default function PremiumPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [track] = useState<Track>({
    id: '1',
    title: 'Premium Track',
    artist: 'Amazing Artist',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop',
    duration: 240,
    currentTime: 0,
  });

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  };

  const buttonVariants = {
    hover: { scale: 1.1, boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' },
    tap: { scale: 0.95 },
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-surface/98 to-surface/90 backdrop-blur-xl border-t border-white/10 z-50 px-4 py-3 md:px-8 shadow-2xl"
      style={{ height: '90px', maxHeight: '90px' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Track Information and Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-6">
          {/* Track Info */}
          <div className="flex items-center gap-4 md:col-span-1">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative w-16 h-16 rounded-xl overflow-hidden shadow-lg shadow-black/50"
            >
              <img
                src={track.thumbnail}
                alt={track.title}
                className="w-full h-full object-cover"
              />
              <motion.div
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"
              />
            </motion.div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{track.title}</h3>
              <p className="text-xs text-text-secondary truncate">{track.artist}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="md:col-span-1 order-3 md:order-2">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
              className="w-full h-1 bg-surface rounded-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-text-secondary mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-end gap-3 md:col-span-1 order-2 md:order-3">
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-lg transition-all ${
                isLiked
                  ? 'bg-primary/20 text-primary'
                  : 'bg-surface/40 text-text-secondary hover:text-primary'
              }`}
            >
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
            </motion.button>
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="p-2 rounded-lg bg-surface/40 text-text-secondary hover:text-primary transition-all"
            >
              <Share2 size={18} />
            </motion.button>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {/* Shuffle */}
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => setIsShuffle(!isShuffle)}
            className={`p-2 rounded-lg transition-all ${
              isShuffle
                ? 'bg-primary/20 text-primary'
                : 'bg-surface/40 text-text-secondary hover:text-primary'
            }`}
          >
            <Shuffle size={20} />
          </motion.button>

          {/* Previous */}
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="p-3 rounded-lg bg-surface/40 text-text-secondary hover:text-primary transition-all"
          >
            <SkipBack size={24} />
          </motion.button>

          {/* Play/Pause */}
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-4 rounded-full bg-gradient-to-br from-primary to-primary-hover text-black shadow-lg shadow-primary/50 hover:shadow-primary/70 transition-all"
          >
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.div
                  key="pause"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Pause size={28} fill="currentColor" />
                </motion.div>
              ) : (
                <motion.div
                  key="play"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Play size={28} fill="currentColor" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Next */}
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="p-3 rounded-lg bg-surface/40 text-text-secondary hover:text-primary transition-all"
          >
            <SkipForward size={24} />
          </motion.button>

          {/* Repeat */}
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => {
              const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
              const currentIndex = modes.indexOf(repeatMode);
              setRepeatMode(modes[(currentIndex + 1) % modes.length]);
            }}
            className={`p-2 rounded-lg transition-all relative ${
              repeatMode !== 'off'
                ? 'bg-primary/20 text-primary'
                : 'bg-surface/40 text-text-secondary hover:text-primary'
            }`}
          >
            <Repeat size={20} />
            {repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-black text-xs rounded-full flex items-center justify-center font-bold">
                1
              </span>
            )}
          </motion.button>
        </div>

        {/* Bottom Row Controls */}
        <div className="flex items-center justify-between">
          {/* Left Side - Additional Controls */}
          <div className="flex items-center gap-2">
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="p-2 rounded-lg bg-surface/40 text-text-secondary hover:text-primary transition-all"
              title="Lyrics"
            >
              <Mic2 size={18} />
            </motion.button>
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="p-2 rounded-lg bg-surface/40 text-text-secondary hover:text-primary transition-all"
              title="Queue"
            >
              <ListMusic size={18} />
            </motion.button>
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="p-2 rounded-lg bg-surface/40 text-text-secondary hover:text-primary transition-all"
              title="Radio"
            >
              <Radio size={18} />
            </motion.button>
          </div>

          {/* Volume Control */}
          <div className="relative">
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="p-2 rounded-lg bg-surface/40 text-text-secondary hover:text-primary transition-all flex items-center gap-2"
            >
              {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              <span className="text-xs font-semibold hidden sm:inline">{volume}%</span>
            </motion.button>

            <AnimatePresence>
              {showVolumeSlider && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-12 right-0 bg-surface/90 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-xl"
                >
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-2 h-32 rotate-[-90deg] origin-center cursor-pointer accent-primary"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
