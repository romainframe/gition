import * as configTypes from "../config";

// Mock the config models module
jest.mock("@/models/config", () => ({
  DEFAULT_CONFIG: {
    theme: "light",
    language: "en",
    taskTypes: [],
    users: [],
  },
  validateConfig: jest.fn(),
  mergeConfig: jest.fn(),
  getTaskTypeByFolder: jest.fn(),
  getUserById: jest.fn(),
}));

describe("types/config re-exports", () => {
  it("should re-export config constants", () => {
    expect(configTypes.DEFAULT_CONFIG).toBeDefined();
    expect(typeof configTypes.DEFAULT_CONFIG).toBe("object");
  });

  it("should re-export config utility functions", () => {
    expect(typeof configTypes.validateConfig).toBe("function");
    expect(typeof configTypes.mergeConfig).toBe("function");
    expect(typeof configTypes.getTaskTypeByFolder).toBe("function");
    expect(typeof configTypes.getUserById).toBe("function");
  });

  it("should provide backward compatibility for config exports", () => {
    // Test that the module can be imported without errors
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const configModule = require("../config");
      return configModule;
    }).not.toThrow();
  });

  it("should maintain type safety for re-exported functions", () => {
    // These functions should be available and callable
    expect(configTypes.validateConfig).toBeDefined();
    expect(configTypes.mergeConfig).toBeDefined();
    expect(configTypes.getTaskTypeByFolder).toBeDefined();
    expect(configTypes.getUserById).toBeDefined();
  });
});
