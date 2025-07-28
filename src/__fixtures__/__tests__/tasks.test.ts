/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  mockFileStructure,
  mockMarkdownContent,
  mockSubtask,
  mockTaskGroups,
} from "../tasks";

describe("Tasks Fixtures", () => {
  describe("mockTaskGroups", () => {
    it("should export an array of task groups", () => {
      expect(Array.isArray(mockTaskGroups)).toBe(true);
      expect(mockTaskGroups.length).toBeGreaterThan(0);
    });

    it("should have valid task group structure", () => {
      mockTaskGroups.forEach((group) => {
        expect(group).toHaveProperty("id");
        expect(group).toHaveProperty("path");
        expect(group).toHaveProperty("title");
        expect(group).toHaveProperty("type");
        expect(group).toHaveProperty("status");
        expect(group).toHaveProperty("priority");
        expect(group).toHaveProperty("description");
        expect(group).toHaveProperty("tags");
        expect(group).toHaveProperty("subtasks");

        expect(typeof group.id).toBe("string");
        expect(typeof group.path).toBe("string");
        expect(typeof group.title).toBe("string");
        expect(typeof group.type).toBe("string");
        expect(typeof group.status).toBe("string");
        expect(typeof group.priority).toBe("string");
        expect(typeof group.description).toBe("string");
        expect(Array.isArray(group.tags)).toBe(true);
        expect(Array.isArray(group.subtasks)).toBe(true);
      });
    });

    it("should have unique IDs across task groups", () => {
      const ids = mockTaskGroups.map((group) => group.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid file paths", () => {
      mockTaskGroups.forEach((group) => {
        expect(group.path).toMatch(/\.mdx$/);
        expect(group.path).toMatch(/^tasks\//);
      });
    });

    it("should use valid task types", () => {
      const validTypes = ["epic", "story", "bug", "task", "documentation"];

      mockTaskGroups.forEach((group) => {
        expect(validTypes).toContain(group.type);
      });
    });

    it("should use valid status values", () => {
      const validStatuses = ["todo", "in_progress", "done"];

      mockTaskGroups.forEach((group) => {
        expect(validStatuses).toContain(group.status);
      });
    });

    it("should use valid priority values", () => {
      const validPriorities = ["low", "medium", "high", "critical"];

      mockTaskGroups.forEach((group) => {
        expect(validPriorities).toContain(group.priority);
      });
    });

    it("should have meaningful titles and descriptions", () => {
      mockTaskGroups.forEach((group) => {
        expect(group.title.length).toBeGreaterThan(5);
        expect(group.description.length).toBeGreaterThan(10);

        // Titles should not end with punctuation
        expect(group.title).not.toMatch(/[.!?]$/);

        // Descriptions should be descriptive sentences
        expect(group.description).toMatch(/\w+/);
      });
    });

    it("should have realistic tag sets", () => {
      mockTaskGroups.forEach((group) => {
        expect(group.tags.length).toBeGreaterThan(0);
        expect(group.tags.length).toBeLessThan(10);

        group.tags.forEach((tag) => {
          expect(typeof tag).toBe("string");
          expect(tag.length).toBeGreaterThan(0);
          expect(tag).not.toMatch(/\s/); // No spaces in tags
        });
      });
    });

    describe("user-authentication task group", () => {
      const authGroup = mockTaskGroups.find(
        (g) => g.id === "user-authentication"
      );

      it("should exist and have correct basic properties", () => {
        expect(authGroup).toBeDefined();
        expect(authGroup?.title).toBe("User Authentication System");
        expect(authGroup?.type).toBe("epic");
        expect(authGroup?.status).toBe("in_progress");
        expect(authGroup?.priority).toBe("high");
      });

      it("should have authentication-related tags", () => {
        expect(authGroup?.tags).toContain("auth");
        expect(authGroup?.tags).toContain("security");
        expect(authGroup?.tags).toContain("backend");
      });

      it("should have multiple subtasks with different states", () => {
        expect(authGroup?.subtasks).toBeDefined();
        expect(authGroup!.subtasks.length).toBeGreaterThan(1);

        const subtasks = authGroup!.subtasks;

        // Should have both completed and incomplete subtasks
        const completedTasks = subtasks.filter((st) => st.completed);
        const incompleteTasks = subtasks.filter((st) => !st.completed);

        expect(completedTasks.length).toBeGreaterThan(0);
        expect(incompleteTasks.length).toBeGreaterThan(0);
      });

      it("should have realistic authentication subtasks", () => {
        const subtasks = authGroup!.subtasks;

        const taskTexts = subtasks.map((st) => st.text.toLowerCase());
        const combinedText = taskTexts.join(" ");

        // Should mention authentication-related concepts
        expect(combinedText).toMatch(/oauth|user|password|auth/);
      });
    });

    describe("dashboard-redesign task group", () => {
      const dashboardGroup = mockTaskGroups.find(
        (g) => g.id === "dashboard-redesign"
      );

      it("should exist and have correct basic properties", () => {
        expect(dashboardGroup).toBeDefined();
        expect(dashboardGroup?.title).toBe("Dashboard UI Redesign");
        expect(dashboardGroup?.type).toBe("story");
        expect(dashboardGroup?.status).toBe("todo");
        expect(dashboardGroup?.priority).toBe("medium");
      });

      it("should have UI-related tags", () => {
        expect(dashboardGroup?.tags).toContain("ui");
        expect(dashboardGroup?.tags).toContain("frontend");
        expect(dashboardGroup?.tags).toContain("design");
      });

      it("should have design-related subtasks", () => {
        const subtasks = dashboardGroup!.subtasks;

        const taskTexts = subtasks.map((st) => st.text.toLowerCase());
        const combinedText = taskTexts.join(" ");

        // Should mention design-related concepts
        expect(combinedText).toMatch(/wireframe|design|component|library/);
      });
    });
  });

  describe("subtasks structure", () => {
    it("should have valid subtask structure in all groups", () => {
      mockTaskGroups.forEach((group) => {
        group.subtasks.forEach((subtask) => {
          expect(subtask).toHaveProperty("id");
          expect(subtask).toHaveProperty("text");
          expect(subtask).toHaveProperty("completed");
          expect(subtask).toHaveProperty("status");

          expect(typeof subtask.id).toBe("string");
          expect(typeof subtask.text).toBe("string");
          expect(typeof subtask.completed).toBe("boolean");
          expect(typeof subtask.status).toBe("string");

          // Optional properties
          if (subtask.priority) {
            expect(typeof subtask.priority).toBe("string");
          }
          if (subtask.assignee) {
            expect(typeof subtask.assignee).toBe("string");
          }
        });
      });
    });

    it("should have unique subtask IDs within each group", () => {
      mockTaskGroups.forEach((group) => {
        const subtaskIds = group.subtasks.map((st) => st.id);
        const uniqueSubtaskIds = new Set(subtaskIds);
        expect(uniqueSubtaskIds.size).toBe(subtaskIds.length);
      });
    });

    it("should have consistent completed/status relationship", () => {
      mockTaskGroups.forEach((group) => {
        group.subtasks.forEach((subtask) => {
          if (subtask.completed) {
            expect(subtask.status).toBe("done");
          } else {
            expect(["todo", "in_progress"]).toContain(subtask.status);
          }
        });
      });
    });

    it("should have realistic assignee names", () => {
      const allSubtasks = mockTaskGroups.flatMap((g) => g.subtasks);
      const assigneesWithAssignee = allSubtasks.filter((st) => st.assignee);

      expect(assigneesWithAssignee.length).toBeGreaterThan(0);

      assigneesWithAssignee.forEach((subtask) => {
        // Should be in format firstname.lastname or role
        expect(subtask.assignee).toMatch(/^[a-z]+([.-][a-z]+)*$/);
      });
    });
  });

  describe("mockSubtask", () => {
    it("should have valid standalone subtask structure", () => {
      expect(mockSubtask).toBeDefined();
      expect(mockSubtask).toHaveProperty("id");
      expect(mockSubtask).toHaveProperty("text");
      expect(mockSubtask).toHaveProperty("completed");
      expect(mockSubtask).toHaveProperty("priority");
      expect(mockSubtask).toHaveProperty("status");
      expect(mockSubtask).toHaveProperty("assignee");

      expect(typeof mockSubtask.id).toBe("string");
      expect(typeof mockSubtask.text).toBe("string");
      expect(typeof mockSubtask.completed).toBe("boolean");
      expect(typeof mockSubtask.priority).toBe("string");
      expect(typeof mockSubtask.status).toBe("string");
      expect(typeof mockSubtask.assignee).toBe("string");
    });

    it("should have consistent data", () => {
      expect(mockSubtask.id).toBe("test-subtask");
      expect(mockSubtask.text).toBe("Sample subtask for testing");
      expect(mockSubtask.completed).toBe(false);
      expect(mockSubtask.priority).toBe("medium");
      expect(mockSubtask.status).toBe("todo");
      expect(mockSubtask.assignee).toBe("test.user");
    });

    it("should have realistic testing values", () => {
      expect(mockSubtask.text).toMatch(/test/i);
      expect(mockSubtask.assignee).toMatch(/test/i);
      expect(mockSubtask.id).toMatch(/test/i);
    });
  });

  describe("mockFileStructure", () => {
    it("should export a valid file structure array", () => {
      expect(Array.isArray(mockFileStructure)).toBe(true);
      expect(mockFileStructure.length).toBeGreaterThan(0);
    });

    it("should have valid file structure nodes", () => {
      const validateNode = (node: any) => {
        expect(node).toHaveProperty("path");
        expect(node).toHaveProperty("type");
        expect(typeof node.path).toBe("string");
        expect(["file", "directory"]).toContain(node.type);

        if (node.type === "directory") {
          expect(node).toHaveProperty("children");
          expect(Array.isArray(node.children)).toBe(true);

          // Recursively validate children
          node.children.forEach(validateNode);
        }
      };

      mockFileStructure.forEach(validateNode);
    });

    it("should have realistic project structure", () => {
      const topLevelPaths = mockFileStructure.map((node) => node.path);

      expect(topLevelPaths).toContain("tasks");
      expect(topLevelPaths).toContain("docs");
    });

    it("should have hierarchical path structure", () => {
      const validatePathHierarchy = (node: any, parentPath?: string) => {
        if (parentPath) {
          expect(node.path).toMatch(new RegExp(`^${parentPath}/`));
        }

        if (node.type === "directory" && node.children) {
          node.children.forEach((child: any) => {
            validatePathHierarchy(child, node.path);
          });
        }
      };

      mockFileStructure.forEach((node) => validatePathHierarchy(node));
    });

    it("should contain MDX files in appropriate directories", () => {
      const getAllFiles = (nodes: any[]): any[] => {
        const files: any[] = [];

        nodes.forEach((node) => {
          if (node.type === "file") {
            files.push(node);
          } else if (node.children) {
            files.push(...getAllFiles(node.children));
          }
        });

        return files;
      };

      const allFiles = getAllFiles(mockFileStructure);
      const mdxFiles = allFiles.filter((file) => file.path.endsWith(".mdx"));

      expect(mdxFiles.length).toBeGreaterThan(0);

      mdxFiles.forEach((file) => {
        expect(file.path).toMatch(/\.(mdx)$/);
      });
    });

    it("should have tasks subdirectories", () => {
      const tasksNode = mockFileStructure.find((node) => node.path === "tasks");

      expect(tasksNode).toBeDefined();
      expect(tasksNode?.type).toBe("directory");
      expect(tasksNode?.children).toBeDefined();

      const taskSubdirs = tasksNode!.children.map((child: any) => child.path);
      expect(taskSubdirs).toContain("tasks/epics");
      expect(taskSubdirs).toContain("tasks/stories");
    });
  });

  describe("mockMarkdownContent", () => {
    it("should export valid markdown content string", () => {
      expect(typeof mockMarkdownContent).toBe("string");
      expect(mockMarkdownContent.length).toBeGreaterThan(100);
    });

    it("should contain valid frontmatter", () => {
      expect(mockMarkdownContent).toMatch(/^---\n/);
      expect(mockMarkdownContent).toMatch(/\n---\n/);

      // Should contain all required frontmatter fields
      expect(mockMarkdownContent).toMatch(/title:/);
      expect(mockMarkdownContent).toMatch(/type:/);
      expect(mockMarkdownContent).toMatch(/status:/);
      expect(mockMarkdownContent).toMatch(/priority:/);
      expect(mockMarkdownContent).toMatch(/assignee:/);
      expect(mockMarkdownContent).toMatch(/description:/);
      expect(mockMarkdownContent).toMatch(/tags:/);
    });

    it("should contain markdown content sections", () => {
      expect(mockMarkdownContent).toMatch(/# Sample Task/);
      expect(mockMarkdownContent).toMatch(/## Acceptance Criteria/);
      expect(mockMarkdownContent).toMatch(/## Implementation Notes/);
    });

    it("should contain task list items with metadata", () => {
      // Should have uncompleted tasks
      expect(mockMarkdownContent).toMatch(/- \[ \]/);

      // Should have completed tasks
      expect(mockMarkdownContent).toMatch(/- \[x\]/);

      // Should have metadata in braces
      expect(mockMarkdownContent).toMatch(/\{priority: ["']high["']\}/);
      expect(mockMarkdownContent).toMatch(/\{status: ["']done["']\}/);
      expect(mockMarkdownContent).toMatch(/\{assignee: ["'][^"']+["']\}/);
    });

    it("should have realistic sample content", () => {
      expect(mockMarkdownContent).toMatch(/sample|test/i);
      expect(mockMarkdownContent).toMatch(/testing/i);

      // Should mention realistic development concepts
      expect(mockMarkdownContent).toMatch(/criterion|implementation/i);
    });

    it("should be suitable for MDX parsing tests", () => {
      // Split into frontmatter and content
      const parts = mockMarkdownContent.split(/\n---\n/);
      expect(parts.length).toBe(2);

      const [frontmatter, content] = parts;
      expect(frontmatter.trim()).not.toBe("");
      expect(content.trim()).not.toBe("");
    });
  });

  describe("fixture integration and consistency", () => {
    it("should use consistent naming conventions", () => {
      // Task group IDs should use kebab-case
      mockTaskGroups.forEach((group) => {
        expect(group.id).toMatch(/^[a-z]+(-[a-z]+)*$/);
      });

      // Subtask IDs should use kebab-case
      const allSubtasks = mockTaskGroups.flatMap((g) => g.subtasks);
      allSubtasks.forEach((subtask) => {
        expect(subtask.id).toMatch(/^[a-z]+(-[a-z]+)*$/);
      });
    });

    it("should have consistent assignee format across all fixtures", () => {
      const allAssignees = new Set<string>();

      // Collect assignees from task groups
      mockTaskGroups.forEach((group) => {
        if (group.assignee) {
          allAssignees.add(group.assignee);
        }

        group.subtasks.forEach((subtask) => {
          if (subtask.assignee) {
            allAssignees.add(subtask.assignee);
          }
        });
      });

      // Add standalone subtask assignee
      allAssignees.add(mockSubtask.assignee);

      // All assignees should follow consistent format
      allAssignees.forEach((assignee) => {
        expect(assignee).toMatch(/^[a-z]+([.-][a-z]+)*$/);
      });
    });

    it("should provide good test data diversity", () => {
      // Should have different task types
      const types = mockTaskGroups.map((g) => g.type);
      expect(new Set(types).size).toBeGreaterThan(1);

      // Should have different statuses
      const statuses = mockTaskGroups.map((g) => g.status);
      expect(new Set(statuses).size).toBeGreaterThan(1);

      // Should have different priorities
      const priorities = mockTaskGroups.map((g) => g.priority);
      expect(new Set(priorities).size).toBeGreaterThan(1);
    });

    it("should be suitable for comprehensive testing scenarios", () => {
      // Should have enough task groups for testing
      expect(mockTaskGroups.length).toBeGreaterThanOrEqual(2);

      // Should have enough subtasks total for testing
      const totalSubtasks = mockTaskGroups.reduce(
        (sum, g) => sum + g.subtasks.length,
        0
      );
      expect(totalSubtasks).toBeGreaterThan(3);

      // Should have realistic file structure depth
      const maxDepth = (nodes: any[], depth = 0): number => {
        return Math.max(
          depth,
          ...nodes.map((node) =>
            node.children ? maxDepth(node.children, depth + 1) : depth
          )
        );
      };

      expect(maxDepth(mockFileStructure)).toBeGreaterThanOrEqual(2);
    });
  });
});
