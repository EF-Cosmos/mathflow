/**
 * Container Component
 *
 * Responsive container component for consistent content width
 */

import React from 'react';
import { cn } from '../../lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centered?: boolean;
}

const sizeClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'lg', centered = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'w-full px-4 sm:px-6 lg:px-8',
          sizeClasses[size],
          centered && 'mx-auto',
          className
        )}
        {...props}
      />
    );
  }
);
Container.displayName = 'Container';

export { Container };
