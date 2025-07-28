import { fireEvent, render, screen } from "@testing-library/react";
import { Info } from "lucide-react";

import { useInspect } from "@/contexts/inspect-context";

import { InspectOverlay } from "../inspect-overlay";

// Mock the inspect context
jest.mock("@/contexts/inspect-context");
jest.mock("lucide-react", () => ({
  Info: jest.fn(() => <div data-testid="info-icon">Info</div>),
}));

const mockUseInspect = useInspect as jest.MockedFunction<typeof useInspect>;

describe("InspectOverlay", () => {
  let mockSetHoveredComponent: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetHoveredComponent = jest.fn();

    // Default mock implementation
    mockUseInspect.mockReturnValue({
      isInspectMode: true,
      isAvailable: true,
      setHoveredComponent: mockSetHoveredComponent,
      hoveredComponent: null,
      getComponentMetadata: jest.fn(),
    });
  });

  const defaultProps = {
    componentId: "test-component",
    children: <div data-testid="child-content">Child Content</div>,
  };

  describe("rendering", () => {
    it("should render children when inspect mode is not available", () => {
      mockUseInspect.mockReturnValue({
        isInspectMode: false,
        isAvailable: false,
        setHoveredComponent: mockSetHoveredComponent,
        hoveredComponent: null,
        getComponentMetadata: jest.fn(),
      });

      render(<InspectOverlay {...defaultProps} />);

      expect(screen.getByTestId("child-content")).toBeInTheDocument();
      expect(screen.queryByTestId("info-icon")).not.toBeInTheDocument();
    });

    it("should render children when inspect mode is not active", () => {
      mockUseInspect.mockReturnValue({
        isInspectMode: false,
        isAvailable: true,
        setHoveredComponent: mockSetHoveredComponent,
        hoveredComponent: null,
        getComponentMetadata: jest.fn(),
      });

      render(<InspectOverlay {...defaultProps} />);

      expect(screen.getByTestId("child-content")).toBeInTheDocument();
      expect(screen.queryByTestId("info-icon")).not.toBeInTheDocument();
    });

    it("should render inspect overlay when mode is available and active", () => {
      render(<InspectOverlay {...defaultProps} />);

      expect(screen.getByTestId("child-content")).toBeInTheDocument();
      expect(screen.getByTestId("info-icon")).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      const { container } = render(
        <InspectOverlay {...defaultProps} className="custom-class" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("custom-class");
      expect(wrapper).toHaveClass("relative", "group");
    });
  });

  describe("interaction", () => {
    it("should call setHoveredComponent on mouse enter", () => {
      render(<InspectOverlay {...defaultProps} />);

      const infoIcon = screen.getByTestId("info-icon").parentElement;
      expect(infoIcon).toBeInTheDocument();

      fireEvent.mouseEnter(infoIcon!);

      expect(mockSetHoveredComponent).toHaveBeenCalledWith("test-component");
    });

    it("should call setHoveredComponent with null on mouse leave", () => {
      render(<InspectOverlay {...defaultProps} />);

      const infoIcon = screen.getByTestId("info-icon").parentElement;
      expect(infoIcon).toBeInTheDocument();

      fireEvent.mouseLeave(infoIcon!);

      expect(mockSetHoveredComponent).toHaveBeenCalledWith(null);
    });

    it("should handle multiple hover interactions", () => {
      render(<InspectOverlay {...defaultProps} />);

      const infoIcon = screen.getByTestId("info-icon").parentElement;
      expect(infoIcon).toBeInTheDocument();

      // Mouse enter
      fireEvent.mouseEnter(infoIcon!);
      expect(mockSetHoveredComponent).toHaveBeenCalledWith("test-component");

      // Mouse leave
      fireEvent.mouseLeave(infoIcon!);
      expect(mockSetHoveredComponent).toHaveBeenCalledWith(null);

      // Mouse enter again
      fireEvent.mouseEnter(infoIcon!);
      expect(mockSetHoveredComponent).toHaveBeenCalledWith("test-component");

      expect(mockSetHoveredComponent).toHaveBeenCalledTimes(3);
    });
  });

  describe("styling and structure", () => {
    it("should have correct CSS classes for overlay structure", () => {
      const { container } = render(<InspectOverlay {...defaultProps} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("relative", "group");

      // Check for inspect icon container
      const iconContainer = wrapper.querySelector(".absolute.top-2.right-2");
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass("opacity-0", "group-hover:opacity-100");

      // Check for hover overlay border
      const hoverBorder = wrapper.querySelector(".absolute.inset-0.border-2");
      expect(hoverBorder).toBeInTheDocument();
      expect(hoverBorder).toHaveClass(
        "border-blue-500",
        "opacity-0",
        "group-hover:opacity-30"
      );
    });

    it("should have correct styling for info icon button", () => {
      render(<InspectOverlay {...defaultProps} />);

      const iconButton = screen.getByTestId("info-icon").parentElement;
      expect(iconButton).toHaveClass(
        "bg-blue-500",
        "text-white",
        "rounded-full",
        "p-1",
        "shadow-lg",
        "cursor-pointer",
        "hover:bg-blue-600"
      );
    });

    it("should render Info icon from lucide-react", () => {
      render(<InspectOverlay {...defaultProps} />);

      // Check that the Info icon is rendered
      expect(Info).toHaveBeenCalled();
      expect(screen.getByTestId("info-icon")).toBeInTheDocument();
    });
  });

  describe("children rendering", () => {
    it("should render complex children correctly", () => {
      const complexChildren = (
        <div>
          <h1 data-testid="heading">Title</h1>
          <p data-testid="paragraph">Description</p>
          <button data-testid="button">Action</button>
        </div>
      );

      render(
        <InspectOverlay componentId="complex-component">
          {complexChildren}
        </InspectOverlay>
      );

      expect(screen.getByTestId("heading")).toBeInTheDocument();
      expect(screen.getByTestId("paragraph")).toBeInTheDocument();
      expect(screen.getByTestId("button")).toBeInTheDocument();
      expect(screen.getByTestId("info-icon")).toBeInTheDocument();
    });

    it("should render text children correctly", () => {
      render(
        <InspectOverlay componentId="text-component">
          Simple text content
        </InspectOverlay>
      );

      expect(screen.getByText("Simple text content")).toBeInTheDocument();
      expect(screen.getByTestId("info-icon")).toBeInTheDocument();
    });

    it("should render multiple children correctly", () => {
      render(
        <InspectOverlay componentId="multiple-children">
          <span data-testid="child1">Child 1</span>
          <span data-testid="child2">Child 2</span>
          <span data-testid="child3">Child 3</span>
        </InspectOverlay>
      );

      expect(screen.getByTestId("child1")).toBeInTheDocument();
      expect(screen.getByTestId("child2")).toBeInTheDocument();
      expect(screen.getByTestId("child3")).toBeInTheDocument();
      expect(screen.getByTestId("info-icon")).toBeInTheDocument();
    });
  });

  describe("component integration", () => {
    it("should work with different componentId values", () => {
      const { rerender } = render(
        <InspectOverlay componentId="component-1">
          <div>Content 1</div>
        </InspectOverlay>
      );

      const infoIcon = screen.getByTestId("info-icon").parentElement;
      fireEvent.mouseEnter(infoIcon!);
      expect(mockSetHoveredComponent).toHaveBeenCalledWith("component-1");

      rerender(
        <InspectOverlay componentId="component-2">
          <div>Content 2</div>
        </InspectOverlay>
      );

      const newInfoIcon = screen.getByTestId("info-icon").parentElement;
      fireEvent.mouseEnter(newInfoIcon!);
      expect(mockSetHoveredComponent).toHaveBeenCalledWith("component-2");
    });

    it("should handle state changes in inspect context", () => {
      const { rerender } = render(<InspectOverlay {...defaultProps} />);

      // Initially available and active
      expect(screen.getByTestId("info-icon")).toBeInTheDocument();

      // Change to unavailable
      mockUseInspect.mockReturnValue({
        isInspectMode: true,
        isAvailable: false,
        setHoveredComponent: mockSetHoveredComponent,
        hoveredComponent: null,
        getComponentMetadata: jest.fn(),
      });

      rerender(<InspectOverlay {...defaultProps} />);
      expect(screen.queryByTestId("info-icon")).not.toBeInTheDocument();
      expect(screen.getByTestId("child-content")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("should have accessible cursor pointer on info icon", () => {
      render(<InspectOverlay {...defaultProps} />);

      const iconButton = screen.getByTestId("info-icon").parentElement;
      expect(iconButton).toHaveClass("cursor-pointer");
    });

    it("should not interfere with child element accessibility", () => {
      render(
        <InspectOverlay componentId="accessible-component">
          <button aria-label="Accessible button" data-testid="accessible-btn">
            Click me
          </button>
        </InspectOverlay>
      );

      const accessibleButton = screen.getByTestId("accessible-btn");
      expect(accessibleButton).toHaveAttribute(
        "aria-label",
        "Accessible button"
      );
      expect(accessibleButton).toBeInTheDocument();
    });

    it("should maintain proper z-index for overlay elements", () => {
      render(<InspectOverlay {...defaultProps} />);

      const iconContainer =
        screen.getByTestId("info-icon").parentElement?.parentElement;
      expect(iconContainer).toHaveClass("z-50");

      const hoverBorder =
        iconContainer?.parentElement?.querySelector(".absolute.inset-0");
      expect(hoverBorder).toHaveClass("pointer-events-none");
    });
  });
});
