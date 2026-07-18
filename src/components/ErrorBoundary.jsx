import React from 'react';
import { logError } from '@/lib/error-logger';
import { Button } from '@/components/ui/button';
import { Gamepad2 } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    logError('react_boundary', error, {
      extra: { componentStack: info?.componentStack ? info.componentStack.slice(0, 800) : '' },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen grid place-items-center px-4 text-center bg-background">
          <div className="max-w-sm space-y-4 animate-scale-in">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 grid place-items-center mx-auto">
              <Gamepad2 className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold font-heading">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              We hit an unexpected error. Your progress is safe — try reloading. Our team has been notified.
            </p>
            <Button onClick={() => window.location.reload()} className="rounded-full">Reload NexusPlay</Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}