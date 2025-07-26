import { NextRequest } from "next/server";

import chokidar from "chokidar";
import fs from "fs";
import { glob } from "glob";
import path from "path";

import { getTargetDirectory } from "@/lib/mdx";

// Store active connections
const connections = new Set<ReadableStreamDefaultController>();

// Global watcher instance
let globalWatcher: chokidar.FSWatcher | null = null;

function initializeWatcher() {
  if (globalWatcher) {
    return globalWatcher;
  }

  const targetDir = getTargetDirectory();
  const docsPath = path.join(targetDir, "docs");
  const tasksPath = path.join(targetDir, "tasks");

  console.log("🔍 File watcher initializing:");
  console.log("  Target directory:", targetDir);
  console.log("  Docs path:", docsPath);
  console.log("  Tasks path:", tasksPath);

  console.log("  Checking directories exist:");
  console.log("    Docs:", fs.existsSync(docsPath));
  console.log("    Tasks:", fs.existsSync(tasksPath));

  // Find existing files first
  const existingFiles: string[] = [];
  try {
    const docsPattern = path.join(docsPath, "**/*.{md,mdx}");
    const tasksPattern = path.join(tasksPath, "**/*.{md,mdx}");

    console.log("🔍 Searching for files with patterns:");
    console.log("  Docs:", docsPattern);
    console.log("  Tasks:", tasksPattern);

    const docsFiles = glob.sync(docsPattern);
    const tasksFiles = glob.sync(tasksPattern);

    existingFiles.push(...docsFiles, ...tasksFiles);
    console.log("🔍 Found existing files:", existingFiles.length);
    existingFiles.slice(0, 3).forEach((file) => console.log("  -", file));
  } catch (error) {
    console.error("🔍 Error finding existing files:", error);
  }

  // Watch directories instead of using glob patterns
  const watchPaths = [docsPath, tasksPath].filter((p) => fs.existsSync(p));

  console.log("  Watching directories:", watchPaths);

  // Watch for changes in markdown files
  globalWatcher = chokidar.watch(watchPaths, {
    ignored: /node_modules/,
    persistent: true,
    ignoreInitial: true,
    recursive: true, // Watch subdirectories
  });

  globalWatcher.on("ready", () => {
    console.log("✅ File watcher is ready");
    const watched = globalWatcher!.getWatched();
    console.log(
      "📁 Watching",
      Object.keys(watched).length,
      "directories with",
      Object.values(watched).reduce((total, files) => total + files.length, 0),
      "files"
    );
  });

  globalWatcher.on("change", (filePath) => {
    // Only process markdown files
    if (!filePath.endsWith(".md") && !filePath.endsWith(".mdx")) {
      return;
    }

    console.log("📁 File changed:", filePath);

    // Notify all connected clients
    const message = JSON.stringify({
      type: "file-change",
      path: filePath,
      timestamp: Date.now(),
    });

    connections.forEach((controller) => {
      try {
        controller.enqueue(`data: ${message}\n\n`);
      } catch (error) {
        console.error("Error sending SSE message:", error);
        connections.delete(controller);
      }
    });
  });

  globalWatcher.on("add", (filePath) => {
    // Only process markdown files
    if (!filePath.endsWith(".md") && !filePath.endsWith(".mdx")) {
      return;
    }

    console.log("📁 File added:", filePath);

    const message = JSON.stringify({
      type: "file-add",
      path: filePath,
      timestamp: Date.now(),
    });

    connections.forEach((controller) => {
      try {
        controller.enqueue(`data: ${message}\n\n`);
      } catch (error) {
        console.error("Error sending SSE message:", error);
        connections.delete(controller);
      }
    });
  });

  globalWatcher.on("unlink", (filePath) => {
    // Only process markdown files
    if (!filePath.endsWith(".md") && !filePath.endsWith(".mdx")) {
      return;
    }

    console.log("📁 File removed:", filePath);

    const message = JSON.stringify({
      type: "file-remove",
      path: filePath,
      timestamp: Date.now(),
    });

    connections.forEach((controller) => {
      try {
        controller.enqueue(`data: ${message}\n\n`);
      } catch (error) {
        console.error("Error sending SSE message:", error);
        connections.delete(controller);
      }
    });
  });

  return globalWatcher;
}

export async function GET(request: NextRequest) {
  // Initialize the file watcher
  initializeWatcher();

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      connections.add(controller);

      // Send initial connection message
      controller.enqueue(
        `data: ${JSON.stringify({
          type: "connected",
          timestamp: Date.now(),
        })}\n\n`
      );

      // Keep connection alive with periodic heartbeat
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(
            `data: ${JSON.stringify({
              type: "heartbeat",
              timestamp: Date.now(),
            })}\n\n`
          );
        } catch {
          clearInterval(heartbeat);
          connections.delete(controller);
        }
      }, 30000); // Every 30 seconds

      // Clean up when connection closes
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        connections.delete(controller);

        // If no more connections, close the watcher
        if (connections.size === 0 && globalWatcher) {
          globalWatcher.close();
          globalWatcher = null;
        }
      });
    },
    cancel() {
      // Connection cancelled by client
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}
