/**
 * Enhanced UI Feedback Components
 * Loading states, error displays, and user feedback
 */

import React from 'react';

// Loading Skeleton Component
interface SkeletonProps {
    className?: string;
    width?: string;
    height?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    width = '100%',
    height = '1rem',
    variant = 'text',
    animation = 'pulse',
}) => {
    const baseClasses = 'bg-gray-700 rounded';
    const variantClasses = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-md',
    };
    const animationClasses = {
        pulse: 'animate-pulse',
        wave: 'animate-wave',
        none: '',
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
            style={{ width, height }}
            aria-busy="true"
            aria-live="polite"
        />
    );
};

// Loading Spinner Component
interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: string;
    className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
    size = 'md',
    color = 'text-primary',
    className = '',
}) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    return (
        <div
            className={`inline-block ${sizes[size]} ${color} ${className}`}
            role="status"
            aria-label="Loading"
        >
            <svg
                className="animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
        </div>
    );
};

// Loading State Component
interface LoadingStateProps {
    message?: string;
    fullScreen?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
    message = 'Loading...',
    fullScreen = false,
    size = 'lg',
}) => {
    const containerClasses = fullScreen
        ? 'fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50'
        : 'flex flex-col items-center justify-center p-8';

    return (
        <div className={containerClasses}>
            <div className="flex flex-col items-center gap-4">
                <Spinner size={size} />
                {message && (
                    <p className="text-white/80 text-sm font-medium">{message}</p>
                )}
            </div>
        </div>
    );
};

// Error Display Component
interface ErrorDisplayProps {
    error: string | Error | null;
    title?: string;
    onRetry?: () => void;
    onDismiss?: () => void;
    variant?: 'inline' | 'toast' | 'modal';
    className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    error,
    title = 'Error',
    onRetry,
    onDismiss,
    variant = 'inline',
    className = '',
}) => {
    if (!error) return null;

    const errorMessage = typeof error === 'string' ? error : error.message;

    const variantClasses = {
        inline: 'rounded-lg border border-red-500/20 bg-red-500/10 p-4',
        toast: 'fixed bottom-4 right-4 max-w-md rounded-lg border border-red-500/20 bg-red-500/10 p-4 shadow-2xl z-50',
        modal: 'fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50',
    };

    const content = (
        <div className={`${variantClasses[variant]} ${className}`} role="alert">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    <svg
                        className="w-5 h-5 text-red-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-300">{title}</h3>
                    <p className="mt-1 text-sm text-red-200/80">{errorMessage}</p>
                    <div className="mt-3 flex gap-2">
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="px-3 py-1.5 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded transition-colors"
                            >
                                Try Again
                            </button>
                        )}
                        {onDismiss && (
                            <button
                                onClick={onDismiss}
                                className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 text-white/60 rounded transition-colors"
                            >
                                Dismiss
                            </button>
                        )}
                    </div>
                </div>
                {variant === 'toast' && onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="flex-shrink-0 text-red-300/60 hover:text-red-300 transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );

    if (variant === 'modal') {
        return (
            <div className={variantClasses.modal}>
                <div className="bg-surface rounded-lg border border-white/10 p-6 max-w-md mx-4 shadow-2xl">
                    {content}
                </div>
            </div>
        );
    }

    return content;
};

// Empty State Component
interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
    className = '',
}) => {
    return (
        <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
            {icon && <div className="mb-4 text-white/30">{icon}</div>}
            <h3 className="text-lg font-semibold text-white/90 mb-2">{title}</h3>
            {description && (
                <p className="text-sm text-white/60 max-w-md mb-6">{description}</p>
            )}
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};

// Progress Bar Component
interface ProgressBarProps {
    value: number; // 0-100
    max?: number;
    color?: string;
    showLabel?: boolean;
    className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    max = 100,
    color = 'bg-primary',
    showLabel = false,
    className = '',
}) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div className={`w-full ${className}`}>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                    className={`h-full ${color} transition-all duration-300 ease-out`}
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={max}
                />
            </div>
            {showLabel && (
                <div className="mt-1 text-xs text-white/60 text-right">
                    {Math.round(percentage)}%
                </div>
            )}
        </div>
    );
};

// Badge Component
interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    size = 'md',
    className = '',
}) => {
    const variantClasses = {
        default: 'bg-white/10 text-white/80',
        success: 'bg-green-500/20 text-green-300',
        warning: 'bg-yellow-500/20 text-yellow-300',
        error: 'bg-red-500/20 text-red-300',
        info: 'bg-blue-500/20 text-blue-300',
    };

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        >
            {children}
        </span>
    );
};

// Tooltip Component
interface TooltipProps {
    children: React.ReactNode;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
    children,
    content,
    position = 'top',
    className = '',
}) => {
    const [show, setShow] = React.useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <div
            className={`relative inline-block ${className}`}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            {show && content && (
                <div
                    className={`absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg whitespace-nowrap pointer-events-none ${positionClasses[position]}`}
                    role="tooltip"
                >
                    {content}
                    <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45" />
                </div>
            )}
        </div>
    );
};
