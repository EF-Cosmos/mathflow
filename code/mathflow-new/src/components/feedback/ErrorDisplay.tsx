/**
 * Error Display Component
 *
 * User-friendly error display with retry functionality
 */

import React from 'react';
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

export interface ErrorDisplayProps {
  title?: string;
  message: string;
  error?: Error;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
  variant?: 'inline' | 'full' | 'card';
}

export function ErrorDisplay({
  title = 'Something went wrong',
  message,
  error,
  onRetry,
  onGoHome,
  className,
  variant = 'inline',
}: ErrorDisplayProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  const isFull = variant === 'full';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        isFull ? 'min-h-[400px] p-8' : 'p-6',
        className
      )}
    >
      {/* Error Icon */}
      <div className="w-16 h-16 rounded-full bg-error-bg flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-error" />
      </div>

      {/* Error Message */}
      <h2 className={cn('font-semibold text-foreground', isFull ? 'text-xl' : 'text-lg mb-2')}>
        {title}
      </h2>
      <p className="text-foreground-secondary text-center max-w-md mb-6">{message}</p>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {onRetry && (
          <Button variant="primary" onClick={onRetry} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}
        {onGoHome && (
          <Button variant="outline" onClick={onGoHome} className="gap-2">
            <Home className="w-4 h-4" />
            Go Home
          </Button>
        )}
      </div>

      {/* Error Details Toggle */}
      {error && (
        <details className="mt-6 w-full max-w-md">
          <summary
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm text-foreground-muted cursor-pointer hover:text-foreground-secondary transition-colors"
          >
            <Bug className="w-4 h-4" />
            {showDetails ? 'Hide' : 'Show'} error details
          </summary>
          {showDetails && (
            <div className="mt-3 p-3 rounded-md bg-background-tertiary border border-border">
              <p className="text-xs font-mono text-foreground-secondary break-all">
                {error.name}: {error.message}
              </p>
              {error.stack && (
                <pre className="mt-2 text-xs font-mono text-foreground-muted overflow-auto max-h-40">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
        </details>
      )}
    </div>
  );
}

/**
 * Inline Error - Compact error display for inline use
 */
export function InlineError({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-3 p-4 rounded-lg bg-error-bg border border-error', className)}>
      <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
      <p className="text-sm text-foreground flex-1">{message}</p>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

/**
 * Error Boundary Fallback - Full page error display
 */
export function ErrorBoundaryFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <ErrorDisplay
        title="Application Error"
        message="An unexpected error occurred. You can try refreshing the page or go back to the home page."
        error={error}
        onRetry={resetError}
        onGoHome={() => (window.location.href = '/')}
        variant="full"
      />
    </div>
  );
}
