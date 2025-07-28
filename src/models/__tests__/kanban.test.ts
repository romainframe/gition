import {
  DEFAULT_KANBAN_COLUMNS,
  type KanbanBoard,
  createEmptyKanbanBoard,
  getKanbanStats,
  organizeTasksIntoColumns,
} from "../kanban";
import type { SubTask } from "../tasks";

describe("Kanban Model Utils", () => {
  describe("DEFAULT_KANBAN_COLUMNS", () => {
    it("should have the correct default columns", () => {
      expect(DEFAULT_KANBAN_COLUMNS).toHaveLength(3);
      expect(DEFAULT_KANBAN_COLUMNS[0]).toEqual({ id: "todo", title: "To Do" });
      expect(DEFAULT_KANBAN_COLUMNS[1]).toEqual({
        id: "in_progress",
        title: "In Progress",
      });
      expect(DEFAULT_KANBAN_COLUMNS[2]).toEqual({ id: "done", title: "Done" });
    });
  });

  describe("createEmptyKanbanBoard", () => {
    it("should create an empty kanban board", () => {
      const board = createEmptyKanbanBoard();

      expect(board.columns).toHaveLength(3);
      expect(board.totalTasks).toBe(0);
      expect(board.groupId).toBeUndefined();
      expect(board.groupName).toBeUndefined();

      board.columns.forEach((column) => {
        expect(column.tasks).toEqual([]);
      });
    });

    it("should create a kanban board with group info", () => {
      const board = createEmptyKanbanBoard("group-1", "Feature Tasks");

      expect(board.groupId).toBe("group-1");
      expect(board.groupName).toBe("Feature Tasks");
      expect(board.totalTasks).toBe(0);
    });
  });

  describe("organizeTasksIntoColumns", () => {
    const createMockSubTask = (
      id: string,
      status: "todo" | "in_progress" | "done"
    ): SubTask => ({
      id,
      title: `Task ${id}`,
      completed: status === "done",
      status,
      line: 1,
      file: "/test.mdx",
      type: "story",
    });

    it("should organize tasks into correct columns", () => {
      const tasks: SubTask[] = [
        createMockSubTask("1", "todo"),
        createMockSubTask("2", "in_progress"),
        createMockSubTask("3", "done"),
        createMockSubTask("4", "todo"),
        createMockSubTask("5", "in_progress"),
      ];

      const columns = organizeTasksIntoColumns(tasks);

      expect(columns).toHaveLength(3);
      expect(columns[0].id).toBe("todo");
      expect(columns[0].tasks).toHaveLength(2);
      expect(columns[1].id).toBe("in_progress");
      expect(columns[1].tasks).toHaveLength(2);
      expect(columns[2].id).toBe("done");
      expect(columns[2].tasks).toHaveLength(1);
    });

    it("should handle empty task list", () => {
      const columns = organizeTasksIntoColumns([]);

      expect(columns).toHaveLength(3);
      columns.forEach((column) => {
        expect(column.tasks).toEqual([]);
      });
    });

    it("should handle all tasks in one status", () => {
      const tasks: SubTask[] = [
        createMockSubTask("1", "todo"),
        createMockSubTask("2", "todo"),
        createMockSubTask("3", "todo"),
      ];

      const columns = organizeTasksIntoColumns(tasks);

      expect(columns[0].tasks).toHaveLength(3);
      expect(columns[1].tasks).toHaveLength(0);
      expect(columns[2].tasks).toHaveLength(0);
    });
  });

  describe("getKanbanStats", () => {
    it("should calculate correct stats for a kanban board", () => {
      const board: KanbanBoard = {
        columns: [
          {
            id: "todo",
            title: "To Do",
            tasks: [
              {
                id: "1",
                title: "Task 1",
                completed: false,
                status: "todo",
                line: 1,
                file: "/test.mdx",
                type: "story",
              },
              {
                id: "2",
                title: "Task 2",
                completed: false,
                status: "todo",
                line: 2,
                file: "/test.mdx",
                type: "story",
              },
            ],
          },
          {
            id: "in_progress",
            title: "In Progress",
            tasks: [
              {
                id: "3",
                title: "Task 3",
                completed: false,
                status: "in_progress",
                line: 3,
                file: "/test.mdx",
                type: "story",
              },
            ],
          },
          {
            id: "done",
            title: "Done",
            tasks: [
              {
                id: "4",
                title: "Task 4",
                completed: true,
                status: "done",
                line: 4,
                file: "/test.mdx",
                type: "story",
              },
              {
                id: "5",
                title: "Task 5",
                completed: true,
                status: "done",
                line: 5,
                file: "/test.mdx",
                type: "story",
              },
            ],
          },
        ],
        totalTasks: 5,
      };

      const stats = getKanbanStats(board);

      expect(stats.total).toBe(5);
      expect(stats.todo).toBe(2);
      expect(stats.inProgress).toBe(1);
      expect(stats.done).toBe(2);
    });

    it("should handle empty board", () => {
      const board = createEmptyKanbanBoard();
      const stats = getKanbanStats(board);

      expect(stats.total).toBe(0);
      expect(stats.todo).toBe(0);
      expect(stats.inProgress).toBe(0);
      expect(stats.done).toBe(0);
    });

    it("should handle board with no completed tasks", () => {
      const board: KanbanBoard = {
        columns: [
          {
            id: "todo",
            title: "To Do",
            tasks: [
              {
                id: "1",
                title: "Task 1",
                completed: false,
                status: "todo",
                line: 1,
                file: "/test.mdx",
                type: "story",
              },
              {
                id: "2",
                title: "Task 2",
                completed: false,
                status: "todo",
                line: 2,
                file: "/test.mdx",
                type: "story",
              },
            ],
          },
          { id: "in_progress", title: "In Progress", tasks: [] },
          { id: "done", title: "Done", tasks: [] },
        ],
        totalTasks: 2,
      };

      const stats = getKanbanStats(board);
      expect(stats.todo).toBe(2);
      expect(stats.inProgress).toBe(0);
      expect(stats.done).toBe(0);
    });
  });
});
