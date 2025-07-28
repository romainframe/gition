import { render, screen } from "@testing-library/react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "../dialog";

describe("Dialog", () => {
  it("should render dialog root without errors", () => {
    expect(() => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
        </Dialog>
      );
    }).not.toThrow();
  });

  it("should pass props to dialog component", () => {
    // Test that Dialog accepts props without errors
    expect(() => {
      render(
        <Dialog open={false}>
          <DialogTrigger data-testid="dialog-trigger">Open</DialogTrigger>
        </Dialog>
      );
    }).not.toThrow();

    const trigger = screen.getByTestId("dialog-trigger");
    expect(trigger).toHaveAttribute("data-slot", "dialog-trigger");
  });
});

describe("DialogTrigger", () => {
  it("should render trigger with default props", () => {
    render(
      <Dialog>
        <DialogTrigger data-testid="dialog-trigger">Open Dialog</DialogTrigger>
      </Dialog>
    );

    const trigger = screen.getByTestId("dialog-trigger");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("data-slot", "dialog-trigger");
    expect(trigger).toHaveTextContent("Open Dialog");
  });

  it("should accept custom props", () => {
    render(
      <Dialog>
        <DialogTrigger data-testid="dialog-trigger" className="custom-trigger">
          Open Dialog
        </DialogTrigger>
      </Dialog>
    );

    const trigger = screen.getByTestId("dialog-trigger");
    expect(trigger).toHaveClass("custom-trigger");
  });
});

