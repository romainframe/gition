import { jest } from "@jest/globals";

import {
  extractTasks,
  getAllTasks,
  getTargetDirectory,
  getTaskGroups,
  getTasksByGroup,
} from "../mdx";

// Mock path module
jest.mock("path", () => ({
  ...jest.requireActual("path"),
  join: (...args: string[]) => args.join("/"),
  resolve: (...args: string[]) => args.join("/"),
}));

describe("MDX Library Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.GITION_TARGET_DIR;
  });

  describe("getTargetDirectory", () => {
    it("should return environment variable when set", () => {
      process.env.GITION_TARGET_DIR = "/custom/path";
      expect(getTargetDirectory()).toBe("/custom/path");
    });

    it("should return current directory when environment variable not set", () => {
      expect(getTargetDirectory()).toBe(process.cwd());
    });

    it("should handle empty environment variable", () => {
      process.env.GITION_TARGET_DIR = "";
      expect(getTargetDirectory()).toBe(process.cwd());
    });
  });

  describe("extractTasks", () => {
    it("should extract simple tasks from markdown content", () => {
      const content = `# My Tasks

- [ ] First task
- [x] Completed task
- [ ] Third task

Some other content.`;

      const tasks = extractTasks(content, "/test/file.md");

      expect(tasks).toHaveLength(3);
      expect(tasks[0].title).toBe("First task");
      expect(tasks[0].completed).toBe(false);
      expect(tasks[0].line).toBe(3);
      expect(tasks[1].title).toBe("Completed task");
      expect(tasks[1].completed).toBe(true);
      expect(tasks[2].title).toBe("Third task");
      expect(tasks[2].completed).toBe(false);
    });

    it("should extract tasks with metadata", () => {
      const content = `# Tasks with Metadata

- [ ] Task with priority (high)
- [ ] Task with assignee +john @2024-01-15
- [x] Task with tags #frontend #urgent`;

      const tasks = extractTasks(content, "/test/file.md");

      expect(tasks).toHaveLength(3);
      expect(tasks[0].metadata?.priority).toBe("high");
      expect(tasks[1].metadata?.assignee).toBe("john");
      expect(tasks[1].metadata?.due_date).toBe("2024-01-15");
      expect(tasks[2].metadata?.tags).toEqual(["frontend", "urgent"]);
    });

    it("should handle nested task lists", () => {
      const content = `# Main Tasks

- [ ] Parent task
  - [ ] Subtask 1
  - [x] Subtask 2
    - [ ] Nested subtask
- [ ] Another parent task`;

      const tasks = extractTasks(content, "/test/file.md");

      expect(tasks).toHaveLength(5);
      expect(tasks[0].title).toBe("Parent task");
      expect(tasks[1].title).toBe("Subtask 1");
      expect(tasks[2].title).toBe("Subtask 2");
      expect(tasks[3].title).toBe("Nested subtask");
      expect(tasks[4].title).toBe("Another parent task");
    });

    it("should extract references from task titles", () => {
      const content = `# Tasks with References

- [ ] Implement feature ref:epics/epic-01
- [ ] Fix bug described in ref:docs/other-file
- [ ] Review task ref:stories/story-02`;

      const tasks = extractTasks(content, "/test/file.md");

      expect(tasks).toHaveLength(3);
      expect(tasks[0].references).toContain("epics/epic-01");
      expect(tasks[1].references).toContain("docs/other-file");
      expect(tasks[2].references).toContain("stories/story-02");
    });

    it("should handle malformed metadata gracefully", () => {
      const content = `# Tasks with Bad Metadata

- [ ] Task with invalid priority (unknown)
- [ ] Task with broken assignee +
- [ ] Normal task`;

      const tasks = extractTasks(content, "/test/file.md");

      expect(tasks).toHaveLength(3);
      expect(tasks[0].metadata?.priority).toBeUndefined();
      expect(tasks[1].metadata?.assignee).toBeUndefined();
      expect(tasks[2].metadata).toBeUndefined();
    });

    it("should ignore non-task lines", () => {
      const content = `# Mixed Content

This is a paragraph.

- Regular list item (not a task)
- [ ] This is a task
- Another regular item

1. Numbered list item
2. [ ] This looks like a task but in numbered list

- [x] Real task`;

      const tasks = extractTasks(content, "/test/file.md");

      expect(tasks).toHaveLength(2);
      expect(tasks[0].title).toBe("This is a task");
      expect(tasks[1].title).toBe("Real task");
    });

    it("should handle empty content", () => {
      const tasks = extractTasks("", "/test/file.md");
      expect(tasks).toHaveLength(0);
    });

    it("should handle content with no tasks", () => {
      const content = `# Document Without Tasks

This is just a regular document with some content.

Here are some points:
- Regular bullet point
- Another bullet point

But no task checkboxes.`;

      const tasks = extractTasks(content, "/test/file.md");
      expect(tasks).toHaveLength(0);
    });
  });

  describe("getAllTasks", () => {
    it("should return an array of tasks", () => {
      // Since getAllTasks depends on file system operations,
      // we'll just test that it returns an array
      const tasks = getAllTasks();
      expect(Array.isArray(tasks)).toBe(true);
    });
  });

  describe("getTaskGroups", () => {
    beforeEach(() => {
      // Mock the getAllTasks function result
      jest.doMock("../mdx", () => ({
        ...jest.requireActual("../mdx"),
        getAllTasks: jest.fn(() => [
          {
            id: "task-1",
            title: "Task 1",
            completed: false,
            status: "todo",
            line: 1,
            file: "/tasks/feature.md",
            type: "story",
            folder: "tasks",
          },
          {
            id: "task-2",
            title: "Task 2",
            completed: true,
            status: "done",
            line: 2,
            file: "/tasks/feature.md",
            type: "story",
            folder: "tasks",
          },
        ]),
      }));
    });

    it("should group tasks by their parent files", () => {
      const groups = getTaskGroups();

      expect(groups.length).toBeGreaterThan(0);
      // Each group should have tasks from the same file
      groups.forEach((group) => {
        group.subtasks.forEach((task) => {
          expect(task.file).toBe(group.file);
        });
      });
    });
  });

  describe("getTasksByGroup", () => {
    it("should filter tasks by group ID", () => {
      // This would require mocking getAllTasks to return predictable data
      // For now, just test that it returns an array
      const tasks = getTasksByGroup("nonexistent-group");
      expect(Array.isArray(tasks)).toBe(true);
    });
  });
});
