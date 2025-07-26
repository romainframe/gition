import {
  AppError,
  ConflictError,
  ExternalServiceError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  UnauthorizedError,
  ValidationError,
  handleError,
  isAppError,
  isOperationalError,
} from "../errors";

describe("Error Classes", () => {
  describe("AppError", () => {
    it("creates error with all properties", () => {
      const error = new AppError("Test error", "TEST_ERROR", 400, true, {
        field: "value",
      });

      expect(error.message).toBe("Test error");
      expect(error.code).toBe("TEST_ERROR");
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.details).toEqual({ field: "value" });
      expect(error.stack).toBeDefined();
    });

    it("defaults to 500 status code", () => {
      const error = new AppError("Test error", "TEST_ERROR");
      expect(error.statusCode).toBe(500);
    });
  });

  describe("ValidationError", () => {
    it("creates validation error with correct properties", () => {
      const error = new ValidationError("Invalid input", { field: "email" });

      expect(error.message).toBe("Invalid input");
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.details).toEqual({ field: "email" });
    });
  });

  describe("NotFoundError", () => {
    it("creates not found error with resource name", () => {
      const error = new NotFoundError("User");
      expect(error.message).toBe("User not found");
      expect(error.code).toBe("NOT_FOUND");
      expect(error.statusCode).toBe(404);
    });

    it("creates not found error with resource and identifier", () => {
      const error = new NotFoundError("User", "123");
      expect(error.message).toBe("User with identifier '123' not found");
    });
  });

  describe("UnauthorizedError", () => {
    it("creates unauthorized error with default message", () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe("Unauthorized");
      expect(error.code).toBe("UNAUTHORIZED");
      expect(error.statusCode).toBe(401);
    });

    it("creates unauthorized error with custom message", () => {
      const error = new UnauthorizedError("Invalid token");
      expect(error.message).toBe("Invalid token");
    });
  });

  describe("ForbiddenError", () => {
    it("creates forbidden error with default message", () => {
      const error = new ForbiddenError();
      expect(error.message).toBe("Forbidden");
      expect(error.code).toBe("FORBIDDEN");
      expect(error.statusCode).toBe(403);
    });
  });

  describe("ConflictError", () => {
    it("creates conflict error", () => {
      const error = new ConflictError("Resource already exists", { id: "123" });
      expect(error.message).toBe("Resource already exists");
      expect(error.code).toBe("CONFLICT");
      expect(error.statusCode).toBe(409);
      expect(error.details).toEqual({ id: "123" });
    });
  });

  describe("RateLimitError", () => {
    it("creates rate limit error without retry time", () => {
      const error = new RateLimitError();
      expect(error.message).toBe("Rate limit exceeded");
      expect(error.code).toBe("RATE_LIMIT_EXCEEDED");
      expect(error.statusCode).toBe(429);
    });

    it("creates rate limit error with retry time", () => {
      const error = new RateLimitError(60);
      expect(error.message).toBe(
        "Rate limit exceeded. Try again in 60 seconds"
      );
      expect(error.details).toEqual({ retryAfter: 60 });
    });
  });

  describe("ExternalServiceError", () => {
    it("creates external service error", () => {
      const originalError = new Error("Connection timeout");
      const error = new ExternalServiceError("PaymentAPI", originalError);

      expect(error.message).toBe("External service 'PaymentAPI' error");
      expect(error.code).toBe("EXTERNAL_SERVICE_ERROR");
      expect(error.statusCode).toBe(503);
      expect(error.isOperational).toBe(false);
      expect(error.details).toBe(originalError);
    });
  });
});

describe("Error Type Guards", () => {
  describe("isAppError", () => {
    it("returns true for AppError instances", () => {
      expect(isAppError(new AppError("Test", "TEST"))).toBe(true);
      expect(isAppError(new ValidationError("Test"))).toBe(true);
      expect(isAppError(new NotFoundError("Test"))).toBe(true);
    });

    it("returns false for non-AppError instances", () => {
      expect(isAppError(new Error("Test"))).toBe(false);
      expect(isAppError("string error")).toBe(false);
      expect(isAppError(null)).toBe(false);
    });
  });

  describe("isOperationalError", () => {
    it("returns true for operational AppErrors", () => {
      expect(isOperationalError(new ValidationError("Test"))).toBe(true);
      expect(isOperationalError(new NotFoundError("Test"))).toBe(true);
    });

    it("returns false for non-operational errors", () => {
      expect(isOperationalError(new ExternalServiceError("Test"))).toBe(false);
      expect(isOperationalError(new Error("Test"))).toBe(false);
    });
  });
});

describe("handleError", () => {
  it("handles AppError correctly", () => {
    const error = new ValidationError("Invalid email", { field: "email" });
    const result = handleError(error);

    expect(result).toEqual({
      message: "Invalid email",
      code: "VALIDATION_ERROR",
      statusCode: 400,
      details: { field: "email" },
    });
  });

  it("handles standard Error", () => {
    const error = new Error("Something went wrong");
    const result = handleError(error);

    expect(result).toEqual({
      message: "Something went wrong",
      code: "INTERNAL_ERROR",
      statusCode: 500,
    });
  });

  it("handles unknown errors", () => {
    const result = handleError("string error");

    expect(result).toEqual({
      message: "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
      statusCode: 500,
    });
  });
});
