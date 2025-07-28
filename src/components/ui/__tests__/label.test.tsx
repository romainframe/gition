import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import { Label } from "../label";

describe("Label", () => {
  it("should render label element", () => {
    render(<Label>Test Label</Label>);

    const label = screen.getByText("Test Label");
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe("LABEL");
  });

  it("should apply custom className", () => {
    const { container } = render(<Label className="custom-class">Label</Label>);

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should handle htmlFor prop", () => {
    render(<Label htmlFor="test-input">Label for input</Label>);

    const label = screen.getByText("Label for input");
    expect(label).toHaveAttribute("for", "test-input");
  });

  it("should forward ref", () => {
    const ref = jest.fn();
    render(<Label ref={ref}>Label</Label>);

    expect(ref).toHaveBeenCalled();
  });

  it("should render children", () => {
    render(
      <Label>
        <span>Nested content</span>
      </Label>
    );

    expect(screen.getByText("Nested content")).toBeInTheDocument();
  });
});
