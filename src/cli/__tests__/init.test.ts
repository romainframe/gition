/* eslint-disable @typescript-eslint/no-explicit-any */
import { existsSync, mkdirSync } from "fs";
import inquirer from "inquirer";

import { ConfigManager } from "@/lib/config";

import { initializeProject } from "../init";

// Mock dependencies
jest.mock("fs");
jest.mock("inquirer");
jest.mock("@/lib/config");

const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
const mockMkdirSync = mkdirSync as jest.MockedFunction<typeof mkdirSync>;
const mockInquirer = inquirer as jest.Mocked<typeof inquirer>;
const MockConfigManager = ConfigManager as jest.MockedClass<
  typeof ConfigManager
>;

describe("CLI Init Module", () => {
  let mockConfigManager: jest.Mocked<ConfigManager>;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock console methods
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    // Setup ConfigManager mock
    mockConfigManager = {
      configExists: jest.fn(),
      initializeConfig: jest.fn(),
      getConfigPath: jest.fn(),
    } as any;
    MockConfigManager.mockImplementation(() => mockConfigManager);

    // Default fs mocks
    mockExistsSync.mockReturnValue(true);
    mockMkdirSync.mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe("initializeProject", () => {
    it("should initialize project with default answers", async () => {
      // Mock configuration doesn't exist
      mockConfigManager.configExists.mockReturnValue(false);
      mockConfigManager.getConfigPath.mockReturnValue(".gitionrc/config.yaml");

      // Mock user inputs
      mockInquirer.prompt.mockResolvedValueOnce({
        name: "Test Workspace",
        description: "Test description",
        docsDir: "docs",
        tasksDir: "tasks",
        setupTaskTypes: false,
        enableFeatures: ["hotReload", "darkMode"],
        defaultLanguage: "en",
        theme: "default",
        createDirectories: true,
      });

      await initializeProject("/test/dir");

      expect(MockConfigManager).toHaveBeenCalledWith("/test/dir");
      expect(mockConfigManager.configExists).toHaveBeenCalled();
      expect(mockConfigManager.initializeConfig).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "🚀 Welcome to Gition! Let's set up your workspace.\n"
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "✅ Configuration saved to .gitionrc/config.yaml"
      );
    });

    it("should prompt for overwrite when config exists", async () => {
      mockConfigManager.configExists.mockReturnValue(true);

      // Mock overwrite confirmation
      mockInquirer.prompt.mockResolvedValueOnce({ overwrite: false });

      await initializeProject("/test/dir");

      expect(mockInquirer.prompt).toHaveBeenCalledWith([
        {
          type: "confirm",
          name: "overwrite",
          message:
            "A .gitionrc configuration already exists. Do you want to overwrite it?",
          default: false,
        },
      ]);
      expect(consoleLogSpy).toHaveBeenCalledWith("Initialization cancelled.");
    });

    it("should proceed with overwrite when confirmed", async () => {
      mockConfigManager.configExists.mockReturnValue(true);
      mockConfigManager.getConfigPath.mockReturnValue(".gitionrc/config.yaml");

      // Mock overwrite confirmation and main config
      mockInquirer.prompt
        .mockResolvedValueOnce({ overwrite: true })
        .mockResolvedValueOnce({
          name: "Test Workspace",
          description: "Test description",
          docsDir: "docs",
          tasksDir: "tasks",
          setupTaskTypes: false,
          enableFeatures: ["hotReload"],
          defaultLanguage: "en",
          theme: "default",
          createDirectories: false,
        });

      await initializeProject("/test/dir");

      expect(mockConfigManager.initializeConfig).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "✅ Configuration saved to .gitionrc/config.yaml"
      );
    });

    it("should handle custom task types setup", async () => {
      mockConfigManager.configExists.mockReturnValue(false);
      mockConfigManager.getConfigPath.mockReturnValue(".gitionrc/config.yaml");

      // Mock main config with custom task types
      mockInquirer.prompt
        .mockResolvedValueOnce({
          name: "Test Workspace",
          description: "Test description",
          docsDir: "docs",
          tasksDir: "tasks",
          setupTaskTypes: true,
          enableFeatures: ["hotReload"],
          defaultLanguage: "en",
          theme: "default",
          createDirectories: false,
        })
        // Mock task type creation
        .mockResolvedValueOnce({
          name: "Epic",
          folder: "epics",
          description: "Large features",
          defaultPriority: "high",
          color: "blue",
        })
        .mockResolvedValueOnce({ continueAdding: false });

      await initializeProject("/test/dir");

      expect(mockConfigManager.initializeConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          taskTypes: [
            {
              name: "Epic",
              folder: "epics",
              description: "Large features",
              defaultPriority: "high",
              color: "blue",
            },
          ],
          defaultTaskType: "Epic",
        })
      );
    });

    it("should create directories when requested", async () => {
      mockConfigManager.configExists.mockReturnValue(false);
      mockConfigManager.getConfigPath.mockReturnValue(".gitionrc/config.yaml");
      mockExistsSync.mockReturnValue(false); // Directories don't exist

      mockInquirer.prompt.mockResolvedValueOnce({
        name: "Test Workspace",
        description: "Test description",
        docsDir: "docs",
        tasksDir: "tasks",
        setupTaskTypes: false,
        enableFeatures: [],
        defaultLanguage: "en",
        theme: "default",
        createDirectories: true,
      });

      await initializeProject("/test/dir");

      expect(mockMkdirSync).toHaveBeenCalledWith("/test/dir/docs", {
        recursive: true,
      });
      expect(mockMkdirSync).toHaveBeenCalledWith("/test/dir/tasks", {
        recursive: true,
      });
      expect(mockMkdirSync).toHaveBeenCalledWith("/test/dir/assets", {
        recursive: true,
      });
    });

    it("should validate directory names", async () => {
      mockConfigManager.configExists.mockReturnValue(false);

      // Test directory name validation

      // Mock the prompt to trigger validation
      mockInquirer.prompt.mockImplementation(async (questions: any[]) => {
        const docsQuestion = questions.find((q) => q.name === "docsDir");
        const tasksQuestion = questions.find((q) => q.name === "tasksDir");

        if (docsQuestion?.validate) {
          expect(docsQuestion.validate("valid-dir")).toBe(true);
          expect(docsQuestion.validate("invalid/dir")).toBe(
            "Directory name must be alphanumeric"
          );
        }

        if (tasksQuestion?.validate) {
          expect(tasksQuestion.validate("valid-dir")).toBe(true);
          expect(tasksQuestion.validate("invalid/dir")).toBe(
            "Directory name must be alphanumeric"
          );
        }

        return {
          name: "Test",
          description: "Test",
          docsDir: "docs",
          tasksDir: "tasks",
          setupTaskTypes: false,
          enableFeatures: [],
          defaultLanguage: "en",
          theme: "default",
          createDirectories: false,
        };
      });

      await initializeProject("/test/dir");
    });

    it("should handle multiple task types creation", async () => {
      mockConfigManager.configExists.mockReturnValue(false);
      mockConfigManager.getConfigPath.mockReturnValue(".gitionrc/config.yaml");

      mockInquirer.prompt
        .mockResolvedValueOnce({
          name: "Test Workspace",
          description: "Test description",
          docsDir: "docs",
          tasksDir: "tasks",
          setupTaskTypes: true,
          enableFeatures: [],
          defaultLanguage: "en",
          theme: "default",
          createDirectories: false,
        })
        // First task type
        .mockResolvedValueOnce({
          name: "Epic",
          folder: "epics",
          description: "Large features",
          defaultPriority: "high",
          color: "blue",
        })
        .mockResolvedValueOnce({ continueAdding: true })
        // Second task type
        .mockResolvedValueOnce({
          name: "Story",
          folder: "stories",
          description: "User stories",
          defaultPriority: "medium",
          color: "green",
        })
        .mockResolvedValueOnce({ continueAdding: false });

      await initializeProject("/test/dir");

      expect(mockConfigManager.initializeConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          taskTypes: [
            {
              name: "Epic",
              folder: "epics",
              description: "Large features",
              defaultPriority: "high",
              color: "blue",
            },
            {
              name: "Story",
              folder: "stories",
              description: "User stories",
              defaultPriority: "medium",
              color: "green",
            },
          ],
          defaultTaskType: "Epic",
        })
      );
    });

    it("should create default task directories when no custom types", async () => {
      mockConfigManager.configExists.mockReturnValue(false);
      mockConfigManager.getConfigPath.mockReturnValue(".gitionrc/config.yaml");
      mockExistsSync.mockReturnValue(false);

      mockInquirer.prompt.mockResolvedValueOnce({
        name: "Test Workspace",
        description: "Test description",
        docsDir: "docs",
        tasksDir: "tasks",
        setupTaskTypes: false,
        enableFeatures: [],
        defaultLanguage: "en",
        theme: "default",
        createDirectories: true,
      });

      await initializeProject("/test/dir");

      // Check default task directories are created
      expect(mockMkdirSync).toHaveBeenCalledWith("/test/dir/tasks/epics", {
        recursive: true,
      });
      expect(mockMkdirSync).toHaveBeenCalledWith("/test/dir/tasks/stories", {
        recursive: true,
      });
      expect(mockMkdirSync).toHaveBeenCalledWith("/test/dir/tasks/tasks", {
        recursive: true,
      });
      expect(mockMkdirSync).toHaveBeenCalledWith("/test/dir/tasks/bugs", {
        recursive: true,
      });
    });

    it("should generate proper configuration object", async () => {
      mockConfigManager.configExists.mockReturnValue(false);
      mockConfigManager.getConfigPath.mockReturnValue(".gitionrc/config.yaml");

      mockInquirer.prompt.mockResolvedValueOnce({
        name: "My Workspace",
        description: "Custom description",
        docsDir: "documentation",
        tasksDir: "issues",
        setupTaskTypes: false,
        enableFeatures: ["hotReload", "darkMode", "search"],
        defaultLanguage: "fr",
        theme: "custom",
        createDirectories: false,
      });

      await initializeProject("/test/dir");

      expect(mockConfigManager.initializeConfig).toHaveBeenCalledWith({
        name: "My Workspace",
        description: "Custom description",
        docsDir: "documentation",
        tasksDir: "issues",
        defaultLanguage: "fr",
        features: {
          hotReload: true,
          darkMode: true,
          search: true,
          analytics: false,
          collaboration: false,
        },
      });
    });

    it("should use default current working directory", async () => {
      const originalCwd = process.cwd();
      jest.spyOn(process, "cwd").mockReturnValue("/default/cwd");

      mockConfigManager.configExists.mockReturnValue(false);
      mockConfigManager.getConfigPath.mockReturnValue(".gitionrc/config.yaml");

      mockInquirer.prompt.mockResolvedValueOnce({
        name: "Test",
        description: "Test",
        docsDir: "docs",
        tasksDir: "tasks",
        setupTaskTypes: false,
        enableFeatures: [],
        defaultLanguage: "en",
        theme: "default",
        createDirectories: false,
      });

      await initializeProject();

      expect(MockConfigManager).toHaveBeenCalledWith("/default/cwd");

      jest.spyOn(process, "cwd").mockReturnValue(originalCwd);
    });
  });

  describe("input validation", () => {
    it("should validate workspace name is required", async () => {
      mockConfigManager.configExists.mockReturnValue(false);

      mockInquirer.prompt.mockImplementation(async (questions: any[]) => {
        const nameQuestion = questions.find((q) => q.name === "name");
        if (nameQuestion?.validate) {
          expect(nameQuestion.validate("")).toBe("Name is required");
          expect(nameQuestion.validate("   ")).toBe("Name is required");
          expect(nameQuestion.validate("Valid Name")).toBe(true);
        }

        return {
          name: "Valid Name",
          description: "Test",
          docsDir: "docs",
          tasksDir: "tasks",
          setupTaskTypes: false,
          enableFeatures: [],
          defaultLanguage: "en",
          theme: "default",
          createDirectories: false,
        };
      });

      await initializeProject("/test/dir");
    });

    it("should validate task type names are required", async () => {
      mockConfigManager.configExists.mockReturnValue(false);

      mockInquirer.prompt
        .mockResolvedValueOnce({
          name: "Test",
          description: "Test",
          docsDir: "docs",
          tasksDir: "tasks",
          setupTaskTypes: true,
          enableFeatures: [],
          defaultLanguage: "en",
          theme: "default",
          createDirectories: false,
        })
        .mockImplementation(async (questions: any[]) => {
          const nameQuestion = questions.find((q) => q.name === "name");
          const folderQuestion = questions.find((q) => q.name === "folder");

          if (nameQuestion?.validate) {
            expect(nameQuestion.validate("")).toBe("Name is required");
            expect(nameQuestion.validate("Valid")).toBe(true);
          }

          if (folderQuestion?.validate) {
            expect(folderQuestion.validate("invalid/folder")).toBe(
              "Folder name must be alphanumeric"
            );
            expect(folderQuestion.validate("valid-folder")).toBe(true);
          }

          return {
            name: "Valid",
            folder: "valid",
            description: "Test",
            defaultPriority: "medium",
            color: "blue",
          };
        })
        .mockResolvedValueOnce({ continueAdding: false });

      await initializeProject("/test/dir");
    });
  });
});
