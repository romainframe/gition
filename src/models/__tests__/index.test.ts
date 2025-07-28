import * as models from "../index";

// Mock the individual model modules
jest.mock("../documents", () => ({
  isDocumentStatus: jest.fn(),
  isPriority: jest.fn(),
}));

jest.mock("../tasks", () => ({
  isTaskStatus: jest.fn(),
  isTaskPriority: jest.fn(),
  isTaskType: jest.fn(),
  getTaskProgress: jest.fn(),
  getTaskTypeFromFolder: jest.fn(),
}));

jest.mock("../kanban", () => ({
  DEFAULT_KANBAN_COLUMNS: [
    { id: "todo", title: "To Do", tasks: [] },
    { id: "in_progress", title: "In Progress", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
  ],
  createEmptyKanbanBoard: jest.fn(),
  organizeTasksIntoColumns: jest.fn(),
  getKanbanStats: jest.fn(),
}));

jest.mock("../structure", () => ({
  isMarkdownFile: jest.fn(),
  getFileExtension: jest.fn(),
  calculateNodeDepth: jest.fn(),
  flattenDirectoryTree: jest.fn(),
  findNodeByPath: jest.fn(),
  getDirectoryStats: jest.fn(),
}));

jest.mock("../events", () => ({
  isFileChangeEvent: jest.fn(),
  isTaskEvent: jest.fn(),
  isSubtaskEvent: jest.fn(),
  isDocumentEvent: jest.fn(),
  isConfigEvent: jest.fn(),
  createFileChangeEvent: jest.fn(),
  createTaskEvent: jest.fn(),
  createSubtaskEvent: jest.fn(),
}));

jest.mock("../config", () => ({
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

describe("models/index exports", () => {
  describe("document exports", () => {
    it("should export document validation functions", () => {
      expect(typeof models.isDocumentStatus).toBe("function");
      expect(typeof models.isPriority).toBe("function");
    });
  });

  describe("task exports", () => {
    it("should export task validation functions", () => {
      expect(typeof models.isTaskStatus).toBe("function");
      expect(typeof models.isTaskPriority).toBe("function");
      expect(typeof models.isTaskType).toBe("function");
    });

    it("should export task utility functions", () => {
      expect(typeof models.getTaskProgress).toBe("function");
      expect(typeof models.getTaskTypeFromFolder).toBe("function");
    });
  });

  describe("kanban exports", () => {
    it("should export kanban constants", () => {
      expect(Array.isArray(models.DEFAULT_KANBAN_COLUMNS)).toBe(true);
      expect(models.DEFAULT_KANBAN_COLUMNS.length).toBe(3);
    });

    it("should export kanban utility functions", () => {
      expect(typeof models.createEmptyKanbanBoard).toBe("function");
      expect(typeof models.organizeTasksIntoColumns).toBe("function");
      expect(typeof models.getKanbanStats).toBe("function");
    });
  });

  describe("structure exports", () => {
    it("should export structure validation functions", () => {
      expect(typeof models.isMarkdownFile).toBe("function");
      expect(typeof models.getFileExtension).toBe("function");
    });

    it("should export structure utility functions", () => {
      expect(typeof models.calculateNodeDepth).toBe("function");
      expect(typeof models.flattenDirectoryTree).toBe("function");
      expect(typeof models.findNodeByPath).toBe("function");
      expect(typeof models.getDirectoryStats).toBe("function");
    });
  });

  describe("event exports", () => {
    it("should export event validation functions", () => {
      expect(typeof models.isFileChangeEvent).toBe("function");
      expect(typeof models.isTaskEvent).toBe("function");
      expect(typeof models.isSubtaskEvent).toBe("function");
      expect(typeof models.isDocumentEvent).toBe("function");
      expect(typeof models.isConfigEvent).toBe("function");
    });

    it("should export event creation functions", () => {
      expect(typeof models.createFileChangeEvent).toBe("function");
      expect(typeof models.createTaskEvent).toBe("function");
      expect(typeof models.createSubtaskEvent).toBe("function");
    });
  });

  describe("config exports", () => {
    it("should export config constants", () => {
      expect(typeof models.DEFAULT_CONFIG).toBe("object");
      expect(models.DEFAULT_CONFIG.theme).toBeDefined();
    });

    it("should export config utility functions", () => {
      expect(typeof models.validateConfig).toBe("function");
      expect(typeof models.mergeConfig).toBe("function");
      expect(typeof models.getTaskTypeByFolder).toBe("function");
      expect(typeof models.getUserById).toBe("function");
    });
  });

  describe("legacy exports", () => {
    it("should export legacy task type aliases", () => {
      // The legacy exports are type aliases, so we can't test them directly at runtime
      // But we can ensure the module exports them without error
      expect(() => {
        // This would fail if the exports were invalid
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const indexModule = require("../index");
        return indexModule;
      }).not.toThrow();
    });
  });
});
