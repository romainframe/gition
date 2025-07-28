import { render, screen } from "@testing-library/react";

import { InteractiveMarkdown } from "../interactive-markdown";

// Mock the InteractiveCheckbox component
jest.mock("../interactive-checkbox", () => ({
  InteractiveCheckbox: ({
    taskGroupId,
    subtaskId,
    status,
    completed,
    className,
  }: {
    taskGroupId: string;
    subtaskId: string;
    status: string;
    completed: boolean;
    className?: string;
  }) => (
    <input
      type="checkbox"
      data-testid="interactive-checkbox"
      data-task-group-id={taskGroupId}
      data-subtask-id={subtaskId}
      data-status={status}
      checked={completed}
      className={className}
      readOnly
    />
  ),
}));

describe("InteractiveMarkdown", () => {
  const sampleTasks = [
    {
      id: "task-1",
      title: "Complete feature A",
      status: "todo" as const,
      completed: false,
      line: 3,
    },
    {
      id: "task-2",
      title: "Review code",
      status: "done" as const,
      completed: true,
      line: 4,
    },
    {
      id: "task-3",
      title: "Update documentation",
      status: "in_progress" as const,
      completed: false,
      line: 5,
    },
  ];

  describe("basic rendering", () => {
    it("should render interactive markdown without errors", () => {
      expect(() => {
        render(<InteractiveMarkdown content="# Test\n\nSimple content" />);
      }).not.toThrow();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <InteractiveMarkdown
          content="Test content"
          className="custom-markdown"
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("custom-markdown");
    });

    it("should render plain content when no tasks provided", () => {
      render(<InteractiveMarkdown content="Simple paragraph" />);

      expect(screen.getByText("Simple paragraph")).toBeInTheDocument();
    });
  });

  describe("markdown parsing", () => {
    it("should render h1 headings correctly", () => {
      render(<InteractiveMarkdown content="# Main Heading" />);

      const heading = screen.getByText("Main Heading");
      expect(heading.tagName).toBe("H1");
      expect(heading).toHaveClass(
        "text-4xl",
        "font-bold",
        "tracking-tight",
        "mb-6"
      );
    });

    it("should render h2 headings correctly", () => {
      render(<InteractiveMarkdown content="## Sub Heading" />);

      const heading = screen.getByText("Sub Heading");
      expect(heading.tagName).toBe("H2");
      expect(heading).toHaveClass(
        "text-3xl",
        "font-semibold",
        "tracking-tight",
        "mb-4",
        "mt-8"
      );
    });

    it("should render h3 headings correctly", () => {
      render(<InteractiveMarkdown content="### Section Heading" />);

      const heading = screen.getByText("Section Heading");
      expect(heading.tagName).toBe("H3");
      expect(heading).toHaveClass(
        "text-2xl",
        "font-semibold",
        "tracking-tight",
        "mb-3",
        "mt-6"
      );
    });

    it("should render paragraphs correctly", () => {
      render(<InteractiveMarkdown content="This is a paragraph" />);

      const paragraph = screen.getByText("This is a paragraph");
      expect(paragraph.tagName).toBe("P");
      expect(paragraph).toHaveClass("text-base", "leading-7", "mb-4");
    });

    it("should handle empty lines with line breaks", () => {
      const content = "First line\n\nSecond line";
      const { container } = render(<InteractiveMarkdown content={content} />);

      expect(screen.getByText("First line")).toBeInTheDocument();
      expect(screen.getByText("Second line")).toBeInTheDocument();
      expect(container.querySelector("br")).toBeInTheDocument();
    });
  });

  describe("task integration", () => {
    it("should render interactive checkboxes for task items", () => {
      const content = `
# Project Tasks

## Current Sprint
- [ ] Complete feature A
- [x] Review code
- [~] Update documentation
      `.trim();

      render(
        <InteractiveMarkdown
          content={content}
          taskGroupId="project-1"
          tasks={sampleTasks}
        />
      );

      // Should render interactive checkboxes
      const checkboxes = screen.getAllByTestId("interactive-checkbox");
      expect(checkboxes).toHaveLength(3);

      // Check properties of first checkbox
      expect(checkboxes[0]).toHaveAttribute("data-task-group-id", "project-1");
      expect(checkboxes[0]).toHaveAttribute("data-subtask-id", "task-1");
      expect(checkboxes[0]).toHaveAttribute("data-status", "todo");
      expect(checkboxes[0]).not.toBeChecked();

      // Check properties of second checkbox
      expect(checkboxes[1]).toHaveAttribute("data-subtask-id", "task-2");
      expect(checkboxes[1]).toHaveAttribute("data-status", "done");
      expect(checkboxes[1]).toBeChecked();
    });

    it("should render task text with proper styling", () => {
      const content = `- [ ] Complete feature A
- [x] Review code`;

      render(
        <InteractiveMarkdown
          content={content}
          taskGroupId="project-1"
          tasks={sampleTasks}
        />
      );

      // Incomplete task should not have line-through
      const incompleteTask = screen.getByText("Complete feature A");
      expect(incompleteTask).not.toHaveClass("line-through");
      expect(incompleteTask).toHaveClass("text-base", "leading-7");

      // Completed task should have line-through
      const completedTask = screen.getByText("Review code");
      expect(completedTask).toHaveClass(
        "line-through",
        "text-muted-foreground"
      );
    });

    it("should handle tasks without matching content", () => {
      const content = `- [ ] Some other task`;

      render(
        <InteractiveMarkdown
          content={content}
          taskGroupId="project-1"
          tasks={sampleTasks}
        />
      );

      // Should render as regular text since no matching task
      expect(screen.getByText("- [ ] Some other task")).toBeInTheDocument();
      expect(
        screen.queryByTestId("interactive-checkbox")
      ).not.toBeInTheDocument();
    });

    it("should render regular markdown when no taskGroupId provided", () => {
      const content = `- [ ] Complete feature A`;

      render(<InteractiveMarkdown content={content} tasks={sampleTasks} />);

      // Should render as regular text
      expect(screen.getByText("- [ ] Complete feature A")).toBeInTheDocument();
      expect(
        screen.queryByTestId("interactive-checkbox")
      ).not.toBeInTheDocument();
    });

    it("should render regular markdown when no tasks provided", () => {
      const content = `- [ ] Complete feature A`;

      render(<InteractiveMarkdown content={content} taskGroupId="project-1" />);

      // Should render as regular text
      expect(screen.getByText("- [ ] Complete feature A")).toBeInTheDocument();
      expect(
        screen.queryByTestId("interactive-checkbox")
      ).not.toBeInTheDocument();
    });
  });

  describe("task matching strategies", () => {
    it("should match tasks by line number", () => {
      const tasks = [
        {
          id: "task-line-3",
          title: "Any title",
          status: "todo" as const,
          completed: false,
          line: 3,
        },
      ];

      const content = `Line 1
Line 2
- [ ] Task on line 3`;

      render(
        <InteractiveMarkdown
          content={content}
          taskGroupId="project-1"
          tasks={tasks}
        />
      );

      expect(screen.getByTestId("interactive-checkbox")).toBeInTheDocument();
      expect(screen.getByTestId("interactive-checkbox")).toHaveAttribute(
        "data-subtask-id",
        "task-line-3"
      );
    });

    it("should match tasks by exact title", () => {
      const tasks = [
        {
          id: "task-exact-title",
          title: "Exact task title",
          status: "todo" as const,
          completed: false,
          line: 999, // Different line number
        },
      ];

      const content = `- [ ] Exact task title`;

      render(
        <InteractiveMarkdown
          content={content}
          taskGroupId="project-1"
          tasks={tasks}
        />
      );

      expect(screen.getByTestId("interactive-checkbox")).toBeInTheDocument();
      expect(screen.getByTestId("interactive-checkbox")).toHaveAttribute(
        "data-subtask-id",
        "task-exact-title"
      );
    });

    it("should match tasks by partial title inclusion", () => {
      const tasks = [
        {
          id: "task-partial",
          title: "feature",
          status: "todo" as const,
          completed: false,
          line: 999,
        },
      ];

      const content = `- [ ] Implement new feature with tests`;

      render(
        <InteractiveMarkdown
          content={content}
          taskGroupId="project-1"
          tasks={tasks}
        />
      );

      expect(screen.getByTestId("interactive-checkbox")).toBeInTheDocument();
      expect(screen.getByTestId("interactive-checkbox")).toHaveAttribute(
        "data-subtask-id",
        "task-partial"
      );
    });
  });

  describe("complex content handling", () => {
    it("should handle mixed content with headers and tasks", () => {
      const content = `# Project Overview

## Tasks
- [ ] Complete feature A
- [x] Review code

## Notes
This is a regular paragraph.

### Subsection
More content here.`;

      render(
        <InteractiveMarkdown
          content={content}
          taskGroupId="project-1"
          tasks={sampleTasks}
        />
      );

      // Check headers
      expect(screen.getByText("Project Overview")).toBeInTheDocument();
      expect(screen.getByText("Tasks")).toBeInTheDocument();
      expect(screen.getByText("Subsection")).toBeInTheDocument();

      // Check tasks
      expect(screen.getAllByTestId("interactive-checkbox")).toHaveLength(2);

      // Check regular content
      expect(
        screen.getByText("This is a regular paragraph.")
      ).toBeInTheDocument();
      expect(screen.getByText("More content here.")).toBeInTheDocument();
    });

    it("should handle indented task lists", () => {
      const content = `# Tasks
  - [ ] Indented task
    - [ ] Nested task`;

      const tasks = [
        {
          id: "indented-task",
          title: "Indented task",
          status: "todo" as const,
          completed: false,
          line: 2,
        },
        {
          id: "nested-task",
          title: "Nested task",
          status: "todo" as const,
          completed: false,
          line: 3,
        },
      ];

      render(
        <InteractiveMarkdown
          content={content}
          taskGroupId="project-1"
          tasks={tasks}
        />
      );

      expect(screen.getAllByTestId("interactive-checkbox")).toHaveLength(2);
    });

    it("should preserve checkbox layout and spacing", () => {
      const content = `- [ ] Complete feature A
- [x] Review code`;

      render(
        <InteractiveMarkdown
          content={content}
          taskGroupId="project-1"
          tasks={sampleTasks.slice(0, 2)}
        />
      );

      const checkboxContainers = screen
        .getAllByTestId("interactive-checkbox")
        .map((checkbox) => checkbox.closest("div"));

      checkboxContainers.forEach((container) => {
        expect(container).toHaveClass("flex", "items-start", "gap-2", "my-1");
      });
    });
  });

  describe("edge cases", () => {
    it("should handle empty content", () => {
      expect(() => {
        render(<InteractiveMarkdown content="" />);
      }).not.toThrow();
    });

    it("should handle content with only whitespace", () => {
      expect(() => {
        render(<InteractiveMarkdown content="   \n\n   " />);
      }).not.toThrow();
    });

    it("should handle malformed checkbox syntax", () => {
      const content = `- [] Missing space
- [ Missing bracket
-[ ] Missing space before bracket`;

      render(
        <InteractiveMarkdown
          content={content}
          taskGroupId="project-1"
          tasks={sampleTasks}
        />
      );

      // Should render as regular text
      expect(screen.getByText("- [] Missing space")).toBeInTheDocument();
      expect(screen.getByText("- [ Missing bracket")).toBeInTheDocument();
      expect(
        screen.getByText("-[ ] Missing space before bracket")
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId("interactive-checkbox")
      ).not.toBeInTheDocument();
    });

    it("should handle tasks array with undefined or null values", () => {
      const content = `- [ ] Valid task`;
      const tasksWithNulls = [
        null,
        {
          id: "valid-task",
          title: "Valid task",
          status: "todo" as const,
          completed: false,
          line: 1,
        },
        undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ].filter(Boolean) as any[];

      expect(() => {
        render(
          <InteractiveMarkdown
            content={content}
            taskGroupId="project-1"
            tasks={tasksWithNulls}
          />
        );
      }).not.toThrow();
    });
  });

  describe("performance and memoization", () => {
    it("should not reprocess content unnecessarily", () => {
      const content = `# Test\n- [ ] Task`;
      const { rerender } = render(
        <InteractiveMarkdown
          content={content}
          taskGroupId="project-1"
          tasks={sampleTasks}
        />
      );

      // Rerender with same props
      rerender(
        <InteractiveMarkdown
          content={content}
          taskGroupId="project-1"
          tasks={sampleTasks}
        />
      );

      // Should still render correctly
      expect(screen.getByText("Test")).toBeInTheDocument();
    });

    it("should handle large content efficiently", () => {
      const largeContent = Array.from(
        { length: 100 },
        (_, i) =>
          `## Section ${i}\n- [ ] Task ${i}\n\nContent for section ${i}.`
      ).join("\n\n");

      const largeTasks = Array.from({ length: 100 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i}`,
        status: "todo" as const,
        completed: false,
        line: i * 4 + 2,
      }));

      expect(() => {
        render(
          <InteractiveMarkdown
            content={largeContent}
            taskGroupId="project-1"
            tasks={largeTasks}
          />
        );
      }).not.toThrow();
    });
  });
});
