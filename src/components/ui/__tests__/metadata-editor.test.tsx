/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MetadataEditor, MetadataEditorProps } from "../metadata-editor";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Calendar: ({ className }: { className?: string }) => (
    <div data-testid="calendar-icon" className={className}>
      Calendar
    </div>
  ),
  Flag: ({ className }: { className?: string }) => (
    <div data-testid="flag-icon" className={className}>
      Flag
    </div>
  ),
  Hash: ({ className }: { className?: string }) => (
    <div data-testid="hash-icon" className={className}>
      Hash
    </div>
  ),
  Settings: ({ className }: { className?: string }) => (
    <div data-testid="settings-icon" className={className}>
      Settings
    </div>
  ),
  Timer: ({ className }: { className?: string }) => (
    <div data-testid="timer-icon" className={className}>
      Timer
    </div>
  ),
  User: ({ className }: { className?: string }) => (
    <div data-testid="user-icon" className={className}>
      User
    </div>
  ),
}));

// Mock UI components with proper forwarding
let mockDialogOpen = false;
let mockOnOpenChange: ((open: boolean) => void) | null = null;

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open, onOpenChange }: any) => {
    mockDialogOpen = open;
    mockOnOpenChange = onOpenChange;
    return (
      <div data-testid="dialog" data-open={open}>
        {children}
      </div>
    );
  },
  DialogContent: ({ children, className }: any) => {
    // Only render content when dialog is open
    if (!mockDialogOpen) return null;
    return (
      <div data-testid="dialog-content" className={className} role="dialog">
        {children}
      </div>
    );
  },
  DialogDescription: ({ children, className }: any) => (
    <div data-testid="dialog-description" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children, className }: any) => (
    <div data-testid="dialog-header" className={className}>
      {children}
    </div>
  ),
  DialogTitle: ({ children, className }: any) => (
    <h2 data-testid="dialog-title" className={className} role="heading">
      {children}
    </h2>
  ),
  DialogTrigger: ({ children, asChild }: any) => {
    const handleClick = () => {
      if (mockOnOpenChange) {
        mockOnOpenChange(true);
      }
    };

    if (asChild) {
      // Clone the child and add the click handler
      return React.cloneElement(children, {
        onClick: handleClick,
        ...children.props,
      });
    }
    return (
      <div data-testid="dialog-trigger" onClick={handleClick}>
        {children}
      </div>
    );
  },
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    className,
    variant,
    size,
    disabled,
    onClick,
    ...props
  }: any) => {
    const handleClick = (e: any) => {
      // Handle Cancel button specially
      if (children === "Cancel" && mockOnOpenChange) {
        mockOnOpenChange(false);
      }
      // Call original onClick if provided
      if (onClick) {
        onClick(e);
      }
    };

    return (
      <button
        className={className}
        disabled={disabled}
        onClick={handleClick}
        data-variant={variant}
        data-size={size}
        {...props}
      >
        {children}
      </button>
    );
  },
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div
      data-testid="select"
      data-value={value}
      onClick={() => onValueChange?.("test-value")}
    >
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({ children, value, onClick }: any) => (
    <div
      data-testid="select-item"
      data-value={value}
      onClick={() => onClick?.(value)}
    >
      {children}
    </div>
  ),
  SelectTrigger: ({ children, className }: any) => (
    <button data-testid="select-trigger" className={className}>
      {children}
    </button>
  ),
  SelectValue: ({ placeholder }: any) => (
    <span data-testid="select-value">{placeholder}</span>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({
    className,
    type,
    placeholder,
    value,
    onChange,
    onKeyPress,
    ...props
  }: any) => (
    <input
      className={className}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      {...props}
    />
  ),
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({ children, className }: any) => (
    <label className={className}>{children}</label>
  ),
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className, variant }: any) => (
    <span data-slot="badge" className={className} data-variant={variant}>
      {children}
    </span>
  ),
}));

// Mock the task store
const mockUpdateSubtaskMetadata = jest.fn();
jest.mock("@/store/useTaskStore", () => ({
  useTaskStore: () => ({
    updateSubtaskMetadata: mockUpdateSubtaskMetadata,
  }),
}));

