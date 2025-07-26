/**
 * Event data models for Gition
 * Contains interfaces for file system events and application events
 */

export type FileChangeType =
  | "file-change"
  | "file-add"
  | "file-remove"
  | "connected"
  | "heartbeat";

export interface FileChangeEvent {
  type: FileChangeType; // type of file system event
  path?: string; // file path (for file events)
  timestamp: number; // event timestamp

  // Additional metadata
  isDirectory?: boolean; // true if path is a directory
  fileSize?: number; // file size (for file events)
  oldPath?: string; // previous path (for rename events)
}

export interface ApplicationEvent {
  type: string; // event type identifier
  data?: Record<string, unknown>; // event payload
  timestamp: number; // event timestamp
  source?: string; // event source identifier
}

// Task-specific events
export interface TaskEvent extends ApplicationEvent {
  type: "task-created" | "task-updated" | "task-deleted" | "task-completed";
  taskId: string; // affected task ID
  groupId?: string; // parent group ID
  changes?: Record<string, unknown>; // specific changes made
}

export interface SubtaskEvent extends ApplicationEvent {
  type:
    | "subtask-toggled"
    | "subtask-updated"
    | "subtask-created"
    | "subtask-deleted";
  subtaskId: string; // affected subtask ID
  taskGroupId: string; // parent task group ID
  lineNumber?: number; // line number in file
  changes?: Record<string, unknown>; // specific changes made
}

// Document-specific events
export interface DocumentEvent extends ApplicationEvent {
  type:
    | "document-created"
    | "document-updated"
    | "document-deleted"
    | "document-viewed";
  documentSlug: string; // affected document slug
  filePath?: string; // document file path
  changes?: Record<string, unknown>; // specific changes made
}

// Configuration events
export interface ConfigEvent extends ApplicationEvent {
  type: "config-updated" | "config-reset" | "config-validated";
  configSection?: string; // specific config section affected
  changes?: Record<string, unknown>; // configuration changes
}

// Union type for all application events
export type GitionEvent =
  | TaskEvent
  | SubtaskEvent
  | DocumentEvent
  | ConfigEvent
  | ApplicationEvent;

// Type guards
export const isFileChangeEvent = (event: unknown): event is FileChangeEvent => {
  return (
    typeof event === "object" &&
    event !== null &&
    "type" in event &&
    "timestamp" in event
  );
};

export const isTaskEvent = (event: GitionEvent): event is TaskEvent => {
  return event.type.startsWith("task-");
};

export const isSubtaskEvent = (event: GitionEvent): event is SubtaskEvent => {
  return event.type.startsWith("subtask-");
};

export const isDocumentEvent = (event: GitionEvent): event is DocumentEvent => {
  return event.type.startsWith("document-");
};

export const isConfigEvent = (event: GitionEvent): event is ConfigEvent => {
  return event.type.startsWith("config-");
};

// Event creation helpers
export const createFileChangeEvent = (
  type: FileChangeType,
  path?: string,
  additionalData?: Partial<FileChangeEvent>
): FileChangeEvent => ({
  type,
  path,
  timestamp: Date.now(),
  ...additionalData,
});

export const createTaskEvent = (
  type: TaskEvent["type"],
  taskId: string,
  additionalData?: Partial<TaskEvent>
): TaskEvent => ({
  type,
  taskId,
  timestamp: Date.now(),
  ...additionalData,
});

export const createSubtaskEvent = (
  type: SubtaskEvent["type"],
  subtaskId: string,
  taskGroupId: string,
  additionalData?: Partial<SubtaskEvent>
): SubtaskEvent => ({
  type,
  subtaskId,
  taskGroupId,
  timestamp: Date.now(),
  ...additionalData,
});
