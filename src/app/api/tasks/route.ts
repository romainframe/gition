import { NextResponse } from "next/server";

import { getAllTasksFromManifest, getTasksFromManifest } from "@/lib/manifest";
import { extractTasks, getAllTasks, getTaskGroups } from "@/lib/mdx";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view");

    if (view === "groups") {
      // For groups, we need to check manifest first
      const manifestTasks = await getTasksFromManifest();
      if (manifestTasks) {
        // Create task groups from manifest data
        const groups = manifestTasks.map((file) => {
          const tasks = extractTasks(file.content, file.filepath);
          return {
            id: file.slug,
            name: file.metadata.title || file.filename,
            type: "custom" as const,
            file: file.filepath,
            subtasks: tasks,
            totalTasks: tasks.length,
            completedTasks: tasks.filter((t) => t.completed).length,
            pendingTasks: tasks.filter((t) => !t.completed).length,
            content: file.content,
            metadata: file.metadata,
          };
        });
        return NextResponse.json(groups);
      }

      // Fallback to file system
      const taskGroups = getTaskGroups();
      return NextResponse.json(taskGroups);
    }

    // For all tasks, check manifest first
    const manifestAllTasks = await getAllTasksFromManifest();
    const tasks = manifestAllTasks || getAllTasks();

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
