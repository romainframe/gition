import { NextResponse } from "next/server";

import { getStructureFromManifest } from "@/lib/manifest";
import {
  getDirectoryStructure,
  getDocsDirectory,
  getTargetDirectory,
  getTasksDirectory,
} from "@/lib/mdx";

export async function GET() {
  try {
    // Try to get structure from manifest first (production)
    const manifestStructure = await getStructureFromManifest();

    if (manifestStructure) {
      return NextResponse.json(manifestStructure);
    }

    // Fallback to file system (development)
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
