/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";

import fs from "fs";
import matter from "gray-matter";

// Mock dependencies - declare before jest.mock()
const mockGetDocsDirectory = jest.fn();
const mockGetTasksDirectory = jest.fn();

jest.mock("fs");
jest.mock("gray-matter");
jest.mock("@/lib/mdx", () => ({
  getDocsDirectory: mockGetDocsDirectory,
  getTasksDirectory: mockGetTasksDirectory,
}));

// Import route after mocking
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PATCH } = require("../route");

const mockFs = fs as jest.Mocked<typeof fs>;
const mockMatter = matter as jest.Mocked<typeof matter>;

describe("/api/task-management/[taskId]/metadata route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDocsDirectory.mockReturnValue("/test/docs");
    mockGetTasksDirectory.mockReturnValue("/test/tasks");
  });

  describe("PATCH /api/task-management/[taskId]/metadata", () => {
    it("should update task metadata successfully", async () => {
      const mockParams = { taskId: "epic-1" };
      const mockMetadata = {
        title: "Updated Epic Title",
        priority: "high",
        assignee: "john-doe",
        tags: ["frontend", "urgent"],
      };

      const mockFileContent = `---
title: Original Title
priority: medium
---

# Epic Content

Task content here.
`;

      const mockParsedContent = {
        data: {
          title: "Original Title",
          priority: "medium",
        },
        content: `# Epic Content

Task content here.
`,
      };

      const updatedFrontmatter = {
        title: "Updated Epic Title",
        priority: "high",
        assignee: "john-doe",
        tags: ["frontend", "urgent"],
      };

      // Mock file exists in tasks directory
      mockFs.existsSync.mockImplementation((path: string) => {
        return path === "/test/tasks/epic-1.mdx";
      });

      mockFs.readFileSync.mockReturnValue(mockFileContent);
      mockMatter.mockReturnValue(mockParsedContent);
      mockMatter.stringify.mockReturnValue("updated file content");

      const request = new NextRequest(
        "http://localhost:3000/api/task-management/epic-1/metadata",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metadata: mockMetadata }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: "Task metadata updated successfully",
        metadata: updatedFrontmatter,
        filePath: "/test/tasks/epic-1.mdx",
      });

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        "/test/tasks/epic-1.mdx",
        "updated file content",
        "utf-8"
      );
    });

    it("should find task file with .md extension", async () => {
      const mockParams = { taskId: "doc-task" };
      const mockMetadata = { status: "published" };

      // Mock file exists with .md extension
      mockFs.existsSync.mockImplementation((path: string) => {
        return path === "/test/tasks/doc-task.md";
      });

      mockFs.readFileSync.mockReturnValue("# Doc Task\n\nContent");
      mockMatter.mockReturnValue({
        data: {},
        content: "# Doc Task\n\nContent",
      });
      mockMatter.stringify.mockReturnValue("updated content");

      const request = new NextRequest(
        "http://localhost:3000/api/task-management/doc-task/metadata",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metadata: mockMetadata }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.filePath).toBe("/test/tasks/doc-task.md");
    });

    it("should find task file in docs directory when not in tasks", async () => {
      const mockParams = { taskId: "api-guide" };
      const mockMetadata = { version: "2.0" };

      // Mock file not found in tasks, found in docs
      mockFs.existsSync.mockImplementation((path: string) => {
        return path === "/test/docs/api-guide.mdx";
      });

      mockFs.readFileSync.mockReturnValue("# API Guide\n\nContent");
      mockMatter.mockReturnValue({
        data: {},
        content: "# API Guide\n\nContent",
      });
      mockMatter.stringify.mockReturnValue("updated content");

      const request = new NextRequest(
        "http://localhost:3000/api/task-management/api-guide/metadata",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metadata: mockMetadata }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.filePath).toBe("/test/docs/api-guide.mdx");
    });

    it("should return 400 when metadata is missing", async () => {
      const mockParams = { taskId: "epic-1" };

      const request = new NextRequest(
        "http://localhost:3000/api/task-management/epic-1/metadata",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Metadata is required" });
    });

    it("should return 404 when task file is not found", async () => {
      const mockParams = { taskId: "non-existent" };
      const mockMetadata = { title: "Test" };

      // Mock all file existence checks to return false
      mockFs.existsSync.mockReturnValue(false);

      const request = new NextRequest(
        "http://localhost:3000/api/task-management/non-existent/metadata",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metadata: mockMetadata }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: "Task file not found" });
    });

    it("should remove empty and null values from metadata", async () => {
      const mockParams = { taskId: "epic-1" };
      const mockMetadata = {
        title: "Valid Title",
        description: "", // Should be removed
        priority: null, // Should be removed
        assignee: "john",
        tags: [], // Should be kept (not empty string or null)
      };

      const mockFileContent = `---
title: Original Title
---

# Content
`;

      const mockParsedContent = {
        data: { title: "Original Title" },
        content: "# Content\n",
      };

      mockFs.existsSync.mockImplementation((path: string) => {
        return path === "/test/tasks/epic-1.mdx";
      });

      mockFs.readFileSync.mockReturnValue(mockFileContent);
      mockMatter.mockReturnValue(mockParsedContent);
      mockMatter.stringify.mockReturnValue("updated content");

      const request = new NextRequest(
        "http://localhost:3000/api/task-management/epic-1/metadata",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metadata: mockMetadata }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.metadata).toEqual({
        title: "Valid Title",
        assignee: "john",
        tags: [],
      });
      expect(data.metadata).not.toHaveProperty("description");
      expect(data.metadata).not.toHaveProperty("priority");
    });

    it("should merge with existing frontmatter", async () => {
      const mockParams = { taskId: "epic-1" };
      const mockMetadata = {
        priority: "high",
        assignee: "alice",
      };

      const mockFileContent = `---
title: Existing Title
description: Existing description
priority: medium
author: Original Author
---

# Content
`;

      const mockParsedContent = {
        data: {
          title: "Existing Title",
          description: "Existing description",
          priority: "medium",
          author: "Original Author",
        },
        content: "# Content\n",
      };

      mockFs.existsSync.mockImplementation((path: string) => {
        return path === "/test/tasks/epic-1.mdx";
      });

      mockFs.readFileSync.mockReturnValue(mockFileContent);
      mockMatter.mockReturnValue(mockParsedContent);
      mockMatter.stringify.mockReturnValue("updated content");

      const request = new NextRequest(
        "http://localhost:3000/api/task-management/epic-1/metadata",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metadata: mockMetadata }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.metadata).toEqual({
        title: "Existing Title",
        description: "Existing description",
        priority: "high", // Updated
        author: "Original Author",
        assignee: "alice", // Added
      });
    });

    it("should handle URL-encoded taskId", async () => {
      const mockParams = { taskId: "epics%2Fuser-auth" };
      const mockMetadata = { status: "in_progress" };

      // Mock file exists with decoded path
      mockFs.existsSync.mockImplementation((path: string) => {
        return path === "/test/tasks/epics/user-auth.mdx";
      });

      mockFs.readFileSync.mockReturnValue("# User Auth\n\nContent");
      mockMatter.mockReturnValue({
        data: {},
        content: "# User Auth\n\nContent",
      });
      mockMatter.stringify.mockReturnValue("updated content");

      const request = new NextRequest(
        "http://localhost:3000/api/task-management/epics%2Fuser-auth/metadata",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metadata: mockMetadata }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.filePath).toBe("/test/tasks/epics/user-auth.mdx");
    });

    it("should handle file system errors gracefully", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const mockParams = { taskId: "epic-1" };
      const mockMetadata = { title: "Test" };

      mockFs.existsSync.mockImplementation(() => {
        throw new Error("File system error");
      });

      const request = new NextRequest(
        "http://localhost:3000/api/task-management/epic-1/metadata",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metadata: mockMetadata }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Failed to update task metadata" });
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error updating task metadata:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should handle malformed JSON gracefully", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const mockParams = { taskId: "epic-1" };

      const request = new NextRequest(
        "http://localhost:3000/api/task-management/epic-1/metadata",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: "invalid json",
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Failed to update task metadata" });

      consoleSpy.mockRestore();
    });

    it("should handle matter parsing errors", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const mockParams = { taskId: "epic-1" };
      const mockMetadata = { title: "Test" };

      mockFs.existsSync.mockImplementation((path: string) => {
        return path === "/test/tasks/epic-1.mdx";
      });

      mockFs.readFileSync.mockReturnValue("invalid content");
      mockMatter.mockImplementation(() => {
        throw new Error("Invalid frontmatter");
      });

      const request = new NextRequest(
        "http://localhost:3000/api/task-management/epic-1/metadata",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metadata: mockMetadata }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Failed to update task metadata" });
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error updating task metadata:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should preserve content when updating metadata", async () => {
      const mockParams = { taskId: "epic-1" };
      const mockMetadata = { title: "New Title" };

      const originalContent =
        "# Epic Content\n\nDetailed description here.\n\n- [ ] Task 1\n- [ ] Task 2";

      mockFs.existsSync.mockImplementation((path: string) => {
        return path === "/test/tasks/epic-1.mdx";
      });

      mockFs.readFileSync.mockReturnValue(`---
title: Old Title
---

${originalContent}`);

      mockMatter.mockReturnValue({
        data: { title: "Old Title" },
        content: originalContent,
      });

      // Capture the content passed to stringify
      let stringifyContent = "";
      mockMatter.stringify.mockImplementation((content, data) => {
        stringifyContent = content;
        return `---\ntitle: ${data.title}\n---\n\n${content}`;
      });

      const request = new NextRequest(
        "http://localhost:3000/api/task-management/epic-1/metadata",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metadata: mockMetadata }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });

      expect(response.status).toBe(200);
      expect(stringifyContent).toBe(originalContent);
      expect(mockMatter.stringify).toHaveBeenCalledWith(originalContent, {
        title: "New Title",
      });
    });
  });
});
