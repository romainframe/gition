export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: unknown
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);

    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", 400, true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, "NOT_FOUND", 404, true);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401, true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, "FORBIDDEN", 403, true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, "CONFLICT", 409, true, details);
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    const message = retryAfter
      ? `Rate limit exceeded. Try again in ${retryAfter} seconds`
      : "Rate limit exceeded";
    super(message, "RATE_LIMIT_EXCEEDED", 429, true, { retryAfter });
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, originalError?: unknown) {
    super(
      `External service '${service}' error`,
      "EXTERNAL_SERVICE_ERROR",
      503,
      false,
      originalError
    );
  }
}

// Error type guards
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

export const isOperationalError = (error: unknown): boolean => {
  if (isAppError(error)) {
    return error.isOperational;
  }
  return false;
};

// Error handler utility
export const handleError = (
  error: unknown
): {
  message: string;
  code: string;
  statusCode: number;
  details?: unknown;
} => {
  if (isAppError(error)) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: "INTERNAL_ERROR",
      statusCode: 500,
    };
  }

  return {
    message: "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
    statusCode: 500,
  };
};
