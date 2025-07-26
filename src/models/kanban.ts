/**
 * Kanban board data models for Gition
 * Contains interfaces for kanban columns and boards
 */
import { SubTask } from "./tasks";

export interface KanbanColumn {
  id: string; // unique column identifier
  title: string; // column display title
  tasks: SubTask[]; // tasks in this column
}

export interface KanbanBoard {
  columns: KanbanColumn[]; // array of kanban columns
  totalTasks: number; // total number of tasks across all columns
  groupId?: string; // associated task group ID (for filtered views)
  groupName?: string; // associated task group name
}

// Standard kanban column configurations
export const DEFAULT_KANBAN_COLUMNS: Omit<KanbanColumn, "tasks">[] = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

// Utility functions
export const createEmptyKanbanBoard = (
  groupId?: string,
  groupName?: string
): KanbanBoard => ({
  columns: DEFAULT_KANBAN_COLUMNS.map((col) => ({ ...col, tasks: [] })),
  totalTasks: 0,
  groupId,
  groupName,
});

export const organizeTasksIntoColumns = (tasks: SubTask[]): KanbanColumn[] => {
  const columns = createEmptyKanbanBoard().columns;

  tasks.forEach((task) => {
    const column = columns.find((col) => col.id === task.status);
    if (column) {
      column.tasks.push(task);
    }
  });

  return columns;
};

export const getKanbanStats = (board: KanbanBoard) => {
  const stats = {
    total: board.totalTasks,
    todo: 0,
    inProgress: 0,
    done: 0,
  };

  board.columns.forEach((column) => {
    switch (column.id) {
      case "todo":
        stats.todo = column.tasks.length;
        break;
      case "in_progress":
        stats.inProgress = column.tasks.length;
        break;
      case "done":
        stats.done = column.tasks.length;
        break;
    }
  });

  return stats;
};
