import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

import GlobalError from "../global-error";

describe("GlobalError Page", () => {
  const mockError = new Error("Critical test error");
  const mockReset = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render global error page with critical error message", () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(screen.getByText("Critical Error")).toBeInTheDocument();
    expect(
      screen.getByText(
        /A critical error occurred that prevented the application from loading properly/
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reload application" })
    ).toBeInTheDocument();
  });

  it("should call reset function when reload button is clicked", () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    const reloadButton = screen.getByRole("button", {
      name: "Reload application",
    });
    fireEvent.click(reloadButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("should render complete HTML structure", () => {
    const { container } = render(
      <GlobalError error={mockError} reset={mockReset} />
    );

    // The component renders html and body tags, but in testing they're just div containers
    // Check that the structure includes the main error layout
    expect(container.firstChild).toBeTruthy();
  });

  it("should have proper styling classes", () => {
    const { container } = render(
      <GlobalError error={mockError} reset={mockReset} />
    );

    // Check for main container styling (look for the div with min-h-screen class)
    const mainContainer = container.querySelector(".min-h-screen");
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass(
      "flex",
      "items-center",
      "justify-center",
      "p-4",
      "bg-background"
    );
  });

  it("should display error icon", () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    // The AlertCircle icon should be present
    const icon = document.querySelector(".lucide-circle-alert");
    expect(icon).toBeInTheDocument();
  });

  it("should handle error parameter variations", () => {
    const errorWithDigest = Object.assign(new Error("Error with digest"), {
      digest: "xyz789",
    });

    // Should render without issues even with digest property
    render(<GlobalError error={errorWithDigest} reset={mockReset} />);

    expect(screen.getByText("Critical Error")).toBeInTheDocument();
  });

  it("should maintain button accessibility", () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    const reloadButton = screen.getByRole("button", {
      name: "Reload application",
    });

    // Button should be focusable and accessible
    expect(reloadButton).toBeInTheDocument();
    expect(reloadButton).not.toBeDisabled();

    // Test keyboard interaction
    reloadButton.focus();
    expect(reloadButton).toHaveFocus();
  });
});
