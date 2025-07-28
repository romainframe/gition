import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";

describe("Tabs Components", () => {
  describe("Tabs", () => {
    it("should render tabs root without errors", () => {
      expect(() => {
        render(
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Content 1</TabsContent>
          </Tabs>
        );
      }).not.toThrow();
    });

    it("should pass props to tabs root", () => {
      render(
        <Tabs
          defaultValue="tab1"
          orientation="vertical"
          data-testid="tabs-root"
        >
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );

      const tabsRoot = screen.getByTestId("tabs-root");
      expect(tabsRoot).toBeInTheDocument();
      expect(tabsRoot).toHaveAttribute("data-orientation", "vertical");
    });

    it("should handle controlled value", () => {
      const { rerender } = render(
        <Tabs value="tab1">
          <TabsList>
            <TabsTrigger value="tab1" data-testid="tab1-trigger">
              Tab 1
            </TabsTrigger>
            <TabsTrigger value="tab2" data-testid="tab2-trigger">
              Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" data-testid="tab1-content">
            Content 1
          </TabsContent>
          <TabsContent value="tab2" data-testid="tab2-content">
            Content 2
          </TabsContent>
        </Tabs>
      );

      expect(screen.getByTestId("tab1-content")).toBeInTheDocument();
      expect(screen.getByTestId("tab1-content")).not.toHaveAttribute("hidden");

      const tab2Content = screen.getByTestId("tab2-content");
      expect(tab2Content).toBeInTheDocument();
      expect(tab2Content).toHaveAttribute("hidden");

      rerender(
        <Tabs value="tab2">
          <TabsList>
            <TabsTrigger value="tab1" data-testid="tab1-trigger">
              Tab 1
            </TabsTrigger>
            <TabsTrigger value="tab2" data-testid="tab2-trigger">
              Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" data-testid="tab1-content">
            Content 1
          </TabsContent>
          <TabsContent value="tab2" data-testid="tab2-content">
            Content 2
          </TabsContent>
        </Tabs>
      );

      const tab1Content = screen.getByTestId("tab1-content");
      expect(tab1Content).toBeInTheDocument();
      expect(tab1Content).toHaveAttribute("hidden");

      expect(screen.getByTestId("tab2-content")).toBeInTheDocument();
      expect(screen.getByTestId("tab2-content")).not.toHaveAttribute("hidden");
    });
  });

  describe("TabsList", () => {
    it("should render tabs list with default styling", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const tabsList = screen.getByTestId("tabs-list");
      expect(tabsList).toBeInTheDocument();
      expect(tabsList).toHaveClass(
        "inline-flex",
        "h-9",
        "items-center",
        "justify-center",
        "rounded-lg",
        "bg-muted",
        "p-1",
        "text-muted-foreground"
      );
      expect(tabsList).toHaveAttribute("role", "tablist");
    });

    it("should merge custom className", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList className="custom-tabs-list" data-testid="tabs-list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const tabsList = screen.getByTestId("tabs-list");
      expect(tabsList).toHaveClass("custom-tabs-list");
      expect(tabsList).toHaveClass("inline-flex", "h-9");
    });

    it("should forward ref correctly", () => {
      const ref = { current: null };
      render(
        <Tabs defaultValue="tab1">
          <TabsList ref={ref} data-testid="tabs-list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      expect(ref.current).not.toBeNull();
    });

    it("should have correct display name", () => {
      expect(TabsList.displayName).toBe("TabsList");
    });
  });

  describe("TabsTrigger", () => {
    it("should render tab trigger with default styling", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" data-testid="tab-trigger">
              Tab 1
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const trigger = screen.getByTestId("tab-trigger");
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveClass(
        "inline-flex",
        "items-center",
        "justify-center",
        "whitespace-nowrap",
        "rounded-md",
        "px-3",
        "py-1",
        "text-sm",
        "font-medium"
      );
      expect(trigger).toHaveAttribute("role", "tab");
      expect(trigger).toHaveTextContent("Tab 1");
    });

    it("should handle active state styling", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" data-testid="tab1-trigger">
              Tab 1
            </TabsTrigger>
            <TabsTrigger value="tab2" data-testid="tab2-trigger">
              Tab 2
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const activeTab = screen.getByTestId("tab1-trigger");
      const inactiveTab = screen.getByTestId("tab2-trigger");

      expect(activeTab).toHaveAttribute("data-state", "active");
      expect(activeTab).toHaveClass("data-[state=active]:bg-background");
      expect(inactiveTab).toHaveAttribute("data-state", "inactive");
    });

    it("should handle disabled state", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" data-testid="tab1-trigger">
              Tab 1
            </TabsTrigger>
            <TabsTrigger value="tab2" disabled data-testid="tab2-trigger">
              Tab 2
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const disabledTab = screen.getByTestId("tab2-trigger");
      expect(disabledTab).toHaveAttribute("disabled");
      expect(disabledTab).toHaveClass(
        "disabled:pointer-events-none",
        "disabled:opacity-50"
      );
    });

    it("should merge custom className", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger
              value="tab1"
              className="custom-trigger"
              data-testid="tab-trigger"
            >
              Custom Tab
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const trigger = screen.getByTestId("tab-trigger");
      expect(trigger).toHaveClass("custom-trigger");
      expect(trigger).toHaveClass("inline-flex", "items-center");
    });

    it("should forward ref correctly", () => {
      const ref = { current: null };
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" ref={ref} data-testid="tab-trigger">
              Tab 1
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );

      expect(ref.current).not.toBeNull();
    });

    it("should have correct display name", () => {
      expect(TabsTrigger.displayName).toBe("TabsTrigger");
    });
  });

  describe("TabsContent", () => {
    it("should render tab content with default styling", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" data-testid="tab-content">
            Content for tab 1
          </TabsContent>
        </Tabs>
      );

      const content = screen.getByTestId("tab-content");
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass(
        "mt-2",
        "ring-offset-background",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-ring",
        "focus-visible:ring-offset-2"
      );
      expect(content).toHaveAttribute("role", "tabpanel");
      expect(content).toHaveTextContent("Content for tab 1");
    });

    it("should hide content for inactive tabs", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" data-testid="tab1-content">
            Content 1
          </TabsContent>
          <TabsContent value="tab2" data-testid="tab2-content">
            Content 2
          </TabsContent>
        </Tabs>
      );

      expect(screen.getByTestId("tab1-content")).toBeInTheDocument();
      expect(screen.getByTestId("tab1-content")).not.toHaveAttribute("hidden");

      const tab2Content = screen.getByTestId("tab2-content");
      expect(tab2Content).toBeInTheDocument();
      expect(tab2Content).toHaveAttribute("hidden");
    });

    it("should merge custom className", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent
            value="tab1"
            className="custom-content"
            data-testid="tab-content"
          >
            Custom Content
          </TabsContent>
        </Tabs>
      );

      const content = screen.getByTestId("tab-content");
      expect(content).toHaveClass("custom-content");
      expect(content).toHaveClass("mt-2", "ring-offset-background");
    });

    it("should forward ref correctly", () => {
      const ref = { current: null };
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" ref={ref} data-testid="tab-content">
            Content
          </TabsContent>
        </Tabs>
      );

      expect(ref.current).not.toBeNull();
    });

    it("should have correct display name", () => {
      expect(TabsContent.displayName).toBe("TabsContent");
    });
  });

  describe("tab interaction", () => {
    it("should switch tabs when trigger is clicked", async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" data-testid="tab1-trigger">
              Tab 1
            </TabsTrigger>
            <TabsTrigger value="tab2" data-testid="tab2-trigger">
              Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" data-testid="tab1-content">
            Content 1
          </TabsContent>
          <TabsContent value="tab2" data-testid="tab2-content">
            Content 2
          </TabsContent>
        </Tabs>
      );

      // Initially tab1 is active
      expect(screen.getByTestId("tab1-content")).toBeInTheDocument();
      expect(screen.getByTestId("tab1-content")).not.toHaveAttribute("hidden");

      let tab2Content = screen.getByTestId("tab2-content");
      expect(tab2Content).toBeInTheDocument();
      expect(tab2Content).toHaveAttribute("hidden");

      // Click tab2
      await user.click(screen.getByTestId("tab2-trigger"));

      // Now tab2 should be active
      const tab1Content = screen.getByTestId("tab1-content");
      expect(tab1Content).toBeInTheDocument();
      expect(tab1Content).toHaveAttribute("hidden");

      tab2Content = screen.getByTestId("tab2-content");
      expect(tab2Content).toBeInTheDocument();
      expect(tab2Content).not.toHaveAttribute("hidden");
    });

    it("should handle keyboard navigation", async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" data-testid="tab1-trigger">
              Tab 1
            </TabsTrigger>
            <TabsTrigger value="tab2" data-testid="tab2-trigger">
              Tab 2
            </TabsTrigger>
            <TabsTrigger value="tab3" data-testid="tab3-trigger">
              Tab 3
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" data-testid="tab1-content">
            Content 1
          </TabsContent>
          <TabsContent value="tab2" data-testid="tab2-content">
            Content 2
          </TabsContent>
          <TabsContent value="tab3" data-testid="tab3-content">
            Content 3
          </TabsContent>
        </Tabs>
      );

      const tab1 = screen.getByTestId("tab1-trigger");
      const tab2 = screen.getByTestId("tab2-trigger");

      // Focus first tab
      act(() => {
        tab1.focus();
      });
      expect(tab1).toHaveFocus();

      // Navigate to next tab with arrow key
      await user.keyboard("{ArrowRight}");
      expect(tab2).toHaveFocus();
    });

    it("should call onValueChange when tab changes", async () => {
      const onValueChange = jest.fn();
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1" onValueChange={onValueChange}>
          <TabsList>
            <TabsTrigger value="tab1" data-testid="tab1-trigger">
              Tab 1
            </TabsTrigger>
            <TabsTrigger value="tab2" data-testid="tab2-trigger">
              Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      await user.click(screen.getByTestId("tab2-trigger"));

      expect(onValueChange).toHaveBeenCalledWith("tab2");
    });

    it("should not change tab when trigger is disabled", async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" data-testid="tab1-trigger">
              Tab 1
            </TabsTrigger>
            <TabsTrigger value="tab2" disabled data-testid="tab2-trigger">
              Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" data-testid="tab1-content">
            Content 1
          </TabsContent>
          <TabsContent value="tab2" data-testid="tab2-content">
            Content 2
          </TabsContent>
        </Tabs>
      );

      // Try to click disabled tab
      await user.click(screen.getByTestId("tab2-trigger"));

      // Should still show tab1 content as active
      expect(screen.getByTestId("tab1-content")).toBeInTheDocument();
      expect(screen.getByTestId("tab1-content")).not.toHaveAttribute("hidden");

      const tab2Content = screen.getByTestId("tab2-content");
      expect(tab2Content).toBeInTheDocument();
      expect(tab2Content).toHaveAttribute("hidden");
    });
  });

  describe("accessibility", () => {
    it("should have correct ARIA attributes", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="tab1" data-testid="tab1-trigger">
              Tab 1
            </TabsTrigger>
            <TabsTrigger value="tab2" data-testid="tab2-trigger">
              Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" data-testid="tab1-content">
            Content 1
          </TabsContent>
        </Tabs>
      );

      const tabsList = screen.getByTestId("tabs-list");
      const tab1Trigger = screen.getByTestId("tab1-trigger");
      const tab2Trigger = screen.getByTestId("tab2-trigger");
      const tab1Content = screen.getByTestId("tab1-content");

      expect(tabsList).toHaveAttribute("role", "tablist");
      expect(tab1Trigger).toHaveAttribute("role", "tab");
      expect(tab2Trigger).toHaveAttribute("role", "tab");
      expect(tab1Content).toHaveAttribute("role", "tabpanel");

      expect(tab1Trigger).toHaveAttribute("aria-selected", "true");
      expect(tab2Trigger).toHaveAttribute("aria-selected", "false");
    });

    it("should associate tab panels with controls", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" data-testid="tab1-trigger">
              Tab 1
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" data-testid="tab1-content">
            Content 1
          </TabsContent>
        </Tabs>
      );

      const tab1Trigger = screen.getByTestId("tab1-trigger");
      const tab1Content = screen.getByTestId("tab1-content");

      const tabId = tab1Trigger.getAttribute("id");
      const panelId = tab1Content.getAttribute("id");

      expect(tab1Trigger).toHaveAttribute("aria-controls", panelId);
      expect(tab1Content).toHaveAttribute("aria-labelledby", tabId);
    });
  });

  describe("integration tests", () => {
    it("should render complete tabs interface", () => {
      render(
        <Tabs defaultValue="overview" data-testid="tabs-root">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="overview" data-testid="overview-trigger">
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="analytics-trigger">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="reports" data-testid="reports-trigger">
              Reports
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              disabled
              data-testid="notifications-trigger"
            >
              Notifications
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" data-testid="overview-content">
            <h2>Overview Dashboard</h2>
            <p>Welcome to the overview section.</p>
          </TabsContent>
          <TabsContent value="analytics" data-testid="analytics-content">
            <h2>Analytics</h2>
            <p>View your analytics data here.</p>
          </TabsContent>
          <TabsContent value="reports" data-testid="reports-content">
            <h2>Reports</h2>
            <p>Generate and view reports.</p>
          </TabsContent>
          <TabsContent
            value="notifications"
            data-testid="notifications-content"
          >
            <h2>Notifications</h2>
            <p>Manage your notifications.</p>
          </TabsContent>
        </Tabs>
      );

      // Verify all components are rendered
      expect(screen.getByTestId("tabs-root")).toBeInTheDocument();
      expect(screen.getByTestId("tabs-list")).toBeInTheDocument();
      expect(screen.getByTestId("overview-trigger")).toBeInTheDocument();
      expect(screen.getByTestId("analytics-trigger")).toBeInTheDocument();
      expect(screen.getByTestId("reports-trigger")).toBeInTheDocument();
      expect(screen.getByTestId("notifications-trigger")).toBeInTheDocument();

      // Only active content should be visible
      expect(screen.getByTestId("overview-content")).toBeInTheDocument();
      expect(screen.getByTestId("overview-content")).not.toHaveAttribute(
        "hidden"
      );

      // Other content should be hidden
      expect(screen.getByTestId("analytics-content")).toHaveAttribute("hidden");
      expect(screen.getByTestId("reports-content")).toHaveAttribute("hidden");
      expect(screen.getByTestId("notifications-content")).toHaveAttribute(
        "hidden"
      );

      // Check content text
      expect(screen.getByText("Overview Dashboard")).toBeInTheDocument();
      expect(
        screen.getByText("Welcome to the overview section.")
      ).toBeInTheDocument();

      // Check disabled state
      expect(screen.getByTestId("notifications-trigger")).toHaveAttribute(
        "disabled"
      );
    });

    it("should handle complex content with nested elements", () => {
      render(
        <Tabs defaultValue="form">
          <TabsList>
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="form" data-testid="form-content">
            <div>
              <input data-testid="form-input" placeholder="Enter text" />
              <button data-testid="form-button">Submit</button>
            </div>
          </TabsContent>
          <TabsContent value="preview" data-testid="preview-content">
            <div>
              <h3>Preview</h3>
              <p>This is the preview of your content.</p>
            </div>
          </TabsContent>
        </Tabs>
      );

      // Form content should be visible with nested elements
      expect(screen.getByTestId("form-content")).toBeInTheDocument();
      expect(screen.getByTestId("form-content")).not.toHaveAttribute("hidden");
      expect(screen.getByTestId("form-input")).toBeInTheDocument();
      expect(screen.getByTestId("form-button")).toBeInTheDocument();

      // Preview content should be hidden
      const previewContent = screen.getByTestId("preview-content");
      expect(previewContent).toBeInTheDocument();
      expect(previewContent).toHaveAttribute("hidden");
    });
  });
});
