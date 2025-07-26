/**
 * Document-related data models for Gition
 * Contains interfaces for markdown files and their metadata
 */

export interface FileMetadata {
  // Core fields
  title?: string;
  description?: string;
  tags?: string[];
  date?: string;
  author?: string;
  status?: "draft" | "published" | "archived";

  // Organization
  type?: string;
  category?: string;
  section?: string;
  order?: number;

  // Task-specific fields (for task files)
  priority?: "low" | "medium" | "high" | "critical";
  assignee?: string;
  due?: string;
  completedDate?: string;
  valueScore?: number;
  estimateScore?: number;
  parent?: string;
  version?: string;

  // Temporal data
  created?: string;
  updated?: string;
  lastModified?: string;

  // Analytics
  readingTime?: number;
  wordCount?: number;

  // Extended metadata (flexible)
  [key: string]: unknown;
}

export interface MarkdownFile {
  slug: string; // path-based identifier
  filename: string; // file basename with extension
  filepath: string; // absolute filesystem path
  content: string; // parsed markdown content (no frontmatter)
  metadata: FileMetadata; // frontmatter and computed metadata
  excerpt?: string; // auto-generated excerpt for previews
}

// Type guards for status checking
export const isDocumentStatus = (
  status: string
): status is FileMetadata["status"] => {
  return ["draft", "published", "archived"].includes(status);
};

export const isPriority = (
  priority: string
): priority is FileMetadata["priority"] => {
  return ["low", "medium", "high", "critical"].includes(priority);
};
