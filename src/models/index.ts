/**
 * Gition Data Models
 * Centralized export of all data model interfaces and types
 */

// Document models
export type { FileMetadata, MarkdownFile } from "./documents";

export { isDocumentStatus, isPriority } from "./documents";

// Task models
export type {
  TaskStatus,
  TaskPriority,
  TaskType,
  TaskItemMetadata,
  TaskItem,
  TaskGroup,
} from "./tasks";

export {
  isTaskStatus,
  isTaskPriority,
  isTaskType,
  getTaskProgress,
  getTaskTypeFromFolder,
} from "./tasks";

// Kanban models
export type { KanbanColumn, KanbanBoard } from "./kanban";

export {
  DEFAULT_KANBAN_COLUMNS,
  createEmptyKanbanBoard,
  organizeTasksIntoColumns,
  getKanbanStats,
} from "./kanban";

// Structure models
export type { DirectoryNode, DirectoryStructure } from "./structure";

export {
  isMarkdownFile,
  getFileExtension,
  calculateNodeDepth,
  flattenDirectoryTree,
  findNodeByPath,
  getDirectoryStats,
} from "./structure";

// Event models
export type {
  FileChangeType,
  FileChangeEvent,
  ApplicationEvent,
  TaskEvent,
  SubtaskEvent,
  DocumentEvent,
  ConfigEvent,
  GitionEvent,
} from "./events";

export {
  isFileChangeEvent,
  isTaskEvent,
  isSubtaskEvent,
  isDocumentEvent,
  isConfigEvent,
  createFileChangeEvent,
  createTaskEvent,
  createSubtaskEvent,
} from "./events";

// Configuration models
export type {
  GitionThemeConfig,
  GitionTaskType,
  GitionUser,
  GitionEnvironmentVars,
  GitionConfig,
} from "./config";

export {
  DEFAULT_CONFIG,
  validateConfig,
  mergeConfig,
  getTaskTypeByFolder,
  getUserById,
} from "./config";
