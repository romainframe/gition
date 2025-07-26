/**
 * Base MDX file models for Gition
 * Contains interfaces for all MDX-based content (tasks and docs)
 */
import { FileMetadata } from "./documents";

/**
 * Base interface for all MDX files
 * Both Task and Doc interfaces extend this
 */
export interface MDXFile {
  id: string; // unique identifier
  name: string; // display name (usually filename without extension)
  file: string; // source file path
  folder?: string; // organizing folder
  content?: string; // full markdown content
  metadata?: FileMetadata; // frontmatter metadata
  slug: string; // URL-friendly identifier
  excerpt?: string; // auto-generated excerpt
  [key: string]: unknown; // allow additional properties
}

/**
 * Common metadata for all MDX files
 */
export interface MDXMetadata {
  title?: string;
  description?: string;
  author?: string;
  tags?: string[];
  date?: string;
  created?: string;
  updated?: string;
  status?: "draft" | "published" | "archived";
  [key: string]: unknown;
}
