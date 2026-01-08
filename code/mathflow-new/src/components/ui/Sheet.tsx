/**
 * Sheet Component (Drawer/Side Panel)
 *
 * A slide-out panel component, useful for mobile navigation and side panels
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SheetProps {
  open?: boolean;
  onClose?: () => void;
  side?: 'left' | 'right' | 'top' | 'bottom';
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

const sizeClasses = {
  sm: 'w-80 max-w-[80vw]',
  md: 'w-96 max-w-[85vw]',
  lg: 'w-[480px] max-w-[90vw]',
  full: 'w-full max-w-full',
};

const sideClasses = {
  left: 'left-0 top-0 h-full border-r',
  right: 'right-0 top-0 h-full border-l',
  top: 'top-0 left-0 w-full border-b',
  bottom: 'bottom-0 left-0 w-full border-t',
};

export function Sheet({
  open = false,
  onClose,
  side = 'right',
  size = 'md',
  children,
  className,
}: SheetProps) {
  // Handle escape key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const isHorizontal = side === 'left' || side === 'right';

  return (
    <div className="fixed inset-0 z-[1100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          'absolute bg-card shadow-xl',
          'animate-slide-in-from-right',
          sideClasses[side],
          isHorizontal && sizeClasses[size],
          !isHorizontal && 'h-[50vh] max-h-[80vh]',
          className
        )}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-background-tertiary transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(100vh-60px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Sheet Header Component
 */
export function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('p-4 border-b border-border', className)}
      {...props}
    />
  );
}

/**
 * Sheet Title Component
 */
export function SheetTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-lg font-semibold text-foreground', className)}
      {...props}
    />
  );
}

/**
 * Sheet Content Component
 */
export function SheetContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('p-4', className)}
      {...props}
    />
  );
}
