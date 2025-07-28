import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import { Header } from "../header";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: "/",
  }),
  usePathname: () => "/",
}));

// Mock Next.js Link
jest.mock("next/link", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function MockLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

// Mock language context
jest.mock("@/contexts/language-context", () => ({
  useLanguage: () => ({
    language: "en",
    setLanguage: jest.fn(),
    t: (key: string) => key,
  }),
}));

// Mock inspect hooks
jest.mock("@/hooks/use-inspect", () => ({
  useComponentInspect: () => ({
    isInspecting: false,
    elementInfo: null,
  }),
  useInspect: () => ({
    isInspectMode: false,
    toggleInspectMode: jest.fn(),
    isAvailable: true,
  }),
}));

// Mock theme toggle component
jest.mock("../theme-toggle", () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Toggle Theme</button>,
}));

// Mock language toggle component
jest.mock("../language-toggle", () => ({
  LanguageToggle: () => (
    <button data-testid="language-toggle">Toggle Language</button>
  ),
}));

// Mock search component
jest.mock("../search", () => ({
  SearchTrigger: () => <button data-testid="search">Search</button>,
}));

// Mock InspectOverlay component
jest.mock("@/components/dev/inspect-overlay", () => ({
  InspectOverlay: ({ children }: { children: React.ReactNode }) => children,
}));

describe("Header", () => {
  it("should render header component", () => {
    render(<Header />);

    // Should render the main header element
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("should display theme toggle", () => {
    render(<Header />);

    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
  });

  it("should display language toggle", () => {
    render(<Header />);

    expect(screen.getByTestId("language-toggle")).toBeInTheDocument();
  });

  it("should display search component", () => {
    render(<Header />);

    expect(screen.getByTestId("search")).toBeInTheDocument();
  });

  it("should have proper header structure", () => {
    render(<Header />);

    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass("border-b");
  });

  it("should render navigation links", () => {
    render(<Header />);

    // Should have translated navigation links (there might be duplicates for accessibility)
    expect(screen.getAllByText("header.docs").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("header.tasks").length).toBeGreaterThanOrEqual(
      1
    );

    // Verify the links exist by checking hrefs (use getAllByRole since there are duplicates)
    const docsLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/docs");
    const tasksLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/tasks");

    expect(docsLinks.length).toBeGreaterThanOrEqual(1);
    expect(tasksLinks.length).toBeGreaterThanOrEqual(1);
  });
});
