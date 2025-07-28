import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import TasksPage from "../page";

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
        "tasks.title": "Tasks",
        "tasks.manageProject": "Manage your project tasks",
        "tasks.noTasks": "No tasks found",
        "tasks.createTasks": "Create task files to get started",
        "tasks.toAddTasks": "To add tasks:",
        "tasks.incompleteTask": "Incomplete task",
        "tasks.completedTask": "Completed task",
        "tasks.forIncompleteTasks": "for incomplete tasks",
        "tasks.forCompletedTasks": "for completed tasks",
        "tasks.addToAnyFile": "Add tasks to any markdown file",
        "tasks.organizeTasksInSubfolders": "Organize tasks in subfolders",
        "tasks.referenceOtherTasks": "Reference other tasks",
        "tasks.kanbanBoard": "Kanban Board",
        "tasks.totalTasks": "total tasks",
        "tasks.pending": "pending",
        "tasks.completed": "completed",
        "tasks.complete": "complete",
        "tasks.pendingTasks": "Pending Tasks",
        "tasks.completedTasks": "Completed Tasks",
        "tasks.files": "Files",
        "tasks.tasksLowercase": "tasks",
        "tasks.done": "done",
        "tasks.kanban": "Kanban",
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

jest.mock("@/components/ui/task-status-editor", () => ({
  TaskStatusEditor: ({ taskId }: { taskId: string }) => (
    <button data-testid={`task-status-editor-${taskId}`}>
      Edit Task Status
    </button>
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

describe("TasksPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTaskStore.taskGroups = [];
    mockTaskStore.isLoading = false;
    mockTaskStore.error = null;
  });

  it("should render loading state", () => {
    mockTaskStore.isLoading = true;

    render(<TasksPage />);

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("should render error state", () => {
    mockTaskStore.error = "Failed to load tasks";

    render(<TasksPage />);

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Failed to load tasks")).toBeInTheDocument();
  });

  it("should call fetchTaskGroups on mount", () => {
    render(<TasksPage />);

    expect(mockFetchTaskGroups).toHaveBeenCalledTimes(1);
  });

  it("should render empty state when no task groups", () => {
    render(<TasksPage />);

    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("No tasks found")).toBeInTheDocument();
    expect(
      screen.getByText("Create task files to get started")
    ).toBeInTheDocument();
    expect(screen.getByText("To add tasks:")).toBeInTheDocument();
    expect(screen.getByText("- [ ] Incomplete task")).toBeInTheDocument();
    expect(screen.getByText("- [x] Completed task")).toBeInTheDocument();
  });

  it("should render task groups when they exist", () => {
    const mockTaskGroups = [
      {
        id: "epic-1",
        name: "Epic 1",
        type: "epic",
        folder: "epics",
        file: "epic-1.md",
        totalTasks: 5,
        completedTasks: 2,
        pendingTasks: 3,
        metadata: { status: "in_progress" },
        subtasks: [
          {
            id: "task-1",
            title: "First task",
            completed: false,
            status: "todo",
            line: 10,
            metadata: { priority: "high" },
            references: [],
          },
          {
            id: "task-2",
            title: "Second task",
            completed: true,
            status: "done",
            line: 11,
            metadata: { priority: "low", tags: ["frontend", "ui"] },
            references: ["docs/guide.md"],
          },
        ],
      },
      {
        id: "story-1",
        name: "Story 1",
        type: "story",
        folder: "stories",
        file: "story-1.md",
        totalTasks: 3,
        completedTasks: 1,
        pendingTasks: 2,
        metadata: { status: "todo" },
        subtasks: [
          {
            id: "task-3",
            title: "Story task",
            completed: false,
            status: "in_progress",
            line: 5,
            metadata: { priority: "medium" },
            references: [],
          },
        ],
      },
    ];

    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TasksPage />);

    expect(screen.getByText("8 total tasks")).toBeInTheDocument();
    expect(screen.getByText("5 pending")).toBeInTheDocument();
    expect(screen.getByText("3 completed")).toBeInTheDocument();
    expect(screen.getByText("38% complete")).toBeInTheDocument(); // 3/8 = 37.5% rounded to 38%

    expect(screen.getByText("Epic 1")).toBeInTheDocument();
    expect(screen.getByText("Story 1")).toBeInTheDocument();

    expect(screen.getByText("epic")).toBeInTheDocument();
    expect(screen.getByText("story")).toBeInTheDocument();
  });

  it("should display summary cards correctly", () => {
    const mockTaskGroups = [
      {
        id: "test-group",
        name: "Test Group",
        type: "doc",
        folder: "docs",
        file: "test.md",
        totalTasks: 10,
        completedTasks: 4,
        pendingTasks: 6,
        metadata: {},
        subtasks: [],
      },
    ];

    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TasksPage />);

    // Check summary cards
    expect(screen.getByText("Pending Tasks")).toBeInTheDocument();
    expect(screen.getByText("Completed Tasks")).toBeInTheDocument();
    expect(screen.getByText("Files")).toBeInTheDocument();

    // Check values in cards
    const summaryCards = document.querySelectorAll(".text-2xl");
    expect(summaryCards[0]).toHaveTextContent("6"); // pending
    expect(summaryCards[1]).toHaveTextContent("4"); // completed
    expect(summaryCards[2]).toHaveTextContent("1"); // files
  });

  it("should show subtasks for task groups", async () => {
    const mockTaskGroups = [
      {
        id: "expandable-group",
        name: "Expandable Group",
        type: "epic",
        folder: "epics",
        file: "expandable.md",
        totalTasks: 2,
        completedTasks: 1,
        pendingTasks: 1,
        metadata: {},
        subtasks: [
          {
            id: "task-1",
            title: "Expandable task",
            completed: false,
            status: "todo",
            line: 5,
            metadata: {},
            references: [],
          },
        ],
      },
    ];

    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TasksPage />);

    // Should show the task group and its subtasks
    expect(screen.getByText("Expandable Group")).toBeInTheDocument();
    expect(screen.getByText("Expandable task")).toBeInTheDocument();

    // Should show task counts in the summary
    const completedTexts = screen.getAllByText("1 completed");
    const pendingTexts = screen.getAllByText("1 pending");
    expect(completedTexts.length).toBeGreaterThan(0);
    expect(pendingTexts.length).toBeGreaterThan(0);
  });

  it("should render different group types with correct icons and colors", () => {
    const mockTaskGroups = [
      {
        id: "epic-group",
        name: "Epic Group",
        type: "epic",
        folder: "epics",
        file: "epic.md",
        totalTasks: 1,
        completedTasks: 0,
        pendingTasks: 1,
        metadata: {},
        subtasks: [],
      },
      {
        id: "story-group",
        name: "Story Group",
        type: "story",
        folder: "stories",
        file: "story.md",
        totalTasks: 1,
        completedTasks: 0,
        pendingTasks: 1,
        metadata: {},
        subtasks: [],
      },
      {
        id: "doc-group",
        name: "Doc Group",
        type: "doc",
        folder: "docs",
        file: "doc.md",
        totalTasks: 1,
        completedTasks: 0,
        pendingTasks: 1,
        metadata: {},
        subtasks: [],
      },
    ];

    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TasksPage />);

    expect(screen.getByText("epic")).toBeInTheDocument();
    expect(screen.getByText("story")).toBeInTheDocument();
    expect(screen.getByText("doc")).toBeInTheDocument();
  });

  it("should render task priority badges correctly", () => {
    const mockTaskGroups = [
      {
        id: "priority-group",
        name: "Priority Group",
        type: "epic",
        folder: "epics",
        file: "priority.md",
        totalTasks: 3,
        completedTasks: 0,
        pendingTasks: 3,
        metadata: {},
        subtasks: [
          {
            id: "high-task",
            title: "High priority task",
            completed: false,
            status: "todo",
            line: 5,
            metadata: { priority: "high" },
            references: [],
          },
          {
            id: "medium-task",
            title: "Medium priority task",
            completed: false,
            status: "todo",
            line: 6,
            metadata: { priority: "medium" },
            references: [],
          },
          {
            id: "low-task",
            title: "Low priority task",
            completed: false,
            status: "todo",
            line: 7,
            metadata: { priority: "low" },
            references: [],
          },
        ],
      },
    ];

    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TasksPage />);

    expect(screen.getByText("H")).toBeInTheDocument(); // High priority
    expect(screen.getByText("M")).toBeInTheDocument(); // Medium priority
    expect(screen.getByText("L")).toBeInTheDocument(); // Low priority
  });

  it("should render task references and tags", () => {
    const mockTaskGroups = [
      {
        id: "refs-group",
        name: "References Group",
        type: "epic",
        folder: "epics",
        file: "refs.md",
        totalTasks: 1,
        completedTasks: 0,
        pendingTasks: 1,
        metadata: {},
        subtasks: [
          {
            id: "refs-task",
            title: "Task with refs and tags",
            completed: false,
            status: "todo",
            line: 5,
            metadata: { tags: ["frontend", "ui", "component"] },
            references: ["docs/guide.md", "specs/requirements.md"],
          },
        ],
      },
    ];

    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TasksPage />);

    expect(screen.getByText("guide.md")).toBeInTheDocument();
    expect(screen.getByText("requirements.md")).toBeInTheDocument();
    expect(screen.getByText("#frontend")).toBeInTheDocument();
    expect(screen.getByText("#ui")).toBeInTheDocument();
  });

  it("should render correct navigation links", () => {
    const mockTaskGroups = [
      {
        id: "nav-group",
        name: "Navigation Group",
        type: "epic",
        folder: "epics",
        file: "nav-group.md",
        totalTasks: 1,
        completedTasks: 0,
        pendingTasks: 1,
        metadata: {},
        subtasks: [],
      },
    ];

    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TasksPage />);

    // Check kanban board link in header
    const kanbanHeaderLink = screen.getByRole("link", {
      name: /Kanban Board/i,
    });
    expect(kanbanHeaderLink).toHaveAttribute("href", "/tasks/kanban");

    // Check individual group kanban link
    const groupKanbanLinks = screen.getAllByRole("link", { name: /Kanban$/i });
    // Find the one with the group parameter
    const groupKanbanLink = groupKanbanLinks.find((link) =>
      link.getAttribute("href")?.includes("group=nav-group")
    );
    expect(groupKanbanLink).toHaveAttribute(
      "href",
      "/tasks/kanban?group=nav-group"
    );
  });

  it("should sort tasks by completion status", () => {
    const mockTaskGroups = [
      {
        id: "sorted-group",
        name: "Sorted Group",
        type: "epic",
        folder: "epics",
        file: "sorted.md",
        totalTasks: 3,
        completedTasks: 1,
        pendingTasks: 2,
        metadata: {},
        subtasks: [
          {
            id: "completed-task",
            title: "Completed task",
            completed: true,
            status: "done",
            line: 5,
            metadata: {},
            references: [],
          },
          {
            id: "pending-task-1",
            title: "Pending task 1",
            completed: false,
            status: "todo",
            line: 6,
            metadata: {},
            references: [],
          },
          {
            id: "pending-task-2",
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

    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TasksPage />);

    // Check that pending tasks appear before completed tasks
    const taskElements = screen.getAllByText(/task/);
    const taskTexts = taskElements.map((el) => el.textContent);

    const pendingIndex1 = taskTexts.findIndex((text) =>
      text?.includes("Pending task 1")
    );
    const pendingIndex2 = taskTexts.findIndex((text) =>
      text?.includes("Pending task 2")
    );
    const completedIndex = taskTexts.findIndex((text) =>
      text?.includes("Completed task")
    );

    expect(pendingIndex1).toBeLessThan(completedIndex);
    expect(pendingIndex2).toBeLessThan(completedIndex);
  });

  it("should handle different task statuses with correct icons", () => {
    const mockTaskGroups = [
      {
        id: "status-group",
        name: "Status Group",
        type: "epic",
        folder: "epics",
        file: "status.md",
        totalTasks: 3,
        completedTasks: 1,
        pendingTasks: 2,
        metadata: {},
        subtasks: [
          {
            id: "todo-task",
            title: "Todo task",
            completed: false,
            status: "todo",
            line: 5,
            metadata: {},
            references: [],
          },
          {
            id: "progress-task",
            title: "In progress task",
            completed: false,
            status: "in_progress",
            line: 6,
            metadata: {},
            references: [],
          },
          {
            id: "done-task",
            title: "Done task",
            completed: true,
            status: "done",
            line: 7,
            metadata: {},
            references: [],
          },
        ],
      },
    ];

    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TasksPage />);

    expect(screen.getByText("Todo task")).toBeInTheDocument();
    expect(screen.getByText("In progress task")).toBeInTheDocument();
    expect(screen.getByText("Done task")).toBeInTheDocument();
  });

  it("should calculate completion rate correctly for 100%", () => {
    const mockTaskGroups = [
      {
        id: "complete-group",
        name: "Complete Group",
        type: "epic",
        folder: "epics",
        file: "complete.md",
        totalTasks: 2,
        completedTasks: 2,
        pendingTasks: 0,
        metadata: {},
        subtasks: [],
      },
    ];

    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TasksPage />);

    expect(screen.getByText("100% complete")).toBeInTheDocument();
  });

  it("should handle zero tasks completion rate", () => {
    const mockTaskGroups = [
      {
        id: "zero-group",
        name: "Zero Group",
        type: "epic",
        folder: "epics",
        file: "zero.md",
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        metadata: {},
        subtasks: [],
      },
    ];

    mockTaskStore.taskGroups = mockTaskGroups;

    render(<TasksPage />);

    expect(screen.getByText("0% complete")).toBeInTheDocument();
  });
});
