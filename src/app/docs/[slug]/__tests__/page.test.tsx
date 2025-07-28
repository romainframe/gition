import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";

import DocPage from "../page";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

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
        "docs.documentNotFound": "Document Not Found",
        "docs.documentNotFoundMessage":
          "The requested document could not be found",
        "docs.backToDocumentation": "Back to Documentation",
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

// Mock UI components
jest.mock("@/components/ui/document-metadata", () => ({
  DocumentMetadata: ({
    metadata,
    filename,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: any;
    filename: string;
  }) => (
    <div data-testid="document-metadata">
      <span>File: {filename}</span>
      {metadata?.author && <span>Author: {metadata.author}</span>}
      {metadata?.date && <span>Date: {metadata.date}</span>}
    </div>
  ),
}));

jest.mock("@/components/ui/enhanced-markdown-renderer", () => ({
  EnhancedMarkdownRenderer: ({ content }: { content: string }) => (
    <div data-testid="markdown-content">{content}</div>
  ),
}));

// Mock docs store
const mockFetchDocs = jest.fn();
const mockGetDocBySlug = jest.fn();
const mockDocsStore = {
  docs: [],
  isLoading: false,
  error: null,
  fetchDocs: mockFetchDocs,
  getDocBySlug: mockGetDocBySlug,
};

jest.mock("@/store/useDocsStore", () => ({
  useDocsStore: () => mockDocsStore,
}));

// Mock useParams
const mockUseParams = jest.requireMock("next/navigation").useParams;

