/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

// Helper to check if file is markdown
function isMarkdownFile(filename) {
  return /\.(md|mdx)$/i.test(filename);
}

// Recursively scan for markdown files
function scanMarkdownFiles(directory, baseDir = directory) {
  const files = [];

  if (!fs.existsSync(directory)) {
    return files;
  }

  const items = fs.readdirSync(directory, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(directory, item.name);

    if (item.isDirectory()) {
      if (!item.name.startsWith(".") && item.name !== "node_modules") {
        files.push(...scanMarkdownFiles(fullPath, baseDir));
      }
    } else if (item.isFile() && isMarkdownFile(fullPath)) {
      const relativePath = path.relative(baseDir, fullPath);
      files.push({
        path: fullPath,
        relativePath: relativePath,
      });
    }
  }

  return files;
}

// Parse markdown file
function parseMarkdownFile(filePath, relativePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const {
      data: metadata,
      content: markdownContent,
      excerpt,
    } = matter(content, {
      excerpt: true,
      excerpt_separator: "---",
    });

    return {
      slug: relativePath.replace(/\.(md|mdx)$/i, ""),
      filename: path.basename(filePath),
      filepath: relativePath,
      content: markdownContent,
      metadata: metadata || {},
      excerpt: excerpt || markdownContent.slice(0, 150) + "...",
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

// Extract tasks from content
function extractTasks(content, filepath) {
  const tasks = [];
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    const taskMatch = line.match(/^(\s*)-\s*\[([ xX])\]\s+(.+)$/);
    if (taskMatch) {
      const completed = taskMatch[2].toLowerCase() === "x";
      const title = taskMatch[3].trim();

      tasks.push({
        id: `${filepath}-L${index + 1}`,
        title,
        completed,
        status: completed ? "done" : "todo",
        line: index + 1,
        file: filepath,
      });
    }
  });

  return tasks;
}

// Main function
function generateManifest() {
  console.log("🔍 Generating file manifest...");

  const targetDir = process.env.GITION_TARGET_DIR || process.cwd();
  const docsDir = path.join(targetDir, "docs");
  const tasksDir = path.join(targetDir, "tasks");

  // Scan for files
  const docFiles = scanMarkdownFiles(docsDir, targetDir);
  const taskFiles = scanMarkdownFiles(tasksDir, targetDir);

  // Parse files and extract content
  const manifest = {
    generated: new Date().toISOString(),
    paths: {
      target: targetDir,
      docs: docsDir,
      tasks: tasksDir,
    },
    docs: [],
    tasks: [],
    structure: {
      docs: {},
      tasks: {},
    },
  };

  // Process doc files
  docFiles.forEach(({ path: filePath, relativePath }) => {
    const parsed = parseMarkdownFile(filePath, relativePath);
    if (parsed) {
      manifest.docs.push(parsed);
    }
  });

  // Process task files
  const allTasks = [];
  taskFiles.forEach(({ path: filePath, relativePath }) => {
    const parsed = parseMarkdownFile(filePath, relativePath);
    if (parsed) {
      manifest.tasks.push(parsed);
      const tasks = extractTasks(parsed.content, relativePath);
      allTasks.push(...tasks);
    }
  });

  // Build directory structure
  function buildStructure(files) {
    const structure = {};

    files.forEach(({ relativePath }) => {
      const parts = relativePath.split(path.sep);
      let current = structure;

      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          // It's a file
          if (!current.files) current.files = [];
          current.files.push(part);
        } else {
          // It's a directory
          if (!current.folders) current.folders = {};
          if (!current.folders[part]) {
            current.folders[part] = {};
          }
          current = current.folders[part];
        }
      });
    });

    return structure;
  }

  manifest.structure.docs = buildStructure(docFiles);
  manifest.structure.tasks = buildStructure(taskFiles);
  manifest.allTasks = allTasks;

  // Write manifest
  const outputPath = path.join(targetDir, ".gition-manifest.json");
  const manifestJson = JSON.stringify(manifest, null, 2);
  fs.writeFileSync(outputPath, manifestJson);

  // Also copy to public directory for static access
  const publicPath = path.join(targetDir, "public", ".gition-manifest.json");
  if (fs.existsSync(path.join(targetDir, "public"))) {
    fs.writeFileSync(publicPath, manifestJson);
    console.log(`📄 Also copied to: ${publicPath}`);
  }

  console.log(
    `✅ Manifest generated with ${manifest.docs.length} docs and ${manifest.tasks.length} task files`
  );
  console.log(`📄 Written to: ${outputPath}`);
}

// Run if called directly
if (require.main === module) {
  generateManifest();
}

module.exports = { generateManifest };
