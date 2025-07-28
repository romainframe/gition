import { act, renderHook } from "@testing-library/react";

import type { MarkdownFile } from "@/models";

import { useDocsStore } from "../useDocsStore";

// Mock fetch at the top level
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe("useDocsStore", () => {
  // Mock console methods to suppress output during tests
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
    // Reset store state
    useDocsStore.setState({
      docs: [],
      isLoading: false,
      error: null,
      lastUpdated: 0,
    });
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const { result } = renderHook(() => useDocsStore());

      expect(result.current.docs).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.lastUpdated).toBe(0);
    });
  });

  describe("setDocs", () => {
    it("should set docs and update lastUpdated", () => {
      const { result } = renderHook(() => useDocsStore());

      const mockDocs: MarkdownFile[] = [
        {
          filename: "getting-started.mdx",
          filepath: "/docs/getting-started.mdx",
          slug: "getting-started",
          content: "# Getting Started\n\nThis is a guide.",
          metadata: {
            title: "Getting Started",
            category: "guides",
            difficulty: "beginner",
          },
        },
        {
          filename: "advanced-features.mdx",
          filepath: "/docs/advanced-features.mdx",
          slug: "advanced-features",
          content: "# Advanced Features\n\nAdvanced stuff.",
          metadata: {
            title: "Advanced Features",
            category: "guides",
            difficulty: "advanced",
          },
        },
      ];

      const beforeTime = Date.now();

      act(() => {
        result.current.setDocs(mockDocs);
      });

      expect(result.current.docs).toEqual(mockDocs);
      expect(result.current.lastUpdated).toBeGreaterThanOrEqual(beforeTime);
    });
  });

  describe("setLoading", () => {
    it("should set loading state", () => {
      const { result } = renderHook(() => useDocsStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("setError", () => {
    it("should set error message", () => {
      const { result } = renderHook(() => useDocsStore());

      act(() => {
        result.current.setError("Something went wrong");
      });

      expect(result.current.error).toBe("Something went wrong");
    });

    it("should clear error message", () => {
      const { result } = renderHook(() => useDocsStore());

      act(() => {
        result.current.setError("Error");
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("fetchDocs", () => {
    it("should fetch docs successfully", async () => {
      const { result } = renderHook(() => useDocsStore());

      const mockDocs: MarkdownFile[] = [
        {
          filename: "test-doc.mdx",
          filepath: "/docs/test-doc.mdx",
          slug: "test-doc",
          content: "# Test Doc\n\nThis is a test.",
          metadata: {
            title: "Test Doc",
            category: "tests",
          },
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockDocs),
      } as unknown as Response);

      await act(async () => {
        await result.current.fetchDocs();
      });

      expect(result.current.docs).toEqual(mockDocs);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith("/api/docs");
    });

    it("should handle fetch errors", async () => {
      const { result } = renderHook(() => useDocsStore());

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as unknown as Response);

      await act(async () => {
        await result.current.fetchDocs();
      });

      expect(result.current.docs).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe("Failed to fetch docs");
    });

    it("should handle network errors", async () => {
      const { result } = renderHook(() => useDocsStore());

      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await act(async () => {
        await result.current.fetchDocs();
      });

      expect(result.current.docs).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe("Network error");
    });

    it("should set loading state during fetch", async () => {
      const { result } = renderHook(() => useDocsStore());

      // Mock a slow response
      mockFetch.mockImplementationOnce(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: jest.fn().mockResolvedValueOnce([]),
            } as unknown as Response);
          }, 50);
        });
      });

      let fetchPromise: Promise<void>;

      // Start the fetch in act to capture the loading state change
      await act(async () => {
        fetchPromise = result.current.fetchDocs();
        // Allow one tick for the loading state to be set
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Check loading state is true during fetch
      expect(result.current.isLoading).toBe(true);

      // Wait for the fetch to complete
      await act(async () => {
        await fetchPromise!;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("refreshDocs", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should debounce docs refresh calls", async () => {
      const { result } = renderHook(() => useDocsStore());

      const mockFetchDocs = jest.fn();

      // Mock the fetchDocs method in the store
      const originalStore = useDocsStore.getState();
      useDocsStore.setState({
        ...originalStore,
        fetchDocs: mockFetchDocs,
      });

      // Call refresh multiple times
      act(() => {
        result.current.refreshDocs();
        result.current.refreshDocs();
        result.current.refreshDocs();
      });

      // Should not call fetchDocs immediately
      expect(mockFetchDocs).not.toHaveBeenCalled();

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should call fetchDocs only once after debounce
      expect(mockFetchDocs).toHaveBeenCalledTimes(1);
    });

    it("should clear previous timeout when called again", async () => {
      const { result } = renderHook(() => useDocsStore());

      const mockFetchDocs = jest.fn();

      // Mock the fetchDocs method in the store
      const originalStore = useDocsStore.getState();
      useDocsStore.setState({
        ...originalStore,
        fetchDocs: mockFetchDocs,
      });

      // Call refresh
      act(() => {
        result.current.refreshDocs();
      });

      // Advance time partway
      act(() => {
        jest.advanceTimersByTime(250);
      });

      // Call refresh again (should reset the timer)
      act(() => {
        result.current.refreshDocs();
      });

      // Advance to where the first call would have triggered
      act(() => {
        jest.advanceTimersByTime(250);
      });

      // Should not have been called yet
      expect(mockFetchDocs).not.toHaveBeenCalled();

      // Advance the remaining time
      act(() => {
        jest.advanceTimersByTime(250);
      });

      // Should be called once
      expect(mockFetchDocs).toHaveBeenCalledTimes(1);
    });
  });

  describe("getDocBySlug", () => {
    it("should find document by slug", () => {
      const { result } = renderHook(() => useDocsStore());

      const mockDocs: MarkdownFile[] = [
        {
          filename: "getting-started.mdx",
          filepath: "/docs/getting-started.mdx",
          slug: "getting-started",
          content: "# Getting Started\n\nThis is a guide.",
          metadata: { title: "Getting Started" },
        },
        {
          filename: "api-reference.mdx",
          filepath: "/docs/api-reference.mdx",
          slug: "api-reference",
          content: "# API Reference\n\nAPI docs.",
          metadata: { title: "API Reference" },
        },
      ];

      act(() => {
        result.current.setDocs(mockDocs);
      });

      const foundDoc = result.current.getDocBySlug("api-reference");
      expect(foundDoc).toBeDefined();
      expect(foundDoc?.filename).toBe("api-reference.mdx");
      expect(foundDoc?.slug).toBe("api-reference");
    });

    it("should return undefined for non-existent slug", () => {
      const { result } = renderHook(() => useDocsStore());

      const foundDoc = result.current.getDocBySlug("non-existent");
      expect(foundDoc).toBeUndefined();
    });

    it("should find docs from current state", () => {
      const { result } = renderHook(() => useDocsStore());

      const mockDocs: MarkdownFile[] = [
        {
          filename: "test-document.mdx",
          filepath: "/docs/test-document.mdx",
          slug: "test-document",
          content: "# Test\n\nContent.",
          metadata: { title: "Test Document" },
        },
      ];

      act(() => {
        result.current.setDocs(mockDocs);
      });

      // Call getDocBySlug multiple times to ensure it reads from current state
      expect(result.current.getDocBySlug("test-document")).toBeDefined();
      expect(result.current.getDocBySlug("test-document")?.filename).toBe(
        "test-document.mdx"
      );

      // Update docs
      const updatedDocs: MarkdownFile[] = [
        {
          filename: "updated-document.mdx",
          filepath: "/docs/updated-document.mdx",
          slug: "updated-document",
          content: "# Updated\n\nNew content.",
          metadata: { title: "Updated Document" },
        },
      ];

      act(() => {
        result.current.setDocs(updatedDocs);
      });

      // Should no longer find the old document
      expect(result.current.getDocBySlug("test-document")).toBeUndefined();
      expect(result.current.getDocBySlug("updated-document")).toBeDefined();
    });
  });

  describe("integration tests", () => {
    it("should handle complete state management lifecycle", async () => {
      const { result } = renderHook(() => useDocsStore());

      // Verify initial state
      expect(result.current.isLoading).toBe(false);
      expect(result.current.docs).toEqual([]);
      expect(result.current.error).toBeNull();

      const mockDocs: MarkdownFile[] = [
        {
          filename: "guide.mdx",
          filepath: "/docs/guide.mdx",
          slug: "guide",
          content: "# Guide\n\nA helpful guide.",
          metadata: { title: "Guide", category: "help" },
        },
      ];

      // Test loading state
      act(() => {
        result.current.setLoading(true);
      });
      expect(result.current.isLoading).toBe(true);

      // Test setting docs (simulates successful fetch result)
      const beforeTime = Date.now();
      act(() => {
        result.current.setDocs(mockDocs);
        result.current.setLoading(false);
      });

      // Verify final state
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.docs).toEqual(mockDocs);
      expect(result.current.lastUpdated).toBeGreaterThanOrEqual(beforeTime);
      expect(result.current.getDocBySlug("guide")).toEqual(mockDocs[0]);
    });

    it("should handle error states correctly", async () => {
      const { result } = renderHook(() => useDocsStore());

      // Test error state
      act(() => {
        result.current.setError("Test error");
        result.current.setLoading(false);
      });

      expect(result.current.error).toBe("Test error");
      expect(result.current.isLoading).toBe(false);

      // Clear error
      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });

    it("should handle docs management correctly", async () => {
      const { result } = renderHook(() => useDocsStore());

      const mockDocs: MarkdownFile[] = [
        {
          filename: "integration-test.mdx",
          filepath: "/docs/integration-test.mdx",
          slug: "integration-test",
          content: "# Integration Test",
          metadata: { title: "Integration Test" },
        },
      ];

      const beforeTime = Date.now();

      act(() => {
        result.current.setDocs(mockDocs);
      });

      expect(result.current.docs).toEqual(mockDocs);
      expect(result.current.lastUpdated).toBeGreaterThanOrEqual(beforeTime);
      expect(result.current.getDocBySlug("integration-test")).toEqual(
        mockDocs[0]
      );

      // Test clearing docs
      act(() => {
        result.current.setDocs([]);
      });

      expect(result.current.docs).toEqual([]);
      expect(result.current.getDocBySlug("integration-test")).toBeUndefined();
    });

    it("should handle loading states correctly", () => {
      const { result } = renderHook(() => useDocsStore());

      // Test loading state transitions
      act(() => {
        result.current.setLoading(true);
      });
      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });
      expect(result.current.isLoading).toBe(false);

      // Test multiple rapid state changes
      act(() => {
        result.current.setLoading(true);
        result.current.setLoading(false);
        result.current.setLoading(true);
      });
      expect(result.current.isLoading).toBe(true);
    });
  });
});
