import fs from "fs";
import matter from "gray-matter";
import path from "path";

import type {
  DirectoryNode,
  FileMetadata,
  MarkdownFile,
  TaskGroup,
  TaskItem,
  TaskType,
} from "@/models";
import { getTaskTypeFromFolder } from "@/models";

import { getConfig } from "./config";

/**
 * Get the target directory from environment variable or default to current directory
 */
export function getTargetDirectory(): string {
  if (process.env.GITION_TARGET_DIR) {
    return process.env.GITION_TARGET_DIR;
  }

  const cwd = process.cwd();

  if (fs.existsSync(path.join(cwd, "data", "docs"))) {
    const dataPath = path.join(cwd, "data");
    return dataPath;
  }

  return cwd;
}

/**
 * Get the docs directory path (defaults to ./docs, configurable via .gitionrc)
 */
export function getDocsDirectory(): string {
  // Environment variable takes precedence
  if (process.env.GITION_DOCS_DIR) {
    return process.env.GITION_DOCS_DIR;
  }

  const targetDir = getTargetDirectory();

  try {
    const config = getConfig();
    return path.join(targetDir, config.docsDir || "docs");
  } catch {
    // Fallback if config not initialized
    return path.join(targetDir, "docs");
  }
}

/**
 * Get the tasks directory path (defaults to ./tasks, configurable via .gitionrc)
 */
export function getTasksDirectory(): string {
  // Environment variable takes precedence
  if (process.env.GITION_TASKS_DIR) {
    return process.env.GITION_TASKS_DIR;
  }

  const targetDir = getTargetDirectory();

  try {
    const config = getConfig();
    return path.join(targetDir, config.tasksDir || "tasks");
  } catch {
    // Fallback if config not initialized
    return path.join(targetDir, "tasks");
  }
}

/**
 * Check if a path is a markdown file
 */
export function isMarkdownFile(filepath: string): boolean {
  const filename = path.basename(filepath);
  const ext = filename.toLowerCase().split(".").pop();
  return ext === "md" || ext === "mdx";
}

/**
 * Recursively scan directory for markdown files
 */
