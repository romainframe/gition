/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

import "@testing-library/jest-dom";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SearchDialog, SearchTrigger } from "../search";

// Mock Next.js Link component
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
  }) {
    return (
      <a href={href} onClick={onClick}>
        {children}
      </a>
    );
  };
});

// Create a stable mock for the language context
let mockT: jest.Mock;

beforeEach(() => {
  mockT = jest.fn((key: string, params?: any) => {
    const translations: Record<string, string> = {
      "search.title": "Search",
      "search.placeholder": "Search docs and tasks...",
      "search.searching": "Searching...",
      "search.noResults": `No results found for "${params?.query || ""}"`,
      "search.completedTask": "Completed",
      "search.pendingTask": "Pending",
      "search.doc": "Doc",
      "search.task": "Task",
      "search.searchTips": "Search tips:",
      "search.tipDocuments": "Search through document titles and content",
      "search.tipTasks": "Find tasks across all your files",
      "search.tipKeywords": "Use keywords for better results",
      "search.searchButton": "Search...",
    };
    return translations[key] || key;
  });
});

jest.mock("@/contexts/language-context", () => ({
  useLanguage: () => ({
    get t() {
      return mockT;
    },
  }),
}));

// Mock inspect hooks
jest.mock("@/hooks/use-inspect", () => ({
  useComponentInspect: jest.fn(),
}));

jest.mock("@/components/dev/inspect-overlay", () => ({
  InspectOverlay: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock UI components
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <header data-testid="dialog-header">{children}</header>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
}));

jest.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="scroll-area">{children}</div>
  ),
}));

jest.mock("@/components/ui/separator", () => ({
  Separator: () => <hr data-testid="separator" />,
}));

// Mock button to avoid issues
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, variant, size, className, ...props }: any) => (
    <button
      onClick={onClick}
      className={className}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));

// Mock fetch
global.fetch = jest.fn();

describe("SearchDialog", () => {
  const mockDocs = [
    {
      slug: "getting-started",
      metadata: { title: "Getting Started", description: "Learn the basics" },
      content: "This is a guide to get you started with the application",
      filename: "getting-started.mdx",
    },
    {
      slug: "api-reference",
      metadata: {
        title: "API Reference",
        description: "Complete API documentation",
      },
      content: "Detailed API documentation for all endpoints",
      filename: "api-reference.mdx",
    },
  ];

  const mockTasks = [
    {
      title: "Complete documentation",
      completed: false,
      file: "tasks/todo.mdx",
    },
    {
      title: "Review API changes",
      completed: true,
      file: "tasks/completed.mdx",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === "/api/docs") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDocs),
        });
      }
      if (url === "/api/tasks") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTasks),
        });
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });
  });

  it("should not render when closed", () => {
    render(<SearchDialog open={false} onOpenChange={() => {}} />);

    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("should render when open", () => {
    render(<SearchDialog open={true} onOpenChange={() => {}} />);

    expect(screen.getByTestId("dialog")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search docs and tasks...")
    ).toBeInTheDocument();
  });

  it("should show search tips when no query is entered", () => {
    render(<SearchDialog open={true} onOpenChange={() => {}} />);

    expect(screen.getByText("Search tips:")).toBeInTheDocument();
    expect(
      screen.getByText("• Search through document titles and content")
    ).toBeInTheDocument();
    expect(
      screen.getByText("• Find tasks across all your files")
    ).toBeInTheDocument();
    expect(
      screen.getByText("• Use keywords for better results")
    ).toBeInTheDocument();
  });

  it("should handle API errors gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    (global.fetch as jest.Mock).mockRejectedValue(new Error("API Error"));

    render(<SearchDialog open={true} onOpenChange={() => {}} />);

    const input = screen.getByPlaceholderText("Search docs and tasks...");

    await act(async () => {
      fireEvent.change(input, { target: { value: "test" } });
      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 400));
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Search failed:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});

describe("SearchTrigger", () => {
  it("should render search button", () => {
    render(<SearchTrigger />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(screen.getByText("Search...")).toBeInTheDocument();
  });

  it("should open search dialog when clicked", async () => {
    const user = userEvent.setup();
    render(<SearchTrigger />);

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("dialog")).toBeInTheDocument();
    });
  });

  it("should open search dialog with Cmd+K (Mac)", async () => {
    render(<SearchTrigger />);

    act(() => {
      fireEvent.keyDown(document, { key: "k", metaKey: true });
    });

    await waitFor(() => {
      expect(screen.getByTestId("dialog")).toBeInTheDocument();
    });
  });

  it("should open search dialog with Ctrl+K (Windows/Linux)", async () => {
    render(<SearchTrigger />);

    act(() => {
      fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    });

    await waitFor(() => {
      expect(screen.getByTestId("dialog")).toBeInTheDocument();
    });
  });

  it("should prevent default behavior for keyboard shortcut", () => {
    render(<SearchTrigger />);

    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });

    const preventDefaultSpy = jest.spyOn(event, "preventDefault");

    act(() => {
      document.dispatchEvent(event);
    });

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("should not open dialog for other key combinations", () => {
    render(<SearchTrigger />);

    act(() => {
      fireEvent.keyDown(document, { key: "k" }); // Just K without modifier
      fireEvent.keyDown(document, { key: "j", metaKey: true }); // Cmd+J
    });

    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("should clean up event listener on unmount", () => {
    const removeEventListenerSpy = jest.spyOn(document, "removeEventListener");

    const { unmount } = render(<SearchTrigger />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
  });
});
