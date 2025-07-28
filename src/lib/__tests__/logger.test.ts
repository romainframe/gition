/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest } from "@jest/globals";

import { logApiRoute, logger, measureAsync } from "../logger";

// Mock global Request and Response
global.Request = jest.fn().mockImplementation((url, options = {}) => ({
  url,
  method: options.method || "GET",
  headers: options.headers || {},
}));

global.Response = jest.fn().mockImplementation((body, init = {}) => ({
  status: init.status || 200,
  statusText: init.statusText || "OK",
  ok: init.status ? init.status >= 200 && init.status < 300 : true,
  body,
}));

// Mock console methods
const mockConsoleDebug = jest.spyOn(console, "debug").mockImplementation();
const mockConsoleLog = jest.spyOn(console, "log").mockImplementation();
const mockConsoleWarn = jest.spyOn(console, "warn").mockImplementation();
const mockConsoleError = jest.spyOn(console, "error").mockImplementation();
const mockConsoleTime = jest.spyOn(console, "time").mockImplementation();
const mockConsoleTimeEnd = jest.spyOn(console, "timeEnd").mockImplementation();

describe("Logger", () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    originalEnv = process.env.NODE_ENV;
    // Set NODE_ENV to development for tests to ensure debug logging works
    process.env.NODE_ENV = "development";
    // Reset the singleton instance to pick up new NODE_ENV
    const LoggerClass = logger.constructor as any;
    LoggerClass.instance = null;
    // Ensure the logger instance has debug level set
    const testLogger = LoggerClass.getInstance();
    testLogger.setLogLevel("debug");
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  afterAll(() => {
    mockConsoleDebug.mockRestore();
    mockConsoleLog.mockRestore();
    mockConsoleWarn.mockRestore();
    mockConsoleError.mockRestore();
    mockConsoleTime.mockRestore();
    mockConsoleTimeEnd.mockRestore();
  });

  it("should be a singleton", () => {
    // Reset the singleton for testing
    const LoggerClass = logger.constructor as any;
    LoggerClass.instance = null;

    const instance1 = LoggerClass.getInstance();
    const instance2 = LoggerClass.getInstance();

    expect(instance1).toBe(instance2);
  });

  describe("logging methods", () => {
    it("should log debug messages", () => {
      // Get fresh logger instance and ensure debug level is set
      const LoggerClass = logger.constructor as any;
      LoggerClass.instance = null;
      const testLogger = LoggerClass.getInstance();
      testLogger.setLogLevel("debug");
      testLogger.debug("Debug message");
      expect(mockConsoleDebug).toHaveBeenCalledWith(
        expect.stringContaining("[DEBUG] Debug message")
      );
    });

    it("should log info messages", () => {
      const LoggerClass = logger.constructor as any;
      LoggerClass.instance = null;
      const testLogger = LoggerClass.getInstance();
      testLogger.setLogLevel("debug");
      testLogger.info("Info message");
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("[INFO] Info message")
      );
    });

    it("should log warn messages", () => {
      const LoggerClass = logger.constructor as any;
      LoggerClass.instance = null;
      const testLogger = LoggerClass.getInstance();
      testLogger.setLogLevel("debug");
      testLogger.warn("Warning message");
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining("[WARN] Warning message")
      );
    });

    it("should log error messages", () => {
      const LoggerClass = logger.constructor as any;
      LoggerClass.instance = null;
      const testLogger = LoggerClass.getInstance();
      testLogger.setLogLevel("debug");
      testLogger.error("Error message");
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR] Error message")
      );
    });
  });

  describe("context logging", () => {
    it("should include context in log messages", () => {
      const context = { userId: "123", action: "test" };
      logger.info("Test message", context);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('{"userId":"123","action":"test"}')
      );
    });

    it("should handle empty context", () => {
      logger.info("Test message", {});

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.not.stringContaining("{}")
      );
    });
  });

  describe("error logging with Error objects", () => {
    it("should handle Error objects", () => {
      const error = new Error("Test error");
      error.stack = "Error: Test error\n    at test";

      logger.error("Error occurred", error);

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('"errorMessage":"Test error"')
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining(
          '"errorStack":"Error: Test error\\n    at test"'
        )
      );
    });

    it("should handle non-Error objects", () => {
      logger.error("Error occurred", "string error");

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('"error":"string error"')
      );
    });
  });

  describe("log levels", () => {
    it("should respect log level in development", () => {
      process.env.NODE_ENV = "development";
      logger.setLogLevel("warn");

      logger.debug("Debug message");
      logger.info("Info message");
      logger.warn("Warning message");

      expect(mockConsoleDebug).not.toHaveBeenCalled();
      expect(mockConsoleLog).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining("[WARN] Warning message")
      );
    });

    it("should respect log level in production", () => {
      process.env.NODE_ENV = "production";
      logger.setLogLevel("error");

      logger.info("Info message");
      logger.warn("Warning message");
      logger.error("Error message");

      expect(mockConsoleLog).not.toHaveBeenCalled();
      expect(mockConsoleWarn).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR] Error message")
      );
    });
  });

  describe("performance logging", () => {
    it("should use console.time in development", () => {
      process.env.NODE_ENV = "development";
      // Reset the singleton to pick up the new NODE_ENV
      const LoggerClass = logger.constructor as any;
      LoggerClass.instance = null;
      const devLogger = LoggerClass.getInstance();

      devLogger.time("test-operation");
      devLogger.timeEnd("test-operation");

      expect(mockConsoleTime).toHaveBeenCalledWith("test-operation");
      expect(mockConsoleTimeEnd).toHaveBeenCalledWith("test-operation");
    });

    it("should not use console.time in production", () => {
      process.env.NODE_ENV = "production";
      // Reset the singleton to pick up the new NODE_ENV
      const LoggerClass = logger.constructor as any;
      LoggerClass.instance = null;
      const prodLogger = LoggerClass.getInstance();

      prodLogger.time("test-operation");
      prodLogger.timeEnd("test-operation");

      expect(mockConsoleTime).not.toHaveBeenCalled();
      expect(mockConsoleTimeEnd).not.toHaveBeenCalled();
    });
  });

  describe("structured logging", () => {
    it("should log HTTP requests", () => {
      const LoggerClass = logger.constructor as any;
      LoggerClass.instance = null;
      const testLogger = LoggerClass.getInstance();
      testLogger.setLogLevel("debug");
      testLogger.logRequest("GET", "/api/test", 200, 150);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("[INFO] HTTP Request")
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"method":"GET"')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"statusCode":200')
      );
    });

    it("should log database queries", () => {
      const LoggerClass = logger.constructor as any;
      LoggerClass.instance = null;
      const testLogger = LoggerClass.getInstance();
      testLogger.setLogLevel("debug");
      testLogger.logDatabaseQuery("find", "users", 25);

      expect(mockConsoleDebug).toHaveBeenCalledWith(
        expect.stringContaining("[DEBUG] Database Query")
      );
      expect(mockConsoleDebug).toHaveBeenCalledWith(
        expect.stringContaining('"operation":"find"')
      );
    });

    it("should log business events", () => {
      const LoggerClass = logger.constructor as any;
      LoggerClass.instance = null;
      const testLogger = LoggerClass.getInstance();
      testLogger.setLogLevel("debug");
      testLogger.logBusinessEvent("user_signup", "user123");

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("[INFO] Business Event")
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"event":"user_signup"')
      );
    });
  });
});

