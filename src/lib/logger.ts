type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private static instance: Logger;
  private isDevelopment = process.env.NODE_ENV === "development";
  private logLevel: LogLevel = this.isDevelopment ? "debug" : "info";

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error"];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const baseMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (context && Object.keys(context).length > 0) {
      return `${baseMessage} ${JSON.stringify(context)}`;
    }

    return baseMessage;
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context);

    switch (level) {
      case "debug":
        console.debug(formattedMessage);
        break;
      case "info":
        console.log(formattedMessage);
        break;
      case "warn":
        console.warn(formattedMessage);
        break;
      case "error":
        console.error(formattedMessage);
        break;
    }

    // In production, you might want to send logs to an external service
    if (!this.isDevelopment && level === "error") {
      // TODO: Send to error tracking service (e.g., Sentry, LogRocket)
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = { ...context };

    if (error instanceof Error) {
      errorContext.errorMessage = error.message;
      errorContext.errorStack = error.stack;
      errorContext.errorName = error.name;
    } else if (error) {
      errorContext.error = error;
    }

    this.log("error", message, errorContext);
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  // Performance logging
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }

  // Structured logging for specific domains
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    this.info("HTTP Request", {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      ...context,
    });
  }

  logDatabaseQuery(
    operation: string,
    collection: string,
    duration: number,
    context?: LogContext
  ): void {
    this.debug("Database Query", {
      operation,
      collection,
      duration: `${duration}ms`,
      ...context,
    });
  }

  logBusinessEvent(event: string, userId?: string, context?: LogContext): void {
    this.info("Business Event", {
      event,
      userId,
      ...context,
    });
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export utility functions for common logging patterns
export function logApiRoute(
  handler: (req: Request) => Promise<Response>
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    const start = Date.now();
    const url = new URL(req.url);

    try {
      const response = await handler(req);
      const duration = Date.now() - start;

      logger.logRequest(req.method, url.pathname, response.status, duration);

      return response;
    } catch (error) {
      const duration = Date.now() - start;

      logger.logRequest(req.method, url.pathname, 500, duration, {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      throw error;
    }
  };
}

// Export function to measure async operations
export async function measureAsync<T>(
  label: string,
  operation: () => Promise<T>
): Promise<T> {
  const start = Date.now();

  try {
    const result = await operation();
    const duration = Date.now() - start;

    logger.debug(`${label} completed`, { duration: `${duration}ms` });

    return result;
  } catch (error) {
    const duration = Date.now() - start;

    logger.error(`${label} failed`, error, { duration: `${duration}ms` });

    throw error;
  }
}
