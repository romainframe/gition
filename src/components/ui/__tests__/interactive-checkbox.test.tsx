import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  InteractiveCheckbox,
  InteractiveCheckboxProps,
} from "../interactive-checkbox";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  CheckCircle: ({ className }: { className: string }) => (
    <div data-testid="check-circle-icon" className={className}>
      CheckCircle
    </div>
  ),
  Circle: ({ className }: { className: string }) => (
    <div data-testid="circle-icon" className={className}>
      Circle
    </div>
  ),
  Clock: ({ className }: { className: string }) => (
    <div data-testid="clock-icon" className={className}>
      Clock
    </div>
  ),
}));

// Mock the task store
const mockToggleSubtaskCompleted = jest.fn();
jest.mock("@/store/useTaskStore", () => ({
  useTaskStore: () => ({
    toggleSubtaskCompleted: mockToggleSubtaskCompleted,
  }),
}));

// Mock the language context
const mockT = jest.fn((key: string) => {
  const translations: Record<string, string> = {
    "checkbox.disabled": "Checkbox is disabled",
    "checkbox.updating": "Updating...",
    "checkbox.markComplete": "Mark as complete",
    "checkbox.markIncomplete": "Mark as incomplete",
  };
  return translations[key] || key;
});

jest.mock("@/contexts/language-context", () => ({
  useLanguage: () => ({
    t: mockT,
  }),
}));

