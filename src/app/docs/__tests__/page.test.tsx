import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import DocsPage from "../page";

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
    t: (key: string, params?: { count?: number }) => {
      const translations: Record<string, string> = {
        "docs.title": "Documentation",
        "docs.subtitle": "Browse and explore documentation",
        "docs.documentsFound": `${params?.count || 0} documents found`,
        "docs.noDocuments": "No documents found",
        "docs.createFiles": "Create markdown files to get started",
        "docs.toAddDocumentation": "To add documentation:",
        "docs.createDocsFolder": "Create a",
        "docs.folder": "folder",
        "docs.addFiles": "Add",
        "docs.or": "or",
        "docs.files": "files",
        "docs.refreshPage": "Refresh this page",
        "docs.published": "Published",
        "docs.draft": "Draft",
        "docs.archived": "Archived",
        "docs.read": "Read",
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

// Mock docs store
const mockFetchDocs = jest.fn();
const mockDocsStore = {
  docs: [],
  isLoading: false,
  error: null,
  fetchDocs: mockFetchDocs,
};

jest.mock("@/store/useDocsStore", () => ({
  useDocsStore: () => mockDocsStore,
}));

describe("DocsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock store state
    mockDocsStore.docs = [];
    mockDocsStore.isLoading = false;
    mockDocsStore.error = null;
  });

  it("should render loading state", () => {
    mockDocsStore.isLoading = true;

    render(<DocsPage />);

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("should render error state", () => {
    mockDocsStore.error = "Failed to load documents";

    render(<DocsPage />);

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Failed to load documents")).toBeInTheDocument();
  });

  it("should render empty state when no docs", () => {
    render(<DocsPage />);

    expect(screen.getByText("Documentation")).toBeInTheDocument();
    expect(screen.getByText("No documents found")).toBeInTheDocument();
    expect(
      screen.getByText("Create markdown files to get started")
    ).toBeInTheDocument();
    expect(screen.getByText("To add documentation:")).toBeInTheDocument();
    expect(screen.getByText("docs/")).toBeInTheDocument();
    expect(screen.getByText(".md")).toBeInTheDocument();
    expect(screen.getByText(".mdx")).toBeInTheDocument();
  });

  it("should call fetchDocs when docs array is empty", () => {
    render(<DocsPage />);

    expect(mockFetchDocs).toHaveBeenCalledTimes(1);
  });

  it("should not call fetchDocs when docs exist", () => {
    mockDocsStore.docs = [
      {
        slug: "test-doc",
        filename: "test-doc.md",
        metadata: { title: "Test Doc" },
        excerpt: "Test excerpt",
      },
    ];

    render(<DocsPage />);

    expect(mockFetchDocs).not.toHaveBeenCalled();
  });

  it("should render docs list when docs exist", () => {
    const mockDocs = [
      {
        slug: "getting-started",
        filename: "getting-started.md",
        metadata: {
          title: "Getting Started",
          description: "How to get started with the project",
          status: "published",
          date: "2024-01-15",
          tags: ["guide", "beginner"],
        },
        excerpt: "A quick guide to getting started",
      },
      {
        slug: "advanced-features",
        filename: "advanced-features.mdx",
        metadata: {
          title: "Advanced Features",
          status: "draft",
          tags: ["advanced", "features", "power-user", "expert"],
        },
        excerpt: "Advanced features for power users",
      },
    ];

    mockDocsStore.docs = mockDocs;

    render(<DocsPage />);

    expect(screen.getByText("2 documents found")).toBeInTheDocument();
    expect(screen.getByText("Getting Started")).toBeInTheDocument();
    expect(screen.getByText("Advanced Features")).toBeInTheDocument();
    expect(
      screen.getByText("How to get started with the project")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Advanced features for power users")
    ).toBeInTheDocument();
  });

  it("should render doc status badges correctly", () => {
    const mockDocs = [
      {
        slug: "published-doc",
        filename: "published.md",
        metadata: {
          title: "Published Doc",
          status: "published",
        },
        excerpt: "Published document",
      },
      {
        slug: "draft-doc",
        filename: "draft.md",
        metadata: {
          title: "Draft Doc",
          status: "draft",
        },
        excerpt: "Draft document",
      },
      {
        slug: "archived-doc",
        filename: "archived.md",
        metadata: {
          title: "Archived Doc",
          status: "archived",
        },
        excerpt: "Archived document",
      },
    ];

    mockDocsStore.docs = mockDocs;

    render(<DocsPage />);

    expect(screen.getByText("Published")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("Archived")).toBeInTheDocument();
  });

  it("should render doc dates correctly", () => {
    const mockDocs = [
      {
        slug: "dated-doc",
        filename: "dated.md",
        metadata: {
          title: "Dated Doc",
          date: "2024-01-15",
        },
        excerpt: "Document with date",
      },
    ];

    mockDocsStore.docs = mockDocs;

    render(<DocsPage />);

    // Check if date is formatted (using toLocaleDateString)
    const expectedDate = new Date("2024-01-15").toLocaleDateString();
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });

  it("should render doc tags correctly", () => {
    const mockDocs = [
      {
        slug: "tagged-doc",
        filename: "tagged.md",
        metadata: {
          title: "Tagged Doc",
          tags: ["react", "typescript", "testing"],
        },
        excerpt: "Document with tags",
      },
    ];

    mockDocsStore.docs = mockDocs;

    render(<DocsPage />);

    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("typescript")).toBeInTheDocument();
    expect(screen.getByText("testing")).toBeInTheDocument();
  });

  it("should handle more than 3 tags correctly", () => {
    const mockDocs = [
      {
        slug: "many-tags-doc",
        filename: "many-tags.md",
        metadata: {
          title: "Many Tags Doc",
          tags: ["tag1", "tag2", "tag3", "tag4", "tag5"],
        },
        excerpt: "Document with many tags",
      },
    ];

    mockDocsStore.docs = mockDocs;

    render(<DocsPage />);

    expect(screen.getByText("tag1")).toBeInTheDocument();
    expect(screen.getByText("tag2")).toBeInTheDocument();
    expect(screen.getByText("tag3")).toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument(); // Shows +2 for remaining tags
    expect(screen.queryByText("tag4")).not.toBeInTheDocument();
    expect(screen.queryByText("tag5")).not.toBeInTheDocument();
  });

  it("should render navigation links correctly", () => {
    const mockDocs = [
      {
        slug: "test-doc",
        filename: "test.md",
        metadata: {
          title: "Test Doc",
        },
        excerpt: "Test document",
      },
    ];

    mockDocsStore.docs = mockDocs;

    render(<DocsPage />);

    const titleLink = screen.getByRole("link", { name: "Test Doc" });
    expect(titleLink).toHaveAttribute("href", "/docs/test-doc");

    const readLink = screen.getByRole("link", { name: "Read →" });
    expect(readLink).toHaveAttribute("href", "/docs/test-doc");
  });

  it("should handle docs without metadata gracefully", () => {
    const mockDocs = [
      {
        slug: "minimal-doc",
        filename: "minimal.md",
        metadata: {},
        excerpt: "Minimal document",
      },
    ];

    mockDocsStore.docs = mockDocs;

    render(<DocsPage />);

    // Should use slug as title when no title in metadata
    expect(screen.getByText("minimal-doc")).toBeInTheDocument();
    expect(screen.getByText("Minimal document")).toBeInTheDocument();
    expect(screen.getByText("minimal.md")).toBeInTheDocument();
  });

  it("should handle special characters in slug for URL encoding", () => {
    const mockDocs = [
      {
        slug: "special-chars & symbols",
        filename: "special.md",
        metadata: {
          title: "Special Chars Doc",
        },
        excerpt: "Document with special characters",
      },
    ];

    mockDocsStore.docs = mockDocs;

    render(<DocsPage />);

    const links = screen.getAllByRole("link", { name: "Special Chars Doc" });
    expect(links[0]).toHaveAttribute(
      "href",
      "/docs/special-chars%20%26%20symbols"
    );
  });

  it("should use excerpt when no description in metadata", () => {
    const mockDocs = [
      {
        slug: "excerpt-doc",
        filename: "excerpt.md",
        metadata: {
          title: "Excerpt Doc",
          // No description
        },
        excerpt: "This is the excerpt text",
      },
    ];

    mockDocsStore.docs = mockDocs;

    render(<DocsPage />);

    expect(screen.getByText("This is the excerpt text")).toBeInTheDocument();
  });

  it("should prefer description over excerpt when both exist", () => {
    const mockDocs = [
      {
        slug: "both-desc-doc",
        filename: "both.md",
        metadata: {
          title: "Both Desc Doc",
          description: "Metadata description",
        },
        excerpt: "Excerpt text",
      },
    ];

    mockDocsStore.docs = mockDocs;

    render(<DocsPage />);

    expect(screen.getByText("Metadata description")).toBeInTheDocument();
    expect(screen.queryByText("Excerpt text")).not.toBeInTheDocument();
  });
});
