/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";

// Mock dependencies - declare before jest.mock()
const mockChokidarWatch = jest.fn();
const mockWatcher = {
  on: jest.fn(),
  close: jest.fn(),
  getWatched: jest.fn(),
};

jest.mock("chokidar", () => ({
  watch: mockChokidarWatch,
}));

jest.mock("fs", () => ({
  existsSync: jest.fn(),
}));

jest.mock("glob", () => ({
  glob: {
    sync: jest.fn(),
  },
}));

jest.mock("@/lib/mdx", () => ({
  getTargetDirectory: jest.fn(),
}));

// These will be dynamically imported in tests
let GET: any;
let mockFs: any;
let mockGlob: any;
let mockGetTargetDirectory: any;

describe("/api/files/watch route", () => {
  let mockController: {
    enqueue: jest.Mock;
    close: jest.Mock;
  };

  let mockSignal: {
    addEventListener: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset the globalWatcher by clearing the module cache
    jest.resetModules();

    // Re-import after reset
    GET = require("../route").GET;
    mockFs = require("fs");
    mockGlob = require("glob").glob;
    mockGetTargetDirectory = require("@/lib/mdx").getTargetDirectory;

    // Setup default mocks
    mockGetTargetDirectory.mockReturnValue("/test/directory");
    mockFs.existsSync.mockReturnValue(true);
    mockGlob.sync.mockReturnValue([
      "/test/directory/docs/guide.md",
      "/test/directory/tasks/epic.mdx",
    ]);

    mockChokidarWatch.mockReturnValue(mockWatcher);
    mockWatcher.getWatched.mockReturnValue({
      "/test/directory/docs": ["guide.md"],
      "/test/directory/tasks": ["epic.mdx"],
    });

    // Mock ReadableStream controller
    mockController = {
      enqueue: jest.fn(),
      close: jest.fn(),
    };

    // Mock AbortSignal
    mockSignal = {
      addEventListener: jest.fn(),
    };

    // Mock ReadableStream
    global.ReadableStream = jest.fn().mockImplementation((config) => {
      // Call start immediately with mock controller
      if (config && config.start) {
        config.start(mockController);
      }
      return {};
    }) as any;

    // Spy on console methods
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();

    // Clean up watcher if it exists
    if (mockWatcher && mockWatcher.close) {
      mockWatcher.close();
    }
  });

  describe("GET /api/files/watch", () => {
    it("should initialize file watcher and return SSE stream", async () => {
      const request = new NextRequest("http://localhost:3000/api/files/watch");
      Object.defineProperty(request, "signal", {
        value: mockSignal,
        writable: false,
      });

      const response = await GET(request);

      expect(response).toBeInstanceOf(Response);
      expect(response.headers.get("Content-Type")).toBe("text/event-stream");
      expect(response.headers.get("Cache-Control")).toBe("no-cache");
      expect(response.headers.get("Connection")).toBe("keep-alive");
    });

    it("should initialize chokidar watcher with correct paths", async () => {
      const request = new NextRequest("http://localhost:3000/api/files/watch");
      Object.defineProperty(request, "signal", {
        value: mockSignal,
        writable: false,
      });

      await GET(request);

      expect(mockChokidarWatch).toHaveBeenCalledWith(
        ["/test/directory/docs", "/test/directory/tasks"],
        expect.objectContaining({
          ignored: /node_modules/,
          persistent: true,
          ignoreInitial: true,
        })
      );
    });

    it("should send initial connection message", async () => {
      const request = new NextRequest("http://localhost:3000/api/files/watch");
      Object.defineProperty(request, "signal", {
        value: mockSignal,
        writable: false,
      });

      await GET(request);

      expect(mockController.enqueue).toHaveBeenCalledWith(
        expect.stringMatching(/data: {"type":"connected","timestamp":\d+}\n\n/)
      );
    });

    it("should handle file change events", async () => {
      const request = new NextRequest("http://localhost:3000/api/files/watch");
      Object.defineProperty(request, "signal", {
        value: mockSignal,
        writable: false,
      });

      await GET(request);

      // Get the change event handler
      const changeHandler = mockWatcher.on.mock.calls.find(
        (call) => call[0] === "change"
      )[1];

      // Simulate file change
      changeHandler("/test/directory/docs/guide.md");

      expect(mockController.enqueue).toHaveBeenCalledWith(
        expect.stringMatching(
          /data: {"type":"file-change","path":"\/test\/directory\/docs\/guide\.md","timestamp":\d+}\n\n/
        )
      );
    });

    it("should handle file add events", async () => {
      const request = new NextRequest("http://localhost:3000/api/files/watch");
      Object.defineProperty(request, "signal", {
        value: mockSignal,
        writable: false,
      });

      await GET(request);

      // Get the add event handler
      const addHandler = mockWatcher.on.mock.calls.find(
        (call) => call[0] === "add"
      )[1];

      // Simulate file add
      addHandler("/test/directory/tasks/new-epic.mdx");

      expect(mockController.enqueue).toHaveBeenCalledWith(
        expect.stringMatching(
          /data: {"type":"file-add","path":"\/test\/directory\/tasks\/new-epic\.mdx","timestamp":\d+}\n\n/
        )
      );
    });

    it("should handle file remove events", async () => {
      const request = new NextRequest("http://localhost:3000/api/files/watch");
      Object.defineProperty(request, "signal", {
        value: mockSignal,
        writable: false,
      });

      await GET(request);

      // Get the unlink event handler
      const unlinkHandler = mockWatcher.on.mock.calls.find(
        (call) => call[0] === "unlink"
      )[1];

      // Simulate file removal
      unlinkHandler("/test/directory/docs/old-guide.md");

      expect(mockController.enqueue).toHaveBeenCalledWith(
        expect.stringMatching(
          /data: {"type":"file-remove","path":"\/test\/directory\/docs\/old-guide\.md","timestamp":\d+}\n\n/
        )
      );
    });

    it("should only process markdown files", async () => {
      const request = new NextRequest("http://localhost:3000/api/files/watch");
      Object.defineProperty(request, "signal", {
        value: mockSignal,
        writable: false,
      });

      await GET(request);

      // Get event handlers
      const changeHandler = mockWatcher.on.mock.calls.find(
        (call) => call[0] === "change"
      )[1];

      // Clear previous calls
      mockController.enqueue.mockClear();

      // Simulate non-markdown file change
      changeHandler("/test/directory/docs/image.png");

      // Should not send any message for non-markdown files
      expect(mockController.enqueue).not.toHaveBeenCalled();

      // Simulate markdown file change
      changeHandler("/test/directory/docs/guide.md");

      // Should send message for markdown files
      expect(mockController.enqueue).toHaveBeenCalled();
    });

    it("should filter non-existent directories", async () => {
      mockFs.existsSync.mockImplementation((path: string) => {
        return path === "/test/directory/docs"; // Only docs exists
      });

      const request = new NextRequest("http://localhost:3000/api/files/watch");
      Object.defineProperty(request, "signal", {
        value: mockSignal,
        writable: false,
      });

      await GET(request);

      expect(mockChokidarWatch).toHaveBeenCalledWith(
        ["/test/directory/docs"], // Only existing directory
        expect.any(Object)
      );
    });

    it("should handle glob pattern errors gracefully", async () => {
      mockGlob.sync.mockImplementation(() => {
        throw new Error("Glob pattern error");
      });

      const request = new NextRequest("http://localhost:3000/api/files/watch");
      Object.defineProperty(request, "signal", {
        value: mockSignal,
        writable: false,
      });

      await GET(request);

      expect(console.error).toHaveBeenCalledWith(
        "🔍 Error finding existing files:",
        expect.any(Error)
      );
    });

    it("should setup heartbeat interval", async () => {
      jest.useFakeTimers();

      const request = new NextRequest("http://localhost:3000/api/files/watch");
      Object.defineProperty(request, "signal", {
        value: mockSignal,
        writable: false,
      });

      await GET(request);

      // Clear initial connection message
      mockController.enqueue.mockClear();

      // Fast-forward 30 seconds
      jest.advanceTimersByTime(30000);

      expect(mockController.enqueue).toHaveBeenCalledWith(
        expect.stringMatching(/data: {"type":"heartbeat","timestamp":\d+}\n\n/)
      );

      jest.useRealTimers();
    });

    it("should handle SSE send errors", async () => {
      const request = new NextRequest("http://localhost:3000/api/files/watch");
      Object.defineProperty(request, "signal", {
        value: mockSignal,
        writable: false,
      });

      await GET(request);

      // Get the change event handler
      const changeHandler = mockWatcher.on.mock.calls.find(
        (call) => call[0] === "change"
      )[1];

      // Mock controller.enqueue to throw error after initial setup
      mockController.enqueue.mockImplementation(() => {
        throw new Error("Stream closed");
      });

      // Simulate file change (should handle error gracefully)
      changeHandler("/test/directory/docs/guide.md");

      expect(console.error).toHaveBeenCalledWith(
        "Error sending SSE message:",
        expect.any(Error)
      );
    });

    it("should setup abort signal listener", async () => {
      const request = new NextRequest("http://localhost:3000/api/files/watch");
      Object.defineProperty(request, "signal", {
        value: mockSignal,
        writable: false,
      });

      await GET(request);

      expect(mockSignal.addEventListener).toHaveBeenCalledWith(
        "abort",
        expect.any(Function)
      );
    });

    it("should handle watcher ready event", async () => {
      const request = new NextRequest("http://localhost:3000/api/files/watch");
      Object.defineProperty(request, "signal", {
        value: mockSignal,
        writable: false,
      });

      await GET(request);

      // Get the ready event handler
      const readyHandler = mockWatcher.on.mock.calls.find(
        (call) => call[0] === "ready"
      )[1];

      // Simulate ready event
      readyHandler();

      expect(console.log).toHaveBeenCalledWith("✅ File watcher is ready");
    });

    it("should log directory watching information", async () => {
      const request = new NextRequest("http://localhost:3000/api/files/watch");
      Object.defineProperty(request, "signal", {
        value: mockSignal,
        writable: false,
      });

      await GET(request);

      expect(console.log).toHaveBeenCalledWith("🔍 File watcher initializing:");
      expect(console.log).toHaveBeenCalledWith(
        "  Target directory:",
        "/test/directory"
      );
      expect(console.log).toHaveBeenCalledWith(
        "  Docs path:",
        "/test/directory/docs"
      );
      expect(console.log).toHaveBeenCalledWith(
        "  Tasks path:",
        "/test/directory/tasks"
      );
    });

    it("should handle both .md and .mdx files", async () => {
      const request = new NextRequest("http://localhost:3000/api/files/watch");
      Object.defineProperty(request, "signal", {
        value: mockSignal,
        writable: false,
      });

      await GET(request);

      const changeHandler = mockWatcher.on.mock.calls.find(
        (call) => call[0] === "change"
      )[1];

      // Clear initial messages
      mockController.enqueue.mockClear();

      // Test .md file
      changeHandler("/test/directory/docs/guide.md");
      expect(mockController.enqueue).toHaveBeenCalled();

      mockController.enqueue.mockClear();

      // Test .mdx file
      changeHandler("/test/directory/tasks/epic.mdx");
      expect(mockController.enqueue).toHaveBeenCalled();
    });
  });
});
