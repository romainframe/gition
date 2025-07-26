import { NextResponse } from "next/server";

import { getAllTasks, getTaskGroups } from "@/lib/mdx";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view");

    if (view === "groups") {
      const taskGroups = getTaskGroups();
      return NextResponse.json(taskGroups);
    }

    const tasks = getAllTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
