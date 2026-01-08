import React from 'react';
import { ErrorBoundaryFallback } from './feedback/ErrorDisplay';

const serializeError = (error: any) => {
  if (error instanceof Error) {
    return error;
  }
  return new Error(JSON.stringify(error, null, 2));
};

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any): State {
    return { hasError: true, error: serializeError(error) };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service (optional)
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // You can integrate with error tracking services here:
    // Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback: Fallback } = this.props;

    if (hasError && error) {
      const FallbackComponent = Fallback || ErrorBoundaryFallback;
      return <FallbackComponent error={error} resetError={this.resetError} />;
    }

    return children;
  }
}
