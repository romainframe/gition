import React from "react";

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

import ErrorComponent from "../error";

// Mock Next.js Link component
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
    className,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) {
    return (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    );
  };
});

// Mock console.error to test error logging
const originalConsoleError = console.error;
let consoleErrorSpy: jest.SpyInstance;

describe("Error Component", () => {
  const mockReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it("should render error UI with correct elements", () => {
    const mockError = new Error("Test error message");
    render(<ErrorComponent error={mockError} reset={mockReset} />);

    // Check main heading
    expect(
      screen.getByRole("heading", { name: /application error/i })
    ).toBeInTheDocument();

    // Check error description
    expect(
      screen.getByText(/something went wrong while processing your request/i)
    ).toBeInTheDocument();

    // Check error icon (lucide icons are SVGs with aria-hidden)
    const icon = document.querySelector(".lucide-circle-alert");
    expect(icon).toBeInTheDocument();

    // Check action buttons
    expect(
      screen.getByRole("button", { name: /try again/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go home/i })).toBeInTheDocument();
  });

  it("should log error to console on mount", () => {
    const mockError = new Error("Test error message");
    render(<ErrorComponent error={mockError} reset={mockReset} />);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Application error:",
      mockError
    );
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
  });

  it('should call reset function when "Try again" button is clicked', () => {
    const mockError = new Error("Test error message");
    render(<ErrorComponent error={mockError} reset={mockReset} />);

    const tryAgainButton = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(tryAgainButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('should render "Go home" link with correct href', () => {
    const mockError = new Error("Test error message");
    render(<ErrorComponent error={mockError} reset={mockReset} />);

    const goHomeLink = screen.getByRole("link", { name: /go home/i });
    expect(goHomeLink).toHaveAttribute("href", "/");
  });

  it("should show error details in development mode", () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    const mockError = new Error("Test error message");

    render(<ErrorComponent error={mockError} reset={mockReset} />);

    // Check if error details section is present
    expect(screen.getByText(/error details/i)).toBeInTheDocument();

    // Check if error message is displayed
    expect(screen.getByText("Test error message")).toBeInTheDocument();

    process.env.NODE_ENV = originalNodeEnv;
  });

  it("should hide error details in production mode", () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const mockError = new Error("Test error message");

    render(<ErrorComponent error={mockError} reset={mockReset} />);

    // Error details should not be present in production
    expect(screen.queryByText(/error details/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Test error message")).not.toBeInTheDocument();

    process.env.NODE_ENV = originalNodeEnv;
  });

  it("should display error digest when present in development mode", () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const errorWithDigest = new Error("Test error message") as Error & {
      digest?: string;
    };
    errorWithDigest.digest = "abc123";

    render(<ErrorComponent error={errorWithDigest} reset={mockReset} />);

    expect(screen.getByText("Error ID: abc123")).toBeInTheDocument();

    process.env.NODE_ENV = originalNodeEnv;
  });

  it("should not display error digest when not present", () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    const mockError = new Error("Test error message");

    render(<ErrorComponent error={mockError} reset={mockReset} />);

    expect(screen.queryByText(/error id:/i)).not.toBeInTheDocument();

    process.env.NODE_ENV = originalNodeEnv;
  });

  it("should have proper styling and structure", () => {
    const mockError = new Error("Test error message");
    render(<ErrorComponent error={mockError} reset={mockReset} />);

    // Check main error card container (look for the container with rounded-lg class)
    const errorCard = document.querySelector(".rounded-lg");
    expect(errorCard).toBeInTheDocument();
    expect(errorCard).toHaveClass(
      "bg-destructive/10",
      "border",
      "border-destructive/20",
      "rounded-lg",
      "p-6"
    );

    // Check if buttons have proper styling
    const tryAgainButton = screen.getByRole("button", { name: /try again/i });
    expect(tryAgainButton).toHaveClass("bg-primary", "text-primary-foreground");

    const goHomeLink = screen.getByRole("link", { name: /go home/i });
    expect(goHomeLink).toHaveClass("border", "border-input", "bg-background");
  });

  it("should expand error details when summary is clicked in development mode", () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    const mockError = new Error("Test error message");

    render(<ErrorComponent error={mockError} reset={mockReset} />);

    const errorDetailsSummary = screen.getByText(/error details/i);

    // Initially, error message might not be visible (details element behavior)
    fireEvent.click(errorDetailsSummary);

    // After clicking, error message should be visible
    expect(screen.getByText("Test error message")).toBeInTheDocument();

    process.env.NODE_ENV = originalNodeEnv;
  });

  it("should re-log error when error prop changes", () => {
    const mockError = new Error("Test error message");
    const { rerender } = render(
      <ErrorComponent error={mockError} reset={mockReset} />
    );

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    const newError = new Error("New error message");
    rerender(<ErrorComponent error={newError} reset={mockReset} />);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).toHaveBeenLastCalledWith(
      "Application error:",
      newError
    );
  });

  it("should have accessible elements", () => {
    const mockError = new Error("Test error message");
    render(<ErrorComponent error={mockError} reset={mockReset} />);

    // Check that heading has proper role and level
    const heading = screen.getByRole("heading", { name: /application error/i });
    expect(heading).toBeInTheDocument();

    // Check that buttons and links are accessible
    expect(
      screen.getByRole("button", { name: /try again/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go home/i })).toBeInTheDocument();
  });
});
