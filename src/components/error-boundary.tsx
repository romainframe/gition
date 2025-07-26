"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-destructive mb-2">
                    Something went wrong
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {this.state.error?.message ||
                      "An unexpected error occurred"}
                  </p>
                  {process.env.NODE_ENV === "development" &&
                    this.state.error?.stack && (
                      <details className="mb-4">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                          Show error details
                        </summary>
                        <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                          {this.state.error.stack}
                        </pre>
                      </details>
                    )}
                  <button
                    onClick={this.handleReset}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for using error boundary
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}
