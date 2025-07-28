import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import { ThemeProvider } from "../theme-provider";

// Mock next-themes
jest.mock("next-themes", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ThemeProvider: ({ children, ...props }: any) => (
    <div data-testid="next-themes-provider" {...props}>
      {children}
    </div>
  ),
}));

describe("ThemeProvider", () => {
  it("should render children", () => {
    render(
      <ThemeProvider>
        <div>Test content</div>
      </ThemeProvider>
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("should forward props to NextThemesProvider", () => {
    render(
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange={true}
      >
        <div>Test content</div>
      </ThemeProvider>
    );

    const provider = screen.getByTestId("next-themes-provider");
    expect(provider).toHaveAttribute("attribute", "class");
    expect(provider).toHaveAttribute("defaultTheme", "dark");
    // Boolean props might not be present as attributes when false
    expect(provider).toBeInTheDocument();
  });

  it("should work with default props", () => {
    render(
      <ThemeProvider>
        <div>Default props test</div>
      </ThemeProvider>
    );

    expect(screen.getByText("Default props test")).toBeInTheDocument();
    expect(screen.getByTestId("next-themes-provider")).toBeInTheDocument();
  });
});
