import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

import { Separator } from "../separator";

describe("Separator", () => {
  it("should render horizontal separator by default", () => {
    const { container } = render(<Separator />);

    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("bg-border", "shrink-0");
    expect(container.firstChild).toHaveAttribute(
      "data-orientation",
      "horizontal"
    );
  });

  it("should render vertical separator", () => {
    const { container } = render(<Separator orientation="vertical" />);

    expect(container.firstChild).toHaveClass("bg-border", "shrink-0");
    expect(container.firstChild).toHaveAttribute(
      "data-orientation",
      "vertical"
    );
  });

  it("should apply custom className", () => {
    const { container } = render(<Separator className="custom-class" />);

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should be decorative by default", () => {
    const { container } = render(<Separator />);

    expect(container.firstChild).toHaveAttribute(
      "data-orientation",
      "horizontal"
    );
    expect(container.firstChild).toHaveAttribute("data-slot", "separator");
  });
});