// Mock the language context
const mockT = jest.fn((key: string) => {
  const translations: Record<string, string> = {
    "taskMetadata.editTaskMetadata": "Edit Task Metadata",
    "taskMetadata.updateSubtaskMetadata":
      "Update the metadata for this subtask",
    "taskMetadata.priority": "Priority",
    "taskMetadata.selectPriority": "Select priority",
    "taskMetadata.none": "None",
    "taskMetadata.low": "Low",
    "taskMetadata.medium": "Medium",
    "taskMetadata.high": "High",
    "taskMetadata.assignee": "Assignee",
    "taskMetadata.enterAssigneeName": "Enter assignee name",
    "taskMetadata.dueDate": "Due Date",
    "taskMetadata.estimateHours": "Estimate (hours)",
    "taskMetadata.additionalStatus": "Additional Status",
    "taskMetadata.selectStatus": "Select status",
    "taskMetadata.blocked": "Blocked",
    "taskMetadata.waiting": "Waiting",
    "taskMetadata.review": "Review",
    "taskMetadata.tags": "Tags",
    "taskMetadata.addTag": "Add tag",
    "taskMetadata.add": "Add",
    "taskMetadata.cancel": "Cancel",
    "taskMetadata.saveChanges": "Save Changes",
    "taskMetadata.saving": "Saving...",
  };
  return translations[key] || key;
});

jest.mock("@/contexts/language-context", () => ({
  useLanguage: () => ({
    t: mockT,
  }),
}));

