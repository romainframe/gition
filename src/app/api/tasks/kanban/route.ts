import { NextResponse } from "next/server";

import { TaskItem, getAllTasks, getTasksByGroup } from "@/lib/mdx";

export interface KanbanColumn {
  id: string;
  title: string;
  tasks: TaskItem[];
}

export interface KanbanBoard {
  columns: KanbanColumn[];
  totalTasks: number;
  groupId?: string;
  groupName?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("group");

    let tasks: TaskItem[];
    let boardTitle = "All Tasks";

    if (groupId) {
      tasks = getTasksByGroup(groupId);
      boardTitle = groupId.split("/").pop() || groupId;
    } else {
      tasks = getAllTasks();
    }

    // Group tasks by status
    const todoTasks = tasks.filter((task) => task.status === "todo");
    const inProgressTasks = tasks.filter(
      (task) => task.status === "in_progress"
    );
    const doneTasks = tasks.filter((task) => task.status === "done");

    const kanbanBoard: KanbanBoard = {
      columns: [
        {
          id: "todo",
          title: "To Do",
          tasks: todoTasks,
        },
        {
          id: "in_progress",
          title: "In Progress",
          tasks: inProgressTasks,
        },
        {
          id: "done",
          title: "Done",
          tasks: doneTasks,
        },
      ],
      totalTasks: tasks.length,
      groupId: groupId || undefined,
      groupName: boardTitle,
    };

    return NextResponse.json(kanbanBoard);
  } catch (error) {
    console.error("Error fetching kanban board:", error);
    return NextResponse.json(
      { error: "Failed to fetch kanban board" },
      { status: 500 }
    );
  }
}
