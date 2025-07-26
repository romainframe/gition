import { NextRequest, NextResponse } from "next/server";

import { handleError, isOperationalError } from "@/lib/errors";

export async function errorHandler(
  error: unknown,
  request: NextRequest
): Promise<NextResponse> {
  const errorDetails = handleError(error);

  // Log non-operational errors
  if (!isOperationalError(error)) {
    console.error("Non-operational error:", {
      error,
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
    });
  }

  // Create error response
  const response = NextResponse.json(
    {
      error: {
        message: errorDetails.message,
        code: errorDetails.code,
        ...(process.env.NODE_ENV === "development" && {
          details: errorDetails.details,
          stack: error instanceof Error ? error.stack : undefined,
        }),
      },
    },
    { status: errorDetails.statusCode }
  );

  // Add security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

// Async error wrapper for API routes
export function asyncHandler<
  T extends (...args: unknown[]) => Promise<unknown>,
>(handler: T): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      const [request] = args as unknown as [NextRequest];
      return errorHandler(error, request);
    }
  }) as T;
}
