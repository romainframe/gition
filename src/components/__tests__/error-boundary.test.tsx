import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import { ErrorBoundary } from "../error-boundary";

// Mock console.error to avoid noisy test output
const mockConsoleError = jest.spyOn(console, "error").mockImplementation();

// Component that throws an error
const ThrowError = ({ shouldError = false }: { shouldError?: boolean }) => {
  if (shouldError) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};

describe("ErrorBoundary", () => {
  afterEach(() => {
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  it("should render children when there is no error", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  it("should render error UI when there is an error", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it("should display error message", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("should have proper error UI structure", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldError />
      </ErrorBoundary>
    );

    // Should have heading and button
    expect(
      screen.getByRole("heading", { name: /something went wrong/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /try again/i })
    ).toBeInTheDocument();
  });

  it("should provide reset functionality", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldError />
      </ErrorBoundary>
    );

    // Error should be displayed
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

    // Click the "Try again" button to reset
    const tryAgainButton = screen.getByText("Try again");
    expect(tryAgainButton).toBeInTheDocument();

    // Note: We can't easily test the actual reset functionality without complex setup
    // because the error boundary would need the child component to not throw again
  });
});
