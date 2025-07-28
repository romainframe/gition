import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import { Badge } from "../badge";

describe("Badge", () => {
  it("should render badge with text", () => {
    render(<Badge>Test Badge</Badge>);

    expect(screen.getByText("Test Badge")).toBeInTheDocument();
  });

  it("should render with default variant", () => {
    const { container } = render(<Badge>Default</Badge>);

    expect(container.firstChild).toHaveClass(
      "bg-primary",
      "text-primary-foreground"
    );
  });

  it("should render with secondary variant", () => {
    const { container } = render(<Badge variant="secondary">Secondary</Badge>);

    expect(container.firstChild).toHaveClass(
      "bg-secondary",
      "text-secondary-foreground"
    );
  });

  it("should render with destructive variant", () => {
    const { container } = render(
      <Badge variant="destructive">Destructive</Badge>
    );

    expect(container.firstChild).toHaveClass("bg-destructive", "text-white");
  });

  it("should render with outline variant", () => {
    const { container } = render(<Badge variant="outline">Outline</Badge>);

    expect(container.firstChild).toHaveClass("text-foreground");
  });

  it("should apply custom className", () => {
    const { container } = render(<Badge className="custom-class">Badge</Badge>);

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should forward props to div element", () => {
    render(<Badge data-testid="test-badge">Badge</Badge>);

    expect(screen.getByTestId("test-badge")).toBeInTheDocument();
  });

  it("should have default badge styling", () => {
    const { container } = render(<Badge>Badge</Badge>);

    expect(container.firstChild).toHaveClass(
      "inline-flex",
      "items-center",
      "rounded-md",
      "border",
      "px-2",
      "py-0.5",
      "text-xs",
      "font-medium"
    );
  });

  it("should render with different sizes when custom classes applied", () => {
    const { container } = render(
      <Badge className="text-lg px-4 py-2">Large Badge</Badge>
    );

    expect(container.firstChild).toHaveClass("text-lg", "px-4", "py-2");
  });
});
