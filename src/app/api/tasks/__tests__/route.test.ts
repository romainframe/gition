/**
 * @jest-environment node
 */
// Import the mocked module properly
import * as mdxLib from "@/lib/mdx";

import { GET } from "../route";

// Mock the MDX utilities
jest.mock("@/lib/mdx", () => ({
  getAllTasks: jest.fn(),
  getTaskGroups: jest.fn(),
}));

const mockMdx = mdxLib as jest.Mocked<typeof mdxLib>;

// Mock console.error
const mockConsoleError = jest.spyOn(console, "error").mockImplementation();

describe("/api/tasks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  it("should return all tasks by default", async () => {
    const mockTasks = [
      {
        id: "task-1",
        title: "Implement feature A",
        completed: false,
        status: "todo",
        file: "/tasks/feature-a.md",
        line: 1,
        type: "story",
        folder: "stories",
      },
      {
        id: "task-2",
        title: "Fix bug B",
        completed: true,
        status: "done",
        file: "/tasks/bug-b.md",
        line: 1,
        type: "bug",
        folder: "bugs",
      },
    ];

    mockMdx.getAllTasks.mockReturnValue(mockTasks);

    const request = new Request("http://localhost/api/tasks");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(mockTasks);
    expect(mockMdx.getAllTasks).toHaveBeenCalled();
    expect(mockMdx.getTaskGroups).not.toHaveBeenCalled();
  });

  it("should return task groups when view=groups", async () => {
    const mockTaskGroups = [
      {
        id: "group-1",
        name: "Feature Development",
        file: "/tasks/features/main.md",
        slug: "features-main",
        subtasks: [
          {
            id: "subtask-1",
            title: "Implement API",
            completed: false,
            status: "todo",
          },
        ],
        totalTasks: 1,
        completedTasks: 0,
        metadata: { title: "Feature Development", type: "epic" },
      },
    ];

    mockMdx.getTaskGroups.mockReturnValue(mockTaskGroups);

    const request = new Request("http://localhost/api/tasks?view=groups");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(mockTaskGroups);
    expect(mockMdx.getTaskGroups).toHaveBeenCalled();
    expect(mockMdx.getAllTasks).not.toHaveBeenCalled();
  });

  it("should handle errors from getAllTasks", async () => {
    mockMdx.getAllTasks.mockImplementation(() => {
      throw new Error("Failed to read tasks");
    });

    const request = new Request("http://localhost/api/tasks");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Failed to fetch tasks" });
    expect(mockConsoleError).toHaveBeenCalledWith(
      "Error fetching tasks:",
      expect.any(Error)
    );
  });

  it("should handle errors from getTaskGroups", async () => {
    mockMdx.getTaskGroups.mockImplementation(() => {
      throw new Error("Failed to group tasks");
    });

    const request = new Request("http://localhost/api/tasks?view=groups");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Failed to fetch tasks" });
    expect(mockConsoleError).toHaveBeenCalledWith(
      "Error fetching tasks:",
      expect.any(Error)
    );
  });

  it("should return empty array when no tasks found", async () => {
    mockMdx.getAllTasks.mockReturnValue([]);

    const request = new Request("http://localhost/api/tasks");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });
});
