import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import TaskDetailPage from "../page";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

// Mock Next.js Link component
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock language context
jest.mock("@/contexts/language-context", () => ({
  useLanguage: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "tasks.taskNotFound": "Task Not Found",
        "tasks.taskNotFoundMessage": "The requested task could not be found",
        "tasks.backToTasks": "Back to Tasks",
        "tasks.viewKanban": "View Kanban",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock inspect overlay and hooks
jest.mock("@/components/dev/inspect-overlay", () => ({
  InspectOverlay: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@/hooks/use-inspect", () => ({
  useComponentInspect: () => ({}),
}));

// Mock UI editor components
jest.mock("@/components/ui/metadata-editor", () => ({
  MetadataEditor: ({
    taskGroupId,
    subtaskId,
  }: {
    taskGroupId: string;
    subtaskId: string;
  }) => (
    <button data-testid={`metadata-editor-${taskGroupId}-${subtaskId}`}>
      Edit Metadata
    </button>
  ),
}));

jest.mock("@/components/ui/status-editor", () => ({
  StatusEditor: ({
    taskGroupId,
    subtaskId,
  }: {
    taskGroupId: string;
    subtaskId: string;
  }) => (
    <button data-testid={`status-editor-${taskGroupId}-${subtaskId}`}>
      Edit Status
    </button>
  ),
}));

jest.mock("@/components/ui/task-metadata-editor", () => ({
  TaskMetadataEditor: ({ taskId }: { taskId: string }) => (
    <button data-testid={`task-metadata-editor-${taskId}`}>
      Edit Task Metadata
    </button>
  ),
}));

jest.mock("@/components/ui/enhanced-markdown-renderer", () => ({
  EnhancedMarkdownRenderer: ({
    content,
    taskGroupId,
  }: {
    content: string;
    taskGroupId: string;
  }) => (
    <div data-testid="markdown-content" data-task-group-id={taskGroupId}>
      {content}
    </div>
  ),
}));

// Mock task store
const mockFetchTaskGroups = jest.fn();
const mockTaskStore = {
  taskGroups: [],
  isLoading: false,
  error: null,
  fetchTaskGroups: mockFetchTaskGroups,
};

jest.mock("@/store/useTaskStore", () => ({
  useTaskStore: () => mockTaskStore,
}));

// Mock useParams
const mockUseParams = jest.requireMock("next/navigation").useParams;

describe("TaskDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTaskStore.taskGroups = [];
    mockTaskStore.isLoading = false;
    mockTaskStore.error = null;
    mockUseParams.mockReturnValue({ slug: ["test-task"] });
  });

  it("should render loading state", () => {
    mockTaskStore.isLoading = true;

    render(<TaskDetailPage />);

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("should render error state when task not found", () => {
    mockUseParams.mockReturnValue({ slug: ["non-existent-task"] });
    mockTaskStore.taskGroups = [];

    render(<TaskDetailPage />);

    expect(screen.getByText("Task Not Found")).toBeInTheDocument();
    expect(
      screen.getByText("The requested task could not be found")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Back to Tasks/i })
    ).toHaveAttribute("href", "/tasks");
  });

  it("should render error state with error message", () => {
    mockTaskStore.error = "Failed to load tasks";

    render(<TaskDetailPage />);

    expect(screen.getByText("Task Not Found")).toBeInTheDocument();
    expect(screen.getByText("Failed to load tasks")).toBeInTheDocument();
  });

  it("should call fetchTaskGroups on mount", () => {
    render(<TaskDetailPage />);

    expect(mockFetchTaskGroups).toHaveBeenCalledTimes(1);
  });

  it("should render task detail when task is found", () => {
    const mockTaskGroups = [
      {
        id: "epic-1",
        name: "Test Epic",
        type: "epic",
        folder: "epics",
        file: "test-task.md",
        content: "# Test Epic\n\nThis is test content.",
        metadata: {
          title: "Test Epic Title",
          description: "Test description",
          author: "Test Author",
          date: "2024-01-15",
        },
        subtasks: [
          {
            id: "task-1",
            title: "First subtask",
            completed: false,
            status: "todo",
            line: 10,
            metadata: { priority: "high" },
            references: [],
          },
          {
            id: "task-2",
            title: "Second subtask",
            completed: true,
            status: "done",
            line: 11,
            metadata: { priority: "low", tags: ["frontend"] },
            references: ["docs/guide.md"],
          },
        ],
      },
    ];

    mockUseParams.mockReturnValue({ slug: ["test-task"] });
    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TaskDetailPage />);

    expect(screen.getByText("Test Epic Title")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
    expect(screen.getByText("Test Author")).toBeInTheDocument();
    expect(screen.getByText("test-task.md")).toBeInTheDocument();
    expect(screen.getByText("epic")).toBeInTheDocument();
    expect(screen.getByText("epics")).toBeInTheDocument();
  });

  it("should render task statistics correctly", () => {
    const mockTaskGroups = [
      {
        id: "stats-task",
        name: "Stats Task",
        type: "story",
        folder: "stories",
        file: "stats-task.md",
        content: "Content",
        metadata: {},
        subtasks: [
          {
            id: "task-1",
            title: "Completed task",
            completed: true,
            status: "done",
            line: 5,
            metadata: {},
            references: [],
          },
          {
            id: "task-2",
            title: "Pending task 1",
            completed: false,
            status: "todo",
            line: 6,
            metadata: {},
            references: [],
          },
          {
            id: "task-3",
            title: "Pending task 2",
            completed: false,
            status: "in_progress",
            line: 7,
            metadata: {},
            references: [],
          },
        ],
      },
    ];

    mockUseParams.mockReturnValue({ slug: ["stats-task"] });
    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TaskDetailPage />);

    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();

    // Check statistics values
    const stats = document.querySelectorAll(".text-lg.font-bold");
    expect(stats[0]).toHaveTextContent("3"); // Total
    expect(stats[1]).toHaveTextContent("2"); // Pending
    expect(stats[2]).toHaveTextContent("1"); // Completed
  });

  it("should render subtasks in sidebar", () => {
    const mockTaskGroups = [
      {
        id: "subtask-test",
        name: "Subtask Test",
        type: "epic",
        folder: "epics",
        file: "subtask-test.md",
        content: "Content",
        metadata: {},
        subtasks: [
          {
            id: "task-1",
            title: "First subtask",
            completed: false,
            status: "todo",
            line: 10,
            metadata: {
              priority: "high",
              assignee: "John Doe",
              due_date: "2024-01-20",
            },
            references: ["docs/guide.md"],
          },
        ],
      },
    ];

    mockUseParams.mockReturnValue({ slug: ["subtask-test"] });
    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TaskDetailPage />);

    expect(screen.getByText("Subtasks")).toBeInTheDocument();
    expect(screen.getByText("First subtask")).toBeInTheDocument();
    expect(screen.getByText("Line 10")).toBeInTheDocument();
    expect(screen.getByText("high")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("ref: guide.md")).toBeInTheDocument();
  });

  it("should handle different task statuses and priorities", () => {
    const mockTaskGroups = [
      {
        id: "status-test",
        name: "Status Test",
        type: "epic",
        folder: "epics",
        file: "status-test.md",
        content: "Content",
        metadata: {},
        subtasks: [
          {
            id: "todo-task",
            title: "Todo task",
            completed: false,
            status: "todo",
            line: 5,
            metadata: { priority: "high" },
            references: [],
          },
          {
            id: "progress-task",
            title: "In progress task",
            completed: false,
            status: "in_progress",
            line: 6,
            metadata: { priority: "medium" },
            references: [],
          },
          {
            id: "done-task",
            title: "Done task",
            completed: true,
            status: "done",
            line: 7,
            metadata: { priority: "low" },
            references: [],
          },
        ],
      },
    ];

    mockUseParams.mockReturnValue({ slug: ["status-test"] });
    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TaskDetailPage />);

    expect(screen.getByText("Todo task")).toBeInTheDocument();
    expect(screen.getByText("In progress task")).toBeInTheDocument();
    expect(screen.getByText("Done task")).toBeInTheDocument();

    expect(screen.getByText("high")).toBeInTheDocument();
    expect(screen.getByText("medium")).toBeInTheDocument();
    expect(screen.getByText("low")).toBeInTheDocument();
  });

  it("should render task tags", () => {
    const mockTaskGroups = [
      {
        id: "tags-test",
        name: "Tags Test",
        type: "epic",
        folder: "epics",
        file: "tags-test.md",
        content: "Content",
        metadata: {},
        subtasks: [
          {
            id: "tagged-task",
            title: "Tagged task",
            completed: false,
            status: "todo",
            line: 5,
            metadata: { tags: ["frontend", "ui", "component"] },
            references: [],
          },
        ],
      },
    ];

    mockUseParams.mockReturnValue({ slug: ["tags-test"] });
    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TaskDetailPage />);

    expect(screen.getByText("frontend")).toBeInTheDocument();
    expect(screen.getByText("ui")).toBeInTheDocument();
    expect(screen.getByText("component")).toBeInTheDocument();
  });

  it("should find task by different slug patterns", () => {
    const mockTaskGroups = [
      {
        id: "epics/complex-task",
        name: "Complex Task",
        type: "epic",
        folder: "epics",
        file: "complex-task.md",
        content: "Content",
        metadata: { title: "Complex Task" },
        subtasks: [],
      },
    ];

    // Test different slug patterns
    mockUseParams.mockReturnValue({ slug: ["epics", "complex-task"] });
    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TaskDetailPage />);

    expect(screen.getByText("Complex Task")).toBeInTheDocument();
  });

  it("should handle array slug params", () => {
    const mockTaskGroups = [
      {
        id: "nested-task",
        name: "Nested Task",
        type: "story",
        folder: "stories",
        file: "nested-task.md",
        content: "Content",
        metadata: {},
        subtasks: [],
      },
    ];

    mockUseParams.mockReturnValue({ slug: ["stories", "nested", "task"] });
    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TaskDetailPage />);

    // Should handle the joined slug path
    expect(mockFetchTaskGroups).toHaveBeenCalled();
  });

  it("should strip first H1 from content", () => {
    const mockTaskGroups = [
      {
        id: "h1-test",
        name: "H1 Test",
        type: "epic",
        folder: "epics",
        file: "h1-test.md",
        content: "# H1 Test\n\nThis is the actual content.",
        metadata: { title: "H1 Test" },
        subtasks: [],
      },
    ];

    mockUseParams.mockReturnValue({ slug: ["h1-test"] });
    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TaskDetailPage />);

    const markdownContent = screen.getByTestId("markdown-content");
    expect(markdownContent).toHaveTextContent("This is the actual content.");
    expect(markdownContent).not.toHaveTextContent("# H1 Test");
  });

  it("should handle content with frontmatter", () => {
    const mockTaskGroups = [
      {
        id: "frontmatter-test",
        name: "Frontmatter Test",
        type: "epic",
        folder: "epics",
        file: "frontmatter-test.md",
        content: "---\ntitle: Test\n---\n\n# Frontmatter Test\n\nContent here.",
        metadata: { title: "Frontmatter Test" },
        subtasks: [],
      },
    ];

    mockUseParams.mockReturnValue({ slug: ["frontmatter-test"] });
    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TaskDetailPage />);

    const markdownContent = screen.getByTestId("markdown-content");
    expect(markdownContent.textContent).toContain("---\ntitle: Test\n---");
    expect(markdownContent.textContent).toContain("Content here.");
    expect(markdownContent.textContent).not.toContain("# Frontmatter Test");
  });

  it("should show metadata warning alerts", () => {
    const mockTaskGroups = [
      {
        id: "no-metadata-test",
        name: "No Metadata Test",
        type: "epic",
        folder: "epics",
        file: "no-metadata-test.md",
        content: "Content",
        metadata: null,
        subtasks: [],
      },
    ];

    mockUseParams.mockReturnValue({ slug: ["no-metadata-test"] });
    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TaskDetailPage />);

    expect(
      screen.getByText(
        "No metadata found. Add frontmatter to this file for better organization."
      )
    ).toBeInTheDocument();
  });

  it("should show title warning when metadata exists but no title", () => {
    const mockTaskGroups = [
      {
        id: "no-title-test",
        name: "No Title Test",
        type: "epic",
        folder: "epics",
        file: "no-title-test.md",
        content: "Content",
        metadata: { author: "Test Author" }, // Has metadata but no title
        subtasks: [],
      },
    ];

    mockUseParams.mockReturnValue({ slug: ["no-title-test"] });
    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TaskDetailPage />);

    expect(screen.getByText(/No title found in metadata/)).toBeInTheDocument();
  });

  it("should render kanban view link", () => {
    const mockTaskGroups = [
      {
        id: "kanban-test",
        name: "Kanban Test",
        type: "epic",
        folder: "epics",
        file: "kanban-test.md",
        content: "Content",
        metadata: {},
        subtasks: [],
      },
    ];

    mockUseParams.mockReturnValue({ slug: ["kanban-test"] });
    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TaskDetailPage />);

    const kanbanLink = screen.getByRole("link", { name: /View Kanban/i });
    expect(kanbanLink).toHaveAttribute(
      "href",
      "/tasks/kanban?group=kanban-test"
    );
  });

  it("should render task count badge when tasks exist", () => {
    const mockTaskGroups = [
      {
        id: "count-test",
        name: "Count Test",
        type: "epic",
        folder: "epics",
        file: "count-test.md",
        content: "Content",
        metadata: {},
        subtasks: [
          {
            id: "1",
            title: "Task 1",
            completed: false,
            status: "todo",
            line: 1,
            metadata: {},
            references: [],
          },
          {
            id: "2",
            title: "Task 2",
            completed: false,
            status: "todo",
            line: 2,
            metadata: {},
            references: [],
          },
          {
            id: "3",
            title: "Task 3",
            completed: false,
            status: "todo",
            line: 3,
            metadata: {},
            references: [],
          },
        ],
      },
    ];

    mockUseParams.mockReturnValue({ slug: ["count-test"] });
    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TaskDetailPage />);

    expect(screen.getByText("3 tasks")).toBeInTheDocument();
  });

  it("should use filename as title when no metadata title or name", () => {
    const mockTaskGroups = [
      {
        id: "filename-test",
        name: "",
        type: "epic",
        folder: "epics",
        file: "filename-fallback.md",
        content: "Content",
        metadata: {},
        subtasks: [],
      },
    ];

    mockUseParams.mockReturnValue({ slug: ["filename-test"] });
    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TaskDetailPage />);

    expect(screen.getByText("filename-fallback")).toBeInTheDocument();
  });

  it("should format dates correctly", () => {
    const mockTaskGroups = [
      {
        id: "date-test",
        name: "Date Test",
        type: "epic",
        folder: "epics",
        file: "date-test.md",
        content: "Content",
        metadata: { date: "2024-01-15" },
        subtasks: [
          {
            id: "task-with-date",
            title: "Task with due date",
            completed: false,
            status: "todo",
            line: 5,
            metadata: { due_date: "2024-01-20" },
            references: [],
          },
        ],
      },
    ];

    mockUseParams.mockReturnValue({ slug: ["date-test"] });
    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TaskDetailPage />);

    // Check if dates are rendered using toLocaleDateString format
    const expectedDate1 = new Date("2024-01-15").toLocaleDateString();
    const expectedDate2 = new Date("2024-01-20").toLocaleDateString();
    expect(screen.getByText(expectedDate1)).toBeInTheDocument();
    expect(screen.getByText(expectedDate2)).toBeInTheDocument();
  });
});
