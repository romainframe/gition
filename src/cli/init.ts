#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from "fs";
import inquirer from "inquirer";
import { join } from "path";

import { ConfigManager } from "@/lib/config";
import { GitionConfig, GitionTaskType } from "@/types/config";

interface InitAnswers {
  name: string;
  description: string;
  docsDir: string;
  tasksDir: string;
  setupTaskTypes: boolean;
  taskTypes: GitionTaskType[];
  enableFeatures: string[];
  defaultLanguage: "en" | "fr" | "es";
  theme: "default" | "custom";
  createDirectories: boolean;
}

export async function initializeProject(targetDir: string = process.cwd()) {
  console.log("🚀 Welcome to Gition! Let's set up your workspace.\n");

  // Check if .gitionrc already exists
  const configManager = new ConfigManager(targetDir);
  if (configManager.configExists()) {
    const { overwrite } = await inquirer.prompt([
      {
        type: "confirm",
        name: "overwrite",
        message:
          "A .gitionrc configuration already exists. Do you want to overwrite it?",
        default: false,
      },
    ]);

    if (!overwrite) {
      console.log("Initialization cancelled.");
      return;
    }
  }

  // Collect configuration
  const answers = await collectConfigurationAnswers();

  // Generate configuration
  const config = generateConfig(answers);

  // Save configuration
  configManager.initializeConfig(config);
  console.log(`✅ Configuration saved to ${configManager.getConfigPath()}`);

  // Create directories if requested
  if (answers.createDirectories) {
    createWorkspaceDirectories(targetDir, config);
  }

  // Create example files
  await createExampleFiles(targetDir, config);

  console.log("\\n🎉 Gition workspace initialized successfully!");
  console.log("\\nNext steps:");
  console.log("1. Run `npx gition` to start the development server");
  console.log("2. Open your browser to view your workspace");
  console.log(
    "3. Start adding markdown files to your docs and tasks directories"
  );
  console.log(
    "\\nFor more information, visit: https://github.com/yourusername/gition"
  );
}

async function collectConfigurationAnswers(): Promise<InitAnswers> {
  return await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "What is the name of your workspace?",
      default: "My Gition Workspace",
      validate: (input: string) =>
        input.trim().length > 0 || "Name is required",
    },
    {
      type: "input",
      name: "description",
      message: "Provide a description for your workspace:",
      default: "Documentation and task management workspace",
    },
    {
      type: "input",
      name: "docsDir",
      message: "What directory should contain your documentation?",
      default: "docs",
      validate: (input: string) =>
        /^[a-zA-Z0-9_-]+$/.test(input) || "Directory name must be alphanumeric",
    },
    {
      type: "input",
      name: "tasksDir",
      message: "What directory should contain your tasks?",
      default: "tasks",
      validate: (input: string) =>
        /^[a-zA-Z0-9_-]+$/.test(input) || "Directory name must be alphanumeric",
    },
    {
      type: "confirm",
      name: "setupTaskTypes",
      message: "Do you want to customize task types?",
      default: false,
    },
    {
      type: "checkbox",
      name: "enableFeatures",
      message: "Which features would you like to enable?",
      choices: [
        { name: "Hot-reload (recommended)", value: "hotReload", checked: true },
        { name: "Dark mode support", value: "darkMode", checked: true },
        { name: "Search functionality", value: "search", checked: true },
        { name: "Analytics tracking", value: "analytics", checked: false },
        {
          name: "Collaboration features",
          value: "collaboration",
          checked: false,
        },
      ],
    },
    {
      type: "list",
      name: "defaultLanguage",
      message: "What is your preferred language?",
      choices: [
        { name: "English", value: "en" },
        { name: "Français", value: "fr" },
        { name: "Español", value: "es" },
      ],
      default: "en",
    },
    {
      type: "list",
      name: "theme",
      message: "Choose a theme:",
      choices: [
        { name: "Default theme", value: "default" },
        { name: "Custom theme (advanced)", value: "custom" },
      ],
      default: "default",
    },
    {
      type: "confirm",
      name: "createDirectories",
      message: "Should we create the directory structure for you?",
      default: true,
    },
  ]);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function setupCustomTaskTypes(): Promise<GitionTaskType[]> {
  const taskTypes: GitionTaskType[] = [];
  let addMore = true;

  while (addMore) {
    const taskType = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Task type name:",
        validate: (input: string) =>
          input.trim().length > 0 || "Name is required",
      },
      {
        type: "input",
        name: "folder",
        message: "Folder name:",
        validate: (input: string) =>
          /^[a-zA-Z0-9_-]+$/.test(input) || "Folder name must be alphanumeric",
      },
      {
        type: "input",
        name: "description",
        message: "Description (optional):",
      },
      {
        type: "list",
        name: "defaultPriority",
        message: "Default priority:",
        choices: ["low", "medium", "high", "critical"],
        default: "medium",
      },
      {
        type: "input",
        name: "color",
        message: "Color (optional):",
        default: "blue",
      },
    ]);

    taskTypes.push(taskType);

    const { continueAdding } = await inquirer.prompt([
      {
        type: "confirm",
        name: "continueAdding",
        message: "Add another task type?",
        default: false,
      },
    ]);

    addMore = continueAdding;
  }

  return taskTypes;
}

