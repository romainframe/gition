"use client";

import { AlertCircle } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-md w-full">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-destructive mb-2">
                    Critical Error
                  </h1>
                  <p className="text-muted-foreground mb-4">
                    A critical error occurred that prevented the application
                    from loading properly.
                  </p>
                  <button
                    onClick={reset}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4"
                  >
                    Reload application
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
