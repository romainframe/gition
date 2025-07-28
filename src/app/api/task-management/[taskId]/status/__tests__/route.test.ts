/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";

import fs from "fs";
import matter from "gray-matter";

// Mock dependencies
jest.mock("fs");
jest.mock("gray-matter");
jest.mock("@/lib/mdx");

const mockFs = fs as jest.Mocked<typeof fs>;
const mockMatter = matter as jest.Mocked<typeof matter>;
const mockGetDocsDirectory = jest.fn();
const mockGetTasksDirectory = jest.fn();

jest.mock("@/lib/mdx", () => ({
  getDocsDirectory: mockGetDocsDirectory,
  getTasksDirectory: mockGetTasksDirectory,
}));

// Import after mocking
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PATCH } = require("../route");

describe("/api/task-management/[taskId]/status route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDocsDirectory.mockReturnValue("/test/docs");
    mockGetTasksDirectory.mockReturnValue("/test/tasks");
  });

  describe("PATCH /api/task-management/[taskId]/status", () => {
    it("should update task status successfully", async () => {
      const mockParams = { taskId: "epic-1" };
      const mockStatus = "in_progress";

      const mockFileContent = `---
title: Epic 1
status: todo
priority: high
---

# Epic 1

Task content here.
`;

      const mockParsedContent = {
        data: {
          title: "Epic 1",
          status: "todo",
          priority: "high",
        },
        content: `# Epic 1

Task content here.
`,
      };

      // Mock file exists in tasks directory
      mockFs.existsSync.mockImplementation((path: string) => {
        return path === "/test/tasks/epic-1.mdx";
      });

      mockFs.readFileSync.mockReturnValue(mockFileContent);
      (mockMatter as unknown as jest.Mock).mockReturnValue(mockParsedContent);
      (mockMatter.stringify as jest.Mock).mockReturnValue(
        "updated file content"
      );

      const request = new NextRequest(
        "http://localhost:3000/api/task-management/epic-1/status",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: mockStatus }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: "Task status updated successfully",
        status: "in_progress",
        filePath: "/test/tasks/epic-1.mdx",
      });

      expect(mockMatter.stringify).toHaveBeenCalledWith(
        mockParsedContent.content,
        {
          title: "Epic 1",
          status: "in_progress",
          priority: "high",
        }
      );

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        "/test/tasks/epic-1.mdx",
        "updated file content",
        "utf-8"
      );
    });

    it("should find task file with .md extension", async () => {
      const mockParams = { taskId: "doc-task" };
      const mockStatus = "done";

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
        "http://localhost:3000/api/task-management/doc-task/status",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: mockStatus }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.filePath).toBe("/test/tasks/doc-task.md");
      expect(data.status).toBe("done");
    });

    it("should find task file in docs directory when not in tasks", async () => {
      const mockParams = { taskId: "api-guide" };
      const mockStatus = "published";

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
        "http://localhost:3000/api/task-management/api-guide/status",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: mockStatus }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.filePath).toBe("/test/docs/api-guide.mdx");
      expect(data.status).toBe("published");
    });

    it("should return 400 when status is missing", async () => {
      const mockParams = { taskId: "epic-1" };

      const request = new NextRequest(
        "http://localhost:3000/api/task-management/epic-1/status",
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
      expect(data).toEqual({ error: "Status is required" });
    });

    it("should return 400 when status is null", async () => {
      const mockParams = { taskId: "epic-1" };

      const request = new NextRequest(
        "http://localhost:3000/api/task-management/epic-1/status",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: null }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Status is required" });
    });

    it("should return 400 when status is empty string", async () => {
      const mockParams = { taskId: "epic-1" };

      const request = new NextRequest(
        "http://localhost:3000/api/task-management/epic-1/status",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "" }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Status is required" });
    });

    it("should return 404 when task file is not found", async () => {
      const mockParams = { taskId: "non-existent" };
      const mockStatus = "done";

      // Mock all file existence checks to return false
      mockFs.existsSync.mockReturnValue(false);

      const request = new NextRequest(
        "http://localhost:3000/api/task-management/non-existent/status",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: mockStatus }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: "Task file not found" });
    });

    it("should preserve existing frontmatter when updating status", async () => {
      const mockParams = { taskId: "epic-1" };
      const mockStatus = "done";

      const mockFileContent = `---
title: Epic 1
description: Important epic
priority: high
assignee: john-doe
tags:
  - frontend
  - urgent
created: 2024-01-15
---

# Epic Content
`;

      const mockParsedContent = {
        data: {
          title: "Epic 1",
          description: "Important epic",
          priority: "high",
          assignee: "john-doe",
          tags: ["frontend", "urgent"],
          created: "2024-01-15",
        },
        content: "# Epic Content\n",
      };

      mockFs.existsSync.mockImplementation((path: string) => {
        return path === "/test/tasks/epic-1.mdx";
      });

      mockFs.readFileSync.mockReturnValue(mockFileContent);
      mockMatter.mockReturnValue(mockParsedContent);
      mockMatter.stringify.mockReturnValue("updated content");

      const request = new NextRequest(
        "http://localhost:3000/api/task-management/epic-1/status",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: mockStatus }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });

      expect(response.status).toBe(200);
      expect(mockMatter.stringify).toHaveBeenCalledWith("# Epic Content\n", {
        title: "Epic 1",
        description: "Important epic",
        priority: "high",
        assignee: "john-doe",
        tags: ["frontend", "urgent"],
        created: "2024-01-15",
        status: "done", // Only status should be updated
      });
    });

    it("should handle URL-encoded taskId", async () => {
      const mockParams = { taskId: "epics%2Fuser-auth" };
      const mockStatus = "in_progress";

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
        "http://localhost:3000/api/task-management/epics%2Fuser-auth/status",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: mockStatus }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.filePath).toBe("/test/tasks/epics/user-auth.mdx");
    });

    it("should add status to file without existing frontmatter", async () => {
      const mockParams = { taskId: "simple-task" };
      const mockStatus = "todo";

      const mockFileContent = `# Simple Task

This task has no frontmatter.
`;

      const mockParsedContent = {
        data: {}, // No existing frontmatter
        content: `# Simple Task

This task has no frontmatter.
`,
      };

      mockFs.existsSync.mockImplementation((path: string) => {
        return path === "/test/tasks/simple-task.md";
      });

      mockFs.readFileSync.mockReturnValue(mockFileContent);
      mockMatter.mockReturnValue(mockParsedContent);
      mockMatter.stringify.mockReturnValue("updated content with frontmatter");

      const request = new NextRequest(
        "http://localhost:3000/api/task-management/simple-task/status",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: mockStatus }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });

      expect(response.status).toBe(200);
      expect(mockMatter.stringify).toHaveBeenCalledWith(
        mockParsedContent.content,
        { status: "todo" }
      );
    });

    it("should handle file system errors gracefully", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const mockParams = { taskId: "epic-1" };
      const mockStatus = "done";

      mockFs.existsSync.mockImplementation(() => {
        throw new Error("File system error");
      });

      const request = new NextRequest(
        "http://localhost:3000/api/task-management/epic-1/status",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: mockStatus }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Failed to update task status" });
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error updating task status:",
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
        "http://localhost:3000/api/task-management/epic-1/status",
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
      expect(data).toEqual({ error: "Failed to update task status" });

      consoleSpy.mockRestore();
    });

    it("should handle matter parsing errors", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const mockParams = { taskId: "epic-1" };
      const mockStatus = "done";

      mockFs.existsSync.mockImplementation((path: string) => {
        return path === "/test/tasks/epic-1.mdx";
      });

      mockFs.readFileSync.mockReturnValue("invalid content");
      mockMatter.mockImplementation(() => {
        throw new Error("Invalid frontmatter");
      });

      const request = new NextRequest(
        "http://localhost:3000/api/task-management/epic-1/status",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: mockStatus }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Failed to update task status" });
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error updating task status:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should handle different valid status values", async () => {
      const mockParams = { taskId: "epic-1" };

      mockFs.existsSync.mockImplementation((path: string) => {
        return path === "/test/tasks/epic-1.mdx";
      });

      mockFs.readFileSync.mockReturnValue("# Epic\n\nContent");
      mockMatter.mockReturnValue({ data: {}, content: "# Epic\n\nContent" });
      mockMatter.stringify.mockReturnValue("updated content");

      const testStatuses = [
        "todo",
        "in_progress",
        "done",
        "blocked",
        "cancelled",
        "custom_status",
      ];

      for (const status of testStatuses) {
        const request = new NextRequest(
          "http://localhost:3000/api/task-management/epic-1/status",
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          }
        );

        const response = await PATCH(request, {
          params: Promise.resolve(mockParams),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe(status);
      }
    });

    it("should preserve content when updating status", async () => {
      const mockParams = { taskId: "epic-1" };
      const mockStatus = "done";

      const originalContent =
        "# Epic Content\n\nDetailed description here.\n\n- [ ] Task 1\n- [ ] Task 2";

      mockFs.existsSync.mockImplementation((path: string) => {
        return path === "/test/tasks/epic-1.mdx";
      });

      mockFs.readFileSync.mockReturnValue(`---
title: Epic Title
---

${originalContent}`);

      mockMatter.mockReturnValue({
        data: { title: "Epic Title" },
        content: originalContent,
      });

      // Capture the content passed to stringify
      let stringifyContent = "";
      mockMatter.stringify.mockImplementation((content, data) => {
        stringifyContent = content;
        return `---\ntitle: ${data.title}\nstatus: ${data.status}\n---\n\n${content}`;
      });

      const request = new NextRequest(
        "http://localhost:3000/api/task-management/epic-1/status",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: mockStatus }),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });

      expect(response.status).toBe(200);
      expect(stringifyContent).toBe(originalContent);
      expect(mockMatter.stringify).toHaveBeenCalledWith(originalContent, {
        title: "Epic Title",
        status: "done",
      });
    });
  });
});