function generateConfig(answers: InitAnswers): Partial<GitionConfig> {
  const config: Partial<GitionConfig> = {
    name: answers.name,
    description: answers.description,
    docsDir: answers.docsDir,
    tasksDir: answers.tasksDir,
    defaultLanguage: answers.defaultLanguage,
    features: {
      hotReload: answers.enableFeatures.includes("hotReload"),
      darkMode: answers.enableFeatures.includes("darkMode"),
      search: answers.enableFeatures.includes("search"),
      analytics: answers.enableFeatures.includes("analytics"),
      collaboration: answers.enableFeatures.includes("collaboration"),
    },
  };

  if (answers.setupTaskTypes && answers.taskTypes.length > 0) {
    config.taskTypes = answers.taskTypes;
    config.defaultTaskType = answers.taskTypes[0].name;
  }

  return config;
}

function createWorkspaceDirectories(
  targetDir: string,
  config: Partial<GitionConfig>
) {
  const docsDir = join(targetDir, config.docsDir || "docs");
  const tasksDir = join(targetDir, config.tasksDir || "tasks");

  // Create main directories
  if (!existsSync(docsDir)) {
    mkdirSync(docsDir, { recursive: true });
    console.log(`📁 Created directory: ${config.docsDir}`);
  }

  if (!existsSync(tasksDir)) {
    mkdirSync(tasksDir, { recursive: true });
    console.log(`📁 Created directory: ${config.tasksDir}`);
  }

  // Create task type subdirectories
  if (config.taskTypes) {
    config.taskTypes.forEach((taskType) => {
      const taskTypeDir = join(tasksDir, taskType.folder);
      if (!existsSync(taskTypeDir)) {
        mkdirSync(taskTypeDir, { recursive: true });
        console.log(
          `📁 Created task directory: ${config.tasksDir}/${taskType.folder}`
        );
      }
    });
  } else {
    // Create default task directories
    const defaultDirs = ["epics", "stories", "tasks", "bugs"];
    defaultDirs.forEach((dir) => {
      const taskDir = join(tasksDir, dir);
      if (!existsSync(taskDir)) {
        mkdirSync(taskDir, { recursive: true });
        console.log(`📁 Created task directory: ${config.tasksDir}/${dir}`);
      }
    });
  }

  // Create assets directory
  const assetsDir = join(targetDir, "assets");
  if (!existsSync(assetsDir)) {
    mkdirSync(assetsDir, { recursive: true });
    console.log("📁 Created directory: assets");
  }
}

async function createExampleFiles(
  targetDir: string,
  config: Partial<GitionConfig>
) {
  const docsDir = join(targetDir, config.docsDir || "docs");
  const tasksDir = join(targetDir, config.tasksDir || "tasks");

  // Create welcome documentation file
  const welcomeDoc = `---
title: Welcome to ${config.name || "Gition"}
description: Getting started with your new workspace
tags: [\"getting-started\", \"welcome\"]
author: Gition
date: ${new Date().toISOString().split("T")[0]}
status: published
---

# Welcome to ${config.name || "Gition"}

${config.description || "This is your new documentation and task management workspace."}

## Getting Started

1. **Documentation**: Add your markdown files to the \`${config.docsDir || "docs"}\` directory
2. **Tasks**: Create task files in the \`${config.tasksDir || "tasks"}\` directory
3. **Hot-reload**: Edit files in your editor and see changes instantly in the browser

## Features Enabled

${config.features?.hotReload ? "✅" : "❌"} Hot-reload
${config.features?.darkMode ? "✅" : "❌"} Dark mode
${config.features?.search ? "✅" : "❌"} Search
${config.features?.analytics ? "✅" : "❌"} Analytics
${config.features?.collaboration ? "✅" : "❌"} Collaboration

## Next Steps

- Explore the sidebar to navigate your content
- Create new markdown files in your directories
- Use the task management features to organize your work
- Customize your configuration in \`.gitionrc/config.yaml\`

Happy documenting! 🚀
`;

  const welcomePath = join(docsDir, "welcome.md");
  writeFileSync(welcomePath, welcomeDoc);
  console.log(`📄 Created example file: ${config.docsDir}/welcome.md`);

  // Create example task file
  const exampleTask = `---
title: Example Task
description: This is an example task to demonstrate the task management features
tags: [\"example\", \"getting-started\"]
priority: medium
status: todo
author: Gition
date: ${new Date().toISOString().split("T")[0]}
---

# Example Task

This is an example task file to help you understand how tasks work in Gition.

## Description

Tasks are markdown files that can contain:
- Frontmatter metadata (title, description, priority, etc.)
- Rich markdown content
- Subtasks using checkbox syntax

## Subtasks

- [ ] Learn about Gition task management
- [ ] Create your first real task
- [ ] Organize tasks by priority and status
- [~] Example in-progress subtask
- [x] This subtask is completed

## Acceptance Criteria

- [ ] Task management interface is working
- [ ] Hot-reload updates task status
- [ ] Subtasks can be checked/unchecked

## Notes

You can use any markdown syntax in your tasks:

\`\`\`javascript
// Code examples
console.log('Hello, Gition!');
\`\`\`

> Blockquotes for important notes

**Bold text** and *italic text* for emphasis.
`;

  const taskPath = join(tasksDir, "tasks", "example-task.md");
  if (!existsSync(join(tasksDir, "tasks"))) {
    mkdirSync(join(tasksDir, "tasks"), { recursive: true });
  }
  writeFileSync(taskPath, exampleTask);
  console.log(
    `📄 Created example file: ${config.tasksDir}/tasks/example-task.md`
  );
}

// CLI interface
if (require.main === module) {
  const targetDir = process.argv[2] || process.cwd();
  initializeProject(targetDir).catch((error) => {
    console.error("❌ Initialization failed:", error);
    process.exit(1);
  });
}
