import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

import { Input } from "../input";

describe("Input", () => {
  it("should render input element", () => {
    render(<Input placeholder="Test input" />);

    const input = screen.getByPlaceholderText("Test input");
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
  });

  it("should handle different input types", () => {
    render(<Input type="email" data-testid="email-input" />);

    const input = screen.getByTestId("email-input");
    expect(input).toHaveAttribute("type", "email");
  });

  it("should handle value changes", () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} data-testid="test-input" />);

    const input = screen.getByTestId("test-input");
    fireEvent.change(input, { target: { value: "test value" } });

    expect(handleChange).toHaveBeenCalled();
  });

  it("should apply custom className", () => {
    const { container } = render(<Input className="custom-class" />);

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Input disabled data-testid="disabled-input" />);

    const input = screen.getByTestId("disabled-input");
    expect(input).toBeDisabled();
  });

  it("should forward ref", () => {
    const ref = jest.fn();
    render(<Input ref={ref} />);

    expect(ref).toHaveBeenCalled();
  });
});
