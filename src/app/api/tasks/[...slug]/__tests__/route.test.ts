/**
 * @jest-environment node
 */
import fs from "fs";
import matter from "gray-matter";

import { createMockDirent } from "@/test-utils/fs-mock";

// Mock functions - declare before jest.mock
const mockGetAllTasks = jest.fn();
const mockGetTaskGroups = jest.fn();
const mockGetTasksDirectory = jest.fn();
const mockGetDocsDirectory = jest.fn();
const mockGetTargetDirectory = jest.fn();

// Mock dependencies
jest.mock("fs");
jest.mock("gray-matter");
jest.mock("@/lib/mdx", () => ({
  getAllTasks: mockGetAllTasks,
  getTaskGroups: mockGetTaskGroups,
  getTasksDirectory: mockGetTasksDirectory,
  getDocsDirectory: mockGetDocsDirectory,
  getTargetDirectory: mockGetTargetDirectory,
}));

// Import after mocking
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GET } = require("../route");
const mockFs = fs as jest.Mocked<typeof fs>;
const mockMatter = matter as jest.Mocked<typeof matter>;

describe("/api/tasks/[...slug] route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTasksDirectory.mockReturnValue("/test/tasks");
    mockGetDocsDirectory.mockReturnValue("/test/docs");
    mockGetTargetDirectory.mockReturnValue("/test");

    // Default mock data
    mockGetAllTasks.mockReturnValue([]);
    mockGetTaskGroups.mockReturnValue([]);
  });

  describe("GET /api/tasks/[...slug]", () => {
    it("should find and return a task file from tasks directory", async () => {
      const mockParams = { slug: ["epic-1"] };
      const mockFileContent =
        "---\ntitle: Epic 1\n---\n# Epic 1\n\nContent here.";
      const mockParsedContent = {
        data: { title: "Epic 1" },
        content: "# Epic 1\n\nContent here.",
      };

      // Mock file system calls
      mockFs.existsSync.mockImplementation((path: string) => {
        return path === "/test/tasks" || path === "/test/tasks/epic-1.mdx";
      });

      mockFs.readdirSync.mockReturnValue([
        createMockDirent("epic-1.mdx", true),
      ]);

      mockFs.readFileSync.mockReturnValue(mockFileContent);
      mockMatter.mockReturnValue(mockParsedContent);

      const mockTasks = [
        {
          id: "task-1",
          title: "Test task",
          file: "/test/tasks/epic-1.mdx",
          references: [],
        },
      ];

      const mockTaskGroups = [
        {
          id: "epic-1",
          name: "Epic 1",
          file: "/test/tasks/epic-1.mdx",
          type: "epic",
        },
      ];

      mockGetAllTasks.mockReturnValue(mockTasks);
      mockGetTaskGroups.mockReturnValue(mockTaskGroups);

      const response = await GET(
        new Request("http://localhost:3000/api/tasks/epic-1"),
        { params: Promise.resolve(mockParams) }
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        slug: "epic-1",
        content: "# Epic 1\n\nContent here.",
        frontmatter: { title: "Epic 1" },
        tasks: mockTasks,
        group: mockTaskGroups[0],
        relatedTasks: [],
        referencedBy: [],
        isDocsFile: false,
      });
    });

    it("should find and return a task file with nested path", async () => {
      const mockParams = { slug: ["epics", "user-auth"] };
      const mockFileContent = "---\ntitle: User Auth Epic\n---\n# User Auth";
      const mockParsedContent = {
        data: { title: "User Auth Epic" },
        content: "# User Auth",
      };

      // Mock file system calls for nested path
      mockFs.existsSync.mockImplementation((path: string) => {
        return path === "/test/tasks/epics/user-auth.mdx";
      });

      mockFs.readFileSync.mockReturnValue(mockFileContent);
      mockMatter.mockReturnValue(mockParsedContent);

      const response = await GET(
        new Request("http://localhost:3000/api/tasks/epics/user-auth"),
        { params: Promise.resolve(mockParams) }
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.slug).toBe("epics/user-auth");
      expect(data.isDocsFile).toBe(false);
    });

    it("should find file in docs directory when not in tasks", async () => {
      const mockParams = { slug: ["api-guide"] };
      const mockFileContent = "---\ntitle: API Guide\n---\n# API Guide";
      const mockParsedContent = {
        data: { title: "API Guide" },
        content: "# API Guide",
      };

      // Mock file system calls - not found in tasks, found in docs
      mockFs.existsSync.mockImplementation((path: string) => {
        if (path === "/test/tasks") return true;
        if (path === "/test/docs") return true;
        if (path === "/test/docs/api-guide.md") return true;
        return false;
      });

      mockFs.readdirSync.mockImplementation((dir: string) => {
        if (dir === "/test/tasks") return [];
        if (dir === "/test/docs")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return [{ name: "api-guide.md", isDirectory: () => false }] as any;
        return [];
      });

      mockFs.readFileSync.mockReturnValue(mockFileContent);
      mockMatter.mockReturnValue(mockParsedContent);

      const response = await GET(
        new Request("http://localhost:3000/api/tasks/api-guide"),
        { params: Promise.resolve(mockParams) }
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.isDocsFile).toBe(true);
    });

    it("should return 404 when file is not found", async () => {
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});
      const mockParams = { slug: ["non-existent"] };

      // Mock file system to return false for all paths
      mockFs.existsSync.mockReturnValue(false);
      mockFs.readdirSync.mockReturnValue([]);

      const response = await GET(
        new Request("http://localhost:3000/api/tasks/non-existent"),
        { params: Promise.resolve(mockParams) }
      );

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: "Task file not found",
        debug: {
          slug: "non-existent",
          tasksDir: "/test/tasks",
          docsDir: "/test/docs",
        },
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "File not found:",
        expect.any(Object)
      );
      consoleSpy.mockRestore();
    });

    it("should handle file system errors gracefully", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const mockParams = { slug: ["error-file"] };

      mockFs.existsSync.mockImplementation(() => {
        throw new Error("File system error");
      });

      const response = await GET(
        new Request("http://localhost:3000/api/tasks/error-file"),
        { params: Promise.resolve(mockParams) }
      );

      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "Failed to fetch task file",
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching task file:",
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it("should handle both .md and .mdx extensions", async () => {
      const mockParams = { slug: ["test-doc"] };
      const mockFileContent = "Content";
      const mockParsedContent = { data: {}, content: "Content" };

      // Mock to find .md file
      mockFs.existsSync.mockImplementation((path: string) => {
        return path === "/test/tasks" || path === "/test/tasks/test-doc.md";
      });

      mockFs.readdirSync.mockReturnValue([
        createMockDirent("test-doc.md", true),
      ]);

      mockFs.readFileSync.mockReturnValue(mockFileContent);
      mockMatter.mockReturnValue(mockParsedContent);

      const response = await GET(
        new Request("http://localhost:3000/api/tasks/test-doc"),
        { params: Promise.resolve(mockParams) }
      );

      expect(response.status).toBe(200);
      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        "/test/tasks/test-doc.md",
        "utf-8"
      );
    });

    it("should return related tasks and references", async () => {
      const mockParams = { slug: ["epic-with-refs"] };
      const mockFileContent = "---\ntitle: Epic\n---\nContent";
      const mockParsedContent = { data: { title: "Epic" }, content: "Content" };

      mockFs.existsSync.mockImplementation((path: string) => {
        return (
          path === "/test/tasks" || path === "/test/tasks/epic-with-refs.mdx"
        );
      });

      mockFs.readdirSync.mockReturnValue([
        createMockDirent("epic-with-refs.mdx", true),
      ]);

      mockFs.readFileSync.mockReturnValue(mockFileContent);
      mockMatter.mockReturnValue(mockParsedContent);

      const mockTasks = [
        {
          id: "task-1",
          title: "Main task",
          file: "/test/tasks/epic-with-refs.mdx",
          references: ["other-epic"],
        },
        {
          id: "task-2",
          title: "Other task",
          file: "/test/tasks/other-epic.mdx",
          references: ["epic-with-refs"],
        },
        {
          id: "task-3",
          title: "Related task",
          file: "/test/tasks/other-epic.mdx",
          references: [],
        },
      ];

      mockGetAllTasks.mockReturnValue(mockTasks);

      const response = await GET(
        new Request("http://localhost:3000/api/tasks/epic-with-refs"),
        { params: Promise.resolve(mockParams) }
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tasks).toEqual([mockTasks[0]]); // Tasks from this file
      expect(data.referencedBy).toEqual([mockTasks[1]]); // Tasks that reference this file
    });

    it("should handle nested directories correctly", async () => {
      const mockParams = { slug: ["epics", "nested-epic"] };

      // Mock nested directory structure
      mockFs.existsSync.mockImplementation((path: string) => {
        return path === "/test/tasks/epics/nested-epic.mdx";
      });

      mockFs.readFileSync.mockReturnValue("Content");
      mockMatter.mockReturnValue({ data: {}, content: "Content" });

      const response = await GET(
        new Request("http://localhost:3000/api/tasks/epics/nested-epic"),
        { params: Promise.resolve(mockParams) }
      );

      expect(response.status).toBe(200);
      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        "/test/tasks/epics/nested-epic.mdx",
        "utf-8"
      );
    });

    it("should handle docs file in nested path", async () => {
      const mockParams = { slug: ["guides", "setup"] };

      // Mock file not found in tasks but found in docs
      mockFs.existsSync.mockImplementation((path: string) => {
        return path === "/test/docs/guides/setup.md";
      });

      mockFs.readFileSync.mockReturnValue("Setup guide");
      mockMatter.mockReturnValue({
        data: { title: "Setup" },
        content: "Setup guide",
      });

      const response = await GET(
        new Request("http://localhost:3000/api/tasks/guides/setup"),
        { params: Promise.resolve(mockParams) }
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.isDocsFile).toBe(true);
      expect(data.slug).toBe("guides/setup");
    });

    it("should skip hidden directories during recursive search", async () => {
      const mockParams = { slug: ["test-file"] };

      mockFs.existsSync.mockImplementation((path: string) => {
        return path === "/test/tasks" || path === "/test/tasks/test-file.md";
      });

      mockFs.readdirSync.mockReturnValue([
        createMockDirent(".hidden", false),
        createMockDirent("test-file.md", true),
      ]);

      mockFs.readFileSync.mockReturnValue("Content");
      mockMatter.mockReturnValue({ data: {}, content: "Content" });

      const response = await GET(
        new Request("http://localhost:3000/api/tasks/test-file"),
        { params: Promise.resolve(mockParams) }
      );

      expect(response.status).toBe(200);
      // Should find the file without trying to search hidden directories
    });

    it("should handle matter parsing errors", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const mockParams = { slug: ["bad-frontmatter"] };

      mockFs.existsSync.mockImplementation((path: string) => {
        return (
          path === "/test/tasks" || path === "/test/tasks/bad-frontmatter.md"
        );
      });

      mockFs.readdirSync.mockReturnValue([
        createMockDirent("bad-frontmatter.md", true),
      ]);

      mockFs.readFileSync.mockReturnValue("Content");
      mockMatter.mockImplementation(() => {
        throw new Error("Invalid frontmatter");
      });

      const response = await GET(
        new Request("http://localhost:3000/api/tasks/bad-frontmatter"),
        { params: Promise.resolve(mockParams) }
      );

      expect(response.status).toBe(500);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching task file:",
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });
});
