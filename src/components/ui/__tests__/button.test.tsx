import React from "react";

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "../button";

describe("Button Component", () => {
  it("renders button with text", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: "Click me" })
    ).toBeInTheDocument();
  });

  it("applies default variant and size classes", () => {
    render(<Button>Default Button</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-primary", "h-9", "px-4");
  });

  it("applies custom variant classes", () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-destructive");
  });

  it("applies custom size classes", () => {
    render(<Button size="sm">Small Button</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("h-8", "px-3");
  });

  it("handles click events", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("can be disabled", () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole("button");

    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:opacity-50");
  });

  it("renders as a different component when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );

    const link = screen.getByRole("link", { name: "Link Button" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Custom Button</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("forwards ref correctly", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Button with ref</Button>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("renders all button variants", () => {
    const variants = [
      "default",
      "destructive",
      "outline",
      "secondary",
      "ghost",
      "link",
    ] as const;

    variants.forEach((variant) => {
      const { container } = render(
        <Button variant={variant}>{variant}</Button>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  it("renders all button sizes", () => {
    const sizes = ["default", "sm", "lg", "icon"] as const;

    sizes.forEach((size) => {
      const { container } = render(
        <Button size={size}>{size === "icon" ? "×" : size}</Button>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
