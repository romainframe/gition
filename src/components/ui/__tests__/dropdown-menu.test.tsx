import { render, screen } from "@testing-library/react";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../dropdown-menu";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  CheckIcon: () => <div data-testid="check-icon">Check</div>,
  ChevronRightIcon: () => (
    <div data-testid="chevron-right-icon">ChevronRight</div>
  ),
  CircleIcon: () => <div data-testid="circle-icon">Circle</div>,
}));

describe("DropdownMenu Components", () => {
  describe("DropdownMenu", () => {
    it("should render dropdown menu root without errors", () => {
      expect(() => {
        render(
          <DropdownMenu>
            <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          </DropdownMenu>
        );
      }).not.toThrow();
    });

    it("should pass props to dropdown menu root", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger data-testid="dropdown-trigger">
            Open Menu
          </DropdownMenuTrigger>
        </DropdownMenu>
      );

      const trigger = screen.getByTestId("dropdown-trigger");
      expect(trigger).toHaveAttribute("data-slot", "dropdown-menu-trigger");
    });
  });

  describe("DropdownMenuTrigger", () => {
    it("should render trigger with default attributes", () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="dropdown-trigger">
            Open Menu
          </DropdownMenuTrigger>
        </DropdownMenu>
      );

      const trigger = screen.getByTestId("dropdown-trigger");
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute("data-slot", "dropdown-menu-trigger");
      expect(trigger).toHaveTextContent("Open Menu");
    });

    it("should accept custom props", () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger
            data-testid="dropdown-trigger"
            className="custom-trigger"
          >
            Custom Trigger
          </DropdownMenuTrigger>
        </DropdownMenu>
      );

      const trigger = screen.getByTestId("dropdown-trigger");
      expect(trigger).toHaveClass("custom-trigger");
    });
  });

  describe("DropdownMenuContent", () => {
    it("should render content when menu is open", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent data-testid="dropdown-content">
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const content = screen.getByTestId("dropdown-content");
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute("data-slot", "dropdown-menu-content");
    });

    it("should apply default styling classes", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent data-testid="dropdown-content">
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const content = screen.getByTestId("dropdown-content");
      expect(content).toHaveClass(
        "bg-popover",
        "z-50",
        "min-w-[8rem]",
        "rounded-md",
        "border",
        "p-1",
        "shadow-md"
      );
    });

    it("should merge custom className", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent
            className="custom-content"
            data-testid="dropdown-content"
          >
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const content = screen.getByTestId("dropdown-content");
      expect(content).toHaveClass("custom-content");
      expect(content).toHaveClass("bg-popover", "z-50");
    });

    it("should use custom sideOffset", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={8} data-testid="dropdown-content">
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const content = screen.getByTestId("dropdown-content");
      expect(content).toBeInTheDocument();
    });
  });

  describe("DropdownMenuItem", () => {
    it("should render menu item with default styling", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem data-testid="menu-item">Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const item = screen.getByTestId("menu-item");
      expect(item).toBeInTheDocument();
      expect(item).toHaveAttribute("data-slot", "dropdown-menu-item");
      expect(item).toHaveAttribute("data-variant", "default");
      expect(item).toHaveClass(
        "relative",
        "flex",
        "cursor-default",
        "items-center"
      );
      expect(item).toHaveTextContent("Item 1");
    });

    it("should render with destructive variant", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem variant="destructive" data-testid="menu-item">
              Delete Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const item = screen.getByTestId("menu-item");
      expect(item).toHaveAttribute("data-variant", "destructive");
      expect(item).toHaveClass("data-[variant=destructive]:text-destructive");
    });

    it("should render with inset styling", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem inset data-testid="menu-item">
              Inset Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const item = screen.getByTestId("menu-item");
      expect(item).toHaveAttribute("data-inset", "true");
      expect(item).toHaveClass("data-[inset]:pl-8");
    });

    it("should merge custom className", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="custom-item" data-testid="menu-item">
              Custom Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const item = screen.getByTestId("menu-item");
      expect(item).toHaveClass("custom-item");
      expect(item).toHaveClass("relative", "flex");
    });
  });

  describe("DropdownMenuCheckboxItem", () => {
    it("should render checkbox item with check indicator", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked data-testid="checkbox-item">
              Checked Item
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const item = screen.getByTestId("checkbox-item");
      expect(item).toBeInTheDocument();
      expect(item).toHaveAttribute("data-slot", "dropdown-menu-checkbox-item");
      expect(item).toHaveClass("relative", "flex", "items-center", "pl-8");
      expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    });

    it("should handle unchecked state", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem
              checked={false}
              data-testid="checkbox-item"
            >
              Unchecked Item
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const item = screen.getByTestId("checkbox-item");
      expect(item).toBeInTheDocument();
      expect(item).toHaveTextContent("Unchecked Item");
    });

    it("should merge custom className", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem
              className="custom-checkbox"
              data-testid="checkbox-item"
            >
              Custom Checkbox
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const item = screen.getByTestId("checkbox-item");
      expect(item).toHaveClass("custom-checkbox");
      expect(item).toHaveClass("relative", "flex");
    });
  });

  describe("DropdownMenuRadioGroup and DropdownMenuRadioItem", () => {
    it("should render radio group with radio items", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="option1" data-testid="radio-group">
              <DropdownMenuRadioItem value="option1" data-testid="radio-item-1">
                Option 1
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="option2" data-testid="radio-item-2">
                Option 2
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const group = screen.getByTestId("radio-group");
      const item1 = screen.getByTestId("radio-item-1");
      const item2 = screen.getByTestId("radio-item-2");

      expect(group).toHaveAttribute("data-slot", "dropdown-menu-radio-group");
      expect(item1).toHaveAttribute("data-slot", "dropdown-menu-radio-item");
      expect(item2).toHaveAttribute("data-slot", "dropdown-menu-radio-item");
      expect(item1).toHaveClass("relative", "flex", "items-center", "pl-8");
      expect(screen.getByTestId("circle-icon")).toBeInTheDocument();
    });

    it("should merge custom className for radio items", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="option1">
              <DropdownMenuRadioItem
                value="option1"
                className="custom-radio"
                data-testid="radio-item"
              >
                Custom Radio
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const item = screen.getByTestId("radio-item");
      expect(item).toHaveClass("custom-radio");
      expect(item).toHaveClass("relative", "flex");
    });
  });

  describe("DropdownMenuLabel", () => {
    it("should render label with default styling", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel data-testid="menu-label">
              Label Text
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const label = screen.getByTestId("menu-label");
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute("data-slot", "dropdown-menu-label");
      expect(label).toHaveClass("px-2", "py-1.5", "text-sm", "font-medium");
      expect(label).toHaveTextContent("Label Text");
    });

    it("should render with inset styling", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel inset data-testid="menu-label">
              Inset Label
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const label = screen.getByTestId("menu-label");
      expect(label).toHaveAttribute("data-inset", "true");
      expect(label).toHaveClass("data-[inset]:pl-8");
    });

    it("should merge custom className", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel
              className="custom-label"
              data-testid="menu-label"
            >
              Custom Label
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const label = screen.getByTestId("menu-label");
      expect(label).toHaveClass("custom-label");
      expect(label).toHaveClass("px-2", "py-1.5");
    });
  });

  describe("DropdownMenuSeparator", () => {
    it("should render separator with default styling", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuSeparator data-testid="menu-separator" />
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const separator = screen.getByTestId("menu-separator");
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveAttribute("data-slot", "dropdown-menu-separator");
      expect(separator).toHaveClass("bg-border", "-mx-1", "my-1", "h-px");
    });

    it("should merge custom className", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSeparator
              className="custom-separator"
              data-testid="menu-separator"
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const separator = screen.getByTestId("menu-separator");
      expect(separator).toHaveClass("custom-separator");
      expect(separator).toHaveClass("bg-border", "-mx-1");
    });
  });

  describe("DropdownMenuShortcut", () => {
    it("should render shortcut with default styling", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              Copy
              <DropdownMenuShortcut data-testid="menu-shortcut">
                ⌘C
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const shortcut = screen.getByTestId("menu-shortcut");
      expect(shortcut).toBeInTheDocument();
      expect(shortcut).toHaveAttribute("data-slot", "dropdown-menu-shortcut");
      expect(shortcut).toHaveClass(
        "text-muted-foreground",
        "ml-auto",
        "text-xs",
        "tracking-widest"
      );
      expect(shortcut).toHaveTextContent("⌘C");
    });

    it("should merge custom className", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              Copy
              <DropdownMenuShortcut
                className="custom-shortcut"
                data-testid="menu-shortcut"
              >
                Ctrl+C
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const shortcut = screen.getByTestId("menu-shortcut");
      expect(shortcut).toHaveClass("custom-shortcut");
      expect(shortcut).toHaveClass("text-muted-foreground", "ml-auto");
    });
  });

  describe("DropdownMenuSub components", () => {
    it("should render sub menu components", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub open>
              <DropdownMenuSubTrigger data-testid="sub-trigger">
                More Options
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent data-testid="sub-content">
                <DropdownMenuItem>Sub Item 1</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const subTrigger = screen.getByTestId("sub-trigger");
      const subContent = screen.getByTestId("sub-content");

      expect(subTrigger).toBeInTheDocument();
      expect(subTrigger).toHaveAttribute(
        "data-slot",
        "dropdown-menu-sub-trigger"
      );
      expect(subTrigger).toHaveClass("flex", "cursor-default", "items-center");
      expect(screen.getByTestId("chevron-right-icon")).toBeInTheDocument();

      expect(subContent).toBeInTheDocument();
      expect(subContent).toHaveAttribute(
        "data-slot",
        "dropdown-menu-sub-content"
      );
      expect(subContent).toHaveClass("bg-popover", "z-50", "min-w-[8rem]");
    });

    it("should render sub trigger with inset styling", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger inset data-testid="sub-trigger">
                Inset Sub Menu
              </DropdownMenuSubTrigger>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const subTrigger = screen.getByTestId("sub-trigger");
      expect(subTrigger).toHaveAttribute("data-inset", "true");
      expect(subTrigger).toHaveClass("data-[inset]:pl-8");
    });

    it("should merge custom className for sub components", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub open>
              <DropdownMenuSubTrigger
                className="custom-sub-trigger"
                data-testid="sub-trigger"
              >
                Custom Sub
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent
                className="custom-sub-content"
                data-testid="sub-content"
              >
                <DropdownMenuItem>Item</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const subTrigger = screen.getByTestId("sub-trigger");
      const subContent = screen.getByTestId("sub-content");

      expect(subTrigger).toHaveClass("custom-sub-trigger");
      expect(subTrigger).toHaveClass("flex", "cursor-default");

      expect(subContent).toHaveClass("custom-sub-content");
      expect(subContent).toHaveClass("bg-popover", "z-50");
    });
  });

  describe("DropdownMenuGroup and DropdownMenuPortal", () => {
    it("should render group component", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup data-testid="menu-group">
              <DropdownMenuItem>Grouped Item 1</DropdownMenuItem>
              <DropdownMenuItem>Grouped Item 2</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const group = screen.getByTestId("menu-group");
      expect(group).toBeInTheDocument();
      expect(group).toHaveAttribute("data-slot", "dropdown-menu-group");
    });

    it("should render portal component within menu context", () => {
      expect(() => {
        render(
          <DropdownMenu open>
            <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuPortal data-testid="menu-portal">
                <div>Portal Content</div>
              </DropdownMenuPortal>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }).not.toThrow();
    });
  });

  describe("integration tests", () => {
    it("should render complete dropdown menu structure", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger data-testid="trigger">
            Options
          </DropdownMenuTrigger>
          <DropdownMenuContent data-testid="content">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem data-testid="profile-item">
                Profile
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem data-testid="settings-item">
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked data-testid="notifications">
              Notifications
            </DropdownMenuCheckboxItem>
            <DropdownMenuRadioGroup value="light">
              <DropdownMenuRadioItem value="light" data-testid="light-theme">
                Light
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark" data-testid="dark-theme">
                Dark
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      // Verify all components are rendered
      expect(screen.getByTestId("trigger")).toBeInTheDocument();
      expect(screen.getByTestId("content")).toBeInTheDocument();
      expect(screen.getByText("My Account")).toBeInTheDocument();
      expect(screen.getByTestId("profile-item")).toBeInTheDocument();
      expect(screen.getByTestId("settings-item")).toBeInTheDocument();
      expect(screen.getByTestId("notifications")).toBeInTheDocument();
      expect(screen.getByTestId("light-theme")).toBeInTheDocument();
      expect(screen.getByTestId("dark-theme")).toBeInTheDocument();
      expect(screen.getByText("⇧⌘P")).toBeInTheDocument();
    });

    it("should handle closed dropdown menu state", () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="trigger">
            Options
          </DropdownMenuTrigger>
          <DropdownMenuContent data-testid="content">
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByTestId("trigger");
      expect(trigger).toBeInTheDocument();

      // Content should not be visible when closed
      const content = screen.queryByTestId("content");
      expect(content).not.toBeInTheDocument();
    });
  });
});
