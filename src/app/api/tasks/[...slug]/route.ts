import { NextResponse } from "next/server";

import fs from "fs";
import matter from "gray-matter";
import path from "path";

import {
  getAllTasks,
  getDocsDirectory,
  getTargetDirectory,
  getTaskGroups,
  getTasksDirectory,
} from "@/lib/mdx";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug.join("/");

    const allTasks = getAllTasks();
    const taskGroups = getTaskGroups();

    // Try to find the file in tasks directory first, then docs
    let isDocsFile = false;

    // Helper function to recursively search for a file
    function findFileRecursively(dir: string, filename: string): string | null {
      if (!fs.existsSync(dir)) return null;

      const items = fs.readdirSync(dir, { withFileTypes: true });

      // First check if the file exists directly in this directory
      for (const ext of [".md", ".mdx"]) {
        const filePath = path.join(dir, filename + ext);
        if (fs.existsSync(filePath)) {
          return filePath;
        }
      }

      // Then search in subdirectories
      for (const item of items) {
        if (item.isDirectory() && !item.name.startsWith(".")) {
          const found = findFileRecursively(
            path.join(dir, item.name),
            filename
          );
          if (found) return found;
        }
      }

      return null;
    }

    // Handle nested paths like "epics/v1-mvp-roadmap"
    let foundFile: string | null = null;

    if (slug.includes("/")) {
      // For nested paths, construct the full path directly
      const [folder, filename] = slug.split("/");

      // Try in tasks/folder/ directory
      for (const ext of [".mdx", ".md"]) {
        const tasksPath = path.join(
          getTasksDirectory(),
          folder,
          filename + ext
        );
        if (fs.existsSync(tasksPath)) {
          foundFile = tasksPath;
          break;
        }
      }

      // If not found in tasks, try in docs/folder/ directory
      if (!foundFile) {
        for (const ext of [".mdx", ".md"]) {
          const docsPath = path.join(
            getDocsDirectory(),
            folder,
            filename + ext
          );
          if (fs.existsSync(docsPath)) {
            foundFile = docsPath;
            isDocsFile = true;
            break;
          }
        }
      }
    } else {
      // For simple filenames, use the recursive search
      const filename = slug;
      foundFile = findFileRecursively(getTasksDirectory(), filename);
      if (foundFile) {
        // Found in tasks directory
      } else {
        // Search in docs directory
        foundFile = findFileRecursively(getDocsDirectory(), filename);
        if (foundFile) {
          isDocsFile = true;
        }
      }
    }

    if (!foundFile) {
      console.log("File not found:", {
        slug,
        targetDir: getTargetDirectory(),
        tasksDir: getTasksDirectory(),
        docsDir: getDocsDirectory(),
        searchPaths: slug.includes("/")
          ? [
              path.join(
                getTasksDirectory(),
                slug.split("/")[0],
                slug.split("/")[1] + ".mdx"
              ),
              path.join(
                getTasksDirectory(),
                slug.split("/")[0],
                slug.split("/")[1] + ".md"
              ),
              path.join(
                getDocsDirectory(),
                slug.split("/")[0],
                slug.split("/")[1] + ".mdx"
              ),
              path.join(
                getDocsDirectory(),
                slug.split("/")[0],
                slug.split("/")[1] + ".md"
              ),
            ]
          : [],
      });

      return NextResponse.json(
        {
          error: "Task file not found",
          debug: {
            slug,
            tasksDir: getTasksDirectory(),
            docsDir: getDocsDirectory(),
          },
        },
        { status: 404 }
      );
    }

    const filePath = foundFile;

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data: frontmatter, content } = matter(fileContent);

    // Get tasks from this specific file
    const fileTasks = allTasks.filter((task) => task.file === filePath);

    // Find the task group this file belongs to
    const group = taskGroups.find((g) => g.file === filePath) || null;

    // Find referenced tasks and tasks that reference this file
    const referencedTasks = allTasks.filter((task) =>
      task.references?.some((ref) => ref.includes(slug))
    );

    const relatedTasks = allTasks.filter((task) =>
      fileTasks.some((fileTask) =>
        fileTask.references?.some((ref) =>
          ref.includes(path.basename(task.file, path.extname(task.file)))
        )
      )
    );

    const taskFile = {
      slug,
      content,
      frontmatter,
      tasks: fileTasks,
      group,
      relatedTasks,
      referencedBy: referencedTasks,
      isDocsFile,
    };

    return NextResponse.json(taskFile);
  } catch (error) {
    console.error("Error fetching task file:", error);
    return NextResponse.json(
      { error: "Failed to fetch task file" },
      { status: 500 }
    );
  }
}
