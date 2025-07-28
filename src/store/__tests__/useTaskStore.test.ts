import { act, renderHook } from "@testing-library/react";

import type { Task } from "@/models";

import { useTaskStore } from "../useTaskStore";

// Mock fetch
global.fetch = jest.fn();

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe("useTaskStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to suppress output during tests
    console.log = jest.fn();
    console.error = jest.fn();
    // Reset store state
    useTaskStore.setState({
      taskGroups: [],
      selectedTaskGroup: null,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    // Restore original console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const { result } = renderHook(() => useTaskStore());

      expect(result.current.taskGroups).toEqual([]);
      expect(result.current.selectedTaskGroup).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("setTaskGroups", () => {
    it("should set task groups", () => {
      const { result } = renderHook(() => useTaskStore());

      const mockTasks: Task[] = [
        {
          id: "task-1",
          name: "Test Task",
          file: "/tasks/test.md",
          slug: "test-task",
          subtasks: [],
          totalTasks: 0,
          completedTasks: 0,
          metadata: {
            title: "Test Task",
            status: "todo",
            type: "story",
          },
        },
      ];

      act(() => {
        result.current.setTaskGroups(mockTasks);
      });

      expect(result.current.taskGroups).toEqual(mockTasks);
    });
  });

  describe("setSelectedTaskGroup", () => {
    it("should set selected task group", () => {
      const { result } = renderHook(() => useTaskStore());

      const mockTask: Task = {
        id: "task-1",
        name: "Test Task",
        file: "/tasks/test.md",
        slug: "test-task",
        subtasks: [],
        totalTasks: 0,
        completedTasks: 0,
        metadata: {
          title: "Test Task",
          status: "todo",
          type: "story",
        },
      };

      act(() => {
        result.current.setSelectedTaskGroup(mockTask);
      });

      expect(result.current.selectedTaskGroup).toEqual(mockTask);
    });

    it("should clear selected task group", () => {
      const { result } = renderHook(() => useTaskStore());

      act(() => {
        result.current.setSelectedTaskGroup(null);
      });

      expect(result.current.selectedTaskGroup).toBeNull();
    });
  });

  describe("setLoading", () => {
    it("should set loading state", () => {
      const { result } = renderHook(() => useTaskStore());

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
      const { result } = renderHook(() => useTaskStore());

      act(() => {
        result.current.setError("Something went wrong");
      });

      expect(result.current.error).toBe("Something went wrong");
    });

    it("should clear error message", () => {
      const { result } = renderHook(() => useTaskStore());

      act(() => {
        result.current.setError("Error");
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("fetchTaskGroups", () => {
    it("should fetch task groups successfully", async () => {
      const { result } = renderHook(() => useTaskStore());

      const mockTaskGroups: Task[] = [
        {
          id: "task-1",
          name: "Test Task",
          file: "/tasks/test.md",
          slug: "test-task",
          subtasks: [],
          totalTasks: 0,
          completedTasks: 0,
          metadata: { title: "Test Task", status: "todo", type: "story" },
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockTaskGroups),
      });

      await act(async () => {
        await result.current.fetchTaskGroups();
      });

      expect(result.current.taskGroups).toEqual(mockTaskGroups);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(global.fetch).toHaveBeenCalledWith("/api/tasks?view=groups");
    });

    it("should handle fetch errors", async () => {
      const { result } = renderHook(() => useTaskStore());

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await act(async () => {
        await result.current.fetchTaskGroups();
      });

      expect(result.current.taskGroups).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe("Failed to fetch task groups");
    });

    it("should handle network errors", async () => {
      const { result } = renderHook(() => useTaskStore());

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      await act(async () => {
        await result.current.fetchTaskGroups();
      });

      expect(result.current.taskGroups).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe("Network error");
    });
  });

  describe("fetchTaskGroup", () => {
    it("should fetch a specific task group", async () => {
      const { result } = renderHook(() => useTaskStore());

      const mockTask: Task = {
        id: "task-1",
        name: "Test Task",
        file: "/tasks/test.md",
        slug: "test-task",
        subtasks: [],
        totalTasks: 0,
        completedTasks: 0,
        metadata: { title: "Test Task", status: "todo", type: "story" },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockTask),
      });

      await act(async () => {
        await result.current.fetchTaskGroup("task-1");
      });

      expect(result.current.selectedTaskGroup).toEqual(mockTask);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(global.fetch).toHaveBeenCalledWith("/api/tasks/task-1");
    });

    it("should handle fetch task group errors", async () => {
      const { result } = renderHook(() => useTaskStore());

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await act(async () => {
        await result.current.fetchTaskGroup("nonexistent");
      });

      expect(result.current.selectedTaskGroup).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe("Failed to fetch task group");
    });
  });

  describe("updateSubtaskStatus", () => {
    const mockTaskWithSubtasks: Task = {
      id: "task-1",
      name: "Test Task",
      file: "/tasks/test.md",
      slug: "test-task",
      subtasks: [
        {
          id: "subtask-1",
          title: "Subtask 1",
          completed: false,
          status: "todo",
          line: 1,
          file: "/tasks/test.md",
          type: "story",
          folder: "tasks",
        },
      ],
      totalTasks: 1,
      completedTasks: 0,
      metadata: { title: "Test Task", status: "todo", type: "story" },
    };

    it("should update subtask status successfully", async () => {
      const { result } = renderHook(() => useTaskStore());

      // Set up initial state
      act(() => {
        result.current.setTaskGroups([mockTaskWithSubtasks]);
      });

      // Create expected updated task with status changed
      const expectedUpdatedTask = {
        ...mockTaskWithSubtasks,
        subtasks: mockTaskWithSubtasks.subtasks.map((subtask) =>
          subtask.id === "subtask-1"
            ? { ...subtask, status: "done", completed: true }
            : subtask
        ),
        completedTasks: 1,
        pendingTasks: 0,
      };

      // Mock successful API call
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce([expectedUpdatedTask]),
        });

      await act(async () => {
        await result.current.updateSubtaskStatus("task-1", "subtask-1", "done");
      });

      // Check that optimistic update occurred
      const updatedTask = result.current.taskGroups.find(
        (t) => t.id === "task-1"
      );
      const updatedSubtask = updatedTask?.subtasks.find(
        (s) => s.id === "subtask-1"
      );

      expect(updatedSubtask?.status).toBe("done");
      expect(updatedSubtask?.completed).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/subtasks/task-1/subtask-1",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "done" }),
        }
      );
    });

    it("should handle update subtask status errors", async () => {
      const { result } = renderHook(() => useTaskStore());

      act(() => {
        result.current.setTaskGroups([mockTaskWithSubtasks]);
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(
        act(async () => {
          await result.current.updateSubtaskStatus(
            "task-1",
            "subtask-1",
            "done"
          );
        })
      ).rejects.toThrow("Failed to update subtask");
    });
  });

  describe("toggleSubtaskCompleted", () => {
    it("should toggle subtask completion status", async () => {
      const { result } = renderHook(() => useTaskStore());

      const mockTask: Task = {
        id: "task-1",
        name: "Test Task",
        file: "/tasks/test.md",
        slug: "test-task",
        subtasks: [
          {
            id: "subtask-1",
            title: "Subtask 1",
            completed: false,
            status: "todo",
            line: 1,
            file: "/tasks/test.md",
            type: "story",
            folder: "tasks",
          },
        ],
        totalTasks: 1,
        completedTasks: 0,
        metadata: { title: "Test Task", status: "todo", type: "story" },
      };

      act(() => {
        result.current.setTaskGroups([mockTask]);
      });

      // Mock successful API calls
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce([mockTask]),
        });

      await act(async () => {
        await result.current.toggleSubtaskCompleted("task-1", "subtask-1");
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/subtasks/task-1/subtask-1",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "done" }),
        }
      );
    });
  });

  describe("saveTaskFile", () => {
    it("should save task file successfully", async () => {
      const { result } = renderHook(() => useTaskStore());

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce([]),
        });

      await act(async () => {
        await result.current.saveTaskFile("/tasks/test.md", "content");
      });

      expect(global.fetch).toHaveBeenCalledWith("/api/files/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath: "/tasks/test.md",
          content: "content",
        }),
      });
    });

    it("should handle save file errors", async () => {
      const { result } = renderHook(() => useTaskStore());

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Save failed")
      );

      let thrownError: Error | undefined;

      await act(async () => {
        try {
          await result.current.saveTaskFile("/tasks/test.md", "content");
        } catch (error) {
          thrownError = error as Error;
        }
      });

      // Check that the error was thrown
      expect(thrownError?.message).toBe("Save failed");

      // Check that the error state was set in the store
      expect(result.current.error).toBe("Failed to save file");
    });
  });

  describe("debouncedRefresh", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should debounce refresh calls", async () => {
      const { result } = renderHook(() => useTaskStore());

      const mockFetchTaskGroups = jest.fn();

      // Mock the fetchTaskGroups method in the store
      const originalStore = useTaskStore.getState();
      useTaskStore.setState({
        ...originalStore,
        fetchTaskGroups: mockFetchTaskGroups,
      });

      // Call debouncedRefresh multiple times
      act(() => {
        result.current.debouncedRefresh();
        result.current.debouncedRefresh();
        result.current.debouncedRefresh();
      });

      // Should not call fetchTaskGroups immediately
      expect(mockFetchTaskGroups).not.toHaveBeenCalled();

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should call fetchTaskGroups only once after debounce
      expect(mockFetchTaskGroups).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateTaskStatus", () => {
    it("should update task status successfully", async () => {
      const { result } = renderHook(() => useTaskStore());

      const mockTask: Task = {
        id: "task-1",
        name: "Test Task",
        file: "/tasks/test.md",
        slug: "test-task",
        subtasks: [],
        totalTasks: 0,
        completedTasks: 0,
        metadata: { title: "Test Task", status: "draft", type: "story" },
      };

      act(() => {
        result.current.setTaskGroups([mockTask]);
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await act(async () => {
        await result.current.updateTaskStatus("task-1", "published");
      });

      const updatedTask = result.current.taskGroups.find(
        (t) => t.id === "task-1"
      );
      expect(updatedTask?.metadata?.status).toBe("published");
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/task-management/task-1/status",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "published" }),
        }
      );
    });

    it("should handle update task status errors", async () => {
      const { result } = renderHook(() => useTaskStore());

      const mockTask: Task = {
        id: "task-1",
        name: "Test Task",
        file: "/tasks/test.md",
        slug: "test-task",
        subtasks: [],
        totalTasks: 0,
        completedTasks: 0,
        metadata: { title: "Test Task", status: "draft", type: "story" },
      };

      act(() => {
        result.current.setTaskGroups([mockTask]);
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      let thrownError: Error | undefined;

      await act(async () => {
        try {
          await result.current.updateTaskStatus("task-1", "published");
        } catch (error) {
          thrownError = error as Error;
        }
      });

      // Check that the error was thrown
      expect(thrownError?.message).toBe("Failed to update task status");

      // Check that the error state was set in the store
      expect(result.current.error).toBe("Failed to update task status");
    });
  });

  describe("updateTaskMetadata", () => {
    it("should update task metadata successfully", async () => {
      const { result } = renderHook(() => useTaskStore());

      const mockTask: Task = {
        id: "task-1",
        name: "Test Task",
        file: "/tasks/test.md",
        slug: "test-task",
        subtasks: [],
        totalTasks: 0,
        completedTasks: 0,
        metadata: { title: "Test Task", status: "todo", type: "story" },
      };

      act(() => {
        result.current.setTaskGroups([mockTask]);
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      const newMetadata = { priority: "high", assignee: "john" };

      await act(async () => {
        await result.current.updateTaskMetadata("task-1", newMetadata);
      });

      const updatedTask = result.current.taskGroups.find(
        (t) => t.id === "task-1"
      );
      expect(updatedTask?.metadata?.priority).toBe("high");
      expect(updatedTask?.metadata?.assignee).toBe("john");
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/task-management/task-1/metadata",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metadata: newMetadata }),
        }
      );
    });
  });
});
