import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { SubTask, Task } from "@/models";

interface TaskStore {
  // State
  taskGroups: Task[];
  selectedTaskGroup: Task | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setTaskGroups: (groups: Task[]) => void;
  setSelectedTaskGroup: (group: Task | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Task operations
  updateSubtaskStatus: (
    taskGroupId: string,
    subtaskId: string,
    status: SubTask["status"]
  ) => Promise<void>;
  updateSubtaskMetadata: (
    taskGroupId: string,
    subtaskId: string,
    metadata: Partial<SubTask["metadata"]>
  ) => Promise<void>;
  toggleSubtaskCompleted: (
    taskGroupId: string,
    subtaskId: string
  ) => Promise<void>;

  // File operations
  saveTaskFile: (filePath: string, content: string) => Promise<void>;

  // Data fetching
  fetchTaskGroups: () => Promise<void>;
  fetchTaskGroup: (id: string) => Promise<void>;
  debouncedRefresh: () => void;

  // Task-level operations (for MDX files)
  updateTaskStatus: (
    taskId: string,
    status: "draft" | "published" | "archived"
  ) => Promise<void>;
  updateTaskMetadata: (
    taskId: string,
    metadata: Record<string, unknown>
  ) => Promise<void>;
}

// Debounce timeout for file changes
let refreshTimeout: NodeJS.Timeout | null = null;

export const useTaskStore = create<TaskStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      taskGroups: [],
      selectedTaskGroup: null,
      isLoading: false,
      error: null,

      // Basic setters
      setTaskGroups: (groups) => set({ taskGroups: groups }),
      setSelectedTaskGroup: (group) => set({ selectedTaskGroup: group }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Task operations
      updateSubtaskStatus: async (taskGroupId, subtaskId, status) => {
        const { taskGroups } = get();

        try {
          // Optimistic update
          const updatedGroups = taskGroups.map((group) => {
            if (group.id === taskGroupId) {
              const updatedSubtasks = group.subtasks.map((subtask) => {
                if (subtask.id === subtaskId) {
                  return {
                    ...subtask,
                    status,
                    completed: status === "done",
                  };
                }
                return subtask;
              });

              const completedTasks = updatedSubtasks.filter(
                (t) => t.completed
              ).length;
              const pendingTasks = updatedSubtasks.length - completedTasks;

              return {
                ...group,
                subtasks: updatedSubtasks,
                completedTasks,
                pendingTasks,
              };
            }
            return group;
          });

          set({ taskGroups: updatedGroups });

          // Update selected group if it's the one being modified
          const { selectedTaskGroup } = get();
          if (selectedTaskGroup?.id === taskGroupId) {
            const updatedGroup = updatedGroups.find(
              (g) => g.id === taskGroupId
            );
            if (updatedGroup) {
              set({ selectedTaskGroup: updatedGroup });
            }
          }

          // Make API call to persist changes to file system
          const encodedTaskGroupId = encodeURIComponent(taskGroupId);
          const response = await fetch(
            `/api/subtasks/${encodedTaskGroupId}/${subtaskId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to update subtask");
          }

          // Refresh data from server to ensure UI is in sync
          console.log("Refreshing task groups after subtask status update...");
          await get().fetchTaskGroups();
          console.log("Task groups refreshed after status update");
        } catch (error) {
          // Revert optimistic update on error
          get().fetchTaskGroups();
          throw error;
        }
      },

      updateSubtaskMetadata: async (taskGroupId, subtaskId, metadata) => {
        const { taskGroups } = get();

        try {
          // Optimistic update
          const updatedGroups = taskGroups.map((group) => {
            if (group.id === taskGroupId) {
              const updatedSubtasks = group.subtasks.map((subtask) => {
                if (subtask.id === subtaskId) {
                  return {
                    ...subtask,
                    metadata: { ...subtask.metadata, ...metadata },
                  };
                }
                return subtask;
              });

              return { ...group, subtasks: updatedSubtasks };
            }
            return group;
          });

          set({ taskGroups: updatedGroups });

          // Update selected group if it's the one being modified
          const { selectedTaskGroup } = get();
          if (selectedTaskGroup?.id === taskGroupId) {
            const updatedGroup = updatedGroups.find(
              (g) => g.id === taskGroupId
            );
            if (updatedGroup) {
              set({ selectedTaskGroup: updatedGroup });
            }
          }

          // Make API call to persist changes
          const encodedTaskGroupId = encodeURIComponent(taskGroupId);
          const response = await fetch(
            `/api/subtasks/${encodedTaskGroupId}/${subtaskId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ metadata }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to update subtask metadata");
          }

          // Refresh data from server to ensure UI is in sync
          await get().fetchTaskGroups();
        } catch (error) {
          // Revert optimistic update on error
          get().fetchTaskGroups();
          throw error;
        }
      },

      toggleSubtaskCompleted: async (taskGroupId, subtaskId) => {
        const { taskGroups } = get();
        const group = taskGroups.find((g) => g.id === taskGroupId);
        const subtask = group?.subtasks.find((s) => s.id === subtaskId);

        if (subtask) {
          const newStatus = subtask.completed ? "todo" : "done";
          await get().updateSubtaskStatus(taskGroupId, subtaskId, newStatus);
        }
      },

      saveTaskFile: async (filePath, content) => {
        try {
          await fetch("/api/files/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filePath, content }),
          });

          // Refresh task groups after saving
          await get().fetchTaskGroups();
        } catch (error) {
          set({ error: "Failed to save file" });
          throw error;
        }
      },

