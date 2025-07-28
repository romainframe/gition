import {
  type SubTask,
  type Task,
  getTaskProgress,
  getTaskTypeFromFolder,
  isTaskPriority,
  isTaskStatus,
  isTaskType,
} from "../tasks";

describe("Task Model Utils", () => {
  describe("isTaskStatus", () => {
    it("should return true for valid task statuses", () => {
      expect(isTaskStatus("todo")).toBe(true);
      expect(isTaskStatus("in_progress")).toBe(true);
      expect(isTaskStatus("done")).toBe(true);
    });

    it("should return false for invalid task statuses", () => {
      expect(isTaskStatus("pending")).toBe(false);
      expect(isTaskStatus("completed")).toBe(false);
      expect(isTaskStatus("")).toBe(false);
    });
  });

  describe("isTaskPriority", () => {
    it("should return true for valid task priorities", () => {
      expect(isTaskPriority("low")).toBe(true);
      expect(isTaskPriority("medium")).toBe(true);
      expect(isTaskPriority("high")).toBe(true);
      expect(isTaskPriority("critical")).toBe(true);
    });

    it("should return false for invalid task priorities", () => {
      expect(isTaskPriority("urgent")).toBe(false);
      expect(isTaskPriority("normal")).toBe(false);
      expect(isTaskPriority("")).toBe(false);
    });
  });

  describe("isTaskType", () => {
    it("should return true for valid task types", () => {
      expect(isTaskType("doc")).toBe(true);
      expect(isTaskType("epic")).toBe(true);
      expect(isTaskType("story")).toBe(true);
      expect(isTaskType("bug")).toBe(true);
      expect(isTaskType("custom")).toBe(true);
    });

    it("should return false for invalid task types", () => {
      expect(isTaskType("feature")).toBe(false);
      expect(isTaskType("task")).toBe(false);
      expect(isTaskType("")).toBe(false);
    });
  });

  describe("getTaskProgress", () => {
    it("should return 0 when there are no tasks", () => {
      const task: Task = {
        id: "test-task",
        name: "Test Task",
        file: "/test/task.mdx",
        slug: "test-task",
        subtasks: [],
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
      };

      expect(getTaskProgress(task)).toBe(0);
    });

    it("should calculate progress correctly", () => {
      const task: Task = {
        id: "test-task",
        name: "Test Task",
        file: "/test/task.mdx",
        slug: "test-task",
        subtasks: [],
        totalTasks: 4,
        completedTasks: 1,
        pendingTasks: 3,
      };

      expect(getTaskProgress(task)).toBe(25);
    });

    it("should return 100 when all tasks are completed", () => {
      const task: Task = {
        id: "test-task",
        name: "Test Task",
        file: "/test/task.mdx",
        slug: "test-task",
        subtasks: [],
        totalTasks: 3,
        completedTasks: 3,
        pendingTasks: 0,
      };

      expect(getTaskProgress(task)).toBe(100);
    });
  });

  describe("getTaskTypeFromFolder", () => {
    it("should return correct task type for known folders", () => {
      expect(getTaskTypeFromFolder("epics")).toBe("epic");
      expect(getTaskTypeFromFolder("stories")).toBe("story");
      expect(getTaskTypeFromFolder("bugs")).toBe("bug");
      expect(getTaskTypeFromFolder("docs")).toBe("doc");
    });

    it("should return custom for unknown folders", () => {
      expect(getTaskTypeFromFolder("features")).toBe("custom");
      expect(getTaskTypeFromFolder("random")).toBe("custom");
      expect(getTaskTypeFromFolder("")).toBe("custom");
    });
  });
});

describe("Task and SubTask Interfaces", () => {
  it("should create a valid SubTask", () => {
    const subtask: SubTask = {
      id: "subtask-1",
      title: "Implement feature",
      completed: false,
      status: "todo",
      line: 10,
      file: "/tasks/feature.mdx",
      type: "story",
      metadata: {
        priority: "high",
        assignee: "john",
        due_date: "2024-01-15",
      },
    };

    expect(subtask.id).toBe("subtask-1");
    expect(subtask.status).toBe("todo");
    expect(subtask.metadata?.priority).toBe("high");
  });

  it("should create a valid Task", () => {
    const task: Task = {
      id: "task-1",
      name: "Feature Implementation",
      file: "/tasks/feature.mdx",
      slug: "tasks/feature",
      type: "story",
      folder: "stories",
      subtasks: [],
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      metadata: {
        title: "Feature Implementation",
        description: "Implement new feature",
        priority: "high",
        status: "published",
      },
    };

    expect(task.id).toBe("task-1");
    expect(task.type).toBe("story");
    expect(task.metadata?.priority).toBe("high");
  });
});
