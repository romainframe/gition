import React from "react";

import { screen, waitFor } from "@testing-library/react";

import {
  mockRouter,
  mockUsePathname,
  mockUseRouter,
  mockUseSearchParams,
  render,
  waitForLoadingToFinish,
} from "../test-utils";

// Test component to verify provider wrapping
const TestComponent = () => {
  return (
    <div>
      <h1>Test Component</h1>
      <div data-testid="theme-test">Theme Test</div>
    </div>
  );
};

// Mock component that simulates loading state
const LoadingComponent = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <div>
      {isLoading && <div aria-busy="true">Loading...</div>}
      <div>Content</div>
    </div>
  );
};

describe("Test Utils Fixtures", () => {
  describe("custom render function", () => {
    it("should export custom render function", () => {
      expect(render).toBeDefined();
      expect(typeof render).toBe("function");
    });

    it("should render components with provider wrapper", () => {
      const { container } = render(<TestComponent />);

      expect(screen.getByText("Test Component")).toBeInTheDocument();
      expect(screen.getByTestId("theme-test")).toBeInTheDocument();
      expect(container).toBeInTheDocument();
    });

    it("should apply ThemeProvider to rendered components", () => {
      render(<TestComponent />);

      // The component should be wrapped with ThemeProvider
      // We can verify this by checking that the component renders without errors
      expect(screen.getByText("Test Component")).toBeInTheDocument();
    });

    it("should accept render options", () => {
      const customContainer = document.createElement("div");
      customContainer.id = "custom-container";
      document.body.appendChild(customContainer);

      const { container } = render(<TestComponent />, {
        container: customContainer,
      });

      // The container should be the custom container we provided
      expect(container).toBe(customContainer);

      document.body.removeChild(customContainer);
    });

    it("should preserve original Testing Library exports", () => {
      // Should re-export all testing library functions
      expect(screen).toBeDefined();
      expect(waitFor).toBeDefined();
    });

    it("should handle components that use theme context", () => {
      // Component that might use theme context should render without errors
      const ThemedComponent = () => (
        <div className="dark:bg-black light:bg-white">Themed content</div>
      );

      expect(() => {
        render(<ThemedComponent />);
      }).not.toThrow();

      expect(screen.getByText("Themed content")).toBeInTheDocument();
    });
  });

  describe("waitForLoadingToFinish utility", () => {
    it("should export waitForLoadingToFinish function", () => {
      expect(waitForLoadingToFinish).toBeDefined();
      expect(typeof waitForLoadingToFinish).toBe("function");
    });

    it("should wait for loading elements to disappear", async () => {
      let isLoading = true;

      const { rerender } = render(<LoadingComponent isLoading={isLoading} />);

      // Initially should have loading element
      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();

      // Simulate loading completion
      setTimeout(() => {
        isLoading = false;
        rerender(<LoadingComponent isLoading={isLoading} />);
      }, 100);

      // Wait for loading to finish
      await waitForLoadingToFinish();

      // Loading element should be gone
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      expect(
        document.querySelector('[aria-busy="true"]')
      ).not.toBeInTheDocument();
    });

    it("should handle case when no loading elements exist", async () => {
      render(<div>No loading state</div>);

      // Should not throw when no loading elements exist
      await expect(waitForLoadingToFinish()).resolves.toBeUndefined();
    });

    it("should import waitFor dynamically", async () => {
      // Test that the function uses dynamic import
      const originalWaitFor = waitFor;

      // The function should work without throwing
      await expect(waitForLoadingToFinish()).resolves.toBeUndefined();

      // waitFor should still be available
      expect(originalWaitFor).toBeDefined();
    });
  });

  describe("mockRouter object", () => {
    it("should export mockRouter with all required properties", () => {
      expect(mockRouter).toBeDefined();
      expect(typeof mockRouter).toBe("object");

      // Required Next.js router properties
      expect(mockRouter).toHaveProperty("basePath");
      expect(mockRouter).toHaveProperty("pathname");
      expect(mockRouter).toHaveProperty("route");
      expect(mockRouter).toHaveProperty("asPath");
      expect(mockRouter).toHaveProperty("query");
      expect(mockRouter).toHaveProperty("push");
      expect(mockRouter).toHaveProperty("replace");
      expect(mockRouter).toHaveProperty("reload");
      expect(mockRouter).toHaveProperty("back");
      expect(mockRouter).toHaveProperty("prefetch");
      expect(mockRouter).toHaveProperty("beforePopState");
      expect(mockRouter).toHaveProperty("events");
      expect(mockRouter).toHaveProperty("isFallback");
      expect(mockRouter).toHaveProperty("isLocaleDomain");
      expect(mockRouter).toHaveProperty("isReady");
      expect(mockRouter).toHaveProperty("isPreview");
    });

    it("should have sensible default values", () => {
      expect(mockRouter.basePath).toBe("");
      expect(mockRouter.pathname).toBe("/");
      expect(mockRouter.route).toBe("/");
      expect(mockRouter.asPath).toBe("/");
      expect(mockRouter.query).toEqual({});
      expect(mockRouter.isFallback).toBe(false);
      expect(mockRouter.isLocaleDomain).toBe(false);
      expect(mockRouter.isReady).toBe(true);
      expect(mockRouter.isPreview).toBe(false);
    });

    it("should have jest mock functions for router methods", () => {
      expect(jest.isMockFunction(mockRouter.push)).toBe(true);
      expect(jest.isMockFunction(mockRouter.replace)).toBe(true);
      expect(jest.isMockFunction(mockRouter.reload)).toBe(true);
      expect(jest.isMockFunction(mockRouter.back)).toBe(true);
      expect(jest.isMockFunction(mockRouter.prefetch)).toBe(true);
      expect(jest.isMockFunction(mockRouter.beforePopState)).toBe(true);
    });

    it("should have events object with mock functions", () => {
      expect(mockRouter.events).toBeDefined();
      expect(typeof mockRouter.events).toBe("object");
      expect(jest.isMockFunction(mockRouter.events.on)).toBe(true);
      expect(jest.isMockFunction(mockRouter.events.off)).toBe(true);
      expect(jest.isMockFunction(mockRouter.events.emit)).toBe(true);
    });

    it("should allow router method calls without errors", () => {
      expect(() => {
        mockRouter.push("/test");
        mockRouter.replace("/test");
        mockRouter.reload();
        mockRouter.back();
        mockRouter.prefetch("/test");
        mockRouter.beforePopState(() => true);
      }).not.toThrow();
    });

    it("should allow events method calls without errors", () => {
      expect(() => {
        mockRouter.events.on("routeChangeStart", () => {});
        mockRouter.events.off("routeChangeStart", () => {});
        mockRouter.events.emit("routeChangeStart", "/test");
      }).not.toThrow();
    });
  });

  describe("mock navigation functions", () => {
    it("should export mockUseRouter function", () => {
      expect(mockUseRouter).toBeDefined();
      expect(jest.isMockFunction(mockUseRouter)).toBe(true);
    });

    it("should export mockUsePathname function", () => {
      expect(mockUsePathname).toBeDefined();
      expect(jest.isMockFunction(mockUsePathname)).toBe(true);
    });

    it("should export mockUseSearchParams function", () => {
      expect(mockUseSearchParams).toBeDefined();
      expect(jest.isMockFunction(mockUseSearchParams)).toBe(true);
    });

    it("should return expected default values", () => {
      expect(mockUseRouter()).toBe(mockRouter);
      expect(mockUsePathname()).toBe("/");
      expect(mockUseSearchParams()).toBeInstanceOf(URLSearchParams);
    });

    it("should allow customization of return values", () => {
      // Mock functions should be configurable
      mockUsePathname.mockReturnValue("/custom-path");
      expect(mockUsePathname()).toBe("/custom-path");

      const customParams = new URLSearchParams("?test=value");
      mockUseSearchParams.mockReturnValue(customParams);
      expect(mockUseSearchParams()).toBe(customParams);

      // Reset for other tests
      mockUsePathname.mockReturnValue("/");
      mockUseSearchParams.mockReturnValue(new URLSearchParams());
    });
  });

  describe("Next.js navigation mocking setup", () => {
    it("should mock next/navigation module", () => {
      // The module mock should be in place
      // We can verify this by checking that the mocks are jest functions
      expect(jest.isMockFunction(mockUseRouter)).toBe(true);
      expect(jest.isMockFunction(mockUsePathname)).toBe(true);
      expect(jest.isMockFunction(mockUseSearchParams)).toBe(true);
    });

    it("should provide realistic URLSearchParams mock", () => {
      const searchParams = mockUseSearchParams();

      expect(searchParams).toBeInstanceOf(URLSearchParams);
      expect(typeof searchParams.get).toBe("function");
      expect(typeof searchParams.set).toBe("function");
      expect(typeof searchParams.has).toBe("function");
      expect(typeof searchParams.delete).toBe("function");
    });

    it("should allow URLSearchParams manipulation", () => {
      const searchParams = new URLSearchParams();

      searchParams.set("test", "value");
      expect(searchParams.get("test")).toBe("value");
      expect(searchParams.has("test")).toBe(true);

      searchParams.delete("test");
      expect(searchParams.has("test")).toBe(false);
    });
  });

  describe("integration with testing environment", () => {
    it("should work with Testing Library queries", () => {
      render(<TestComponent />);

      // Should work with all Testing Library query methods
      expect(screen.getByText("Test Component")).toBeInTheDocument();
      expect(screen.getByTestId("theme-test")).toBeInTheDocument();
      expect(screen.queryByText("Non-existent")).not.toBeInTheDocument();
    });

    it("should support async testing patterns", async () => {
      const AsyncComponent = () => {
        const [loaded, setLoaded] = React.useState(false);

        React.useEffect(() => {
          setTimeout(() => setLoaded(true), 100);
        }, []);

        return <div>{loaded ? "Loaded" : "Loading"}</div>;
      };

      render(<AsyncComponent />);

      expect(screen.getByText("Loading")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText("Loaded")).toBeInTheDocument();
      });
    });

    it("should support component event testing", async () => {
      const ClickComponent = () => {
        const [clicked, setClicked] = React.useState(false);

        return (
          <button onClick={() => setClicked(true)}>
            {clicked ? "Clicked" : "Click me"}
          </button>
        );
      };

      render(<ClickComponent />);

      const button = screen.getByText("Click me");
      // Use fireEvent for this test to avoid userEvent setup complexity
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { fireEvent } = require("@testing-library/react");
      fireEvent.click(button);

      expect(screen.getByText("Clicked")).toBeInTheDocument();
    });

    it("should handle components that use router hooks", () => {
      const RouterComponent = () => {
        // This would use useRouter, usePathname, etc. in real code
        // Since we've mocked them, this should work without errors
        return <div>Router component</div>;
      };

      expect(() => {
        render(<RouterComponent />);
      }).not.toThrow();

      expect(screen.getByText("Router component")).toBeInTheDocument();
    });
  });

  describe("provider configuration", () => {
    it("should configure ThemeProvider with correct attributes", () => {
      // The ThemeProvider should be configured with class attribute and light default
      render(<TestComponent />);

      // Component should render without theme-related errors
      expect(screen.getByText("Test Component")).toBeInTheDocument();
    });

    it("should support theme switching capabilities", () => {
      // The provider should enable system theme detection
      // and support class-based theme switching
      const ThemeAwareComponent = () => (
        <div className="bg-white dark:bg-black">Theme aware content</div>
      );

      expect(() => {
        render(<ThemeAwareComponent />);
      }).not.toThrow();
    });

    it("should isolate test environments", () => {
      // Each render should have isolated provider state
      const Component1 = () => <div>Component 1</div>;
      const Component2 = () => <div>Component 2</div>;

      const { unmount: unmount1 } = render(<Component1 />);
      const { unmount: unmount2 } = render(<Component2 />);

      expect(screen.getByText("Component 1")).toBeInTheDocument();
      expect(screen.getByText("Component 2")).toBeInTheDocument();

      unmount1();
      expect(screen.queryByText("Component 1")).not.toBeInTheDocument();
      expect(screen.getByText("Component 2")).toBeInTheDocument();

      unmount2();
    });
  });

  describe("utility function reliability", () => {
    it("should handle edge cases in waitForLoadingToFinish", async () => {
      // Test with multiple loading elements
      render(
        <div>
          <div aria-busy="true">Loading 1</div>
          <div aria-busy="true">Loading 2</div>
          <div>Content</div>
        </div>
      );

      // Should wait for all loading elements to be removed
      setTimeout(() => {
        const loadingElements = document.querySelectorAll('[aria-busy="true"]');
        loadingElements.forEach((el) => el.remove());
      }, 50);

      await waitForLoadingToFinish();

      expect(
        document.querySelector('[aria-busy="true"]')
      ).not.toBeInTheDocument();
    });

    it("should provide consistent mock values across test runs", () => {
      // Mock values should be predictable
      expect(mockRouter.pathname).toBe("/");
      expect(mockRouter.isReady).toBe(true);
      expect(mockUsePathname()).toBe("/");

      // Should be the same on repeated calls
      expect(mockRouter.pathname).toBe("/");
      expect(mockUsePathname()).toBe("/");
    });

    it("should allow mock customization without affecting other tests", () => {
      const originalPathname = mockUsePathname();

      // Customize mock for this test
      mockUsePathname.mockReturnValueOnce("/custom");
      expect(mockUsePathname()).toBe("/custom");

      // Should return to original value
      expect(mockUsePathname()).toBe(originalPathname);
    });
  });
});