describe("InteractiveCheckbox", () => {
  const defaultProps: InteractiveCheckboxProps = {
    taskGroupId: "task-group-1",
    subtaskId: "subtask-1",
    status: "todo",
    completed: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockToggleSubtaskCompleted.mockResolvedValue(undefined);
  });

  describe("basic rendering", () => {
    it("should render interactive checkbox without errors", () => {
      expect(() => {
        render(<InteractiveCheckbox {...defaultProps} />);
      }).not.toThrow();
    });

    it("should render as a button element", () => {
      render(<InteractiveCheckbox {...defaultProps} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe("BUTTON");
    });

    it("should apply custom className", () => {
      render(
        <InteractiveCheckbox
          {...defaultProps}
          className="custom-checkbox-class"
        />
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-checkbox-class");
      expect(button).toHaveClass(
        "flex-shrink-0",
        "transition-colors",
        "duration-200"
      );
    });
  });

  describe("status icons", () => {
    it("should render circle icon for todo status", () => {
      render(
        <InteractiveCheckbox
          {...defaultProps}
          status="todo"
          completed={false}
        />
      );

      expect(screen.getByTestId("circle-icon")).toBeInTheDocument();
      expect(screen.getByTestId("circle-icon")).toHaveClass(
        "h-4",
        "w-4",
        "text-muted-foreground"
      );
    });

    it("should render check circle icon for done status", () => {
      render(
        <InteractiveCheckbox {...defaultProps} status="done" completed={true} />
      );

      expect(screen.getByTestId("check-circle-icon")).toBeInTheDocument();
      expect(screen.getByTestId("check-circle-icon")).toHaveClass(
        "h-4",
        "w-4",
        "text-green-600"
      );
    });

    it("should render clock icon for in_progress status", () => {
      render(
        <InteractiveCheckbox
          {...defaultProps}
          status="in_progress"
          completed={false}
        />
      );

      expect(screen.getByTestId("clock-icon")).toBeInTheDocument();
      expect(screen.getByTestId("clock-icon")).toHaveClass(
        "h-4",
        "w-4",
        "text-orange-500"
      );
    });

    it("should render pulsing circle icon when updating", async () => {
      // Mock a slow async function to capture the updating state
      mockToggleSubtaskCompleted.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<InteractiveCheckbox {...defaultProps} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      // Check for loading state immediately after click
      expect(screen.getByTestId("circle-icon")).toHaveClass("animate-pulse");

      // Wait for the async operation to complete
      await waitFor(() => {
        expect(mockToggleSubtaskCompleted).toHaveBeenCalled();
      });
    });
  });

  describe("interaction behavior", () => {
    it("should call toggleSubtaskCompleted when clicked", async () => {
      const user = userEvent.setup();
      render(<InteractiveCheckbox {...defaultProps} />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockToggleSubtaskCompleted).toHaveBeenCalledWith(
        "task-group-1",
        "subtask-1"
      );
      expect(mockToggleSubtaskCompleted).toHaveBeenCalledTimes(1);
    });

    it("should not call toggleSubtaskCompleted when disabled", async () => {
      const user = userEvent.setup();
      render(<InteractiveCheckbox {...defaultProps} disabled={true} />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockToggleSubtaskCompleted).not.toHaveBeenCalled();
    });

    it("should prevent multiple clicks during update", async () => {
      mockToggleSubtaskCompleted.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<InteractiveCheckbox {...defaultProps} />);

      const button = screen.getByRole("button");

      // Click multiple times quickly
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      // Wait for async operations to complete
      await waitFor(() => {
        expect(mockToggleSubtaskCompleted).toHaveBeenCalledTimes(1);
      });
    });

    it("should handle errors gracefully", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockToggleSubtaskCompleted.mockRejectedValue(new Error("Network error"));

      const user = userEvent.setup();
      render(<InteractiveCheckbox {...defaultProps} />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Failed to update subtask:",
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe("disabled state", () => {
    it("should render disabled styling when disabled", () => {
      render(<InteractiveCheckbox {...defaultProps} disabled={true} />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveClass("opacity-50", "cursor-not-allowed");
      expect(button).not.toHaveClass("hover:scale-110", "cursor-pointer");
    });

    it("should show disabled tooltip", () => {
      render(<InteractiveCheckbox {...defaultProps} disabled={true} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("title", "Checkbox is disabled");
      expect(mockT).toHaveBeenCalledWith("checkbox.disabled");
    });

    it("should not have hover effects when disabled", () => {
      render(<InteractiveCheckbox {...defaultProps} disabled={true} />);

      const button = screen.getByRole("button");
      expect(button).not.toHaveClass("hover:scale-110");
      expect(button).not.toHaveClass("cursor-pointer");
    });
  });

  describe("accessibility and tooltips", () => {
    it("should show correct tooltip for incomplete task", () => {
      render(
        <InteractiveCheckbox
          {...defaultProps}
          status="todo"
          completed={false}
        />
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("title", "Mark as complete");
      expect(mockT).toHaveBeenCalledWith("checkbox.markComplete");
    });

    it("should show correct tooltip for completed task", () => {
      render(
        <InteractiveCheckbox {...defaultProps} status="done" completed={true} />
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("title", "Mark as incomplete");
      expect(mockT).toHaveBeenCalledWith("checkbox.markIncomplete");
    });

    it("should show updating tooltip during async operation", async () => {
      mockToggleSubtaskCompleted.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<InteractiveCheckbox {...defaultProps} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      // Check tooltip during update
      await waitFor(() => {
        expect(button).toHaveAttribute("title", "Updating...");
      });

      expect(mockT).toHaveBeenCalledWith("checkbox.updating");
    });

    it("should be keyboard accessible", async () => {
      const user = userEvent.setup();
      render(<InteractiveCheckbox {...defaultProps} />);

      const button = screen.getByRole("button");

      // Tab to focus the button
      await user.tab();
      expect(button).toHaveFocus();

      // Press Enter to activate
      await user.keyboard("{Enter}");
      expect(mockToggleSubtaskCompleted).toHaveBeenCalled();
    });

    it("should be keyboard accessible with Space key", async () => {
      const user = userEvent.setup();
      render(<InteractiveCheckbox {...defaultProps} />);

      const button = screen.getByRole("button");
      button.focus();

      // Press Space to activate
      await user.keyboard(" ");
      expect(mockToggleSubtaskCompleted).toHaveBeenCalled();
    });
  });

  describe("styling variations", () => {
    it("should apply hover effects when not disabled", () => {
      render(<InteractiveCheckbox {...defaultProps} />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("hover:scale-110", "cursor-pointer");
    });

    it("should have proper transition classes", () => {
      render(<InteractiveCheckbox {...defaultProps} />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("transition-colors", "duration-200");
    });

    it("should maintain flex-shrink-0 for layout consistency", () => {
      render(<InteractiveCheckbox {...defaultProps} />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("flex-shrink-0");
    });
  });

  describe("different task states", () => {
    it("should handle todo state correctly", () => {
      render(
        <InteractiveCheckbox
          {...defaultProps}
          status="todo"
          completed={false}
        />
      );

      expect(screen.getByTestId("circle-icon")).toBeInTheDocument();
      expect(screen.getByRole("button")).toHaveAttribute(
        "title",
        "Mark as complete"
      );
    });

    it("should handle in_progress state correctly", () => {
      render(
        <InteractiveCheckbox
          {...defaultProps}
          status="in_progress"
          completed={false}
        />
      );

      expect(screen.getByTestId("clock-icon")).toBeInTheDocument();
      expect(screen.getByRole("button")).toHaveAttribute(
        "title",
        "Mark as complete"
      );
    });

    it("should handle done state correctly", () => {
      render(
        <InteractiveCheckbox {...defaultProps} status="done" completed={true} />
      );

      expect(screen.getByTestId("check-circle-icon")).toBeInTheDocument();
      expect(screen.getByRole("button")).toHaveAttribute(
        "title",
        "Mark as incomplete"
      );
    });

    it("should handle inconsistent status and completed props", () => {
      // Test edge case where status and completed don't match
      render(
        <InteractiveCheckbox {...defaultProps} status="todo" completed={true} />
      );

      // Should prioritize status for icon, completed for tooltip
      expect(screen.getByTestId("circle-icon")).toBeInTheDocument();
      expect(screen.getByRole("button")).toHaveAttribute(
        "title",
        "Mark as incomplete"
      );
    });
  });

  describe("integration scenarios", () => {
    it("should work with different task group and subtask IDs", async () => {
      const user = userEvent.setup();
      render(
        <InteractiveCheckbox
          {...defaultProps}
          taskGroupId="custom-group"
          subtaskId="custom-subtask"
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockToggleSubtaskCompleted).toHaveBeenCalledWith(
        "custom-group",
        "custom-subtask"
      );
    });

    it("should maintain state during rapid prop changes", () => {
      const { rerender } = render(<InteractiveCheckbox {...defaultProps} />);

      // Change props rapidly
      rerender(<InteractiveCheckbox {...defaultProps} status="in_progress" />);
      rerender(
        <InteractiveCheckbox {...defaultProps} status="done" completed={true} />
      );

      // Should render final state correctly
      expect(screen.getByTestId("check-circle-icon")).toBeInTheDocument();
    });
  });
});