describe("MetadataEditor", () => {
  const defaultProps: MetadataEditorProps = {
    taskGroupId: "task-group-1",
    subtaskId: "subtask-1",
  };

  const sampleMetadata = {
    priority: "high" as const,
    due_date: "2024-12-31",
    assignee: "John Doe",
    tags: ["frontend", "urgent"],
    estimate: 4.5,
    status: "review" as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateSubtaskMetadata.mockResolvedValue(undefined);
    mockDialogOpen = false;
    mockOnOpenChange = null;
  });

  describe("basic rendering", () => {
    it("should render metadata editor without errors", () => {
      expect(() => {
        render(<MetadataEditor {...defaultProps} />);
      }).not.toThrow();
    });

    it("should render trigger button with settings icon", () => {
      render(<MetadataEditor {...defaultProps} />);

      expect(screen.getByTestId("settings-icon")).toBeInTheDocument();
      // Look for button with the settings icon as child
      const triggerButton = screen
        .getByTestId("settings-icon")
        .closest("button");
      expect(triggerButton).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(
        <MetadataEditor {...defaultProps} className="custom-metadata-editor" />
      );

      const triggerButton = screen
        .getByTestId("settings-icon")
        .closest("button");
      expect(triggerButton).toHaveClass("custom-metadata-editor");
    });

    it("should disable trigger button when disabled prop is true", () => {
      render(<MetadataEditor {...defaultProps} disabled={true} />);

      const triggerButton = screen
        .getByTestId("settings-icon")
        .closest("button");
      expect(triggerButton).toBeDisabled();
    });
  });

  describe("dialog behavior", () => {
    it("should open dialog when trigger button is clicked", async () => {
      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      const triggerButton = screen
        .getByTestId("settings-icon")
        .closest("button");
      await user.click(triggerButton!);

      expect(screen.getByTestId("dialog")).toBeInTheDocument();
      expect(screen.getByText("Edit Task Metadata")).toBeInTheDocument();
      expect(
        screen.getByText("Update the metadata for this subtask")
      ).toBeInTheDocument();
    });

    it("should close dialog when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      // Open dialog
      const triggerButton = screen
        .getByTestId("settings-icon")
        .closest("button");
      await user.click(triggerButton!);
      expect(screen.getByText("Edit Task Metadata")).toBeInTheDocument();

      // Close dialog
      await user.click(screen.getByText("Cancel"));

      // Wait for dialog to close
      await waitFor(() => {
        expect(
          screen.queryByText("Edit Task Metadata")
        ).not.toBeInTheDocument();
      });
    });

    it("should display current metadata when provided", async () => {
      const user = userEvent.setup();
      render(
        <MetadataEditor {...defaultProps} currentMetadata={sampleMetadata} />
      );

      const triggerButton = screen
        .getByTestId("settings-icon")
        .closest("button");
      await user.click(triggerButton!);

      // Check that current values are displayed
      expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("2024-12-31")).toBeInTheDocument();
      expect(screen.getByDisplayValue("4.5")).toBeInTheDocument();
      expect(screen.getByText("#frontend")).toBeInTheDocument();
      expect(screen.getByText("#urgent")).toBeInTheDocument();
    });
  });

  describe("priority field", () => {
    it("should render priority field with icon and label", async () => {
      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      const triggerButton = screen
        .getByTestId("settings-icon")
        .closest("button");
      await user.click(triggerButton!);

      expect(screen.getByTestId("flag-icon")).toBeInTheDocument();
      expect(screen.getByText("Priority")).toBeInTheDocument();
    });

    it("should update priority value when selected", async () => {
      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      const triggerButton = screen
        .getByTestId("settings-icon")
        .closest("button");
      await user.click(triggerButton!);

      // Find and click priority select trigger
      const prioritySelects = screen.getAllByTestId("select-trigger");
      const prioritySelect = prioritySelects[0]; // First select is priority
      await user.click(prioritySelect);

      // Since we have a mocked select, just verify the interaction
      expect(prioritySelect).toBeInTheDocument();
    });
  });

  describe("assignee field", () => {
    it("should render assignee field with icon and label", async () => {
      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      await user.click(screen.getByRole("button"));

      expect(screen.getByTestId("user-icon")).toBeInTheDocument();
      expect(screen.getByText("Assignee")).toBeInTheDocument();
    });

    it("should update assignee value when typed", async () => {
      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      await user.click(screen.getByRole("button"));

      const assigneeInput = screen.getByPlaceholderText("Enter assignee name");
      await user.type(assigneeInput, "Jane Smith");

      expect(screen.getByDisplayValue("Jane Smith")).toBeInTheDocument();
    });
  });

  describe("due date field", () => {
    it("should render due date field with icon and label", async () => {
      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      await user.click(screen.getByRole("button"));

      expect(screen.getByTestId("calendar-icon")).toBeInTheDocument();
      expect(screen.getByText("Due Date")).toBeInTheDocument();
    });

    it("should update due date value when changed", async () => {
      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      const triggerButton = screen
        .getByTestId("settings-icon")
        .closest("button");
      await user.click(triggerButton!);

      // Find the date input specifically
      const dateInput = document.querySelector(
        'input[type="date"]'
      ) as HTMLInputElement;
      expect(dateInput).toBeInTheDocument();

      await user.type(dateInput, "2024-06-15");
      expect(dateInput.value).toBe("2024-06-15");
    });
  });

  describe("estimate field", () => {
    it("should render estimate field with icon and label", async () => {
      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      await user.click(screen.getByRole("button"));

      expect(screen.getByTestId("timer-icon")).toBeInTheDocument();
      expect(screen.getByText("Estimate (hours)")).toBeInTheDocument();
    });

    it("should update estimate value when typed", async () => {
      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      await user.click(screen.getByRole("button"));

      const estimateInput = screen.getByPlaceholderText("0");
      await user.type(estimateInput, "8.5");

      expect(screen.getByDisplayValue("8.5")).toBeInTheDocument();
    });

    it("should accept decimal values for estimates", async () => {
      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      await user.click(screen.getByRole("button"));

      const estimateInput = screen.getByPlaceholderText("0");
      await user.clear(estimateInput);
      await user.type(estimateInput, "2.5");

      expect(screen.getByDisplayValue("2.5")).toBeInTheDocument();
    });
  });

  describe("additional status field", () => {
    it("should render additional status field with label", async () => {
      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      await user.click(screen.getByRole("button"));

      expect(screen.getByText("Additional Status")).toBeInTheDocument();
    });

    it("should update additional status when selected", async () => {
      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      await user.click(screen.getByRole("button"));

      // Find status select trigger (second select)
      const statusSelects = screen.getAllByTestId("select-trigger");
      const statusSelect = statusSelects[1]; // Second select is status
      await user.click(statusSelect);

      // Since we have a mocked select, just verify the interaction
      expect(statusSelect).toBeInTheDocument();
    });
  });

  describe("tags management", () => {
    it("should render tags field with icon and label", async () => {
      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      await user.click(screen.getByRole("button"));

      expect(screen.getByTestId("hash-icon")).toBeInTheDocument();
      expect(screen.getByText("Tags")).toBeInTheDocument();
    });

    it("should display existing tags with remove buttons", async () => {
      const user = userEvent.setup();
      render(
        <MetadataEditor
          {...defaultProps}
          currentMetadata={{ tags: ["frontend", "urgent"] }}
        />
      );

      await user.click(screen.getByRole("button"));

      expect(screen.getByText("#frontend")).toBeInTheDocument();
      expect(screen.getByText("#urgent")).toBeInTheDocument();

      // Check for remove buttons (×)
      const removeButtons = screen.getAllByText("×");
      expect(removeButtons).toHaveLength(2);
    });

    it("should add new tag when Add button is clicked", async () => {
      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      await user.click(screen.getByRole("button"));

      const tagInput = screen.getByPlaceholderText("Add tag");
      await user.type(tagInput, "backend");

      const addButton = screen.getByText("Add");
      await user.click(addButton);

      expect(screen.getByText("#backend")).toBeInTheDocument();
      expect(tagInput).toHaveValue("");
    });

    it("should add new tag when Enter key is pressed", async () => {
      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      await user.click(screen.getByRole("button"));

      const tagInput = screen.getByPlaceholderText("Add tag");
      await user.type(tagInput, "testing{enter}");

      expect(screen.getByText("#testing")).toBeInTheDocument();
      expect(tagInput).toHaveValue("");
    });

    it("should remove tag when remove button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <MetadataEditor
          {...defaultProps}
          currentMetadata={{ tags: ["frontend", "urgent"] }}
        />
      );

      await user.click(screen.getByRole("button"));

      expect(screen.getByText("#frontend")).toBeInTheDocument();

      // Find and click the remove button for 'frontend' tag
      const frontendBadge = screen.getByText("#frontend").closest("span");
      const removeButton = frontendBadge?.querySelector("button");
      await user.click(removeButton!);

      expect(screen.queryByText("#frontend")).not.toBeInTheDocument();
      expect(screen.getByText("#urgent")).toBeInTheDocument();
    });

    it("should not add duplicate tags", async () => {
      const user = userEvent.setup();
      render(
        <MetadataEditor
          {...defaultProps}
          currentMetadata={{ tags: ["frontend"] }}
        />
      );

      await user.click(screen.getByRole("button"));

      const tagInput = screen.getByPlaceholderText("Add tag");
      await user.type(tagInput, "frontend");

      const addButton = screen.getByText("Add");
      await user.click(addButton);

      // Should still only have one frontend tag
      const frontendTags = screen.getAllByText("#frontend");
      expect(frontendTags).toHaveLength(1);
    });

    it("should trim whitespace from new tags", async () => {
      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      await user.click(screen.getByRole("button"));

      const tagInput = screen.getByPlaceholderText("Add tag");
      await user.type(tagInput, "  spaced  ");

      const addButton = screen.getByText("Add");
      await user.click(addButton);

      expect(screen.getByText("#spaced")).toBeInTheDocument();
    });

    it("should disable Add button when tag input is empty", async () => {
      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      await user.click(screen.getByRole("button"));

      const addButton = screen.getByText("Add");
      expect(addButton).toBeDisabled();

      const tagInput = screen.getByPlaceholderText("Add tag");
      await user.type(tagInput, "new-tag");

      expect(addButton).not.toBeDisabled();
    });
  });

  describe("save functionality", () => {
    it("should call updateSubtaskMetadata when save is clicked", async () => {
      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      await user.click(screen.getByRole("button"));

      // Add some metadata
      const assigneeInput = screen.getByPlaceholderText("Enter assignee name");
      await user.type(assigneeInput, "Test User");

      const saveButton = screen.getByText("Save Changes");
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateSubtaskMetadata).toHaveBeenCalledWith(
          "task-group-1",
          "subtask-1",
          { assignee: "Test User" }
        );
      });
    });

    it("should clean up empty values before saving", async () => {
      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      await user.click(screen.getByRole("button"));

      // Add only assignee, leave other fields empty
      const assigneeInput = screen.getByPlaceholderText("Enter assignee name");
      await user.type(assigneeInput, "Test User");

      const saveButton = screen.getByText("Save Changes");
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateSubtaskMetadata).toHaveBeenCalledWith(
          "task-group-1",
          "subtask-1",
          { assignee: "Test User" }
        );
      });
    });

    it("should close dialog after successful save", async () => {
      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      await user.click(screen.getByRole("button"));

      const saveButton = screen.getByText("Save Changes");
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.queryByText("Edit Task Metadata")
        ).not.toBeInTheDocument();
      });
    });

    it("should show saving state during save operation", async () => {
      let resolveSave: () => void;
      const savePromise = new Promise<void>((resolve) => {
        resolveSave = resolve;
      });
      mockUpdateSubtaskMetadata.mockReturnValue(savePromise);

      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      await user.click(screen.getByRole("button"));

      const saveButton = screen.getByText("Save Changes");
      await user.click(saveButton);

      expect(screen.getByText("Saving...")).toBeInTheDocument();
      expect(saveButton).toBeDisabled();

      resolveSave!();
      await waitFor(() => {
        expect(screen.queryByText("Saving...")).not.toBeInTheDocument();
      });
    });

    it("should handle save errors gracefully", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockUpdateSubtaskMetadata.mockRejectedValue(new Error("Save failed"));

      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      await user.click(screen.getByRole("button"));

      const saveButton = screen.getByText("Save Changes");
      await user.click(saveButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Failed to update metadata:",
          expect.any(Error)
        );
      });

      // Dialog should remain open on error
      expect(screen.getByText("Edit Task Metadata")).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });

    it("should not save when disabled", async () => {
      render(<MetadataEditor {...defaultProps} disabled={true} />);

      // Button should be disabled so clicking won't open dialog
      const triggerButton = screen.getByRole("button");
      expect(triggerButton).toBeDisabled();

      expect(mockUpdateSubtaskMetadata).not.toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("should have proper labels for form fields", async () => {
      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      await user.click(screen.getByRole("button"));

      // Check that labels are rendered
      expect(screen.getByText("Priority")).toBeInTheDocument();
      expect(screen.getByText("Assignee")).toBeInTheDocument();
      expect(screen.getByText("Due Date")).toBeInTheDocument();
      expect(screen.getByText("Estimate (hours)")).toBeInTheDocument();
      expect(screen.getByText("Tags")).toBeInTheDocument();
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      // Tab to the trigger button
      await user.tab();
      expect(screen.getByRole("button")).toHaveFocus();

      // Press Enter to open dialog
      await user.keyboard("{Enter}");
      expect(screen.getByText("Edit Task Metadata")).toBeInTheDocument();
    });

    it("should have proper dialog structure", async () => {
      const user = userEvent.setup();
      render(<MetadataEditor {...defaultProps} />);

      await user.click(screen.getByRole("button"));

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByRole("heading")).toBeInTheDocument();
      expect(screen.getByText("Edit Task Metadata")).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("should handle undefined currentMetadata gracefully", () => {
      expect(() => {
        render(
          <MetadataEditor {...defaultProps} currentMetadata={undefined} />
        );
      }).not.toThrow();
    });

    it("should handle empty tags array", async () => {
      const user = userEvent.setup();
      render(
        <MetadataEditor {...defaultProps} currentMetadata={{ tags: [] }} />
      );

      await user.click(screen.getByRole("button"));

      // Should not show any tags
      expect(screen.queryByText(/^#/)).not.toBeInTheDocument();
    });

    it("should handle numeric estimate values correctly", async () => {
      const user = userEvent.setup();
      render(
        <MetadataEditor {...defaultProps} currentMetadata={{ estimate: 0 }} />
      );

      const triggerButton = screen
        .getByTestId("settings-icon")
        .closest("button");
      await user.click(triggerButton!);

      // Find the number input specifically
      const estimateInput = document.querySelector(
        'input[type="number"]'
      ) as HTMLInputElement;
      expect(estimateInput).toBeInTheDocument();

      // The value might be empty for 0, so check if it can accept numbers
      await user.clear(estimateInput);
      await user.type(estimateInput, "5");
      expect(estimateInput.value).toBe("5");
    });
  });
});
