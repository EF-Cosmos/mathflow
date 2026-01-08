/**
 * Loading Component
 *
 * Various loading states: spinner, skeleton, and full-screen loader
 */

import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Spinner - Simple circular loading indicator
 */
export function Spinner({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div
      className={cn(
        'animate-spin-slow rounded-full border-2 border-border border-t-primary',
        sizeClasses[size],
        className
      )}
    />
  );
}

/**
 * Skeleton - Content placeholder while loading
 */
export function Skeleton({
  className,
  variant = 'default',
}: {
  className?: string;
  variant?: 'default' | 'text' | 'circular' | 'rounded';
}) {
  const variantClasses = {
    default: 'rounded-md',
    text: 'rounded h-4',
    circular: 'rounded-full',
    rounded: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-border-subtle',
        variantClasses[variant],
        className
      )}
    />
  );
}

/**
 * Loading Screen - Full screen loading overlay
 */
export function LoadingScreen({
  message = 'Loading...',
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-background',
        className
      )}
    >
      <Spinner size="lg" />
      {message && (
        <p className="mt-4 text-sm text-foreground-secondary">{message}</p>
      )}
    </div>
  );
}

/**
 * Inline Loading - Loading indicator within content
 */
export function InlineLoading({
  message = 'Loading...',
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-3 py-8', className)}>
      <Spinner size="md" />
      <span className="text-sm text-foreground-secondary">{message}</span>
    </div>
  );
}

/**
 * Card Skeleton - Skeleton for card content
 */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border border-border bg-card p-6', className)}>
      <Skeleton className="h-5 w-3/4 mb-4" variant="text" />
      <Skeleton className="h-4 w-full mb-2" variant="text" />
      <Skeleton className="h-4 w-2/3 mb-4" variant="text" />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-8 w-20" variant="rounded" />
        <Skeleton className="h-8 w-20" variant="rounded" />
      </div>
    </div>
  );
}

/**
 * List Skeleton - Multiple skeleton items in a list
 */
export function ListSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
