import {
  DEFAULT_CONFIG,
  type GitionConfig,
  type GitionTaskType,
  type GitionUser,
  getTaskTypeByFolder,
  getUserById,
  mergeConfig,
  validateConfig,
} from "../config";

describe("Config Model Utils", () => {
  describe("DEFAULT_CONFIG", () => {
    it("should have all required properties", () => {
      expect(DEFAULT_CONFIG.name).toBe("Gition Workspace");
      expect(DEFAULT_CONFIG.docsDir).toBe("docs");
      expect(DEFAULT_CONFIG.tasksDir).toBe("tasks");
      expect(DEFAULT_CONFIG.port).toBe(3000);
      expect(DEFAULT_CONFIG.taskTypes).toHaveLength(4);
      expect(DEFAULT_CONFIG.features.hotReload).toBe(true);
      expect(DEFAULT_CONFIG.defaultLanguage).toBe("en");
    });
  });

  describe("validateConfig", () => {
    it("should validate a valid config", () => {
      const config: Partial<GitionConfig> = {
        name: "My Workspace",
        port: 3001,
        docsDir: "documentation",
        tasksDir: "todos",
      };

      const result = validateConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject invalid name type", () => {
      const config = {
        name: 123 as unknown as string,
      };

      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("config.name must be a string");
    });

    it("should reject invalid port", () => {
      const config = {
        port: 70000,
      };

      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "config.port must be a number between 1 and 65535"
      );
    });

    it("should validate task types", () => {
      const config = {
        taskTypes: [
          { name: "Feature", folder: "features" },
          { name: "Bug" }, // Missing folder
        ] as GitionTaskType[],
      };

      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "config.taskTypes[1].folder is required and must be a string"
      );
    });

    it("should validate users", () => {
      const config = {
        users: [
          { id: "1", name: "John" },
          { name: "Jane" }, // Missing id
        ] as GitionUser[],
      };

      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "config.users[1].id is required and must be a string"
      );
    });
  });

  describe("mergeConfig", () => {
    it("should merge configs correctly", () => {
      const base: GitionConfig = {
        name: "Base",
        port: 3000,
        theme: {
          primaryColor: "blue",
        },
        features: {
          hotReload: true,
          darkMode: false,
        },
      };

      const override: Partial<GitionConfig> = {
        name: "Override",
        theme: {
          primaryColor: "red",
          backgroundColor: "white",
        },
        features: {
          darkMode: true,
        },
      };

      const merged = mergeConfig(base, override);

      expect(merged.name).toBe("Override");
      expect(merged.port).toBe(3000);
      expect(merged.theme?.primaryColor).toBe("red");
      expect(merged.theme?.backgroundColor).toBe("white");
      expect(merged.features?.hotReload).toBe(true);
      expect(merged.features?.darkMode).toBe(true);
    });

    it("should handle empty override", () => {
      const base: GitionConfig = {
        name: "Base",
        port: 3000,
      };

      const merged = mergeConfig(base, {});
      // mergeConfig always adds theme, features, markdown, and paths objects
      expect(merged).toEqual({
        name: "Base",
        port: 3000,
        theme: {},
        features: {},
        markdown: {},
        paths: {},
      });
    });
  });

  describe("getTaskTypeByFolder", () => {
    const config: GitionConfig = {
      taskTypes: [
        { name: "Epic", folder: "epics" },
        { name: "Story", folder: "stories" },
        { name: "Bug", folder: "bugs" },
      ],
    };

    it("should find task type by folder", () => {
      const taskType = getTaskTypeByFolder(config, "stories");
      expect(taskType).toBeDefined();
      expect(taskType?.name).toBe("Story");
      expect(taskType?.folder).toBe("stories");
    });

    it("should return undefined for unknown folder", () => {
      const taskType = getTaskTypeByFolder(config, "features");
      expect(taskType).toBeUndefined();
    });

    it("should handle config without taskTypes", () => {
      const taskType = getTaskTypeByFolder({}, "stories");
      expect(taskType).toBeUndefined();
    });
  });

  describe("getUserById", () => {
    const config: GitionConfig = {
      users: [
        { id: "user1", name: "John Doe", email: "john@example.com" },
        { id: "user2", name: "Jane Smith", role: "admin" },
      ],
    };

    it("should find user by id", () => {
      const user = getUserById(config, "user1");
      expect(user).toBeDefined();
      expect(user?.name).toBe("John Doe");
      expect(user?.email).toBe("john@example.com");
    });

    it("should return undefined for unknown user", () => {
      const user = getUserById(config, "user3");
      expect(user).toBeUndefined();
    });

    it("should handle config without users", () => {
      const user = getUserById({}, "user1");
      expect(user).toBeUndefined();
    });
  });
});