      fetchTaskGroups: async () => {
        console.log("🔄 fetchTaskGroups called");
        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/tasks?view=groups");
          if (!response.ok) {
            throw new Error("Failed to fetch task groups");
          }

          const groups = await response.json();
          console.log("📦 New task groups data:", groups.length, "groups");
          console.log(
            "📦 Sample group data:",
            groups[0]?.subtasks?.slice(0, 2)
          );
          set({ taskGroups: groups, isLoading: false });
          console.log("✅ Store updated with new task groups");
        } catch (error) {
          console.error("❌ Error fetching task groups:", error);
          set({
            error: error instanceof Error ? error.message : "Unknown error",
            isLoading: false,
          });
        }
      },

      fetchTaskGroup: async (id) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`/api/tasks/${id}`);
          if (!response.ok) {
            throw new Error("Failed to fetch task group");
          }

          const group = await response.json();
          set({ selectedTaskGroup: group, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Unknown error",
            isLoading: false,
          });
        }
      },

      // Debounced refresh for file changes
      debouncedRefresh: () => {
        if (refreshTimeout) {
          clearTimeout(refreshTimeout);
        }

        refreshTimeout = setTimeout(() => {
          console.log("🔄 Debounced refresh triggered");
          get().fetchTaskGroups();
          refreshTimeout = null;
        }, 1000); // 1 second debounce
      },

      // Task-level management functions (for MDX files)
      updateTaskStatus: async (taskId, status) => {
        const { taskGroups } = get();

        try {
          // Optimistic update
          const updatedGroups = taskGroups.map((group) => {
            if (group.id === taskId) {
              return {
                ...group,
                metadata: { ...group.metadata, status },
              };
            }
            return group;
          });

          set({ taskGroups: updatedGroups });

          // Update selected group if it's the one being modified
          const { selectedTaskGroup } = get();
          if (selectedTaskGroup?.id === taskId) {
            set({
              selectedTaskGroup: {
                ...selectedTaskGroup,
                metadata: { ...selectedTaskGroup.metadata, status },
              },
            });
          }

          // Make API call to persist changes
          const encodedTaskId = encodeURIComponent(taskId);
          const response = await fetch(
            `/api/task-management/${encodedTaskId}/status`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to update task status");
          }
        } catch (error) {
          // Revert optimistic update on error
          get().fetchTaskGroups();
          set({ error: "Failed to update task status" });
          throw error;
        }
      },

      updateTaskMetadata: async (taskId, metadata) => {
        const { taskGroups } = get();

        try {
          // Optimistic update
          const updatedGroups = taskGroups.map((group) => {
            if (group.id === taskId) {
              return {
                ...group,
                metadata: { ...group.metadata, ...metadata },
              };
            }
            return group;
          });

          set({ taskGroups: updatedGroups });

          // Update selected group if it's the one being modified
          const { selectedTaskGroup } = get();
          if (selectedTaskGroup?.id === taskId) {
            set({
              selectedTaskGroup: {
                ...selectedTaskGroup,
                metadata: { ...selectedTaskGroup.metadata, ...metadata },
              },
            });
          }

          // Make API call to persist changes
          const encodedTaskId = encodeURIComponent(taskId);
          const response = await fetch(
            `/api/task-management/${encodedTaskId}/metadata`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ metadata }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to update task metadata");
          }
        } catch (error) {
          // Revert optimistic update on error
          get().fetchTaskGroups();
          set({ error: "Failed to update task metadata" });
          throw error;
        }
      },
    }),
    {
      name: "task-store",
    }
  )
);
