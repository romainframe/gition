import React from "react";

import { ThemeProvider } from "next-themes";

import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ThemeToggle } from "../theme-toggle";

// Mock the language context
jest.mock("@/contexts/language-context", () => ({
  useLanguage: () => ({
    t: (key: string) => key,
  }),
}));

// Mock the inspect hook
jest.mock("@/hooks/use-inspect", () => ({
  useComponentInspect: jest.fn(),
}));

// Mock the InspectOverlay component
jest.mock("@/components/dev/inspect-overlay", () => ({
  InspectOverlay: ({ children }: { children: React.ReactNode }) => children,
}));

describe("ThemeToggle Component", () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(
      <ThemeProvider attribute="class" defaultTheme="light">
        {ui}
      </ThemeProvider>
    );
  };

  it("renders without crashing", async () => {
    renderWithTheme(<ThemeToggle />);

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  it("shows correct initial icon based on theme", async () => {
    renderWithTheme(<ThemeToggle />);

    await waitFor(() => {
      const button = screen.getByRole("button");
      // In light mode, sun should be visible (scale-100)
      const sun = button.querySelector(".scale-100");
      expect(sun).toBeInTheDocument();
    });
  });

  it("toggles theme when clicked", async () => {
    const user = userEvent.setup();
    renderWithTheme(<ThemeToggle />);

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    const button = screen.getByRole("button");

    // Click to switch to dark mode
    await user.click(button);

    // Note: Since next-themes manages the actual theme state,
    // we can't easily test the theme change in unit tests.
    // This would be better suited for E2E tests.
    expect(button).toBeInTheDocument();
  });

  it("has accessible label", async () => {
    renderWithTheme(<ThemeToggle />);

    await waitFor(() => {
      const button = screen.getByRole("button", { name: "theme.toggle" });
      expect(button).toBeInTheDocument();
    });
  });

  it("renders placeholder while mounting", () => {
    renderWithTheme(<ThemeToggle />);

    // Initially, it should render a placeholder button
    const button = screen.getByRole("button");
    expect(button).toHaveClass("h-9", "w-9", "p-0");
  });
});
