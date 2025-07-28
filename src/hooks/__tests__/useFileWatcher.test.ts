/* eslint-disable @typescript-eslint/no-explicit-any */
import { act, renderHook } from "@testing-library/react";

import { useFileWatcher } from "../useFileWatcher";

// Create mock functions at module level
const mockDebouncedRefresh = jest.fn();
const mockRefreshDocs = jest.fn();
const mockRefreshStructure = jest.fn();

// Mock the stores
jest.mock("@/store/useTaskStore", () => ({
  useTaskStore: () => ({
    debouncedRefresh: mockDebouncedRefresh,
  }),
}));

jest.mock("@/store/useDocsStore", () => ({
  useDocsStore: () => ({
    refreshDocs: mockRefreshDocs,
  }),
}));

jest.mock("@/store/useStructureStore", () => ({
  useStructureStore: () => ({
    refreshStructure: mockRefreshStructure,
  }),
}));

// Mock EventSource
class MockEventSource {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;

  readyState = MockEventSource.CONNECTING;
  url: string;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    setTimeout(() => {
      this.readyState = MockEventSource.OPEN;
      this.onopen?.(new Event("open"));
    }, 0);
  }

  close() {
    this.readyState = MockEventSource.CLOSED;
    this.onclose?.(new Event("close"));
  }

  // Helper method to simulate receiving a message
  simulateMessage(data: any) {
    if (this.readyState === MockEventSource.OPEN) {
      const event = new MessageEvent("message", { data: JSON.stringify(data) });
      this.onmessage?.(event);
    }
  }

  // Helper method to simulate an error
  simulateError() {
    this.onerror?.(new Event("error"));
  }
}

// Mock global EventSource
global.EventSource = MockEventSource as any;

describe("useFileWatcher", () => {
  let mockEventSource: MockEventSource;
  let originalEnv: string | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDebouncedRefresh.mockClear();
    mockRefreshDocs.mockClear();
    mockRefreshStructure.mockClear();
    originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    // Override the constructor to capture the instance
    global.EventSource = jest.fn().mockImplementation((url) => {
      mockEventSource = new MockEventSource(url);
      return mockEventSource;
    });
  });

  afterEach(() => {
    if (mockEventSource) {
      mockEventSource.close();
    }
    process.env.NODE_ENV = originalEnv;
  });

  it("should return hook interface", () => {
    const { result } = renderHook(() => useFileWatcher());

    expect(result.current.isConnected).toBeDefined();
    expect(result.current.reconnect).toBeDefined();
    expect(typeof result.current.reconnect).toBe("function");
  });

  it("should connect automatically in development", async () => {
    renderHook(() => useFileWatcher());

    // Wait for connection
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(global.EventSource).toHaveBeenCalledWith("/api/files/watch");
  });

  it("should not connect in production", () => {
    process.env.NODE_ENV = "production";

    renderHook(() => useFileWatcher());

    expect(global.EventSource).not.toHaveBeenCalled();
  });

  it("should handle file change events and refresh stores", async () => {
    renderHook(() => useFileWatcher());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    // Simulate markdown file change in docs
    act(() => {
      mockEventSource.simulateMessage({
        type: "file-change",
        path: "/docs/test.md",
        timestamp: Date.now(),
      });
    });

    expect(mockRefreshDocs).toHaveBeenCalled();

    // Simulate markdown file change in tasks
    act(() => {
      mockEventSource.simulateMessage({
        type: "file-change",
        path: "/tasks/test.md",
        timestamp: Date.now(),
      });
    });

    expect(mockDebouncedRefresh).toHaveBeenCalled();
  });

  it("should handle file add/remove events and refresh structure", async () => {
    renderHook(() => useFileWatcher());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    // Simulate file add
    act(() => {
      mockEventSource.simulateMessage({
        type: "file-add",
        path: "/docs/new-file.md",
        timestamp: Date.now(),
      });
    });

    expect(mockRefreshStructure).toHaveBeenCalled();
  });

  it("should handle connection errors", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    renderHook(() => useFileWatcher());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    // Simulate error
    act(() => {
      mockEventSource.simulateError();
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should handle malformed messages gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    renderHook(() => useFileWatcher());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    // Simulate malformed message
    act(() => {
      const event = new MessageEvent("message", { data: "invalid json" });
      mockEventSource.onmessage?.(event);
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should cleanup on unmount", async () => {
    const { unmount } = renderHook(() => useFileWatcher());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    const closeSpy = jest.spyOn(mockEventSource, "close");

    unmount();

    expect(closeSpy).toHaveBeenCalled();
  });

  it("should handle heartbeat events", async () => {
    renderHook(() => useFileWatcher());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    // Simulate heartbeat - should not cause any errors
    act(() => {
      mockEventSource.simulateMessage({
        type: "heartbeat",
        timestamp: Date.now(),
      });
    });

    // No assertions needed - just ensuring no errors thrown
  });

  it("should handle connected events", async () => {
    renderHook(() => useFileWatcher());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    // Simulate connected event
    act(() => {
      mockEventSource.simulateMessage({
        type: "connected",
        timestamp: Date.now(),
      });
    });

    // No assertions needed - just ensuring no errors thrown
  });
});
