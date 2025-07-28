import { act, renderHook } from "@testing-library/react";

import { useTaskFile } from "../useTaskFile";

// Mock the task store
const mockFetchTaskGroups = jest.fn();
const mockTaskGroups = [
  {
    id: "test-task",
    title: "Test Task",
    metadata: { status: "todo" },
    subtasks: [{ id: "subtask-1", title: "Subtask 1", completed: false }],
  },
];

jest.mock("@/store/useTaskStore", () => ({
  useTaskStore: () => ({
    taskGroups: mockTaskGroups,
    selectedTaskGroup: mockTaskGroups[0],
    fetchTaskGroups: mockFetchTaskGroups,
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe("useTaskFile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it("should initialize with loading state", () => {
    const { result } = renderHook(() => useTaskFile("test-task"));

    expect(result.current.taskFile).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.refetch).toBe("function");
  });

  it("should fetch task file on mount", async () => {
    const mockTaskFile = {
      slug: "test-task",
      content: "# Test Task\n\n- [ ] First task",
      frontmatter: {
        title: "Test Task",
        status: "todo",
      },
      tasks: [{ id: "subtask-1", title: "Subtask 1", completed: false }],
      group: {
        id: "test-task",
        title: "Test Task",
        metadata: { status: "todo" },
        subtasks: [{ id: "subtask-1", title: "Subtask 1", completed: false }],
      },
      relatedTasks: [],
      referencedBy: [],
      isDocsFile: false,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockTaskFile),
    });

    const { result } = renderHook(() => useTaskFile("test-task"));

    // Wait for fetch to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/tasks/test-task");
    expect(result.current.loading).toBe(false);
    expect(result.current.taskFile).toEqual(mockTaskFile);
    expect(result.current.error).toBeNull();
  });

  it("should handle fetch errors", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({ error: "Task not found" }),
    });

    const { result } = renderHook(() => useTaskFile("nonexistent-task"));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.taskFile).toBeNull();
    expect(result.current.error).toBe("Task not found");
  });

  it("should handle network errors", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    const { result } = renderHook(() => useTaskFile("test-task"));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Network error");
  });

  it("should refetch when refetch is called", async () => {
    const mockTaskFile = {
      slug: "test-task",
      content: "# Test Task",
      frontmatter: { title: "Test Task" },
      tasks: [],
      group: null,
      relatedTasks: [],
      referencedBy: [],
      isDocsFile: false,
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockTaskFile),
    });

    const { result } = renderHook(() => useTaskFile("test-task"));

    // Wait for initial fetch
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Clear fetch calls
    (global.fetch as jest.Mock).mockClear();

    // Call refetch
    await act(async () => {
      await result.current.refetch();
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/tasks/test-task");
  });

  // Note: Testing task group fetching would require more complex store mocking setup

  it("should not fetch task groups if already loaded", () => {
    renderHook(() => useTaskFile("test-task"));

    expect(mockFetchTaskGroups).not.toHaveBeenCalled();
  });

  it("should handle empty slug", () => {
    const { result } = renderHook(() => useTaskFile(""));

    expect(result.current.taskFile).toBeNull();
    expect(result.current.loading).toBe(true);
  });
});
