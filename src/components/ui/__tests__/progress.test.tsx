import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

import { Progress } from "../progress";

describe("Progress", () => {
  it("should render progress bar", () => {
    const { container } = render(<Progress value={50} />);

    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute("role", "progressbar");
  });

  it("should show correct progress value", () => {
    const { container } = render(<Progress value={75} />);

    expect(container.firstChild).toHaveAttribute("aria-valuenow", "75");
  });

  it("should handle 0 value", () => {
    const { container } = render(<Progress value={0} />);

    expect(container.firstChild).toHaveAttribute("aria-valuenow", "0");
  });

  it("should handle 100 value", () => {
    const { container } = render(<Progress value={100} />);

    expect(container.firstChild).toHaveAttribute("aria-valuenow", "100");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <Progress value={50} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should handle undefined value", () => {
    const { container } = render(<Progress />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
