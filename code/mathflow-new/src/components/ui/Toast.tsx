/**
 * Toast Component
 *
 * Individual toast notification UI
 */

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  title?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const variantStyles: Record<ToastVariant, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-success-bg',
    border: 'border-success',
    icon: 'text-success',
  },
  error: {
    bg: 'bg-error-bg',
    border: 'border-error',
    icon: 'text-error',
  },
  warning: {
    bg: 'bg-warning-bg',
    border: 'border-warning',
    icon: 'text-warning',
  },
  info: {
    bg: 'bg-info-bg',
    border: 'border-info',
    icon: 'text-info',
  },
};

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export function Toast({
  id,
  title,
  message,
  variant = 'info',
  onClose,
  action,
}: ToastProps) {
  const styles = variantStyles[variant];
  const icon = variantIcons[variant];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg',
        'min-w-[320px] max-w-md',
        'animate-slide-in-from-right',
        styles.bg,
        styles.border,
        'border'
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0 mt-0.5', styles.icon)}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-semibold text-sm text-foreground">{title}</p>
        )}
        <p className="text-sm text-foreground-secondary mt-0.5">{message}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-sm font-medium text-secondary hover:underline"
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-foreground-muted" />
        </button>
      )}
    </div>
  );
}
