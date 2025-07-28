/* eslint-disable @typescript-eslint/no-require-imports */
import { jest } from "@jest/globals";

// Mock fs module
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

// Mock js-yaml
jest.mock("js-yaml", () => ({
  load: jest.fn(),
  dump: jest.fn(),
}));

// Mock path module for Windows/Unix compatibility
jest.mock("path", () => ({
  ...jest.requireActual("path"),
  join: (...args: string[]) => args.join("/"),
  resolve: (...args: string[]) => args.join("/"),
}));

// Import after mocking
const { ConfigManager } = require("../config");
const mockFs = require("fs");
const mockYaml = require("js-yaml");

describe("ConfigManager", () => {
  const mockWorkspaceDir = "/test/workspace";

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks to default behavior
    mockFs.existsSync.mockReturnValue(false);
    mockFs.mkdirSync.mockImplementation();
    mockFs.readFileSync.mockReturnValue("");
    mockFs.writeFileSync.mockImplementation();
    mockYaml.load.mockReturnValue({});
    mockYaml.dump.mockReturnValue("yaml content");
  });

  describe("constructor", () => {
    it("should initialize with workspace directory", () => {
      const configManager = new ConfigManager(mockWorkspaceDir);

      expect(configManager.getConfigDir()).toBe("/test/workspace/.gitionrc");
      expect(configManager.getConfigPath()).toBe(
        "/test/workspace/.gitionrc/config.yaml"
      );
    });

    it("should use default config when file does not exist", () => {
      mockFs.existsSync.mockReturnValue(false);

      const configManager = new ConfigManager(mockWorkspaceDir);
      const config = configManager.getConfig();

      expect(config.name).toBe("Gition Workspace");
      expect(config.port).toBe(3000);
    });

    it("should load existing config file", () => {
      const mockConfig = {
        name: "Test Workspace",
        port: 3001,
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue("config content");
      mockYaml.load.mockReturnValue(mockConfig);

      const configManager = new ConfigManager(mockWorkspaceDir);
      const config = configManager.getConfig();

      expect(config.name).toBe("Test Workspace");
      expect(config.port).toBe(3001);
    });

    it("should handle YAML parse errors gracefully", () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue("invalid yaml");
      mockYaml.load.mockImplementation(() => {
        throw new Error("Invalid YAML");
      });

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const configManager = new ConfigManager(mockWorkspaceDir);
      const config = configManager.getConfig();

      expect(config.name).toBe("Gition Workspace"); // Should fall back to default
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("saveConfig", () => {
    it("should save config to file", () => {
      const configManager = new ConfigManager(mockWorkspaceDir);

      configManager.saveConfig({ name: "Updated Workspace" });

      expect(mockFs.writeFileSync).toHaveBeenCalled();
      expect(mockYaml.dump).toHaveBeenCalled();
    });

    it("should merge config correctly", () => {
      const configManager = new ConfigManager(mockWorkspaceDir);

      configManager.saveConfig({
        theme: {
          primaryColor: "red",
        },
      });

      const config = configManager.getConfig();
      expect(config.theme?.primaryColor).toBe("red");
    });
  });

  describe("get", () => {
    it("should get nested config values with dot notation", () => {
      const configManager = new ConfigManager(mockWorkspaceDir);

      expect(configManager.get<string>("name")).toBe("Gition Workspace");
      expect(configManager.get<number>("port")).toBe(3000);
      expect(configManager.get<boolean>("features.hotReload")).toBe(true);
    });

    it("should return undefined for non-existent paths", () => {
      const configManager = new ConfigManager(mockWorkspaceDir);

      expect(configManager.get("nonexistent")).toBeUndefined();
      expect(configManager.get("features.nonexistent")).toBeUndefined();
    });
  });

  describe("set", () => {
    it("should set nested config values with dot notation", () => {
      const configManager = new ConfigManager(mockWorkspaceDir);

      configManager.set("theme.primaryColor", "blue");

      expect(configManager.get("theme.primaryColor")).toBe("blue");
      expect(mockFs.writeFileSync).toHaveBeenCalled();
    });

    it("should create nested objects as needed", () => {
      const configManager = new ConfigManager(mockWorkspaceDir);

      configManager.set("newSection.newValue", "test");

      expect(configManager.get("newSection.newValue")).toBe("test");
    });
  });

  describe("initializeConfig", () => {
    it("should initialize with default config", () => {
      const configManager = new ConfigManager(mockWorkspaceDir);
      configManager.initializeConfig();

      expect(mockFs.writeFileSync).toHaveBeenCalled();
    });

    it("should initialize with custom config", () => {
      const configManager = new ConfigManager(mockWorkspaceDir);
      configManager.initializeConfig({ name: "Custom Workspace" });

      expect(mockFs.writeFileSync).toHaveBeenCalled();
    });
  });

  describe("configExists", () => {
    it("should return true when config file exists", () => {
      mockFs.existsSync.mockReturnValue(true);

      const configManager = new ConfigManager(mockWorkspaceDir);
      expect(configManager.configExists()).toBe(true);
    });

    it("should return false when config file does not exist", () => {
      mockFs.existsSync.mockReturnValue(false);

      const configManager = new ConfigManager(mockWorkspaceDir);
      expect(configManager.configExists()).toBe(false);
    });
  });
});
