import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";

import KanbanPage from "../page";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
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
        "tasks.backToTasks": "Back to Tasks",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock DND Kit
jest.mock("@dnd-kit/core", () => ({
  DndContext: ({
    children,
    onDragStart,
    onDragEnd,
  }: {
    children: React.ReactNode;
    onDragStart?: () => void;
    onDragEnd?: () => void;
  }) => (
    <div
      data-testid="dnd-context"
      data-drag-start={!!onDragStart}
      data-drag-end={!!onDragEnd}
    >
      {children}
    </div>
  ),
  DragOverlay: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="drag-overlay">{children}</div>
  ),
  useSensor: jest.fn(),
  useSensors: jest.fn(() => []),
  PointerSensor: jest.fn(),
}));

jest.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sortable-context">{children}</div>
  ),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  arrayMove: jest.fn((arr, from, to) => {
    const result = [...arr];
    const [moved] = result.splice(from, 1);
    result.splice(to, 0, moved);
    return result;
  }),
  verticalListSortingStrategy: "vertical",
}));

jest.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: () => "transform: none",
    },
  },
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

// Mock useSearchParams
const mockUseSearchParams = jest.requireMock("next/navigation").useSearchParams;

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("KanbanPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTaskStore.taskGroups = [];
    mockTaskStore.isLoading = false;
    mockTaskStore.error = null;
    mockUseSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    });
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        groupName: "Test Board",
        totalTasks: 6,
        columns: [
          {
            id: "todo",
            title: "To Do",
            tasks: [
              {
                id: "task-1",
                title: "Todo task",
                status: "todo",
                completed: false,
                line: 5,
                file: "test-group",
                metadata: { priority: "high", assignee: "John" },
                references: ["docs/guide.md"],
              },
            ],
          },
          {
            id: "in_progress",
            title: "In Progress",
            tasks: [
              {
                id: "task-2",
                title: "In progress task",
                status: "in_progress",
                completed: false,
                line: 6,
                file: "test-group",
                metadata: { priority: "medium", tags: ["frontend", "ui"] },
                references: [],
              },
            ],
          },
          {
            id: "done",
            title: "Done",
            tasks: [
              {
                id: "task-3",
                title: "Done task",
                status: "done",
                completed: true,
                line: 7,
                file: "test-group",
                metadata: { priority: "low", due_date: "2024-01-20" },
                references: [],
              },
            ],
          },
        ],
      }),
    });
  });

  it("should render loading state initially", async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<KanbanPage />);

    await waitFor(() => {
      expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
    });
  });

  it("should render kanban board after loading", async () => {
    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Board")).toBeInTheDocument();
    });

    expect(screen.getByText("6 total tasks")).toBeInTheDocument();
    expect(screen.getByText("1 to do")).toBeInTheDocument();
    expect(screen.getByText("1 in progress")).toBeInTheDocument();
    expect(screen.getByText("1 done")).toBeInTheDocument();
  });

  it("should render error state when fetch fails", async () => {
    mockFetch.mockRejectedValue(new Error("Failed to fetch kanban board"));

    render(<KanbanPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Error Loading Kanban Board")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("Failed to fetch kanban board")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Back to Tasks/i })
    ).toHaveAttribute("href", "/tasks");
  });

  it("should fetch kanban board with group parameter", async () => {
    mockUseSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue("test-group-id"),
    });

    render(<KanbanPage />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/tasks/kanban?group=test-group-id"
      );
    });
  });

  it("should fetch kanban board without group parameter", async () => {
    render(<KanbanPage />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/tasks/kanban");
    });
  });

  it("should call fetchTaskGroups on mount", async () => {
    render(<KanbanPage />);

    await waitFor(() => {
      expect(mockFetchTaskGroups).toHaveBeenCalledTimes(1);
    });
  });

  it("should render all three kanban columns", async () => {
    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText("To Do")).toBeInTheDocument();
    });

    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("should render task cards in columns", async () => {
    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText("Todo task")).toBeInTheDocument();
    });

    expect(screen.getByText("In progress task")).toBeInTheDocument();
    expect(screen.getByText("Done task")).toBeInTheDocument();
  });

  it("should render task metadata correctly", async () => {
    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText("John")).toBeInTheDocument();
    });

    expect(screen.getByText("L5")).toBeInTheDocument();
    expect(screen.getByText("L6")).toBeInTheDocument();
    expect(screen.getByText("L7")).toBeInTheDocument();
  });

  it("should render task tags and references", async () => {
    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText("frontend")).toBeInTheDocument();
    });

    expect(screen.getByText("ui")).toBeInTheDocument();
    expect(screen.getByText("guide.md")).toBeInTheDocument();
  });

  it("should render priority indicators", async () => {
    render(<KanbanPage />);

    await waitFor(() => {
      expect(document.querySelector(".text-red-500")).toBeInTheDocument(); // high priority
    });

    expect(document.querySelector(".text-orange-500")).toBeInTheDocument(); // medium priority
    expect(document.querySelector(".text-green-500")).toBeInTheDocument(); // low priority
  });

  it("should render status icons correctly", async () => {
    render(<KanbanPage />);

    await waitFor(() => {
      expect(document.querySelector(".text-gray-600")).toBeInTheDocument(); // todo icon
    });

    expect(document.querySelector(".text-orange-600")).toBeInTheDocument(); // in progress icon
    expect(document.querySelector(".text-green-600")).toBeInTheDocument(); // done icon
  });

  it("should show column task counts", async () => {
    render(<KanbanPage />);

    await waitFor(() => {
      // Get the column headers and find the badges within them
      const columnHeaders = document.querySelectorAll(".border-l-4");
      expect(columnHeaders[0].querySelector(".bg-secondary")).toHaveTextContent(
        "1"
      ); // To Do column
      expect(columnHeaders[1].querySelector(".bg-secondary")).toHaveTextContent(
        "1"
      ); // In Progress column
      expect(columnHeaders[2].querySelector(".bg-secondary")).toHaveTextContent(
        "1"
      ); // Done column
    });
  });

  it("should render due dates correctly", async () => {
    render(<KanbanPage />);

    await waitFor(() => {
      // Check if the due date is displayed using toLocaleDateString format
      const expectedDate = new Date("2024-01-20").toLocaleDateString();
      expect(screen.getByText(expectedDate)).toBeInTheDocument();
    });
  });

  it("should render back to tasks navigation", async () => {
    render(<KanbanPage />);

    await waitFor(() => {
      const backLinks = screen.getAllByRole("link", { name: /Back to Tasks/i });
      expect(backLinks[0]).toHaveAttribute("href", "/tasks");
    });
  });

  it("should show group-specific description when groupId is provided", async () => {
    mockUseSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue("test-group"),
    });

    render(<KanbanPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Kanban board for Test Board")
      ).toBeInTheDocument();
    });
  });

  it("should show default description when no groupId", async () => {
    render(<KanbanPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Kanban-style view of your project tasks")
      ).toBeInTheDocument();
    });
  });

  it("should handle empty columns", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        groupName: "Empty Board",
        totalTasks: 0,
        columns: [
          { id: "todo", title: "To Do", tasks: [] },
          { id: "in_progress", title: "In Progress", tasks: [] },
          { id: "done", title: "Done", tasks: [] },
        ],
      }),
    });

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText("Empty Board")).toBeInTheDocument();
    });

    expect(screen.getByText("0 total tasks")).toBeInTheDocument();
    expect(screen.getAllByText("No tasks")).toHaveLength(3);
  });

  it("should render DndContext and drag overlay", async () => {
    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByTestId("dnd-context")).toBeInTheDocument();
    });

    expect(screen.getByTestId("drag-overlay")).toBeInTheDocument();
  });

  it("should handle task tags overflow", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        groupName: "Test Board",
        totalTasks: 1,
        columns: [
          {
            id: "todo",
            title: "To Do",
            tasks: [
              {
                id: "task-1",
                title: "Task with many tags",
                status: "todo",
                completed: false,
                line: 5,
                file: "test-group",
                metadata: {
                  tags: ["tag1", "tag2", "tag3", "tag4", "tag5"],
                },
                references: [],
              },
            ],
          },
          { id: "in_progress", title: "In Progress", tasks: [] },
          { id: "done", title: "Done", tasks: [] },
        ],
      }),
    });

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText("tag1")).toBeInTheDocument();
    });

    expect(screen.getByText("tag2")).toBeInTheDocument();
    expect(screen.getByText("tag3")).toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument(); // Overflow indicator
  });

  it("should handle references overflow", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        groupName: "Test Board",
        totalTasks: 1,
        columns: [
          {
            id: "todo",
            title: "To Do",
            tasks: [
              {
                id: "task-1",
                title: "Task with many refs",
                status: "todo",
                completed: false,
                line: 5,
                file: "test-group",
                metadata: {},
                references: ["docs/ref1.md", "docs/ref2.md", "docs/ref3.md"],
              },
            ],
          },
          { id: "in_progress", title: "In Progress", tasks: [] },
          { id: "done", title: "Done", tasks: [] },
        ],
      }),
    });

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText("ref1.md")).toBeInTheDocument();
    });

    expect(screen.getByText("ref2.md")).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument(); // Overflow indicator
  });

  it("should refetch when taskGroups change", async () => {
    const { rerender } = render(<KanbanPage />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // Update task store
    mockTaskStore.taskGroups = [{ id: "new-group" }];

    rerender(<KanbanPage />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  it("should render task time estimates", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        groupName: "Test Board",
        totalTasks: 1,
        columns: [
          {
            id: "todo",
            title: "To Do",
            tasks: [
              {
                id: "task-1",
                title: "Task with estimate",
                status: "todo",
                completed: false,
                line: 5,
                file: "test-group",
                metadata: { estimate: "4" },
                references: [],
              },
            ],
          },
          { id: "in_progress", title: "In Progress", tasks: [] },
          { id: "done", title: "Done", tasks: [] },
        ],
      }),
    });

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText("4h")).toBeInTheDocument();
    });
  });
});
