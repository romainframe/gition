import { NextResponse } from "next/server";

import {
  getDirectoryStructure,
  getDocsDirectory,
  getTargetDirectory,
  getTasksDirectory,
} from "@/lib/mdx";

export async function GET() {
  try {
    const targetDir = getTargetDirectory();
    const docsDir = getDocsDirectory();
    const tasksDir = getTasksDirectory();

    const structure = {
      root: getDirectoryStructure(targetDir),
      docs: getDirectoryStructure(docsDir),
      tasks: getDirectoryStructure(tasksDir),
      paths: {
        target: targetDir,
        docs: docsDir,
        tasks: tasksDir,
      },
    };

    return NextResponse.json(structure);
  } catch (error) {
    console.error("Error fetching directory structure:", error);
    return NextResponse.json(
      { error: "Failed to fetch directory structure" },
      { status: 500 }
    );
  }
}
