import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import { Sidebar } from "../sidebar";

// Mock the structure store
jest.mock("@/store/useStructureStore", () => ({
  useStructureStore: () => ({
    structure: {
      root: {
        name: "root",
        type: "directory",
        path: "/test",
        children: [
          {
            name: "docs",
            type: "directory",
            path: "/test/docs",
            children: [
              {
                name: "guide.md",
                type: "file",
                path: "/test/docs/guide.md",
                isMarkdown: true,
                children: [],
              },
            ],
          },
          {
            name: "tasks",
            type: "directory",
            path: "/test/tasks",
            children: [
              {
                name: "feature.md",
                type: "file",
                path: "/test/tasks/feature.md",
                isMarkdown: true,
                children: [],
              },
            ],
          },
        ],
      },
      docs: [
        {
          name: "guide.md",
          type: "file",
          path: "/test/docs/guide.md",
          isMarkdown: true,
          children: [],
        },
      ],
      tasks: [
        {
          name: "feature.md",
          type: "file",
          path: "/test/tasks/feature.md",
          isMarkdown: true,
          children: [],
        },
      ],
      paths: {
        target: "/test/workspace",
        docs: "/test/workspace/docs",
        tasks: "/test/workspace/tasks",
      },
    },
    loading: false,
    error: null,
    fetchStructure: jest.fn(),
  }),
}));

// Mock config provider
jest.mock("../config-provider", () => ({
  useConfig: () => ({
    config: {
      name: "Test Workspace",
      docsDir: "docs",
      tasksDir: "tasks",
    },
  }),
}));

// Mock language context
jest.mock("@/contexts/language-context", () => ({
  useLanguage: () => ({
    language: "en",
    setLanguage: jest.fn(),
    t: (key: string) => key,
  }),
}));

// Mock inspect hook
jest.mock("@/hooks/use-inspect", () => ({
  useComponentInspect: () => ({
    isInspecting: false,
    elementInfo: null,
  }),
}));

// Mock Next.js Link component
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

// Mock InspectOverlay component
jest.mock("@/components/dev/inspect-overlay", () => ({
  InspectOverlay: ({ children }: { children: React.ReactNode }) => children,
}));

describe("Sidebar", () => {
  it("should render sidebar component", () => {
    render(<Sidebar />);

    // Should render the main sidebar container (check for workspace heading)
    expect(screen.getByText("sidebar.workspace")).toBeInTheDocument();
  });

  it("should display workspace path", () => {
    render(<Sidebar />);

    // Should display the workspace path
    expect(screen.getByText("/test/workspace")).toBeInTheDocument();
  });

  it("should display docs and tasks sections", () => {
    render(<Sidebar />);

    // Should display section headings (they use translation keys)
    expect(screen.getByText("sidebar.documentation")).toBeInTheDocument();
    expect(screen.getByText("sidebar.tasks")).toBeInTheDocument();
  });

  it("should display file structure", () => {
    render(<Sidebar />);

    // Should display the markdown files (they're capitalized by formatDisplayName)
    expect(screen.getByText("Guide")).toBeInTheDocument();
    expect(screen.getByText("Feature")).toBeInTheDocument();
  });

  // Note: These tests would require more complex mocking setup to test loading and error states
  // For now, focusing on the core functionality tests to ensure basic sidebar works
});
