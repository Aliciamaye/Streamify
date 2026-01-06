/**
 * Enhanced Loading Components
 * Beautiful loading states with skeleton screens and animations
 */

import React from 'react';
import { Loader2, Music, Volume2, Waves } from 'lucide-react';

// Main loading spinner
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}> = ({ size = 'md', color = 'text-green-500', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${color} ${className}`} />
  );
};

// Music-themed loading animation
export const MusicLoader: React.FC<{
  text?: string;
  className?: string;
}> = ({ text = 'Loading...', className = '' }) => (
  <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
    <div className="relative mb-4">
      <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
        <Volume2 className="w-8 h-8 text-white animate-bounce" />
      </div>
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center animate-ping">
        <Music className="w-3 h-3 text-white" />
      </div>
    </div>
    <p className="text-slate-400 text-sm animate-pulse">{text}</p>
  </div>
);

// Skeleton loader for track items
export const TrackSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 animate-pulse">
        <div className="w-12 h-12 bg-slate-700 rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
          <div className="h-3 bg-slate-700 rounded w-1/2"></div>
        </div>
        <div className="w-16 h-8 bg-slate-700 rounded"></div>
      </div>
    ))}
  </div>
);

// Skeleton loader for search results
export const SearchSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center space-x-2 mb-4">
      <div className="w-4 h-4 bg-slate-700 rounded-full animate-pulse"></div>
      <div className="h-4 bg-slate-700 rounded w-32 animate-pulse"></div>
    </div>
    <TrackSkeleton count={8} />
  </div>
);

// Skeleton for now playing panel
export const NowPlayingSkeleton: React.FC = () => (
  <div className="bg-slate-800/50 rounded-xl p-4 animate-pulse">
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-16 h-16 bg-slate-700 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
      </div>
    </div>
    
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-3 bg-slate-700 rounded w-12"></div>
        <div className="h-3 bg-slate-700 rounded w-12"></div>
      </div>
      <div className="h-2 bg-slate-700 rounded-full"></div>
    </div>

    <div className="flex justify-center space-x-4 mt-4">
      <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
      <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
      <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
    </div>
  </div>
);

// Audio wave animation
export const AudioWave: React.FC<{
  isPlaying?: boolean;
  barCount?: number;
  className?: string;
}> = ({ isPlaying = true, barCount = 5, className = '' }) => (
  <div className={`flex items-end space-x-0.5 h-6 ${className}`}>
    {Array.from({ length: barCount }).map((_, i) => (
      <div
        key={i}
        className={`w-1 bg-green-500 rounded-full transition-all duration-150 ${
          isPlaying ? 'animate-pulse' : 'h-1'
        }`}
        style={{
          height: isPlaying ? `${Math.random() * 100}%` : '4px',
          animationDelay: `${i * 0.1}s`,
          animationDuration: `${0.5 + Math.random() * 0.5}s`
        }}
      />
    ))}
  </div>
);

// Page transition loader
export const PageLoader: React.FC<{
  text?: string;
  progress?: number;
}> = ({ text = 'Loading page...', progress }) => (
  <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-slate-800 rounded-2xl p-8 max-w-sm w-full mx-4 border border-slate-700">
      <div className="text-center">
        <MusicLoader text={text} />
        
        {progress !== undefined && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Lazy loading component wrapper
export const LazyWrapper: React.FC<{
  children: React.ReactNode;
  loading?: React.ReactNode;
  error?: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, loading, error, fallback }) => (
  <React.Suspense 
    fallback={loading || fallback || <MusicLoader text="Loading component..." />}
  >
    {children}
  </React.Suspense>
);

// Infinite scroll loader
export const InfiniteScrollLoader: React.FC<{
  hasMore: boolean;
  isLoading: boolean;
  text?: string;
}> = ({ hasMore, isLoading, text = 'Loading more...' }) => {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center py-8">
      {isLoading ? (
        <div className="flex items-center space-x-3 text-slate-400">
          <LoadingSpinner size="sm" />
          <span className="text-sm">{text}</span>
        </div>
      ) : (
        <div className="w-8 h-8 border-2 border-slate-600 border-t-green-500 rounded-full animate-spin" />
      )}
    </div>
  );
};

// Button loading state
export const LoadingButton: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ isLoading, children, onClick, disabled, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative font-semibold rounded-xl transition-all duration-200
        bg-green-600 hover:bg-green-700 text-white
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center space-x-2
        ${sizeClasses[size]} ${className}
      `}
    >
      {isLoading && (
        <LoadingSpinner size="sm" color="text-white" />
      )}
      <span className={isLoading ? 'opacity-70' : ''}>{children}</span>
    </button>
  );
};

// Shimmer effect for images
export const ImageSkeleton: React.FC<{
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
}> = ({ className = '', aspectRatio = 'square' }) => {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[2/1]'
  };

  return (
    <div className={`
      ${aspectClasses[aspectRatio]} 
      bg-slate-700 
      rounded-lg 
      animate-pulse
      relative
      overflow-hidden
      ${className}
    `}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/50 to-transparent animate-shimmer" />
    </div>
  );
};

// Custom CSS for shimmer effect (add to your CSS file)
const shimmerStyles = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  animation: shimmer 1.5s infinite;
}
`;