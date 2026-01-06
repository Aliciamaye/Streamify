/**
 * Skeleton Loading Components
 * Beautiful animated skeleton loaders for various UI elements
 */

import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
    <div
        className={`animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded ${className}`}
        style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite',
        }}
    />
);

export const TrackSkeleton: React.FC = () => (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
        <Skeleton className="w-14 h-14 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="w-12 h-4" />
    </div>
);

export const TrackListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
    <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
            <TrackSkeleton key={i} />
        ))}
    </div>
);

export const AlbumCardSkeleton: React.FC = () => (
    <div className="group">
        <Skeleton className="aspect-square rounded-xl mb-3" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
    </div>
);

export const AlbumGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: count }).map((_, i) => (
            <AlbumCardSkeleton key={i} />
        ))}
    </div>
);

export const PlayerSkeleton: React.FC = () => (
    <div className="p-4 border-t border-white/10 bg-black/40">
        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-10 h-3" />
            <Skeleton className="flex-1 h-1" />
            <Skeleton className="w-10 h-3" />
        </div>
        {/* Controls */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="w-12 h-12 rounded-full" />
                <Skeleton className="w-8 h-8 rounded-full" />
            </div>
            <div className="flex items-center gap-3 flex-1 justify-end">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="w-20 h-1" />
            </div>
        </div>
    </div>
);

export const SearchResultsSkeleton: React.FC = () => (
    <div className="space-y-6">
        {/* Top Result */}
        <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="bg-white/5 rounded-2xl p-6 flex items-center gap-6">
                <Skeleton className="w-32 h-32 rounded-xl" />
                <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="w-12 h-12 rounded-full mt-4" />
                </div>
            </div>
        </div>

        {/* Songs */}
        <div>
            <Skeleton className="h-6 w-24 mb-4" />
            <TrackListSkeleton count={4} />
        </div>

        {/* Artists */}
        <div>
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="flex gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="text-center">
                        <Skeleton className="w-24 h-24 rounded-full mb-2" />
                        <Skeleton className="h-4 w-20 mx-auto" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const HomeSkeleton: React.FC = () => (
    <div className="p-8 space-y-8">
        {/* Header */}
        <div>
            <Skeleton className="h-12 w-64 mb-4" />
            <Skeleton className="h-5 w-96" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-6 rounded-xl bg-white/5">
                    <Skeleton className="w-12 h-12 rounded-lg mb-3" />
                    <Skeleton className="h-4 w-20" />
                </div>
            ))}
        </div>

        {/* Recently Played */}
        <div>
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/5 flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-lg" />
                        <div className="flex-1">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Albums */}
        <div>
            <Skeleton className="h-8 w-40 mb-4" />
            <AlbumGridSkeleton count={5} />
        </div>
    </div>
);

// CSS for shimmer animation (add to your global styles)
export const shimmerStyles = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`;

export default {
    Skeleton,
    TrackSkeleton,
    TrackListSkeleton,
    AlbumCardSkeleton,
    AlbumGridSkeleton,
    PlayerSkeleton,
    SearchResultsSkeleton,
    HomeSkeleton,
};
