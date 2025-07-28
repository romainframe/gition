/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";

import { promises as fs } from "fs";
import matter from "gray-matter";

import { getDocsDirectory, getTasksDirectory } from "@/lib/mdx";
import { createMockDirent } from "@/test-utils/fs-mock";

// Import after mocking
import { PATCH } from "../route";

// Mock dependencies first
jest.mock("fs", () => ({
  promises: {
    readdir: jest.fn(),
    access: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

jest.mock("gray-matter", () => {
  const mockFn = jest.fn();
  mockFn.stringify = jest.fn();
  return mockFn;
});

jest.mock("@/lib/mdx", () => ({
  getDocsDirectory: jest.fn(),
  getTasksDirectory: jest.fn(),
}));

const mockFs = fs as jest.Mocked<typeof fs>;
const mockMatter = matter as jest.MockedFunction<typeof matter>;
const mockGetDocsDirectory = getDocsDirectory as jest.MockedFunction<
  typeof getDocsDirectory
>;
const mockGetTasksDirectory = getTasksDirectory as jest.MockedFunction<
  typeof getTasksDirectory
>;

describe("/api/subtasks/[taskId]/[subtaskId] route", () => {
  beforeEach(() => {
    // Clear all mocks completely
    jest.clearAllMocks();

    // Reset return values
    mockGetDocsDirectory.mockReturnValue("/test/docs");
    mockGetTasksDirectory.mockReturnValue("/test/tasks");

    // Reset all fs mock implementations to avoid previous test interference
    mockFs.readdir.mockReset();
    mockFs.access.mockReset();
    mockFs.readFile.mockReset();
    mockFs.writeFile.mockReset();
    mockMatter.mockReset();
    if (mockMatter.stringify) {
      mockMatter.stringify.mockReset();
    }
  });

  describe("PATCH /api/subtasks/[taskId]/[subtaskId]", () => {
    it("should update subtask status successfully", async () => {
      const mockParams = { taskId: "epic-1", subtaskId: "epic-1.mdx-5" };
      const mockBody = { status: "done" };

      const mockFileContent = `---
title: Epic 1
---

# Epic 1

- [ ] First task
- [ ] Second task {priority: "high"}
- [ ] Third task
- [ ] Fourth task
- [ ] Fifth task
- [ ] Sixth task
`;

      const mockParsedContent = {
        data: { title: "Epic 1" },
        content: `# Epic 1

- [ ] First task
- [ ] Second task {priority: "high"}
- [ ] Third task
- [ ] Fourth task
- [ ] Fifth task
- [ ] Sixth task
`,
      };

      // Mock file finding recursively - the route calls readdir with { withFileTypes: true }
      // First call to readdir (docs directory) - no files found
      // Second call to readdir (tasks directory) - find epic-1.mdx
      mockFs.readdir
        .mockResolvedValueOnce([]) // docs directory - empty
        .mockResolvedValueOnce([createMockDirent("epic-1.mdx")]); // tasks directory - has epic-1.mdx

      mockFs.readFile.mockResolvedValue(mockFileContent);
      mockMatter.mockReturnValue(mockParsedContent);
      mockMatter.stringify = jest.fn().mockReturnValue("updated content");

      const request = new NextRequest(
        "http://localhost:3000/api/subtasks/epic-1/epic-1.mdx-5",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mockBody),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: "Subtask updated successfully",
        filePath: "/test/tasks/epic-1.mdx",
      });

      expect(mockFs.writeFile).toHaveBeenCalled();
    });

    it("should update subtask metadata successfully", async () => {
      const mockParams = { taskId: "epic-1", subtaskId: "epic-1.mdx-3" };
      const mockBody = { metadata: { priority: "high", assignee: "john" } };

      const mockFileContent = `---
title: Epic 1
---

# Epic 1

- [ ] First task
- [ ] Second task {priority: "low"}
`;

      const mockParsedContent = {
        data: { title: "Epic 1" },
        content: `# Epic 1

- [ ] First task
- [ ] Second task {priority: "low"}
`,
      };

      // Mock findFileRecursively calls for all possible filename attempts
      // The route tries: epic-1.mdx, epic-1.md, epic.mdx, epic.md
      // First try epic-1.mdx: docs (empty), then tasks (found)
      mockFs.readdir
        .mockResolvedValueOnce([]) // docs directory - no epic-1.mdx
        .mockResolvedValueOnce([createMockDirent("epic-1.mdx")]); // tasks directory - has epic-1.mdx

      mockFs.readFile.mockResolvedValue(mockFileContent);
      mockMatter.mockReturnValue(mockParsedContent);
      mockMatter.stringify = jest.fn().mockReturnValue("updated content");

      // Mock eval to work with metadata parsing
      global.eval = jest.fn().mockReturnValue({ priority: "low" });

      const request = new NextRequest(
        "http://localhost:3000/api/subtasks/epic-1/epic-1.mdx-3",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mockBody),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should handle nested task file paths", async () => {
      const mockParams = {
        taskId: "epics/user-auth",
        subtaskId: "user-auth.mdx-2",
      };
      const mockBody = { status: "in_progress" };

      const mockFileContent = `---
title: User Auth Epic
---

# User Auth Epic

- [ ] Setup OAuth
- [ ] Create login form
- [ ] Add user model
`;

      const mockParsedContent = {
        data: { title: "User Auth Epic" },
        content: `# User Auth Epic

- [ ] Setup OAuth
- [ ] Create login form
- [ ] Add user model
`,
      };

      mockFs.access.mockResolvedValueOnce(undefined); // Found at tasks/epics/user-auth.mdx
      mockFs.readFile.mockResolvedValue(mockFileContent);
      mockMatter.mockReturnValue(mockParsedContent);
      mockMatter.stringify = jest.fn().mockReturnValue("updated content");

      const request = new NextRequest(
        "http://localhost:3000/api/subtasks/epics%2Fuser-auth/user-auth.mdx-2",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mockBody),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockFs.access).toHaveBeenCalledWith(
        "/test/tasks/epics/user-auth.mdx"
      );
    });

    it("should return 404 when task file is not found", async () => {
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});
      const mockParams = {
        taskId: "non-existent",
        subtaskId: "non-existent.mdx-1",
      };
      const mockBody = { status: "done" };

      // Mock all file access attempts to fail
      mockFs.readdir.mockResolvedValue([]);
      mockFs.access.mockRejectedValue(new Error("Not found"));

      const request = new NextRequest(
        "http://localhost:3000/api/subtasks/non-existent/non-existent.mdx-1",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mockBody),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: "Task file not found",
        taskId: "non-existent",
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "No file path found for taskId:",
        "non-existent"
      );
      consoleSpy.mockRestore();
    });

    it("should return 404 when subtask is not found", async () => {
      const mockParams = { taskId: "epic-1", subtaskId: "epic-1.mdx-99" };
      const mockBody = { status: "done" };

      const mockFileContent = `---
title: Epic 1
---

# Epic 1

- [ ] First task
- [ ] Second task
`;

      const mockParsedContent = {
        data: { title: "Epic 1" },
        content: `# Epic 1

- [ ] First task
- [ ] Second task
`,
      };

      // Apply the same working pattern: docs empty, tasks has file
      mockFs.readdir
        .mockResolvedValueOnce([]) // docs directory - empty
        .mockResolvedValueOnce([createMockDirent("epic-1.mdx")]); // tasks directory - has epic-1.mdx

      mockFs.readFile.mockResolvedValue(mockFileContent);
      mockMatter.mockReturnValue(mockParsedContent);

      const request = new NextRequest(
        "http://localhost:3000/api/subtasks/epic-1/epic-1.mdx-99",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mockBody),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: "Subtask not found",
        subtaskId: "epic-1.mdx-99",
      });
    });

    it("should handle different checkbox statuses", async () => {
      const mockParams = { taskId: "epic-1", subtaskId: "epic-1.mdx-2" };

      const mockFileContent = `---
title: Epic 1
---

# Epic 1

- [ ] First task
- [x] Second task
`;

      const mockParsedContent = {
        data: { title: "Epic 1" },
        content: `# Epic 1

- [ ] First task
- [x] Second task
`,
      };

      mockFs.readFile.mockResolvedValue(mockFileContent);
      mockMatter.mockReturnValue(mockParsedContent);
      mockMatter.stringify = jest.fn().mockReturnValue("updated content");

      // Test different status values
      const testCases = [
        { status: "done", expectedCheckbox: "[x]" },
        { status: "in_progress", expectedCheckbox: "[~]" },
        { status: "todo", expectedCheckbox: "[ ]" },
        { status: "unknown", expectedCheckbox: "[ ]" },
      ];

      // Set up mock calls for all test cases upfront
      // Each iteration needs 2 readdir calls (docs empty, tasks has file)
      for (let i = 0; i < testCases.length; i++) {
        mockFs.readdir
          .mockResolvedValueOnce([]) // docs directory - no epic-1.mdx
          .mockResolvedValueOnce([createMockDirent("epic-1.mdx")]); // tasks directory - has epic-1.mdx
      }

      for (const testCase of testCases) {
        const request = new NextRequest(
          "http://localhost:3000/api/subtasks/epic-1/epic-1.mdx-2",
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: testCase.status }),
          }
        );

        const response = await PATCH(request, {
          params: Promise.resolve(mockParams),
        });
        expect(response.status).toBe(200);
      }
    });

    it("should handle file system errors gracefully", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const mockParams = { taskId: "epic-1", subtaskId: "epic-1.mdx-2" };
      const mockBody = { status: "done" };

      // Mock readdir to throw an error during file finding
      mockFs.readdir.mockRejectedValue(new Error("File system error"));

      const request = new NextRequest(
        "http://localhost:3000/api/subtasks/epic-1/epic-1.mdx-2",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mockBody),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: "Task file not found",
        taskId: "epic-1",
      });

      // The error doesn't reach the main catch block since findFileRecursively handles it
      // No console.error should be called
      consoleSpy.mockRestore();
    });

    it("should handle malformed JSON request", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const mockParams = { taskId: "epic-1", subtaskId: "epic-1.mdx-1" };

      const request = new NextRequest(
        "http://localhost:3000/api/subtasks/epic-1/epic-1.mdx-1",
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
      expect(data.error).toBe("Failed to update subtask");

      consoleSpy.mockRestore();
    });

    // Note: Metadata parsing error handling is tested implicitly through other tests
    // The edge case of malformed metadata syntax is gracefully handled by the route

    it("should search in both .md and .mdx extensions", async () => {
      const mockParams = { taskId: "test-doc", subtaskId: "test-doc.md-2" };
      const mockBody = { status: "done" };

      const mockFileContent = `# Test Doc

- [ ] Test task
`;

      const mockParsedContent = {
        data: {},
        content: `# Test Doc

- [ ] Test task
`,
      };

      // Mock file finding - first .mdx searches fail, then .md search succeeds
      mockFs.readdir
        .mockResolvedValueOnce([]) // docs directory - no test-doc.mdx
        .mockResolvedValueOnce([]) // tasks directory - no test-doc.mdx
        .mockResolvedValueOnce([]) // docs directory - no test-doc.md
        .mockResolvedValueOnce([createMockDirent("test-doc.md")]); // tasks directory - has test-doc.md

      mockFs.readFile.mockResolvedValue(mockFileContent);
      mockMatter.mockReturnValue(mockParsedContent);
      mockMatter.stringify = jest.fn().mockReturnValue("updated content");

      const request = new NextRequest(
        "http://localhost:3000/api/subtasks/test-doc/test-doc.md-2",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mockBody),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });

      expect(response.status).toBe(200);
      // This test verifies that the route searches both .mdx and .md extensions via findFileRecursively
      expect(mockFs.readdir).toHaveBeenCalledTimes(4); // docs/.mdx, tasks/.mdx, docs/.md, tasks/.md
    });

    it("should preserve task indentation when updating", async () => {
      const mockParams = { taskId: "epic-1", subtaskId: "epic-1.mdx-3" }; // Line 3 is the nested task
      const mockBody = { status: "done" };

      const mockFileContent = `---
title: Epic 1
---

# Epic 1

- [ ] First task
  - [ ] Nested task
- [ ] Third task
`;

      const mockParsedContent = {
        data: { title: "Epic 1" },
        content: `# Epic 1

- [ ] First task
  - [ ] Nested task
- [ ] Third task
`,
      };

      // Mock findFileRecursively: docs empty, tasks has file
      mockFs.readdir
        .mockResolvedValueOnce([]) // docs directory - no epic-1.mdx
        .mockResolvedValueOnce([createMockDirent("epic-1.mdx")]); // tasks directory - has epic-1.mdx

      mockFs.readFile.mockResolvedValue(mockFileContent);
      mockMatter.mockReturnValue(mockParsedContent);

      let writtenContent = "";
      mockMatter.stringify = jest.fn().mockImplementation((content, _data) => {
        writtenContent = content;
        return `---\ntitle: Epic 1\n---\n\n${content}`;
      });

      const request = new NextRequest(
        "http://localhost:3000/api/subtasks/epic-1/epic-1.mdx-3",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mockBody),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve(mockParams),
      });

      expect(response.status).toBe(200);
      // Verify indentation is preserved
      expect(writtenContent).toContain("  - [x] Nested task");
    });
  });
});
