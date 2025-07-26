import { NextRequest, NextResponse } from "next/server";

import { promises as fs } from "fs";
import matter from "gray-matter";
import path from "path";

import { getDocsDirectory, getTasksDirectory } from "@/lib/mdx";

async function findFileRecursively(
  dir: string,
  filename: string
): Promise<string | null> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    // Check current directory
    for (const entry of entries) {
      if (entry.isFile() && entry.name === filename) {
        return path.join(dir, entry.name);
      }
    }

    // Search subdirectories
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith(".")) {
        const result = await findFileRecursively(
          path.join(dir, entry.name),
          filename
        );
        if (result) return result;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string; subtaskId: string }> }
) {
  try {
    const resolvedParams = await params;
    const taskId = decodeURIComponent(resolvedParams.taskId);
    const { subtaskId } = resolvedParams;
    const body = await request.json();
    const { status, metadata } = body;

    console.log("Updating subtask:", { taskId, subtaskId, status, metadata });

    // Find the task file
    const docsDir = getDocsDirectory();
    const tasksDir = getTasksDirectory();

    let filePath: string | null = null;

    // Handle taskId that might include folder structure (e.g., "epics/v1-mvp-roadmap")
    if (taskId.includes("/")) {
      const [folder, filename] = taskId.split("/");
      const possibleFilenames = [`${filename}.mdx`, `${filename}.md`];

      for (const fname of possibleFilenames) {
        // Try in tasks/folder/ directory
        const tasksPath = path.join(tasksDir, folder, fname);
        try {
          await fs.access(tasksPath);
          filePath = tasksPath;
          break;
        } catch {}

        // Try in docs/folder/ directory
        const docsPath = path.join(docsDir, folder, fname);
        try {
          await fs.access(docsPath);
          filePath = docsPath;
          break;
        } catch {}
      }
    } else {
      // Handle simple taskId without folder structure
      const possibleFilenames = [
        `${taskId}.mdx`,
        `${taskId}.md`,
        `${taskId.split("-").slice(0, -1).join("-")}.mdx`, // Remove potential line number suffix
        `${taskId.split("-").slice(0, -1).join("-")}.md`,
      ];

      for (const filename of possibleFilenames) {
        // Search in docs directory
        const docsPath = await findFileRecursively(docsDir, filename);
        if (docsPath) {
          filePath = docsPath;
          break;
        }

        // Search in tasks directory
        const tasksPath = await findFileRecursively(tasksDir, filename);
        if (tasksPath) {
          filePath = tasksPath;
          break;
        }
      }
    }

    if (!filePath) {
      console.log("No file path found for taskId:", taskId);
      return NextResponse.json(
        { error: "Task file not found", taskId },
        { status: 404 }
      );
    }

    // Read the current file
    const fileContent = await fs.readFile(filePath, "utf8");
    const { data: frontmatter, content } = matter(fileContent);

    // Parse subtasks from content only (same as frontend)
    const lines = content.split("\n");
    let subtaskFound = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const checkboxMatch = line.match(/^(\s*)- \[([ x~])\] (.+)$/);

      if (checkboxMatch) {
        const [, indent, , taskTitle] = checkboxMatch;

        // Generate ID for this subtask using 0-based index (same as frontend)
        const lineTaskId = `${path.basename(filePath)}-${i}`;

        if (lineTaskId === subtaskId) {
          subtaskFound = true;

          // Update status if provided
          if (status !== undefined) {
            let newCheckbox;
            switch (status) {
              case "done":
                newCheckbox = "[x]";
                break;
              case "in_progress":
                newCheckbox = "[~]";
                break;
              default:
                newCheckbox = "[ ]";
            }

            // Extract existing metadata from the line
            const metadataMatch = taskTitle.match(/^(.+?)(\s*\{.+\})?$/);
            const titlePart = metadataMatch
              ? metadataMatch[1].trim()
              : taskTitle;
            let metadataPart = metadataMatch ? metadataMatch[2] : "";

            // Update metadata if provided
            if (metadata !== undefined) {
              try {
                // Parse existing metadata
                let existingMetadata = {};
                if (metadataPart) {
                  const metadataStr = metadataPart.trim().slice(1, -1); // Remove { }
                  existingMetadata = eval(`({${metadataStr}})`); // Simple eval for JSON-like syntax
                }

                // Merge with new metadata
                const updatedMetadata = { ...existingMetadata, ...metadata };

                // Convert back to string format
                const metadataEntries = Object.entries(updatedMetadata)
                  .filter(([, value]) => value !== undefined && value !== null)
                  .map(([key, value]) => {
                    if (typeof value === "string") {
                      return `${key}: "${value}"`;
                    } else if (Array.isArray(value)) {
                      return `${key}: [${value.map((v) => `"${v}"`).join(", ")}]`;
                    } else {
                      return `${key}: ${value}`;
                    }
                  });

                metadataPart =
                  metadataEntries.length > 0
                    ? ` {${metadataEntries.join(", ")}}`
                    : "";
              } catch (error) {
                console.warn("Failed to parse/update metadata:", error);
              }
            }

            // Reconstruct the line and update in lines array
            lines[i] =
              `${indent}- ${newCheckbox} ${titlePart}${metadataPart || ""}`;
            break;
          }
        }
      }
    }

    if (!subtaskFound) {
      return NextResponse.json(
        { error: "Subtask not found", subtaskId },
        { status: 404 }
      );
    }

    // Write the updated content back to file with frontmatter
    const updatedContent = matter.stringify(lines.join("\n"), frontmatter);
    await fs.writeFile(filePath, updatedContent, "utf8");

    return NextResponse.json({
      success: true,
      message: "Subtask updated successfully",
      filePath,
    });
  } catch (error) {
    console.error("Error updating subtask:", error);
    return NextResponse.json(
      {
        error: "Failed to update subtask",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
