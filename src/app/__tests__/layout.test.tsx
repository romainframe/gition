import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import RootLayout, { metadata } from "../layout";

// Mock Next.js font imports
jest.mock("next/font/google", () => ({
  Geist: jest.fn(() => ({
    variable: "--font-geist-sans",
  })),
  Geist_Mono: jest.fn(() => ({
    variable: "--font-geist-mono",
  })),
}));

// Mock all provider components
jest.mock("@/components/config-provider", () => ({
  ConfigProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="config-provider">{children}</div>
  ),
}));

jest.mock("@/components/theme-provider", () => ({
  ThemeProvider: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }) => (
    <div
      data-testid="theme-provider"
      data-attribute={props.attribute}
      data-default-theme={props.defaultTheme}
      data-enable-system={props.enableSystem?.toString()}
      data-disable-transition-on-change={props.disableTransitionOnChange?.toString()}
    >
      {children}
    </div>
  ),
}));

jest.mock("@/contexts/language-context", () => ({
  LanguageProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="language-provider">{children}</div>
  ),
}));

jest.mock("@/contexts/inspect-context", () => ({
  InspectProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="inspect-provider">{children}</div>
  ),
}));

jest.mock("@/components/file-watcher-provider", () => ({
  FileWatcherProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="file-watcher-provider">{children}</div>
  ),
}));

jest.mock("@/components/header", () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

jest.mock("@/components/sidebar", () => ({
  Sidebar: () => <aside data-testid="sidebar">Sidebar</aside>,
}));

jest.mock("@/components/dev/inspect-tooltip", () => ({
  InspectTooltip: () => (
    <div data-testid="inspect-tooltip">Inspect Tooltip</div>
  ),
}));

// Mock CSS import
jest.mock("../globals.css", () => ({}));

describe("RootLayout", () => {
  it("should render all providers in the correct order", () => {
    render(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>
    );

    // Check that all providers are rendered
    expect(screen.getByTestId("config-provider")).toBeInTheDocument();
    expect(screen.getByTestId("theme-provider")).toBeInTheDocument();
    expect(screen.getByTestId("language-provider")).toBeInTheDocument();
    expect(screen.getByTestId("inspect-provider")).toBeInTheDocument();
    expect(screen.getByTestId("file-watcher-provider")).toBeInTheDocument();

    // Check provider nesting order
    const configProvider = screen.getByTestId("config-provider");
    const themeProvider = screen.getByTestId("theme-provider");
    const languageProvider = screen.getByTestId("language-provider");
    const inspectProvider = screen.getByTestId("inspect-provider");
    const fileWatcherProvider = screen.getByTestId("file-watcher-provider");

    expect(configProvider).toContainElement(themeProvider);
    expect(themeProvider).toContainElement(languageProvider);
    expect(languageProvider).toContainElement(inspectProvider);
    expect(inspectProvider).toContainElement(fileWatcherProvider);
  });

  it("should render layout components correctly", () => {
    render(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>
    );

    // Check header is rendered
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("Header")).toBeInTheDocument();

    // Check sidebar is rendered
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByText("Sidebar")).toBeInTheDocument();

    // Check inspect tooltip is rendered
    expect(screen.getByTestId("inspect-tooltip")).toBeInTheDocument();
    expect(screen.getByText("Inspect Tooltip")).toBeInTheDocument();
  });

  it("should render children within the main content area", () => {
    render(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>
    );

    const testChild = screen.getByTestId("test-child");
    expect(testChild).toBeInTheDocument();
    expect(testChild).toHaveTextContent("Test Content");

    // Check that child is within main element
    const main = testChild.closest("main");
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass(
      "flex-1",
      "ml-72",
      "overflow-auto",
      "no-scrollbar"
    );
  });

  it("should render with correct font variables", () => {
    const { container } = render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    // Since RootLayout returns html/body elements, we can't directly test them
    // in a unit test environment. Instead, we verify the fonts are imported correctly
    const fontMocks = jest.requireMock("next/font/google");
    expect(fontMocks.Geist).toHaveBeenCalled();
    expect(fontMocks.Geist_Mono).toHaveBeenCalled();

    // Verify the layout structure renders
    expect(
      container.querySelector(".flex.min-h-screen.flex-col")
    ).toBeInTheDocument();
  });

  it("should have correct layout structure", () => {
    const { container } = render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    // Check main layout structure
    const layoutDiv = container.querySelector(".flex.min-h-screen.flex-col");
    expect(layoutDiv).toBeInTheDocument();

    // Check content wrapper structure
    const contentWrapper = container.querySelector(".flex.flex-1.relative");
    expect(contentWrapper).toBeInTheDocument();

    // Check sidebar positioning
    const sidebarWrapper = container.querySelector(
      ".fixed.left-0.top-16.bottom-0.z-10"
    );
    expect(sidebarWrapper).toBeInTheDocument();

    // Check main content area
    const mainContent = container.querySelector("main");
    expect(mainContent).toBeInTheDocument();

    // Check content container within main
    const contentContainer = mainContent?.querySelector(
      ".mx-auto.max-w-screen-xl.p-6.lg\\:p-8"
    );
    expect(contentContainer).toBeInTheDocument();
  });

  it("should pass correct props to ThemeProvider", () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    const themeProvider = screen.getByTestId("theme-provider");
    expect(themeProvider).toHaveAttribute("data-attribute", "class");
    expect(themeProvider).toHaveAttribute("data-default-theme", "system");
    expect(themeProvider).toHaveAttribute("data-enable-system", "true");
    expect(themeProvider).toHaveAttribute(
      "data-disable-transition-on-change",
      "true"
    );
  });

  it("should export metadata correctly", () => {
    expect(metadata).toBeDefined();
    expect(metadata.title).toBe("Gition - Documentation & Task Management");
    expect(metadata.description).toBe(
      "Zero-config local web interface for Markdown/MDX files with Kanban-style task boards"
    );
  });

  it("should handle multiple children", () => {
    render(
      <RootLayout>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </RootLayout>
    );

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
    expect(screen.getByTestId("child-3")).toBeInTheDocument();
  });

  it("should render with empty children", () => {
    const { container } = render(<RootLayout>{null}</RootLayout>);

    // Layout should still render even with no children
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(container.querySelector("main")).toBeInTheDocument();
  });

  it("should maintain correct z-index layering", () => {
    const { container } = render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    // Sidebar should have z-10 for proper layering
    const sidebarWrapper = container.querySelector(".z-10");
    expect(sidebarWrapper).toBeInTheDocument();
    expect(sidebarWrapper).toContainElement(screen.getByTestId("sidebar"));
  });

  it("should have responsive padding on content container", () => {
    const { container } = render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    const contentContainer = container.querySelector(".p-6.lg\\:p-8");
    expect(contentContainer).toBeInTheDocument();
  });

  it("should position header at the top", () => {
    const { container } = render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    // Header should be the first element in the layout
    const layoutDiv = container.querySelector(".flex.min-h-screen.flex-col");
    const firstChild = layoutDiv?.firstElementChild;
    expect(firstChild).toBe(screen.getByTestId("header"));
  });

  it("should apply correct margin to account for fixed sidebar", () => {
    const { container } = render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    const main = container.querySelector("main");
    expect(main).toHaveClass("ml-72");
  });
});
