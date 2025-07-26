import { NextRequest } from "next/server";

import fs from "fs";
import matter from "gray-matter";
import path from "path";

import { getDocsDirectory, getTasksDirectory } from "@/lib/mdx";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const resolvedParams = await params;
    const taskId = decodeURIComponent(resolvedParams.taskId);
    const { status } = await request.json();

    if (!status) {
      return Response.json({ error: "Status is required" }, { status: 400 });
    }

    // Find the task file
    let filePath: string | null = null;

    // Try tasks directory first
    const tasksPath = path.join(getTasksDirectory(), `${taskId}.mdx`);
    const tasksPathMd = path.join(getTasksDirectory(), `${taskId}.md`);

    if (fs.existsSync(tasksPath)) {
      filePath = tasksPath;
    } else if (fs.existsSync(tasksPathMd)) {
      filePath = tasksPathMd;
    } else {
      // Try docs directory
      const docsPath = path.join(getDocsDirectory(), `${taskId}.mdx`);
      const docsPathMd = path.join(getDocsDirectory(), `${taskId}.md`);

      if (fs.existsSync(docsPath)) {
        filePath = docsPath;
      } else if (fs.existsSync(docsPathMd)) {
        filePath = docsPathMd;
      }
    }

    if (!filePath) {
      return Response.json({ error: "Task file not found" }, { status: 404 });
    }

    // Read and update the file
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data: frontmatter, content } = matter(fileContent);

    // Update the status in frontmatter
    const updatedFrontmatter = {
      ...frontmatter,
      status,
    };

    // Reconstruct the file with updated frontmatter
    const updatedContent = matter.stringify(content, updatedFrontmatter);

    // Write back to file
    fs.writeFileSync(filePath, updatedContent, "utf-8");

    return Response.json({
      success: true,
      message: "Task status updated successfully",
      status,
      filePath,
    });
  } catch (error) {
    console.error("Error updating task status:", error);
    return Response.json(
      { error: "Failed to update task status" },
      { status: 500 }
    );
  }
}
