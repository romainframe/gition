import { render, screen } from "@testing-library/react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../select";

describe("Select", () => {
  it("should render select root without errors", () => {
    expect(() => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
        </Select>
      );
    }).not.toThrow();
  });

  it("should pass props to select root", () => {
    // Test that Select accepts props without errors
    expect(() => {
      render(
        <Select defaultValue="option1">
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
        </Select>
      );
    }).not.toThrow();

    const trigger = screen.getByTestId("select-trigger");
    expect(trigger).toHaveAttribute("data-slot", "select-trigger");
  });
});

describe("SelectTrigger", () => {
  it("should render trigger with default styles", () => {
    render(
      <Select>
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
      </Select>
    );

    const trigger = screen.getByTestId("select-trigger");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("data-slot", "select-trigger");
    expect(trigger).toHaveAttribute("data-size", "default");
    expect(trigger).toHaveClass(
      "flex",
      "w-fit",
      "items-center",
      "justify-between"
    );
  });

  it("should render with small size variant", () => {
    render(
      <Select>
        <SelectTrigger size="sm" data-testid="select-trigger">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
      </Select>
    );

    const trigger = screen.getByTestId("select-trigger");
    expect(trigger).toHaveAttribute("data-size", "sm");
    expect(trigger).toHaveClass("data-[size=sm]:h-8");
  });

  it("should merge custom className", () => {
    render(
      <Select>
        <SelectTrigger className="custom-trigger" data-testid="select-trigger">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
      </Select>
    );

    const trigger = screen.getByTestId("select-trigger");
    expect(trigger).toHaveClass("custom-trigger");
    expect(trigger).toHaveClass("flex", "w-fit");
  });

  it("should display chevron down icon", () => {
    render(
      <Select>
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
      </Select>
    );

    // Check for chevron icon presence
    const trigger = screen.getByTestId("select-trigger");
    const icon = trigger.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });
});

describe("SelectValue", () => {
  it("should render value placeholder", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose option" data-testid="select-value" />
        </SelectTrigger>
      </Select>
    );

    const value = screen.getByTestId("select-value");
    expect(value).toBeInTheDocument();
    expect(value).toHaveAttribute("data-slot", "select-value");
  });

  it("should accept custom props", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue
            placeholder="Custom placeholder"
            data-testid="select-value"
          />
        </SelectTrigger>
      </Select>
    );

    const value = screen.getByTestId("select-value");
    expect(value).toBeInTheDocument();
    expect(value).toHaveAttribute("data-slot", "select-value");
  });
});

describe("SelectContent", () => {
  it("should render content when select is open", () => {
    render(
      <Select open>
        <SelectTrigger>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent data-testid="select-content">
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    const content = screen.getByTestId("select-content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute("data-slot", "select-content");
    expect(content).toHaveClass("bg-popover", "relative", "z-50");
  });

  it("should merge custom className", () => {
    render(
      <Select open>
        <SelectTrigger>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent className="custom-content" data-testid="select-content">
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    const content = screen.getByTestId("select-content");
    expect(content).toHaveClass("custom-content");
    expect(content).toHaveClass("bg-popover", "relative");
  });
});

describe("SelectItem", () => {
  it("should render item with default styles", () => {
    render(
      <Select open>
        <SelectTrigger>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1" data-testid="select-item">
            Option 1
          </SelectItem>
        </SelectContent>
      </Select>
    );

    const item = screen.getByTestId("select-item");
    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute("data-slot", "select-item");
    expect(item).toHaveClass("relative", "flex", "w-full", "cursor-default");
    expect(item).toHaveTextContent("Option 1");
  });

  it("should merge custom className", () => {
    render(
      <Select open>
        <SelectTrigger>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            value="option1"
            className="custom-item"
            data-testid="select-item"
          >
            Option 1
          </SelectItem>
        </SelectContent>
      </Select>
    );

    const item = screen.getByTestId("select-item");
    expect(item).toHaveClass("custom-item");
    expect(item).toHaveClass("relative", "flex");
  });

  it("should display check icon when selected", () => {
    render(
      <Select value="option1" open>
        <SelectTrigger>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1" data-testid="select-item">
            Option 1
          </SelectItem>
        </SelectContent>
      </Select>
    );

    const item = screen.getByTestId("select-item");
    // Check for check icon presence
    const checkIcon = item.querySelector("svg");
    expect(checkIcon).toBeInTheDocument();
  });
});

describe("SelectLabel", () => {
  it("should render label with default styles", () => {
    render(
      <Select open>
        <SelectTrigger>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel data-testid="select-label">Category</SelectLabel>
          </SelectGroup>
        </SelectContent>
      </Select>
    );

    const label = screen.getByTestId("select-label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("data-slot", "select-label");
    expect(label).toHaveClass(
      "text-muted-foreground",
      "px-2",
      "py-1.5",
      "text-xs"
    );
    expect(label).toHaveTextContent("Category");
  });

  it("should merge custom className", () => {
    render(
      <Select open>
        <SelectTrigger>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="custom-label" data-testid="select-label">
              Category
            </SelectLabel>
          </SelectGroup>
        </SelectContent>
      </Select>
    );

    const label = screen.getByTestId("select-label");
    expect(label).toHaveClass("custom-label");
    expect(label).toHaveClass("text-muted-foreground", "px-2");
  });
});

describe("SelectSeparator", () => {
  it("should render separator with default styles", () => {
    render(
      <Select open>
        <SelectTrigger>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectSeparator data-testid="select-separator" />
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    const separator = screen.getByTestId("select-separator");
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute("data-slot", "select-separator");
    expect(separator).toHaveClass("bg-border", "-mx-1", "my-1", "h-px");
  });

  it("should merge custom className", () => {
    render(
      <Select open>
        <SelectTrigger>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectSeparator
            className="custom-separator"
            data-testid="select-separator"
          />
        </SelectContent>
      </Select>
    );

    const separator = screen.getByTestId("select-separator");
    expect(separator).toHaveClass("custom-separator");
    expect(separator).toHaveClass("bg-border", "-mx-1");
  });
});

describe("SelectGroup", () => {
  it("should render group without errors", () => {
    expect(() => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup data-testid="select-group">
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );
    }).not.toThrow();

    const group = screen.getByTestId("select-group");
    expect(group).toHaveAttribute("data-slot", "select-group");
  });
});

describe("Select integration", () => {
  it("should render complete select structure", () => {
    render(
      <Select open>
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Choose a fruit" />
        </SelectTrigger>
        <SelectContent data-testid="select-content">
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple" data-testid="apple-item">
              Apple
            </SelectItem>
            <SelectItem value="banana" data-testid="banana-item">
              Banana
            </SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Vegetables</SelectLabel>
            <SelectItem value="carrot">Carrot</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByTestId("select-trigger");
    const content = screen.getByTestId("select-content");
    const appleItem = screen.getByTestId("apple-item");
    const bananaItem = screen.getByTestId("banana-item");

    expect(trigger).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(appleItem).toBeInTheDocument();
    expect(bananaItem).toBeInTheDocument();
    expect(appleItem).toHaveTextContent("Apple");
    expect(bananaItem).toHaveTextContent("Banana");
  });

  it("should render select in closed state", () => {
    render(
      <Select>
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent data-testid="select-content">
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByTestId("select-trigger");
    expect(trigger).toBeInTheDocument();

    // Content should not be visible when closed
    const content = screen.queryByTestId("select-content");
    expect(content).not.toBeInTheDocument();
  });
});
