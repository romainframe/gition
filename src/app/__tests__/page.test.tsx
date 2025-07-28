import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";

import Home from "../page";

// Mock Next.js Link component
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock language context
jest.mock("@/contexts/language-context", () => ({
  useLanguage: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "homepage.failedToLoadProject": "Failed to load project",
        "homepage.documentation": "Documentation",
        "homepage.document": "document",
        "homepage.documents": "documents",
        "homepage.browseDocs": "Browse Docs",
        "homepage.tasks": "Tasks",
        "homepage.completed": "completed",
        "homepage.complete": "complete",
        "homepage.viewTasks": "View Tasks",
        "homepage.quickStart": "Quick Start",
        "homepage.newToGition": "New to Gition?",
        "homepage.howToGuide": "How-to Guide",
        "homepage.exploreDocs": "Explore Docs",
        "homepage.gettingStarted": "Getting Started",
        "homepage.workspaceReady": "Your workspace is ready!",
        "homepage.documentationSection": "Documentation",
        "homepage.browseDocuments": "Browse documents in the",
        "homepage.docsTab": "Docs",
        "homepage.useSidebar": "Use sidebar navigation",
        "homepage.createNewFiles": "Create new markdown files",
        "homepage.taskManagement": "Task Management",
        "homepage.addTasks": "Add tasks using",
        "homepage.taskDescription": "Task description",
        "homepage.forIncompleteTasks": "for incomplete tasks",
        "homepage.markComplete": "Mark complete with",
        "homepage.done": "Done",
        "homepage.forCompletedTasks": "for completed tasks",
        "homepage.viewAllTasks": "View all tasks in the",
        "homepage.tasksTab": "Tasks",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock inspect overlay and hooks
jest.mock("@/components/dev/inspect-overlay", () => ({
  InspectOverlay: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@/hooks/use-inspect", () => ({
  useComponentInspect: () => ({}),
}));

// Mock fetch
global.fetch = jest.fn();

describe("Home Page", () => {
  const mockDocsResponse = [
    { id: "doc1", title: "Doc 1" },
    { id: "doc2", title: "Doc 2" },
  ];

  const mockTasksResponse = [
    { id: "task1", title: "Task 1", completed: true },
    { id: "task2", title: "Task 2", completed: false },
    { id: "task3", title: "Task 3", completed: true },
  ];

  const mockStructureResponse = {
    paths: {
      target: "/test/workspace",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === "/api/docs") {
        return Promise.resolve({
          json: () => Promise.resolve(mockDocsResponse),
        });
      }
      if (url === "/api/tasks") {
        return Promise.resolve({
          json: () => Promise.resolve(mockTasksResponse),
        });
      }
      if (url === "/api/structure") {
        return Promise.resolve({
          json: () => Promise.resolve(mockStructureResponse),
        });
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });
  });

  it("should render loading state initially", () => {
    render(<Home />);

    expect(
      screen.getByTestId("loading-skeleton") ||
        document.querySelector(".animate-pulse")
    ).toBeInTheDocument();
  });

  it("should render project stats after loading", async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("workspace")).toBeInTheDocument();
    });

    // Check if project name is displayed (basename of path)
    expect(screen.getByText("workspace")).toBeInTheDocument();

    // Check if project path is displayed
    expect(screen.getByText("/test/workspace")).toBeInTheDocument();

    // Check docs count
    expect(screen.getByText("2")).toBeInTheDocument(); // docs count

    // Check tasks count and completion
    expect(screen.getByText("3")).toBeInTheDocument(); // tasks count
    expect(screen.getByText("2 completed")).toBeInTheDocument(); // completed tasks
    expect(screen.getByText("67% complete")).toBeInTheDocument(); // task progress
  });

  it("should render navigation links", async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("workspace")).toBeInTheDocument();
    });

    // Check documentation links
    const docsLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/docs");
    expect(docsLinks.length).toBeGreaterThan(0);

    // Check tasks link
    const tasksLink = screen.getByRole("link", { name: /View Tasks/i });
    expect(tasksLink).toHaveAttribute("href", "/tasks");

    // Check how-to guide link
    const howToLink = screen.getByRole("link", { name: /How-to Guide/i });
    expect(howToLink).toHaveAttribute("href", "/how-to");
  });

  it("should calculate task progress correctly", async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("67% complete")).toBeInTheDocument();
    });

    // 2 completed out of 3 total = 67% (rounded)
    expect(screen.getByText("67% complete")).toBeInTheDocument();
  });

  it("should show appropriate badge variant based on completion", async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("67% complete")).toBeInTheDocument();
    });

    const badge = screen
      .getByText("67% complete")
      .closest('.badge, [data-slot="badge"]');
    expect(badge).toBeInTheDocument();
  });

  it("should handle 100% task completion", async () => {
    const allCompletedTasks = [
      { id: "task1", title: "Task 1", completed: true },
      { id: "task2", title: "Task 2", completed: true },
    ];

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === "/api/tasks") {
        return Promise.resolve({
          json: () => Promise.resolve(allCompletedTasks),
        });
      }
      if (url === "/api/docs") {
        return Promise.resolve({
          json: () => Promise.resolve(mockDocsResponse),
        });
      }
      if (url === "/api/structure") {
        return Promise.resolve({
          json: () => Promise.resolve(mockStructureResponse),
        });
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("100% complete")).toBeInTheDocument();
    });
  });

  it("should handle zero tasks correctly", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === "/api/tasks") {
        return Promise.resolve({
          json: () => Promise.resolve([]),
        });
      }
      if (url === "/api/docs") {
        return Promise.resolve({
          json: () => Promise.resolve(mockDocsResponse),
        });
      }
      if (url === "/api/structure") {
        return Promise.resolve({
          json: () => Promise.resolve(mockStructureResponse),
        });
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("0% complete")).toBeInTheDocument();
    });

    expect(screen.getByText("0 completed")).toBeInTheDocument();
  });

  it("should handle API errors gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("API Error"));

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load project")).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to fetch stats:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it("should render getting started guide", async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Getting Started")).toBeInTheDocument();
    });

    expect(screen.getByText("Your workspace is ready!")).toBeInTheDocument();
    expect(screen.getByText("📁 Documentation")).toBeInTheDocument();
    expect(screen.getByText("✅ Task Management")).toBeInTheDocument();
  });

  it("should render task syntax examples", async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("- [ ] Task description")).toBeInTheDocument();
    });

    expect(screen.getByText("- [x] Done")).toBeInTheDocument();
  });

  it("should handle singular vs plural document text", async () => {
    // Test with single document
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === "/api/docs") {
        return Promise.resolve({
          json: () => Promise.resolve([{ id: "doc1", title: "Single Doc" }]),
        });
      }
      if (url === "/api/tasks") {
        return Promise.resolve({
          json: () => Promise.resolve(mockTasksResponse),
        });
      }
      if (url === "/api/structure") {
        return Promise.resolve({
          json: () => Promise.resolve(mockStructureResponse),
        });
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("document found")).toBeInTheDocument();
    });
  });

  it("should call all required APIs in parallel", () => {
    render(<Home />);

    expect(global.fetch).toHaveBeenCalledWith("/api/docs");
    expect(global.fetch).toHaveBeenCalledWith("/api/tasks");
    expect(global.fetch).toHaveBeenCalledWith("/api/structure");
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it("should use correct folder name from path basename", async () => {
    const customStructure = {
      paths: {
        target: "/Users/test/my-awesome-project",
      },
    };

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === "/api/structure") {
        return Promise.resolve({
          json: () => Promise.resolve(customStructure),
        });
      }
      if (url === "/api/docs") {
        return Promise.resolve({
          json: () => Promise.resolve(mockDocsResponse),
        });
      }
      if (url === "/api/tasks") {
        return Promise.resolve({
          json: () => Promise.resolve(mockTasksResponse),
        });
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("my-awesome-project")).toBeInTheDocument();
    });

    expect(
      screen.getByText("/Users/test/my-awesome-project")
    ).toBeInTheDocument();
  });
});
