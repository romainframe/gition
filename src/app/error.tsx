"use client";

import { useEffect } from "react";

import Link from "next/link";

import { AlertCircle } from "lucide-react";

export default function ErrorComponent({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-destructive mb-2">
                Application Error
              </h1>
              <p className="text-muted-foreground mb-4">
                Something went wrong while processing your request. The error
                has been logged and we&apos;ll look into it.
              </p>
              {process.env.NODE_ENV === "development" && (
                <details className="mb-4">
                  <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                    Error details
                  </summary>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm font-mono bg-muted p-2 rounded">
                      {error.message}
                    </p>
                    {error.digest && (
                      <p className="text-xs text-muted-foreground">
                        Error ID: {error.digest}
                      </p>
                    )}
                  </div>
                </details>
              )}
              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4"
                >
                  Try again
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4"
                >
                  Go home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