describe("DialogContent", () => {
  it("should render content with default styles and close button", () => {
    render(
      <Dialog open>
        <DialogContent data-testid="dialog-content">
          <DialogTitle>Test Title</DialogTitle>
          <p>Dialog content</p>
        </DialogContent>
      </Dialog>
    );

    const content = screen.getByTestId("dialog-content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute("data-slot", "dialog-content");
    expect(content).toHaveClass(
      "bg-background",
      "fixed",
      "top-[50%]",
      "left-[50%]"
    );
    expect(content).toHaveTextContent("Dialog content");

    // Check for close button
    const closeButton = screen.getByRole("button", { name: /close/i });
    expect(closeButton).toBeInTheDocument();
  });

  it("should hide close button when showCloseButton is false", () => {
    render(
      <Dialog open>
        <DialogContent data-testid="dialog-content" showCloseButton={false}>
          <DialogTitle>Test Title</DialogTitle>
          <p>Dialog content</p>
        </DialogContent>
      </Dialog>
    );

    const content = screen.getByTestId("dialog-content");
    expect(content).toBeInTheDocument();

    // Check for no close button
    const closeButton = screen.queryByRole("button", { name: /close/i });
    expect(closeButton).not.toBeInTheDocument();
  });

  it("should merge custom className with default classes", () => {
    render(
      <Dialog open>
        <DialogContent className="custom-content" data-testid="dialog-content">
          <DialogTitle>Test Title</DialogTitle>
          Content
        </DialogContent>
      </Dialog>
    );

    const content = screen.getByTestId("dialog-content");
    expect(content).toHaveClass("custom-content");
    expect(content).toHaveClass("bg-background", "fixed");
  });
});

describe("DialogOverlay", () => {
  it("should render overlay with default styles", () => {
    render(
      <Dialog open>
        <DialogOverlay data-testid="dialog-overlay" />
      </Dialog>
    );

    const overlay = screen.getByTestId("dialog-overlay");
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveAttribute("data-slot", "dialog-overlay");
    expect(overlay).toHaveClass("fixed", "inset-0", "z-50", "bg-black/50");
  });

  it("should merge custom className", () => {
    render(
      <Dialog open>
        <DialogOverlay
          className="custom-overlay"
          data-testid="dialog-overlay"
        />
      </Dialog>
    );

    const overlay = screen.getByTestId("dialog-overlay");
    expect(overlay).toHaveClass("custom-overlay");
    expect(overlay).toHaveClass("fixed", "inset-0");
  });
});

describe("DialogHeader", () => {
  it("should render header with default styles", () => {
    render(
      <DialogHeader data-testid="dialog-header">Header content</DialogHeader>
    );

    const header = screen.getByTestId("dialog-header");
    expect(header).toBeInTheDocument();
    expect(header).toHaveAttribute("data-slot", "dialog-header");
    expect(header).toHaveClass(
      "flex",
      "flex-col",
      "gap-2",
      "text-center",
      "sm:text-left"
    );
    expect(header).toHaveTextContent("Header content");
  });

  it("should merge custom className", () => {
    render(
      <DialogHeader className="custom-header" data-testid="dialog-header">
        Header
      </DialogHeader>
    );

    const header = screen.getByTestId("dialog-header");
    expect(header).toHaveClass("custom-header");
    expect(header).toHaveClass("flex", "flex-col");
  });
});

describe("DialogFooter", () => {
  it("should render footer with default styles", () => {
    render(
      <DialogFooter data-testid="dialog-footer">Footer content</DialogFooter>
    );

    const footer = screen.getByTestId("dialog-footer");
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveAttribute("data-slot", "dialog-footer");
    expect(footer).toHaveClass(
      "flex",
      "flex-col-reverse",
      "gap-2",
      "sm:flex-row",
      "sm:justify-end"
    );
    expect(footer).toHaveTextContent("Footer content");
  });

  it("should merge custom className", () => {
    render(
      <DialogFooter className="custom-footer" data-testid="dialog-footer">
        Footer
      </DialogFooter>
    );

    const footer = screen.getByTestId("dialog-footer");
    expect(footer).toHaveClass("custom-footer");
    expect(footer).toHaveClass("flex", "flex-col-reverse");
  });
});

describe("DialogTitle", () => {
  it("should render title with default styles", () => {
    render(
      <Dialog open>
        <DialogTitle data-testid="dialog-title">Dialog Title</DialogTitle>
      </Dialog>
    );

    const title = screen.getByTestId("dialog-title");
    expect(title).toBeInTheDocument();
    expect(title).toHaveAttribute("data-slot", "dialog-title");
    expect(title).toHaveClass("text-lg", "leading-none", "font-semibold");
    expect(title).toHaveTextContent("Dialog Title");
  });

  it("should merge custom className", () => {
    render(
      <Dialog open>
        <DialogTitle className="custom-title" data-testid="dialog-title">
          Title
        </DialogTitle>
      </Dialog>
    );

    const title = screen.getByTestId("dialog-title");
    expect(title).toHaveClass("custom-title");
    expect(title).toHaveClass("text-lg", "leading-none");
  });
});

describe("DialogDescription", () => {
  it("should render description with default styles", () => {
    render(
      <Dialog open>
        <DialogDescription data-testid="dialog-description">
          Dialog description
        </DialogDescription>
      </Dialog>
    );

    const description = screen.getByTestId("dialog-description");
    expect(description).toBeInTheDocument();
    expect(description).toHaveAttribute("data-slot", "dialog-description");
    expect(description).toHaveClass("text-muted-foreground", "text-sm");
    expect(description).toHaveTextContent("Dialog description");
  });

  it("should merge custom className", () => {
    render(
      <Dialog open>
        <DialogDescription
          className="custom-description"
          data-testid="dialog-description"
        >
          Description
        </DialogDescription>
      </Dialog>
    );

    const description = screen.getByTestId("dialog-description");
    expect(description).toHaveClass("custom-description");
    expect(description).toHaveClass("text-muted-foreground", "text-sm");
  });
});

describe("DialogClose", () => {
  it("should render close button", () => {
    render(
      <Dialog open>
        <DialogClose data-testid="dialog-close">Close</DialogClose>
      </Dialog>
    );

    const closeButton = screen.getByTestId("dialog-close");
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveAttribute("data-slot", "dialog-close");
    expect(closeButton).toHaveTextContent("Close");
  });
});

describe("Dialog integration", () => {
  it("should render complete dialog structure", () => {
    render(
      <Dialog open>
        <DialogContent data-testid="dialog-content">
          <DialogHeader>
            <DialogTitle data-testid="dialog-title">Test Dialog</DialogTitle>
            <DialogDescription data-testid="dialog-description">
              This is a test dialog description.
            </DialogDescription>
          </DialogHeader>
          <div>Dialog body content</div>
          <DialogFooter>
            <DialogClose data-testid="dialog-close">Cancel</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    const content = screen.getByTestId("dialog-content");
    const title = screen.getByTestId("dialog-title");
    const description = screen.getByTestId("dialog-description");
    const closeButton = screen.getByTestId("dialog-close");

    expect(content).toBeInTheDocument();
    expect(title).toHaveTextContent("Test Dialog");
    expect(description).toHaveTextContent("This is a test dialog description.");
    expect(closeButton).toHaveTextContent("Cancel");
    expect(content).toContainElement(title);
    expect(content).toContainElement(description);
    expect(content).toContainElement(closeButton);
  });

  it("should render dialog with trigger", () => {
    render(
      <Dialog>
        <DialogTrigger data-testid="dialog-trigger">Open Dialog</DialogTrigger>
        <DialogContent data-testid="dialog-content">
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    const trigger = screen.getByTestId("dialog-trigger");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("Open Dialog");

    // Dialog content should not be visible initially
    const content = screen.queryByTestId("dialog-content");
    expect(content).not.toBeInTheDocument();
  });
});
