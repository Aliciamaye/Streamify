/**
 * Global Error Boundary for React Components
 * Enhanced error handling with analytics and recovery options
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home, Bug, Send } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log error to analytics
    this.logErrorToAnalytics(error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to error tracking service
    this.reportError(error, errorInfo);
  }

  private logErrorToAnalytics = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Analytics tracking
      if (window.analytics) {
        window.analytics.track('Error Occurred', {
          error_message: error.message,
          error_stack: error.stack,
          component_stack: errorInfo.componentStack,
          error_id: this.state.errorId,
          user_agent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        });
      }

      // Console error with enhanced info
      console.group('🚨 React Error Boundary');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error ID:', this.state.errorId);
      console.groupEnd();
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorId: this.state.errorId,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          userId: localStorage.getItem('userId') || 'anonymous'
        })
      });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  private sendFeedback = () => {
    const subject = encodeURIComponent(`Error Report - ${this.state.errorId}`);
    const body = encodeURIComponent(`
Error ID: ${this.state.errorId}
Error: ${this.state.error?.message}
URL: ${window.location.href}
Time: ${new Date().toISOString()}

Additional details:
[Please describe what you were doing when this error occurred]
    `);
    
    window.open(`mailto:support@streamify.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </div>

            {/* Error Message */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
              <p className="text-slate-400 mb-4">
                We encountered an unexpected error. Our team has been notified.
              </p>
              
              {/* Error ID for support */}
              <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
                <p className="text-xs text-slate-500 mb-1">Error ID</p>
                <code className="text-sm text-green-400 font-mono">{this.state.errorId}</code>
              </div>

              {/* Development mode - show error details */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                  <summary className="text-red-400 cursor-pointer mb-2">
                    Technical Details
                  </summary>
                  <pre className="text-xs text-red-300 overflow-auto max-h-32">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Retry button (if retries available) */}
              {this.state.retryCount < this.maxRetries && (
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCcw size={18} />
                  Try Again ({this.maxRetries - this.state.retryCount} attempts left)
                </button>
              )}

              {/* Go Home */}
              <button
                onClick={this.handleGoHome}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Home size={18} />
                Go Home
              </button>

              {/* Reload Page */}
              <button
                onClick={this.handleReload}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCcw size={18} />
                Reload Page
              </button>

              {/* Send Feedback */}
              <button
                onClick={this.sendFeedback}
                className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Send size={16} />
                Send Feedback
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500">
                If this problem persists, please contact our support team with the error ID above.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for handling async errors in functional components
export const useErrorHandler = () => {
  const [, setError] = React.useState();

  return React.useCallback((error: Error) => {
    console.error('Async error caught:', error);
    
    // Log to analytics
    if (window.analytics) {
      window.analytics.track('Async Error', {
        error_message: error.message,
        error_stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }

    // Trigger error boundary
    setError(() => {
      throw error;
    });
  }, [setError]);
};

// Higher-order component for error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallbackComponent?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <GlobalErrorBoundary fallbackComponent={fallbackComponent}>
      <Component {...props} />
    </GlobalErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Toast notification for non-critical errors
export const useErrorToast = () => {
  return React.useCallback((error: string | Error, options?: {
    duration?: number;
    action?: { label: string; onClick: () => void };
  }) => {
    const message = typeof error === 'string' ? error : error.message;
    
    // Implementation would integrate with your toast system
    console.warn('Error toast:', message);
    
    // Example: show toast notification
    // toast.error(message, options);
  }, []);
};

export default GlobalErrorBoundary;