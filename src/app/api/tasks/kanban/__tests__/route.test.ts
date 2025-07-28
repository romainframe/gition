/**
 * @jest-environment node
 */
import { NextResponse } from "next/server";

// Mock the MDX functions
const mockGetAllTasks = jest.fn();
const mockGetTasksByGroup = jest.fn();

jest.mock("@/lib/mdx", () => ({
  getAllTasks: mockGetAllTasks,
  getTasksByGroup: mockGetTasksByGroup,
}));

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

// Import after mocking
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GET } = require("../route");

describe("/api/tasks/kanban", () => {
  beforeEach(() => {
    mockGetAllTasks.mockClear();
    mockGetTasksByGroup.mockClear();

    (NextResponse.json as jest.Mock).mockImplementation((data, options) => ({
      json: async () => data,
      status: options?.status || 200,
      headers: new Map(),
    }));
  });

  describe("GET", () => {
    it("should return kanban board for all tasks when no group specified", async () => {
      const mockTasks = [
        {
          id: "1",
          title: "Task 1",
          status: "todo",
          content: "Content 1",
          filePath: "/tasks/task1.mdx",
        },
        {
          id: "2",
          title: "Task 2",
          status: "in_progress",
          content: "Content 2",
          filePath: "/tasks/task2.mdx",
        },
        {
          id: "3",
          title: "Task 3",
          status: "done",
          content: "Content 3",
          filePath: "/tasks/task3.mdx",
        },
        {
          id: "4",
          title: "Task 4",
          status: "todo",
          content: "Content 4",
          filePath: "/tasks/task4.mdx",
        },
      ];

      mockGetAllTasks.mockReturnValue(mockTasks);

      const request = new Request("http://localhost/api/tasks/kanban");
      await GET(request);

      expect(mockGetAllTasks).toHaveBeenCalledTimes(1);
      expect(NextResponse.json).toHaveBeenCalledWith({
        columns: [
          {
            id: "todo",
            title: "To Do",
            tasks: [mockTasks[0], mockTasks[3]],
          },
          {
            id: "in_progress",
            title: "In Progress",
            tasks: [mockTasks[1]],
          },
          {
            id: "done",
            title: "Done",
            tasks: [mockTasks[2]],
          },
        ],
        totalTasks: 4,
        groupId: undefined,
        groupName: "All Tasks",
      });
    });

    it("should return kanban board for specific group when group parameter provided", async () => {
      const mockTasks = [
        {
          id: "1",
          title: "Epic Task 1",
          status: "todo",
          content: "Content 1",
          filePath: "/tasks/epics/task1.mdx",
        },
        {
          id: "2",
          title: "Epic Task 2",
          status: "done",
          content: "Content 2",
          filePath: "/tasks/epics/task2.mdx",
        },
      ];

      mockGetTasksByGroup.mockReturnValue(mockTasks);

      const request = new Request(
        "http://localhost/api/tasks/kanban?group=tasks/epics"
      );
      await GET(request);

      expect(mockGetTasksByGroup).toHaveBeenCalledWith("tasks/epics");
      expect(NextResponse.json).toHaveBeenCalledWith({
        columns: [
          {
            id: "todo",
            title: "To Do",
            tasks: [mockTasks[0]],
          },
          {
            id: "in_progress",
            title: "In Progress",
            tasks: [],
          },
          {
            id: "done",
            title: "Done",
            tasks: [mockTasks[1]],
          },
        ],
        totalTasks: 2,
        groupId: "tasks/epics",
        groupName: "epics",
      });
    });

    it("should handle group name extraction from nested path", async () => {
      mockGetTasksByGroup.mockReturnValue([]);

      const request = new Request(
        "http://localhost/api/tasks/kanban?group=projects/frontend/components"
      );
      await GET(request);

      expect(NextResponse.json).toHaveBeenCalledWith({
        columns: [
          { id: "todo", title: "To Do", tasks: [] },
          { id: "in_progress", title: "In Progress", tasks: [] },
          { id: "done", title: "Done", tasks: [] },
        ],
        totalTasks: 0,
        groupId: "projects/frontend/components",
        groupName: "components",
      });
    });

    it("should handle empty tasks list", async () => {
      mockGetAllTasks.mockReturnValue([]);

      const request = new Request("http://localhost/api/tasks/kanban");
      await GET(request);

      expect(NextResponse.json).toHaveBeenCalledWith({
        columns: [
          { id: "todo", title: "To Do", tasks: [] },
          { id: "in_progress", title: "In Progress", tasks: [] },
          { id: "done", title: "Done", tasks: [] },
        ],
        totalTasks: 0,
        groupId: undefined,
        groupName: "All Tasks",
      });
    });

    it("should handle tasks with unknown status", async () => {
      const mockTasks = [
        {
          id: "1",
          title: "Task 1",
          status: "todo",
          content: "Content 1",
          filePath: "/tasks/task1.mdx",
        },
        {
          id: "2",
          title: "Task 2",
          status: "unknown",
          content: "Content 2",
          filePath: "/tasks/task2.mdx",
        },
        {
          id: "3",
          title: "Task 3",
          status: "done",
          content: "Content 3",
          filePath: "/tasks/task3.mdx",
        },
      ];

      mockGetAllTasks.mockReturnValue(mockTasks);

      const request = new Request("http://localhost/api/tasks/kanban");
      await GET(request);

      expect(NextResponse.json).toHaveBeenCalledWith({
        columns: [
          {
            id: "todo",
            title: "To Do",
            tasks: [mockTasks[0]],
          },
          {
            id: "in_progress",
            title: "In Progress",
            tasks: [],
          },
          {
            id: "done",
            title: "Done",
            tasks: [mockTasks[2]],
          },
        ],
        totalTasks: 3,
        groupId: undefined,
        groupName: "All Tasks",
      });
    });

    it("should handle error when getAllTasks throws", async () => {
      const mockError = new Error("Database connection failed");
      mockGetAllTasks.mockImplementation(() => {
        throw mockError;
      });

      // Mock console.error to suppress error output in test
      const mockConsoleError = jest
        .spyOn(console, "error")
        .mockImplementation();

      const request = new Request("http://localhost/api/tasks/kanban");
      await GET(request);

      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error fetching kanban board:",
        mockError
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Failed to fetch kanban board" },
        { status: 500 }
      );

      mockConsoleError.mockRestore();
    });

    it("should handle error when getTasksByGroup throws", async () => {
      const mockError = new Error("Group not found");
      mockGetTasksByGroup.mockImplementation(() => {
        throw mockError;
      });

      // Mock console.error to suppress error output in test
      const mockConsoleError = jest
        .spyOn(console, "error")
        .mockImplementation();

      const request = new Request(
        "http://localhost/api/tasks/kanban?group=invalid/group"
      );
      await GET(request);

      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error fetching kanban board:",
        mockError
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Failed to fetch kanban board" },
        { status: 500 }
      );

      mockConsoleError.mockRestore();
    });

    it("should handle group parameter with single segment", async () => {
      mockGetTasksByGroup.mockReturnValue([]);

      const request = new Request(
        "http://localhost/api/tasks/kanban?group=epics"
      );
      await GET(request);

      expect(NextResponse.json).toHaveBeenCalledWith({
        columns: [
          { id: "todo", title: "To Do", tasks: [] },
          { id: "in_progress", title: "In Progress", tasks: [] },
          { id: "done", title: "Done", tasks: [] },
        ],
        totalTasks: 0,
        groupId: "epics",
        groupName: "epics",
      });
    });

    it("should handle group parameter with empty string", async () => {
      mockGetAllTasks.mockReturnValue([]);

      const request = new Request("http://localhost/api/tasks/kanban?group=");
      await GET(request);

      expect(mockGetAllTasks).toHaveBeenCalledTimes(1);
      expect(NextResponse.json).toHaveBeenCalledWith({
        columns: [
          { id: "todo", title: "To Do", tasks: [] },
          { id: "in_progress", title: "In Progress", tasks: [] },
          { id: "done", title: "Done", tasks: [] },
        ],
        totalTasks: 0,
        groupId: undefined,
        groupName: "All Tasks",
      });
    });
  });
});
