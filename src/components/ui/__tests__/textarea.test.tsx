import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

import { Textarea } from "../textarea";

describe("Textarea", () => {
  it("should render textarea element", () => {
    render(<Textarea placeholder="Test textarea" />);

    const textarea = screen.getByPlaceholderText("Test textarea");
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe("TEXTAREA");
  });

  it("should handle value changes", () => {
    const handleChange = jest.fn();
    render(<Textarea onChange={handleChange} data-testid="test-textarea" />);

    const textarea = screen.getByTestId("test-textarea");
    fireEvent.change(textarea, { target: { value: "test value" } });

    expect(handleChange).toHaveBeenCalled();
  });

  it("should apply custom className", () => {
    const { container } = render(<Textarea className="custom-class" />);

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Textarea disabled data-testid="disabled-textarea" />);

    const textarea = screen.getByTestId("disabled-textarea");
    expect(textarea).toBeDisabled();
  });

  it("should forward ref", () => {
    const ref = jest.fn();
    render(<Textarea ref={ref} />);

    expect(ref).toHaveBeenCalled();
  });

  it("should handle rows prop", () => {
    render(<Textarea rows={5} data-testid="test-textarea" />);

    const textarea = screen.getByTestId("test-textarea");
    expect(textarea).toHaveAttribute("rows", "5");
  });
});
