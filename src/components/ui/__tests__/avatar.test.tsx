import { render, screen } from "@testing-library/react";

import { Avatar, AvatarFallback, AvatarImage } from "../avatar";

describe("Avatar", () => {
  it("should render with default classes", () => {
    render(<Avatar data-testid="avatar" />);
    const avatar = screen.getByTestId("avatar");

    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute("data-slot", "avatar");
    expect(avatar).toHaveClass(
      "relative",
      "flex",
      "size-8",
      "shrink-0",
      "overflow-hidden",
      "rounded-full"
    );
  });

  it("should merge custom className with default classes", () => {
    render(<Avatar className="custom-class" data-testid="avatar" />);
    const avatar = screen.getByTestId("avatar");

    expect(avatar).toHaveClass("custom-class");
    expect(avatar).toHaveClass("relative", "flex", "size-8");
  });

  it("should pass through props to root element", () => {
    render(<Avatar data-testid="avatar" role="img" aria-label="User avatar" />);
    const avatar = screen.getByTestId("avatar");

    expect(avatar).toHaveAttribute("role", "img");
    expect(avatar).toHaveAttribute("aria-label", "User avatar");
  });
});

describe("AvatarImage", () => {
  it("should render avatar with image component without errors", () => {
    // Test that AvatarImage can be used within Avatar without throwing errors
    expect(() => {
      render(
        <Avatar data-testid="avatar-with-image">
          <AvatarImage
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjNTU3NTcwIi8+Cjwvc3ZnPgo="
            alt="Test"
          />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
    }).not.toThrow();

    const avatar = screen.getByTestId("avatar-with-image");
    expect(avatar).toBeInTheDocument();
  });

  it("should render avatar with custom props without errors", () => {
    expect(() => {
      render(
        <Avatar data-testid="avatar-container">
          <AvatarImage
            className="custom-image"
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjNTU3NTcwIi8+Cjwvc3ZnPgo="
            alt="Test image"
            loading="lazy"
          />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
    }).not.toThrow();

    const container = screen.getByTestId("avatar-container");
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass("relative", "flex", "size-8");
  });
});

describe("AvatarFallback", () => {
  it("should render with default classes when inside Avatar", () => {
    render(
      <Avatar>
        <AvatarFallback data-testid="avatar-fallback">JD</AvatarFallback>
      </Avatar>
    );
    const fallback = screen.getByTestId("avatar-fallback");

    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveAttribute("data-slot", "avatar-fallback");
    expect(fallback).toHaveClass(
      "bg-muted",
      "flex",
      "size-full",
      "items-center",
      "justify-center",
      "rounded-full"
    );
    expect(fallback).toHaveTextContent("JD");
  });

  it("should merge custom className with default classes", () => {
    render(
      <Avatar>
        <AvatarFallback
          className="custom-fallback"
          data-testid="avatar-fallback"
        >
          JD
        </AvatarFallback>
      </Avatar>
    );
    const fallback = screen.getByTestId("avatar-fallback");

    expect(fallback).toHaveClass("custom-fallback");
    expect(fallback).toHaveClass("bg-muted", "flex", "size-full");
  });

  it("should render children content", () => {
    render(
      <Avatar>
        <AvatarFallback data-testid="avatar-fallback">
          <span>👤</span>
        </AvatarFallback>
      </Avatar>
    );
    const fallback = screen.getByTestId("avatar-fallback");

    expect(fallback).toHaveTextContent("👤");
  });
});

describe("Avatar integration", () => {
  it("should render complete avatar with fallback", () => {
    render(
      <Avatar data-testid="complete-avatar">
        <AvatarImage
          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjNTU3NTcwIi8+Cjwvc3ZnPgo="
          alt="User"
        />
        <AvatarFallback data-testid="avatar-fallback">JD</AvatarFallback>
      </Avatar>
    );

    const avatar = screen.getByTestId("complete-avatar");
    const fallback = screen.getByTestId("avatar-fallback");

    expect(avatar).toBeInTheDocument();
    expect(avatar).toContainElement(fallback);
    expect(fallback).toHaveTextContent("JD");
  });

  it("should render only fallback when no image provided", () => {
    render(
      <Avatar data-testid="fallback-only-avatar">
        <AvatarFallback data-testid="avatar-fallback">JD</AvatarFallback>
      </Avatar>
    );

    const avatar = screen.getByTestId("fallback-only-avatar");
    const fallback = screen.getByTestId("avatar-fallback");

    expect(avatar).toContainElement(fallback);
    expect(fallback).toHaveTextContent("JD");
  });

  it("should render avatar with proper accessibility attributes", () => {
    render(
      <Avatar
        data-testid="accessible-avatar"
        role="img"
        aria-label="User profile picture"
      >
        <AvatarFallback>👤</AvatarFallback>
      </Avatar>
    );

    const avatar = screen.getByTestId("accessible-avatar");
    expect(avatar).toHaveAttribute("role", "img");
    expect(avatar).toHaveAttribute("aria-label", "User profile picture");
  });
});