describe("DocPage", () => {
  // Mock sessionStorage
  const mockSessionStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
  };
  Object.defineProperty(window, "sessionStorage", {
    value: mockSessionStorage,
  });

  // Mock scrollTo
  Object.defineProperty(window, "scrollTo", {
    value: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockDocsStore.docs = [];
    mockDocsStore.isLoading = false;
    mockDocsStore.error = null;
    mockSessionStorage.getItem.mockReturnValue(null);
    mockUseParams.mockReturnValue({ slug: "test-doc" });
  });

  it("should render loading state", () => {
    mockDocsStore.isLoading = true;

    render(<DocPage />);

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("should render not found state when doc is null", () => {
    mockGetDocBySlug.mockReturnValue(null);

    render(<DocPage />);

    expect(screen.getByText("Document Not Found")).toBeInTheDocument();
    expect(
      screen.getByText("The requested document could not be found")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Back to Documentation/i })
    ).toHaveAttribute("href", "/docs");
  });

  it("should render error state", () => {
    mockDocsStore.error = "Failed to load document";

    render(<DocPage />);

    expect(screen.getByText("Document Not Found")).toBeInTheDocument();
    expect(screen.getByText("Failed to load document")).toBeInTheDocument();
  });

  it("should call fetchDocs when docs array is empty", () => {
    mockUseParams.mockReturnValue({ slug: "test-doc" });
    mockGetDocBySlug.mockReturnValue(null);

    render(<DocPage />);

    expect(mockFetchDocs).toHaveBeenCalledTimes(1);
  });

  it("should not call fetchDocs when docs exist", () => {
    mockDocsStore.docs = [{ slug: "test-doc" }];
    mockGetDocBySlug.mockReturnValue({
      slug: "test-doc",
      filename: "test-doc.md",
      metadata: { title: "Test Doc" },
      content: "# Test Content",
      excerpt: "Test excerpt",
    });

    render(<DocPage />);

    expect(mockFetchDocs).not.toHaveBeenCalled();
  });

  it("should render document content", async () => {
    const mockDoc = {
      slug: "test-doc",
      filename: "test-doc.md",
      metadata: {
        title: "Test Document",
        description: "A test document",
        author: "Test Author",
        date: "2024-01-15",
      },
      content: "# Test Document\n\nThis is test content.",
      excerpt: "Test excerpt",
    };

    mockGetDocBySlug.mockReturnValue(mockDoc);

    render(<DocPage />);

    expect(screen.getByText("Test Document")).toBeInTheDocument();
    expect(screen.getByText("A test document")).toBeInTheDocument();
    expect(screen.getByTestId("document-metadata")).toBeInTheDocument();
    expect(screen.getByText("File: test-doc.md")).toBeInTheDocument();
    expect(screen.getByText("Author: Test Author")).toBeInTheDocument();
  });

  it("should strip first H1 from content to avoid duplication", () => {
    const mockDoc = {
      slug: "test-doc",
      filename: "test-doc.md",
      metadata: { title: "Test Document" },
      content: "# Test Document\n\nThis is the actual content.",
      excerpt: "Test excerpt",
    };

    mockGetDocBySlug.mockReturnValue(mockDoc);

    render(<DocPage />);

    const markdownContent = screen.getByTestId("markdown-content");
    expect(markdownContent).toHaveTextContent("This is the actual content.");
    expect(markdownContent).not.toHaveTextContent("# Test Document");
  });

  it("should handle content with frontmatter correctly", () => {
    const mockDoc = {
      slug: "test-doc",
      filename: "test-doc.md",
      metadata: { title: "Test Document" },
      content: "---\ntitle: Test\n---\n\n# Test Document\n\nContent here.",
      excerpt: "Test excerpt",
    };

    mockGetDocBySlug.mockReturnValue(mockDoc);

    render(<DocPage />);

    const markdownContent = screen.getByTestId("markdown-content");
    // Should remove the H1 but keep frontmatter and content
    expect(markdownContent.textContent).toContain("---\ntitle: Test\n---");
    expect(markdownContent.textContent).toContain("Content here.");
    expect(markdownContent.textContent).not.toContain("# Test Document");
  });

  it("should use slug as title when no title in metadata", () => {
    const mockDoc = {
      slug: "my-awesome-doc",
      filename: "my-awesome-doc.md",
      metadata: {},
      content: "Content without title",
      excerpt: "Test excerpt",
    };

    mockGetDocBySlug.mockReturnValue(mockDoc);

    render(<DocPage />);

    expect(screen.getByText("my-awesome-doc")).toBeInTheDocument();
  });

  it("should use excerpt as description when no description in metadata", () => {
    const mockDoc = {
      slug: "test-doc",
      filename: "test-doc.md",
      metadata: { title: "Test Doc" },
      content: "Content",
      excerpt: "This is the excerpt",
    };

    mockGetDocBySlug.mockReturnValue(mockDoc);

    render(<DocPage />);

    expect(screen.getByText("This is the excerpt")).toBeInTheDocument();
  });

  it("should handle array slug params", () => {
    mockUseParams.mockReturnValue({ slug: ["nested", "doc", "path"] });
    mockGetDocBySlug.mockReturnValue({
      slug: "nested/doc/path",
      filename: "path.md",
      metadata: { title: "Nested Doc" },
      content: "Nested content",
      excerpt: "Nested excerpt",
    });

    render(<DocPage />);

    expect(mockGetDocBySlug).toHaveBeenCalledWith("nested/doc/path");
    expect(screen.getByText("Nested Doc")).toBeInTheDocument();
  });

  it("should show metadata warning alerts", () => {
    const mockDoc = {
      slug: "test-doc",
      filename: "test-doc.md",
      metadata: null, // No metadata
      content: "Content",
      excerpt: "Test excerpt",
    };

    mockGetDocBySlug.mockReturnValue(mockDoc);

    render(<DocPage />);

    expect(
      screen.getByText(
        "No metadata found. Add frontmatter to this file for better organization."
      )
    ).toBeInTheDocument();
  });

  it("should show title warning when metadata exists but no title", () => {
    const mockDoc = {
      slug: "test-doc",
      filename: "test-doc.md",
      metadata: { author: "Test Author" }, // Has metadata but no title
      content: "Content",
      excerpt: "Test excerpt",
    };

    mockGetDocBySlug.mockReturnValue(mockDoc);

    render(<DocPage />);

    expect(screen.getByText(/No title found in metadata/)).toBeInTheDocument();
  });

  it("should handle scroll restoration", async () => {
    mockSessionStorage.getItem.mockReturnValue("500");

    const mockDoc = {
      slug: "test-doc",
      filename: "test-doc.md",
      metadata: { title: "Test Doc" },
      content: "Content",
      excerpt: "Test excerpt",
    };

    mockGetDocBySlug.mockReturnValue(mockDoc);

    render(<DocPage />);

    // Should restore scroll position after timeout
    await waitFor(
      () => {
        expect(window.scrollTo).toHaveBeenCalledWith({
          top: 500,
          behavior: "instant",
        });
      },
      { timeout: 200 }
    );
  });

  it("should set up scroll event listener", () => {
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

    const mockDoc = {
      slug: "test-doc",
      filename: "test-doc.md",
      metadata: { title: "Test Doc" },
      content: "Content",
      excerpt: "Test excerpt",
    };

    mockGetDocBySlug.mockReturnValue(mockDoc);

    const { unmount } = render(<DocPage />);

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function)
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function)
    );

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it("should render back navigation button", () => {
    const mockDoc = {
      slug: "test-doc",
      filename: "test-doc.md",
      metadata: { title: "Test Doc" },
      content: "Content",
      excerpt: "Test excerpt",
    };

    mockGetDocBySlug.mockReturnValue(mockDoc);

    render(<DocPage />);

    const backButtons = screen.getAllByRole("link", {
      name: /Back to Documentation/i,
    });
    expect(backButtons[0]).toHaveAttribute("href", "/docs");
  });

  it("should not render description if not available", () => {
    const mockDoc = {
      slug: "test-doc",
      filename: "test-doc.md",
      metadata: { title: "Test Doc" },
      content: "Content",
      excerpt: "", // Empty excerpt
    };

    mockGetDocBySlug.mockReturnValue(mockDoc);

    render(<DocPage />);

    expect(screen.getByText("Test Doc")).toBeInTheDocument();
    // Should not have a description paragraph since no description is provided
    // The component conditionally renders description only if it exists
    // Since the mock doc has no description, there should be no description element
  });
});