describe("logApiRoute", () => {
  it("should wrap handler and call it successfully", async () => {
    const mockHandler = jest
      .fn()
      .mockResolvedValue(new Response("OK", { status: 200 }));
    const wrappedHandler = logApiRoute(mockHandler);

    const request = new Request("http://localhost/api/test", { method: "GET" });
    const response = await wrappedHandler(request);

    expect(response.status).toBe(200);
    expect(mockHandler).toHaveBeenCalledWith(request);
  });

  it("should wrap handler and propagate errors", async () => {
    const mockHandler = jest.fn().mockRejectedValue(new Error("Handler error"));
    const wrappedHandler = logApiRoute(mockHandler);

    const request = new Request("http://localhost/api/test", {
      method: "POST",
    });

    await expect(wrappedHandler(request)).rejects.toThrow("Handler error");
    expect(mockHandler).toHaveBeenCalledWith(request);
  });
});

describe("measureAsync", () => {
  it("should execute operation and return result", async () => {
    const mockOperation = jest.fn().mockResolvedValue("result");

    const result = await measureAsync("test-operation", mockOperation);

    expect(result).toBe("result");
    expect(mockOperation).toHaveBeenCalled();
  });

  it("should execute operation and propagate errors", async () => {
    const mockOperation = jest
      .fn()
      .mockRejectedValue(new Error("Operation failed"));

    await expect(measureAsync("test-operation", mockOperation)).rejects.toThrow(
      "Operation failed"
    );
    expect(mockOperation).toHaveBeenCalled();
  });
});
