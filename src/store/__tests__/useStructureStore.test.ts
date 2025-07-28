import { act, renderHook } from "@testing-library/react";

import type { DirectoryStructure } from "@/models";

import { useStructureStore } from "../useStructureStore";

// Mock fetch
global.fetch = jest.fn();

describe("useStructureStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useStructureStore.setState({
      structure: null,
      isLoading: false,
      error: null,
      lastUpdated: 0,
    });
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const { result } = renderHook(() => useStructureStore());

      expect(result.current.structure).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.lastUpdated).toBe(0);
    });
  });

  describe("setStructure", () => {
    it("should set directory structure and update lastUpdated", () => {
      const { result } = renderHook(() => useStructureStore());

      const mockStructure: DirectoryStructure = {
        root: {
          name: "project",
          path: "/project",
          type: "directory",
          children: [
            {
              name: "src",
              path: "/project/src",
              type: "directory",
              children: [],
            },
            {
              name: "README.md",
              path: "/project/README.md",
              type: "file",
              stats: {
                size: 1000,
                created: new Date(),
                modified: new Date(),
              },
            },
          ],
        },
        totalFiles: 1,
        totalDirectories: 2,
      };

      const beforeTime = Date.now();

      act(() => {
        result.current.setStructure(mockStructure);
      });

      expect(result.current.structure).toEqual(mockStructure);
      expect(result.current.lastUpdated).toBeGreaterThanOrEqual(beforeTime);
    });
  });

  describe("setLoading", () => {
    it("should set loading state", () => {
      const { result } = renderHook(() => useStructureStore());

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
      const { result } = renderHook(() => useStructureStore());

      act(() => {
        result.current.setError("Failed to load directory structure");
      });

      expect(result.current.error).toBe("Failed to load directory structure");
    });

    it("should clear error message", () => {
      const { result } = renderHook(() => useStructureStore());

      act(() => {
        result.current.setError("Error");
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("fetchStructure", () => {
    it("should fetch structure successfully", async () => {
      const { result } = renderHook(() => useStructureStore());

      const mockStructure: DirectoryStructure = {
        root: {
          name: "project",
          path: "/project",
          type: "directory",
          children: [],
        },
        totalFiles: 0,
        totalDirectories: 1,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockStructure),
      });

      await act(async () => {
        await result.current.fetchStructure();
      });

      expect(result.current.structure).toEqual(mockStructure);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(global.fetch).toHaveBeenCalledWith("/api/structure");
    });

    it("should handle fetch errors", async () => {
      const { result } = renderHook(() => useStructureStore());

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await act(async () => {
        await result.current.fetchStructure();
      });

      expect(result.current.structure).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe("Failed to fetch directory structure");
    });

    it("should handle network errors", async () => {
      const { result } = renderHook(() => useStructureStore());

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      await act(async () => {
        await result.current.fetchStructure();
      });

      expect(result.current.structure).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe("Network error");
    });

    it("should set loading state during fetch", async () => {
      const { result } = renderHook(() => useStructureStore());

      // Mock a slow response
      (global.fetch as jest.Mock).mockImplementationOnce(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: jest.fn().mockResolvedValueOnce({
                root: { name: "test" },
                totalFiles: 0,
                totalDirectories: 1,
              }),
            });
          }, 50);
        });
      });

      let fetchPromise: Promise<void>;

      // Start the fetch in act to capture the loading state change
      await act(async () => {
        fetchPromise = result.current.fetchStructure();
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

  describe("refreshStructure", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should debounce structure refresh calls", async () => {
      const { result } = renderHook(() => useStructureStore());

      const mockFetchStructure = jest.fn();

      // Mock the fetchStructure method in the store
      const originalStore = useStructureStore.getState();
      useStructureStore.setState({
        ...originalStore,
        fetchStructure: mockFetchStructure,
      });

      // Call refresh multiple times
      act(() => {
        result.current.refreshStructure();
        result.current.refreshStructure();
        result.current.refreshStructure();
      });

      // Should not call fetchStructure immediately
      expect(mockFetchStructure).not.toHaveBeenCalled();

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(800);
      });

      // Should call fetchStructure only once after debounce
      expect(mockFetchStructure).toHaveBeenCalledTimes(1);
    });

    it("should clear previous timeout when called again", async () => {
      const { result } = renderHook(() => useStructureStore());

      const mockFetchStructure = jest.fn();

      // Mock the fetchStructure method in the store
      const originalStore = useStructureStore.getState();
      useStructureStore.setState({
        ...originalStore,
        fetchStructure: mockFetchStructure,
      });

      // Call refresh
      act(() => {
        result.current.refreshStructure();
      });

      // Advance time partway
      act(() => {
        jest.advanceTimersByTime(400);
      });

      // Call refresh again (should reset the timer)
      act(() => {
        result.current.refreshStructure();
      });

      // Advance to where the first call would have triggered
      act(() => {
        jest.advanceTimersByTime(400);
      });

      // Should not have been called yet
      expect(mockFetchStructure).not.toHaveBeenCalled();

      // Advance the remaining time
      act(() => {
        jest.advanceTimersByTime(400);
      });

      // Should be called once
      expect(mockFetchStructure).toHaveBeenCalledTimes(1);
    });
  });
});
