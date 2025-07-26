/**
 * Task-related data models for Gition
 * Contains interfaces for tasks and subtasks
 */
import { FileMetadata } from "./documents";
import { MDXFile } from "./mdx";

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type TaskType = "doc" | "epic" | "story" | "bug" | "custom";

export interface SubTaskMetadata {
  priority?: TaskPriority;
  due_date?: string; // ISO date string
  assignee?: string; // assigned person/team
  tags?: string[]; // categorization tags
  estimate?: number; // time estimate in hours
  status?: "blocked" | "waiting" | "review";

  // Enhanced metadata for better tracking
  startDate?: string; // when work began (ISO date)
  timeSpent?: number; // actual time spent in hours
  sourceLink?: string; // URL to external resource
  ref?: string; // reference to another task file
}

export interface SubTask {
  id: string; // unique identifier (file + line)
  title: string; // task description text
  completed: boolean; // checkbox completion state
  status: TaskStatus; // current task status
  line: number; // line number in source file
  file: string; // source file path
  type: TaskType; // task type (inherited from parent file)
  folder?: string; // parent folder name (e.g., "epics")
  references?: string[]; // references to other tasks/files
  metadata?: SubTaskMetadata; // inline task metadata
  [key: string]: unknown; // allow additional properties
}

export interface Task extends MDXFile {
  id: string; // unique identifier
  name: string; // display name (usually filename)
  type: TaskType; // task category from folder structure
  file: string; // source file path
  folder?: string; // organizing folder
  subtasks: SubTask[]; // array of contained subtasks
  totalTasks: number; // total number of subtasks
  completedTasks: number; // number of completed subtasks
  pendingTasks: number; // number of pending subtasks
  content?: string; // full markdown content
  metadata?: FileMetadata; // frontmatter metadata
  [key: string]: unknown; // allow additional properties
}

// Type guards
export const isTaskStatus = (status: string): status is TaskStatus => {
  return ["todo", "in_progress", "done"].includes(status);
};

export const isTaskPriority = (priority: string): priority is TaskPriority => {
  return ["low", "medium", "high", "critical"].includes(priority);
};

export const isTaskType = (type: string): type is TaskType => {
  return ["doc", "epic", "story", "bug", "custom"].includes(type);
};

// Utility functions
export const getTaskProgress = (task: Task): number => {
  if (task.totalTasks === 0) return 0;
  return Math.round((task.completedTasks / task.totalTasks) * 100);
};

export const getTaskTypeFromFolder = (folder: string): TaskType => {
  switch (folder) {
    case "epics":
      return "epic";
    case "stories":
      return "story";
    case "bugs":
      return "bug";
    case "docs":
      return "doc";
    default:
      return "custom";
  }
};
