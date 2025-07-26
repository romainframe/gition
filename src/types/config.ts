// Configuration types for Gition

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
  name: string;
  folder: string;
  icon?: string;
  color?: string;
  description?: string;
  defaultPriority?: "low" | "medium" | "high" | "critical";
}

export interface GitionUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: "viewer" | "editor" | "admin";
}

export interface GitionEnvironmentVars {
  [key: string]: string | number | boolean;
}

export interface GitionConfig {
  // Basic settings
  name?: string;
  description?: string;
  version?: string;

  // Directories
  docsDir?: string;
  tasksDir?: string;
  outputDir?: string;

  // Theme customization
  theme?: GitionThemeConfig;

  // Task management
  taskTypes?: GitionTaskType[];
  defaultTaskType?: string;

  // Users and collaboration
  users?: GitionUser[];
  defaultAssignee?: string;

  // Environment variables
  env?: GitionEnvironmentVars;

  // Server settings
  port?: number;
  host?: string;

  // Feature flags
  features?: {
    hotReload?: boolean;
    darkMode?: boolean;
    search?: boolean;
    analytics?: boolean;
    collaboration?: boolean;
  };

  // Internationalization
  defaultLanguage?: "en" | "fr" | "es";
  supportedLanguages?: ("en" | "fr" | "es")[];

  // Advanced settings
  markdown?: {
    enableMermaid?: boolean;
    enableCodeHighlighting?: boolean;
    enableTables?: boolean;
    enableMath?: boolean;
  };

  // Custom paths
  paths?: {
    assets?: string;
    uploads?: string;
    templates?: string;
  };
}

// Default configuration
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

// Configuration validation schema (simple validation)
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
