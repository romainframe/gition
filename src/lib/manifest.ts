import fs from "fs";
import path from "path";

import { MarkdownFile, TaskItem } from "./mdx";

interface FileManifest {
  generated: string;
  paths: {
    target: string;
    docs: string;
    tasks: string;
  };
  docs: MarkdownFile[];
  tasks: MarkdownFile[];
  structure: {
    docs: unknown;
    tasks: unknown;
  };
  allTasks: TaskItem[];
}

let cachedManifest: FileManifest | null = null;

/**
 * Check if we're running in production (Netlify or other serverless)
 */
export function isProduction(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.NETLIFY === "true" ||
    process.env.VERCEL === "1" ||
    process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined
  );
}

/**
 * Load the manifest file if it exists
 */
export async function loadManifest(): Promise<FileManifest | null> {
  if (cachedManifest) {
    return cachedManifest;
  }

  try {
    // In serverless environments, try to fetch from public URL first
    if (typeof window === "undefined" && isProduction()) {
      try {
        // Try to fetch from the public directory via URL
        const baseUrl = process.env.URL || process.env.DEPLOY_URL || "";
        if (baseUrl) {
          const response = await fetch(`${baseUrl}/.gition-manifest.json`);
          if (response.ok) {
            cachedManifest = await response.json();
            console.log(
              `📦 Loaded manifest from URL: ${baseUrl}/.gition-manifest.json`
            );
            return cachedManifest;
          }
        }
      } catch (urlError) {
        console.warn("⚠️ Failed to fetch manifest from URL:", urlError);
      }
    }

    // Try multiple locations where the manifest might be on the filesystem
    const possiblePaths = [
      path.join(process.cwd(), ".gition-manifest.json"),
      path.join(process.cwd(), "public", ".gition-manifest.json"),
      path.join(process.cwd(), ".next", "static", ".gition-manifest.json"),
      "/.gition-manifest.json", // Root path for serverless
    ];

    for (const manifestPath of possiblePaths) {
      if (fs.existsSync(manifestPath)) {
        const manifestContent = fs.readFileSync(manifestPath, "utf-8");
        cachedManifest = JSON.parse(manifestContent);
        console.log(`📦 Loaded manifest from: ${manifestPath}`);
        return cachedManifest;
      }
    }

    console.warn("⚠️ No manifest file found in production");
    return null;
  } catch (error) {
    console.error("❌ Error loading manifest:", error);
    return null;
  }
}

/**
 * Get docs from manifest or fallback to file system
 */
export async function getDocsFromManifest(): Promise<MarkdownFile[] | null> {
  if (!isProduction()) {
    return null; // Use file system in development
  }

  const manifest = await loadManifest();
  return manifest?.docs || null;
}

/**
 * Get tasks from manifest or fallback to file system
 */
export async function getTasksFromManifest(): Promise<MarkdownFile[] | null> {
  if (!isProduction()) {
    return null; // Use file system in development
  }

  const manifest = await loadManifest();
  return manifest?.tasks || null;
}

/**
 * Get directory structure from manifest
 */
export async function getStructureFromManifest(): Promise<unknown | null> {
  if (!isProduction()) {
    return null; // Use file system in development
  }

  const manifest = await loadManifest();
  if (!manifest) return null;

  return {
    root: manifest.structure,
    docs: manifest.structure.docs,
    tasks: manifest.structure.tasks,
    paths: manifest.paths,
  };
}

/**
 * Get all tasks from manifest
 */
export async function getAllTasksFromManifest(): Promise<TaskItem[] | null> {
  if (!isProduction()) {
    return null; // Use file system in development
  }

  const manifest = await loadManifest();
  return manifest?.allTasks || null;
}
