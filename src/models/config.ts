/**
 * Configuration data models for Gition
 * Contains interfaces for system configuration and customization
 */

export interface GitionThemeConfig {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  borderRadius?: string;
  fontFamily?: string;
  fontSize?: {
    small?: string;
    medium?: string;
    large?: string;
  };
}

export interface GitionTaskType {
  name: string; // task type display name
  folder: string; // directory name for this type
  icon?: string; // icon identifier
  color?: string; // color theme
  description?: string; // type description
  defaultPriority?: "low" | "medium" | "high" | "critical"; // default priority for new tasks
}

export interface GitionUser {
  id: string; // unique user identifier
  name: string; // display name
  email?: string; // email address
  avatar?: string; // avatar URL or path
  role?: "viewer" | "editor" | "admin"; // user role/permissions
}

export interface GitionEnvironmentVars {
  [key: string]: string | number | boolean;
}

export interface GitionConfig {
  // Basic settings
  name?: string; // workspace name
  description?: string; // workspace description
  version?: string; // configuration version

  // Directories
  docsDir?: string; // documentation directory name
  tasksDir?: string; // tasks directory name
  outputDir?: string; // build output directory

  // Theme customization
  theme?: GitionThemeConfig; // theme configuration

  // Task management
  taskTypes?: GitionTaskType[]; // custom task type definitions
  defaultTaskType?: string; // default task type for new tasks

  // Users and collaboration
  users?: GitionUser[]; // project users
  defaultAssignee?: string; // default assignee for new tasks

  // Environment variables
  env?: GitionEnvironmentVars; // custom environment variables

  // Server settings
  port?: number; // server port
  host?: string; // server host

  // Feature flags
  features?: {
    hotReload?: boolean; // file watching and hot reload
    darkMode?: boolean; // dark mode support
    search?: boolean; // search functionality
    analytics?: boolean; // usage analytics
    collaboration?: boolean; // collaboration features
  };

  // Internationalization
  defaultLanguage?: "en" | "fr" | "es"; // default UI language
  supportedLanguages?: ("en" | "fr" | "es")[]; // supported languages

  // Advanced settings
  markdown?: {
    enableMermaid?: boolean; // Mermaid diagram rendering
    enableCodeHighlighting?: boolean; // syntax highlighting
    enableTables?: boolean; // table support
    enableMath?: boolean; // math rendering
  };

  // Custom paths
  paths?: {
    assets?: string; // assets directory
    uploads?: string; // uploads directory
    templates?: string; // templates directory
  };

  // Allow additional properties
  [key: string]: unknown;
}

// Default configuration values
export const DEFAULT_CONFIG: Required<GitionConfig> = {
  name: "Gition Workspace",
  description: "Documentation and task management workspace",
  version: "1.0.0",

  docsDir: "docs",
  tasksDir: "tasks",
  outputDir: ".gition/build",

  theme: {
    primaryColor: "hsl(var(--primary))",
    backgroundColor: "hsl(var(--background))",
    textColor: "hsl(var(--foreground))",
    accentColor: "hsl(var(--accent))",
    borderRadius: "0.5rem",
    fontFamily: "var(--font-geist-sans)",
    fontSize: {
      small: "0.875rem",
      medium: "1rem",
      large: "1.125rem",
    },
  },

  taskTypes: [
    {
      name: "Epic",
      folder: "epics",
      icon: "Target",
      color: "purple",
      description: "Large features or initiatives",
      defaultPriority: "high",
    },
    {
      name: "Story",
      folder: "stories",
      icon: "Archive",
      color: "blue",
      description: "User stories and features",
      defaultPriority: "medium",
    },
    {
      name: "Task",
      folder: "tasks",
      icon: "FileText",
      color: "green",
      description: "Individual tasks and todos",
      defaultPriority: "medium",
    },
    {
      name: "Bug",
      folder: "bugs",
      icon: "AlertCircle",
      color: "red",
      description: "Bug reports and fixes",
      defaultPriority: "high",
    },
  ],
  defaultTaskType: "Task",

  users: [],
  defaultAssignee: "",

  env: {},

  port: 3000,
  host: "localhost",

  features: {
    hotReload: true,
    darkMode: true,
    search: true,
    analytics: false,
    collaboration: false,
  },

  defaultLanguage: "en",
  supportedLanguages: ["en", "fr", "es"],

  markdown: {
    enableMermaid: true,
    enableCodeHighlighting: true,
    enableTables: true,
    enableMath: false,
  },

  paths: {
    assets: "assets",
    uploads: "uploads",
    templates: "templates",
  },
};

// Configuration validation helpers
export const validateConfig = (
  config: Partial<GitionConfig>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate basic types
  if (config.name && typeof config.name !== "string") {
    errors.push("config.name must be a string");
  }

  if (
    config.port &&
    (typeof config.port !== "number" || config.port < 1 || config.port > 65535)
  ) {
    errors.push("config.port must be a number between 1 and 65535");
  }

  if (config.docsDir && typeof config.docsDir !== "string") {
    errors.push("config.docsDir must be a string");
  }

  if (config.tasksDir && typeof config.tasksDir !== "string") {
    errors.push("config.tasksDir must be a string");
  }

  // Validate task types
  if (config.taskTypes) {
    if (!Array.isArray(config.taskTypes)) {
      errors.push("config.taskTypes must be an array");
    } else {
      config.taskTypes.forEach((taskType, index) => {
        if (!taskType.name || typeof taskType.name !== "string") {
          errors.push(
            `config.taskTypes[${index}].name is required and must be a string`
          );
        }
        if (!taskType.folder || typeof taskType.folder !== "string") {
          errors.push(
            `config.taskTypes[${index}].folder is required and must be a string`
          );
        }
      });
    }
  }

  // Validate users
  if (config.users) {
    if (!Array.isArray(config.users)) {
      errors.push("config.users must be an array");
    } else {
      config.users.forEach((user, index) => {
        if (!user.id || typeof user.id !== "string") {
          errors.push(
            `config.users[${index}].id is required and must be a string`
          );
        }
        if (!user.name || typeof user.name !== "string") {
          errors.push(
            `config.users[${index}].name is required and must be a string`
          );
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Helper functions
export const mergeConfig = (
  base: GitionConfig,
  override: Partial<GitionConfig>
): GitionConfig => {
  return {
    ...base,
    ...override,
    theme: { ...base.theme, ...override.theme },
    features: { ...base.features, ...override.features },
    markdown: { ...base.markdown, ...override.markdown },
    paths: { ...base.paths, ...override.paths },
  };
};

export const getTaskTypeByFolder = (
  config: GitionConfig,
  folder: string
): GitionTaskType | undefined => {
  return config.taskTypes?.find((type) => type.folder === folder);
};

export const getUserById = (
  config: GitionConfig,
  userId: string
): GitionUser | undefined => {
  return config.users?.find((user) => user.id === userId);
};