export function scanMarkdownFiles(directory: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(directory)) {
    return files;
  }

  const items = fs.readdirSync(directory, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(directory, item.name);

    if (item.isDirectory()) {
      // Skip hidden directories and node_modules
      if (!item.name.startsWith(".") && item.name !== "node_modules") {
        files.push(...scanMarkdownFiles(fullPath));
      }
    } else if (item.isFile() && isMarkdownFile(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Parse markdown file with frontmatter
 */
export function parseMarkdownFile(filepath: string): MarkdownFile {
  const content = fs.readFileSync(filepath, "utf-8");
  const {
    data,
    content: markdownContent,
    excerpt,
  } = matter(content, {
    excerpt: true,
    excerpt_separator: "<!-- more -->",
  });

  const filename = path.basename(filepath);
  const slug = path.basename(filepath, path.extname(filepath));

  return {
    slug,
    filename,
    filepath,
    content: markdownContent,
    metadata: data as FileMetadata,
    excerpt: excerpt || undefined,
  };
}

/**
 * Get all markdown files from docs directory
 */
export function getDocsFiles(): MarkdownFile[] {
  const docsDir = getDocsDirectory();
  const files = scanMarkdownFiles(docsDir);

  return files.map(parseMarkdownFile).sort((a, b) => {
    // Sort by metadata.date if available, otherwise by filename
    const dateA = a.metadata.date || "";
    const dateB = b.metadata.date || "";

    if (dateA && dateB) {
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    }

    return a.filename.localeCompare(b.filename);
  });
}

/**
 * Get all markdown files from tasks directory
 */
export function getTasksFiles(): MarkdownFile[] {
  const tasksDir = getTasksDirectory();
  const files = scanMarkdownFiles(tasksDir);

  return files.map(parseMarkdownFile);
}

/**
 * Extract task items from markdown content with hierarchical support
 */
export function extractTasks(content: string, filepath: string): TaskItem[] {
  const tasks: TaskItem[] = [];
  const lines = content.split("\n");

  // Determine task type and folder from file path
  const relativePath = path.relative(getTargetDirectory(), filepath);
  const pathParts = relativePath.split(path.sep);

  let taskType: TaskType = "doc";
  let folder: string | undefined;

  if (pathParts[0] === "tasks" && pathParts.length > 2) {
    folder = pathParts[1];
    taskType = getTaskTypeFromFolder(folder);
  }

  lines.forEach((line, index) => {
    const taskMatch = line.match(/^\s*-\s*\[([ xX~])\]\s*(.+)$/);

    if (taskMatch) {
      const [, checkbox, fullTitle] = taskMatch;
      const completed = checkbox.toLowerCase() === "x";

      // Parse metadata from title (priority, tags, due date, references)
      const metadata: TaskItem["metadata"] = {};
      const references: string[] = [];
      let title = fullTitle.trim();

      // Extract task references: ref:epics/epic-01 or ref:stories/story-02
      const referenceMatches = title.match(/ref:([\w\/-]+)/g);
      if (referenceMatches) {
        references.push(
          ...referenceMatches.map((ref) => ref.replace("ref:", ""))
        );
        referenceMatches.forEach((ref) => {
          title = title.replace(ref, "").trim();
        });
      }

      // Extract priority: (high), (medium), (low)
      const priorityMatch = title.match(
        /\((?:priority:\s*)?(high|medium|low)\)/i
      );
      if (priorityMatch) {
        metadata.priority = priorityMatch[1].toLowerCase() as
          | "low"
          | "medium"
          | "high";
        title = title.replace(priorityMatch[0], "").trim();
      }

      // Extract due date: @2024-01-15 or @tomorrow or @next-week
      const dueDateMatch = title.match(/@([\w-]+)/);
      if (dueDateMatch) {
        metadata.due_date = dueDateMatch[1];
        title = title.replace(dueDateMatch[0], "").trim();
      }

      // Extract assignee: +john or +@jane
      const assigneeMatch = title.match(/\+@?(\w+)/);
      if (assigneeMatch) {
        metadata.assignee = assigneeMatch[1];
        title = title.replace(assigneeMatch[0], "").trim();
      }

      // Extract tags: #tag1 #tag2
      const tagMatches = title.match(/#(\w+)/g);
      if (tagMatches) {
        metadata.tags = tagMatches.map((tag) => tag.substring(1));
        tagMatches.forEach((tag) => {
          title = title.replace(tag, "").trim();
        });
      }

      // Determine status: look for status indicators or default based on completion
      let status: "todo" | "in_progress" | "done" = completed ? "done" : "todo";

      // Check for [~] indicating in-progress status
      if (checkbox === "~") {
        status = "in_progress";
      }

      // Check for explicit status indicators: [doing], [in-progress], [wip]
      const statusMatch = title.match(/\[(doing|in-progress|wip|todo|done)\]/i);
      if (statusMatch) {
        const statusText = statusMatch[1].toLowerCase();
        if (
          statusText === "doing" ||
          statusText === "in-progress" ||
          statusText === "wip"
        ) {
          status = "in_progress";
        } else if (statusText === "done") {
          status = "done";
        } else if (statusText === "todo") {
          status = "todo";
        }
        title = title.replace(statusMatch[0], "").trim();
      }

      tasks.push({
        id: `${path.basename(filepath)}-${index}`,
        title: title.trim(),
        completed,
        status,
        line: index + 1,
        file: filepath,
        type: taskType,
        folder,
        references: references.length > 0 ? references : undefined,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      });
    }
  });

  return tasks;
}

/**
 * Get all tasks from both docs and tasks directories
 */
export function getAllTasks(): TaskItem[] {
  const allTasks: TaskItem[] = [];

  // Get tasks from docs files
  const docsFiles = getDocsFiles();
  docsFiles.forEach((file) => {
    const tasks = extractTasks(file.content, file.filepath);
    allTasks.push(...tasks);
  });

  // Get tasks from tasks files
  const tasksFiles = getTasksFiles();
  tasksFiles.forEach((file) => {
    const tasks = extractTasks(file.content, file.filepath);
    allTasks.push(...tasks);
  });

  return allTasks;
}

/**
 * Group tasks hierarchically by parent files/epics
 */
export function getTaskGroups(): TaskGroup[] {
  const allTasks = getAllTasks();
  const groups: Map<string, TaskGroup> = new Map();

  // Get all markdown files to access frontmatter
  const docsFiles = getDocsFiles();
  const tasksFiles = getTasksFiles();
  const allFiles = [...docsFiles, ...tasksFiles];
  const fileMap = new Map(allFiles.map((file) => [file.filepath, file]));

  // First, create groups for files that have tasks
  allTasks.forEach((task) => {
    const fileBasename = path.basename(task.file, path.extname(task.file));
    const groupId = task.folder
      ? `${task.folder}/${fileBasename}`
      : `docs/${fileBasename}`;

    if (!groups.has(groupId)) {
      // Get the file's frontmatter metadata
      const fileData = fileMap.get(task.file);
      const metadata = fileData ? fileData.metadata : {};

      groups.set(groupId, {
        id: groupId,
        name: fileBasename,
        type: task.type,
        file: task.file,
        folder: task.folder,
        subtasks: [],
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        content: fileData ? fileData.content : undefined,
        metadata,
      });
    }

    const group = groups.get(groupId)!;
    group.subtasks.push(task);
    group.totalTasks++;

    if (task.completed) {
      group.completedTasks++;
    } else {
      group.pendingTasks++;
    }
  });

  // Only return groups that have more than one task (making them parent-level)
  // Or are epics/stories (always shown as parent level)
  return Array.from(groups.values())
    .filter(
      (group) =>
        group.totalTasks > 1 ||
        group.type === "epic" ||
        (group.type === "doc" && group.totalTasks > 0)
    )
    .sort((a, b) => {
      // Sort by type priority: epics first, then docs, then custom
      const typePriority = { epic: 1, doc: 2, story: 3, custom: 4 };
      const aPriority = typePriority[a.type] || 5;
      const bPriority = typePriority[b.type] || 5;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      return a.name.localeCompare(b.name);
    });
}

/**
 * Get tasks for a specific group (for individual Kanban boards)
 */
export function getTasksByGroup(groupId: string): TaskItem[] {
  const allTasks = getAllTasks();
  const [folder, filename] = groupId.includes("/")
    ? groupId.split("/")
    : ["docs", groupId];

  return allTasks.filter((task) => {
    const fileBasename = path.basename(task.file, path.extname(task.file));
    const taskFolder = task.folder || "docs";
    return taskFolder === folder && fileBasename === filename;
  });
}

/**
 * Get directory structure for file explorer
 */
// DirectoryNode is now imported from @/models

export function getDirectoryStructure(directory: string): DirectoryNode[] {
  const nodes: DirectoryNode[] = [];

  if (!fs.existsSync(directory)) {
    return nodes;
  }

  const items = fs.readdirSync(directory, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(directory, item.name);

    // Skip hidden files and node_modules
    if (item.name.startsWith(".") || item.name === "node_modules") {
      continue;
    }

    if (item.isDirectory()) {
      const children = getDirectoryStructure(fullPath);
      nodes.push({
        name: item.name,
        path: fullPath,
        type: "directory",
        children,
      });
    } else if (item.isFile()) {
      nodes.push({
        name: item.name,
        path: fullPath,
        type: "file",
        isMarkdown: isMarkdownFile(fullPath),
      });
    }
  }

  // Sort: directories first, then files, both alphabetically
  return nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "directory" ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}
