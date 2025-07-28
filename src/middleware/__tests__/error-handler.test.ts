/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";

import { jest } from "@jest/globals";

import { asyncHandler, errorHandler } from "../error-handler";

// Mock the error handling utilities
jest.mock("@/lib/errors", () => ({
  handleError: jest.fn((error) => ({
    message: error instanceof Error ? error.message : "Unknown error",
    code: "INTERNAL_ERROR",
    statusCode: 500,
    details: error instanceof Error ? error.stack : undefined,
  })),
  isOperationalError: jest.fn(() => false),
}));

// Mock console methods
const mockConsoleError = jest.spyOn(console, "error").mockImplementation();

describe("errorHandler", () => {
  beforeEach(() => {
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  it("should handle errors and return error response", async () => {
    const error = new Error("Test error");
    const request = new NextRequest("http://localhost/test");

    const response = await errorHandler(error, request);

    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.error.message).toBe("Test error");
    expect(body.error.code).toBe("INTERNAL_ERROR");
  });

  it("should include stack trace in development", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const error = new Error("Test error");
    error.stack = "Error: Test error\n    at test";
    const request = new NextRequest("http://localhost/test");

    const response = await errorHandler(error, request);

    const body = await response.json();
    expect(body.error.stack).toBe("Error: Test error\n    at test");

    process.env.NODE_ENV = originalEnv;
  });

  it("should not include stack trace in production", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const error = new Error("Test error");
    error.stack = "Error: Test error\n    at test";
    const request = new NextRequest("http://localhost/test");

    const response = await errorHandler(error, request);

    const body = await response.json();
    expect(body.error.stack).toBeUndefined();

    process.env.NODE_ENV = originalEnv;
  });

  it("should add security headers", async () => {
    const error = new Error("Test error");
    const request = new NextRequest("http://localhost/test");

    const response = await errorHandler(error, request);

    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(response.headers.get("X-XSS-Protection")).toBe("1; mode=block");
  });

  it("should log non-operational errors", async () => {
    const error = new Error("Non-operational error");
    const request = new NextRequest("http://localhost/test");

    await errorHandler(error, request);

    expect(mockConsoleError).toHaveBeenCalledWith(
      "Non-operational error:",
      expect.objectContaining({
        error,
        url: "http://localhost/test",
        method: "GET",
      })
    );
  });
});

describe("asyncHandler", () => {
  it("should wrap handler and catch errors", async () => {
    const mockHandler = jest.fn().mockRejectedValue(new Error("Handler error"));
    const wrappedHandler = asyncHandler(mockHandler);

    const request = new NextRequest("http://localhost/test");
    const response = await wrappedHandler(request);

    expect(mockHandler).toHaveBeenCalledWith(request);
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.error.message).toBe("Handler error");
  });

  it("should pass through successful responses", async () => {
    const mockResponse = new Response("Success", { status: 200 });
    const mockHandler = jest.fn().mockResolvedValue(mockResponse);
    const wrappedHandler = asyncHandler(mockHandler);

    const request = new NextRequest("http://localhost/test");
    const response = await wrappedHandler(request);

    expect(response).toBe(mockResponse);
  });
});
