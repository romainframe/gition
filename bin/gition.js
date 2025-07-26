#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const { Command } = require("commander");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
let open;
try {
  open = require("open");
} catch {
  // open package not available, we'll skip auto-opening
  open = null;
}

const program = new Command();

program
  .name("gition")
  .description("Zero-config local web interface for Markdown/MDX files")
  .version("0.1.3");

// Main serve command
program
  .argument(
    "[directory]",
    "Directory to serve (defaults to current directory)",
    "."
  )
  .option("-p, --port <port>", "Port to run on", "3000")
  .option("--no-open", "Do not automatically open browser")
  .action(async (directory, options) => {
    const targetDir = path.resolve(directory);

    // Verify directory exists
    if (!fs.existsSync(targetDir)) {
      console.error(`Error: Directory "${targetDir}" does not exist`);
      process.exit(1);
    }

    console.log(`🚀 Starting Gition UI (production mode)`);
    console.log(`📂 Directory: ${targetDir}`);
    console.log(`🌐 Server: http://localhost:${options.port}`);

    // Find the Next.js project root (where this CLI is installed)
    const gitionRoot = path.resolve(__dirname, "..");

    // Set environment variables for the Next.js app
    const env = {
      ...process.env,
      GITION_TARGET_DIR: targetDir,
      PORT: options.port,
    };

    // Spawn Next.js production server with quieter output
    const nextProcess = spawn("npm", ["start"], {
      cwd: gitionRoot,
      env: {
        ...env,
        NODE_ENV: "production",
      },
      stdio: ["inherit", "pipe", "pipe"], // Capture stdout/stderr to filter output
    });

    // Filter and show only essential output
    nextProcess.stdout.on("data", (data) => {
      const output = data.toString();
      // Only show Ready message and errors, suppress verbose Next.js output
      if (
        output.includes("Ready in") ||
        output.includes("Error") ||
        output.includes("Failed")
      ) {
        process.stdout.write(`✅ ${output.replace(/.*Ready in/, "Ready in")}`);
      }
    });

    nextProcess.stderr.on("data", (data) => {
      const output = data.toString();
      // Suppress lockfile warnings and other verbose warnings
      if (!output.includes("lockfile") && !output.includes("Warning:")) {
        process.stderr.write(output);
      }
    });

    // Handle process termination
    process.on("SIGINT", () => {
      console.log("\n👋 Shutting down Gition...");
      nextProcess.kill("SIGINT");
      process.exit(0);
    });

    // Open browser after a short delay
    if (options.open && open) {
      setTimeout(() => {
        open(`http://localhost:${options.port}`).catch(() => {
          console.log(
            `📋 Please open your browser to: http://localhost:${options.port}`
          );
        });
      }, 3000);
    } else if (options.open) {
      console.log(
        `📋 Please open your browser to: http://localhost:${options.port}`
      );
    }

    nextProcess.on("error", (error) => {
      console.error("Failed to start Gition:", error);
      process.exit(1);
    });

    nextProcess.on("exit", (code) => {
      if (code !== 0) {
        console.error(`Gition exited with code ${code}`);
        process.exit(code);
      }
    });
  });

// Init command
program
  .command("init")
  .description("Initialize a new Gition workspace with configuration")
  .argument(
    "[directory]",
    "Directory to initialize (defaults to current directory)",
    "."
  )
  .action(async (directory) => {
    const targetDir = path.resolve(directory);

    // Ensure directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    console.log(`🔧 Initializing Gition workspace in: ${targetDir}`);

    try {
      // Import and run the init function
      const { initializeProject } = require("../dist/cli/init.js");
      await initializeProject(targetDir);
    } catch {
      // Fallback to compiling TypeScript first
      console.log("📦 Building initialization tools...");
      const { spawn } = require("child_process");
      const gitionRoot = path.resolve(__dirname, "..");

      const buildProcess = spawn("npm", ["run", "build"], {
        cwd: gitionRoot,
        stdio: "inherit",
      });

      buildProcess.on("exit", async (code) => {
        if (code === 0) {
          try {
            const { initializeProject } = require("../dist/cli/init.js");
            await initializeProject(targetDir);
          } catch (err) {
            console.error("❌ Failed to initialize project:", err.message);
            process.exit(1);
          }
        } else {
          console.error("❌ Failed to build initialization tools");
          process.exit(1);
        }
      });
    }
  });

program.parse();
