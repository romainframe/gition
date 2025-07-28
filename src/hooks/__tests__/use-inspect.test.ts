/* eslint-disable @typescript-eslint/no-require-imports */
import { renderHook } from "@testing-library/react";

import { useComponentInspect, useInspect } from "../use-inspect";

// Mock the inspect context
const mockRegisterComponent = jest.fn();
const mockUnregisterComponent = jest.fn();
const mockGetElementInfo = jest.fn();

jest.mock("@/contexts/inspect-context", () => ({
  useInspect: jest.fn(() => ({
    isInspectMode: false,
    toggleInspectMode: jest.fn(),
    registerComponent: mockRegisterComponent,
    unregisterComponent: mockUnregisterComponent,
    getElementInfo: mockGetElementInfo,
    isAvailable: true,
  })),
}));

describe("useComponentInspect", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register component on mount", () => {
    const options = {
      componentId: "test-component",
      name: "TestComponent",
      filePath: "/src/components/TestComponent.tsx",
      description: "A test component",
      interfaces: ["TestProps"],
      apiDependencies: ["/api/test"],
      storeDependencies: ["useTestStore"],
      props: { value: "test" },
    };

    renderHook(() => useComponentInspect(options));

    expect(mockRegisterComponent).toHaveBeenCalledWith("test-component", {
      name: "TestComponent",
      filePath: "/src/components/TestComponent.tsx",
      description: "A test component",
      interfaces: ["TestProps"],
      apiDependencies: ["/api/test"],
      storeDependencies: ["useTestStore"],
      props: { value: "test" },
    });
  });

  it("should not register when not available", () => {
    // Mock useInspect to return isAvailable: false
    const mockUseInspect = require("@/contexts/inspect-context").useInspect;
    mockUseInspect.mockReturnValueOnce({
      isInspectMode: false,
      toggleInspectMode: jest.fn(),
      registerComponent: mockRegisterComponent,
      unregisterComponent: mockUnregisterComponent,
      getElementInfo: mockGetElementInfo,
      isAvailable: false,
    });

    const options = {
      componentId: "test-component",
      name: "TestComponent",
      filePath: "/src/components/TestComponent.tsx",
    };

    renderHook(() => useComponentInspect(options));

    expect(mockRegisterComponent).not.toHaveBeenCalled();
  });

  it("should re-register when componentId changes", () => {
    const initialOptions = {
      componentId: "test-component-1",
      name: "TestComponent",
      filePath: "/src/components/TestComponent.tsx",
    };

    const { rerender } = renderHook(
      ({ componentId, ...rest }) =>
        useComponentInspect({ componentId, ...rest }),
      { initialProps: initialOptions }
    );

    expect(mockRegisterComponent).toHaveBeenCalledWith(
      "test-component-1",
      expect.any(Object)
    );

    // Clear previous calls
    mockRegisterComponent.mockClear();

    // Change componentId
    rerender({
      ...initialOptions,
      componentId: "test-component-2",
    });

    // Should register the new component (no unregister as per implementation)
    expect(mockRegisterComponent).toHaveBeenCalledWith(
      "test-component-2",
      expect.any(Object)
    );
  });

  it("should return inspect mode and availability state", () => {
    const options = {
      componentId: "test-component",
      name: "TestComponent",
      filePath: "/src/components/TestComponent.tsx",
    };

    const { result } = renderHook(() => useComponentInspect(options));

    expect(result.current.isInspectMode).toBe(false);
    expect(result.current.isAvailable).toBe(true);
  });

  it("should work with minimal options", () => {
    const options = {
      componentId: "minimal-component",
      name: "MinimalComponent",
      filePath: "/src/components/MinimalComponent.tsx",
    };

    renderHook(() => useComponentInspect(options));

    expect(mockRegisterComponent).toHaveBeenCalledWith("minimal-component", {
      name: "MinimalComponent",
      filePath: "/src/components/MinimalComponent.tsx",
      description: undefined,
      interfaces: undefined,
      apiDependencies: undefined,
      storeDependencies: undefined,
      props: undefined,
    });
  });
});

describe("useInspect", () => {
  it("should return inspect context", () => {
    const { result } = renderHook(() => useInspect());

    expect(result.current.isInspectMode).toBe(false);
    expect(result.current.isAvailable).toBe(true);
    expect(typeof result.current.toggleInspectMode).toBe("function");
    expect(typeof result.current.registerComponent).toBe("function");
    expect(typeof result.current.unregisterComponent).toBe("function");
    expect(typeof result.current.getElementInfo).toBe("function");
  });
});
