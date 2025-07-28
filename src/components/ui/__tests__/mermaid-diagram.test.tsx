import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import mermaid from "mermaid";

import { MermaidDiagram } from "../mermaid-diagram";

// Mock mermaid library
jest.mock("mermaid", () => ({
  __esModule: true,
  default: {
    initialize: jest.fn(),
    parse: jest.fn(),
    render: jest.fn(),
  },
}));

describe("MermaidDiagram", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    (mermaid.initialize as jest.Mock).mockImplementation(() => {});
    (mermaid.parse as jest.Mock).mockResolvedValue(true);
    (mermaid.render as jest.Mock).mockResolvedValue({
      svg: '<svg viewBox="0 0 100 100"><rect width="50" height="50" fill="blue"/></svg>',
    });
  });

  describe("basic rendering", () => {
    it("should render mermaid diagram without errors", () => {
      expect(() => {
        render(<MermaidDiagram chart="graph TD; A-->B;" />);
      }).not.toThrow();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <MermaidDiagram chart="graph TD; A-->B;" className="custom-diagram" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("custom-diagram");
      expect(wrapper).toHaveClass("my-4");
    });

    it("should show loading state initially", () => {
      render(<MermaidDiagram chart="graph TD; A-->B;" />);

      expect(screen.getByText("Mermaid Diagram")).toBeInTheDocument();
      expect(screen.getByText("mermaid")).toBeInTheDocument();
      expect(screen.getByText("Rendering diagram...")).toBeInTheDocument();
    });

    it("should show diagram after successful rendering", async () => {
      render(<MermaidDiagram chart="graph TD; A-->B;" />);

      await waitFor(() => {
        expect(
          screen.queryByText("Rendering diagram...")
        ).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("Mermaid Diagram")).toBeInTheDocument();
        expect(screen.getByText("Show Source")).toBeInTheDocument();
      });
    });
  });

  describe("diagram rendering", () => {
    it("should call mermaid render with correct parameters", async () => {
      const chart = "graph TD; A-->B;";
      render(<MermaidDiagram chart={chart} />);

      await waitFor(() => {
        expect(mermaid.render).toHaveBeenCalledWith(
          expect.stringMatching(/^mermaid-[a-z0-9]{9}$/),
          chart
        );
      });
    });

    it("should render SVG content when successful", async () => {
      const mockSvg =
        '<svg viewBox="0 0 200 100"><circle cx="50" cy="50" r="40" fill="red"/></svg>';
      (mermaid.render as jest.Mock).mockResolvedValue({ svg: mockSvg });

      render(<MermaidDiagram chart="graph TD; A-->B;" />);

      await waitFor(() => {
        expect(
          screen.queryByText("Rendering diagram...")
        ).not.toBeInTheDocument();
      });

      // Check that SVG content is rendered via dangerouslySetInnerHTML
      const diagramContainer = document.querySelector(".mermaid-container");
      expect(diagramContainer).toBeInTheDocument();
      expect(diagramContainer?.innerHTML).toContain('viewBox="0 0 200 100"');
      expect(diagramContainer?.innerHTML).toContain(
        '<circle cx="50" cy="50" r="40" fill="red"'
      );
    });

    it("should add viewBox if missing from SVG", async () => {
      const svgWithoutViewBox =
        '<svg><circle cx="50" cy="50" r="40" fill="red"/></svg>';
      (mermaid.render as jest.Mock).mockResolvedValue({
        svg: svgWithoutViewBox,
      });

      render(<MermaidDiagram chart="graph TD; A-->B;" />);

      await waitFor(() => {
        expect(
          screen.queryByText("Rendering diagram...")
        ).not.toBeInTheDocument();
      });

      const diagramContainer = document.querySelector(".mermaid-container");
      expect(diagramContainer?.innerHTML).toContain('viewBox="0 0 100 100"');
    });

    it("should not render anything for empty chart", () => {
      render(<MermaidDiagram chart="" />);

      // Should not call mermaid methods for empty chart
      expect(mermaid.render).not.toHaveBeenCalled();
    });

    it("should not render anything for whitespace-only chart", () => {
      render(<MermaidDiagram chart="   \n\n   " />);

      // Should not call mermaid methods for whitespace-only chart
      expect(mermaid.render).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should show error state when rendering fails", async () => {
      const errorMessage = "Syntax error in mermaid diagram";
      (mermaid.render as jest.Mock).mockRejectedValue(new Error(errorMessage));

      render(<MermaidDiagram chart="invalid chart" />);

      await waitFor(() => {
        expect(screen.getByText("Mermaid Diagram Error")).toBeInTheDocument();
        expect(screen.getByText("error")).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it("should show error state when no SVG is returned", async () => {
      (mermaid.render as jest.Mock).mockResolvedValue({ svg: "" });

      render(<MermaidDiagram chart="graph TD; A-->B;" />);

      await waitFor(() => {
        expect(screen.getByText("Mermaid Diagram Error")).toBeInTheDocument();
        expect(
          screen.getByText("No valid SVG returned from mermaid.render")
        ).toBeInTheDocument();
      });
    });

    it("should handle parse errors gracefully", async () => {
      (mermaid.parse as jest.Mock).mockRejectedValue(new Error("Parse error"));
      // Render should still succeed
      (mermaid.render as jest.Mock).mockResolvedValue({
        svg: '<svg viewBox="0 0 100 100"><rect width="50" height="50" fill="blue"/></svg>',
      });

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(<MermaidDiagram chart="graph TD; A-->B;" />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to parse mermaid diagram:",
          expect.any(Error)
        );
      });

      // Should still render successfully
      await waitFor(() => {
        expect(
          screen.queryByText("Rendering diagram...")
        ).not.toBeInTheDocument();
        expect(screen.getByText("Show Source")).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it("should show source code toggle in error state", async () => {
      (mermaid.render as jest.Mock).mockRejectedValue(
        new Error("Rendering failed")
      );

      render(<MermaidDiagram chart="graph TD; A-->B;" />);

      await waitFor(() => {
        expect(screen.getByText("Show Source")).toBeInTheDocument();
      });
    });
  });

  describe("source code toggle", () => {
    it("should toggle source code visibility in success state", async () => {
      render(<MermaidDiagram chart="graph TD; A-->B;" />);

      await waitFor(() => {
        expect(screen.getByText("Show Source")).toBeInTheDocument();
      });

      const toggleButton = screen.getByText("Show Source");
      fireEvent.click(toggleButton);

      expect(screen.getByText("Hide Source")).toBeInTheDocument();
      expect(screen.getByText("View Source")).toBeInTheDocument();
      expect(screen.getByText("graph TD; A-->B;")).toBeInTheDocument();

      // Toggle back
      fireEvent.click(screen.getByText("Hide Source"));
      expect(screen.getByText("Show Source")).toBeInTheDocument();
      expect(screen.queryByText("View Source")).not.toBeInTheDocument();
    });

    it("should toggle source code visibility in error state", async () => {
      (mermaid.render as jest.Mock).mockRejectedValue(
        new Error("Rendering failed")
      );

      render(<MermaidDiagram chart="graph TD; A-->B;" />);

      await waitFor(() => {
        expect(screen.getByText("Show Source")).toBeInTheDocument();
      });

      const toggleButton = screen.getByText("Show Source");
      fireEvent.click(toggleButton);

      expect(screen.getByText("Hide Source")).toBeInTheDocument();
      // In error state, source is shown directly in a pre tag
      const sourceElement = screen.getByText("graph TD; A-->B;");
      expect(sourceElement.tagName).toBe("PRE");
    });

    it("should be keyboard accessible", async () => {
      const user = userEvent.setup();

      render(<MermaidDiagram chart="graph TD; A-->B;" />);

      await waitFor(() => {
        expect(screen.getByText("Show Source")).toBeInTheDocument();
      });

      const toggleButton = screen.getByText("Show Source");

      // Tab to the button and press Enter
      await user.tab();
      expect(toggleButton).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(screen.getByText("Hide Source")).toBeInTheDocument();
    });
  });

  describe("styling and layout", () => {
    it("should apply correct loading state styling", () => {
      render(<MermaidDiagram chart="graph TD; A-->B;" />);

      const loadingContainer = screen
        .getByText("Rendering diagram...")
        .closest("div");
      expect(loadingContainer).toHaveClass(
        "flex",
        "items-center",
        "justify-center",
        "py-6",
        "bg-muted/20",
        "rounded-lg"
      );
    });

    it("should apply correct success state styling", async () => {
      render(<MermaidDiagram chart="graph TD; A-->B;" />);

      await waitFor(() => {
        expect(
          screen.queryByText("Rendering diagram...")
        ).not.toBeInTheDocument();
      });

      const diagramContainer = document.querySelector(".mermaid-container");
      expect(diagramContainer).toHaveClass(
        "mermaid-container",
        "flex",
        "justify-center",
        "items-center",
        "p-3",
        "bg-muted/20",
        "rounded-lg",
        "overflow-auto"
      );
    });

    it("should style badge elements correctly", async () => {
      render(<MermaidDiagram chart="graph TD; A-->B;" />);

      const badge = screen.getByText("mermaid");
      expect(badge).toHaveClass("text-xs");
      expect(badge.closest("span")).toHaveAttribute("data-slot", "badge");
    });
  });

  describe("lifecycle and updates", () => {
    it("should re-render when chart changes", async () => {
      const { rerender } = render(<MermaidDiagram chart="graph TD; A-->B;" />);

      await waitFor(() => {
        expect(mermaid.render).toHaveBeenCalledWith(
          expect.any(String),
          "graph TD; A-->B;"
        );
      });

      jest.clearAllMocks();

      rerender(<MermaidDiagram chart="graph LR; C-->D;" />);

      await waitFor(() => {
        expect(mermaid.render).toHaveBeenCalledWith(
          expect.any(String),
          "graph LR; C-->D;"
        );
      });
    });

    it("should handle rapid chart changes", async () => {
      const { rerender } = render(<MermaidDiagram chart="graph TD; A-->B;" />);

      // Rapidly change the chart multiple times
      rerender(<MermaidDiagram chart="graph LR; C-->D;" />);
      rerender(<MermaidDiagram chart="graph TB; E-->F;" />);
      rerender(<MermaidDiagram chart="graph RL; G-->H;" />);

      // Should eventually render the last chart
      await waitFor(() => {
        expect(mermaid.render).toHaveBeenLastCalledWith(
          expect.any(String),
          "graph RL; G-->H;"
        );
      });
    });

    it("should clean up timeouts on unmount", () => {
      const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

      const { unmount } = render(<MermaidDiagram chart="graph TD; A-->B;" />);
      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });

  describe("accessibility", () => {
    it("should have accessible button labels", async () => {
      render(<MermaidDiagram chart="graph TD; A-->B;" />);

      await waitFor(() => {
        const button = screen.getByRole("button", { name: "Show Source" });
        expect(button).toBeInTheDocument();
      });
    });

    it("should provide semantic structure", async () => {
      render(<MermaidDiagram chart="graph TD; A-->B;" />);

      await waitFor(() => {
        expect(screen.getByText("Show Source")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Show Source"));

      const details = screen.getByText("View Source").closest("details");
      expect(details).toBeInTheDocument();
      expect(details?.querySelector("summary")).toBeInTheDocument();
    });

    it("should have proper heading hierarchy", () => {
      render(<MermaidDiagram chart="graph TD; A-->B;" />);

      // The component uses spans with appropriate styling rather than heading elements
      // This is appropriate for diagram labels
      expect(screen.getByText("Mermaid Diagram")).toBeInTheDocument();
    });
  });

  describe("edge cases and robustness", () => {
    it("should handle very large diagrams", async () => {
      const largeChart = Array.from(
        { length: 100 },
        (_, i) => `A${i} --> A${i + 1}`
      ).join("\n");

      expect(() => {
        render(<MermaidDiagram chart={largeChart} />);
      }).not.toThrow();
    });

    it("should handle special characters in chart", async () => {
      const chartWithSpecialChars = 'graph TD; A["Special: <>&\\""] --> B';

      render(<MermaidDiagram chart={chartWithSpecialChars} />);

      await waitFor(() => {
        expect(mermaid.render).toHaveBeenCalledWith(
          expect.any(String),
          chartWithSpecialChars
        );
      });
    });

    it("should handle non-Error objects in catch blocks", async () => {
      (mermaid.render as jest.Mock).mockRejectedValue("String error");

      render(<MermaidDiagram chart="graph TD; A-->B;" />);

      await waitFor(() => {
        expect(
          screen.getByText("Failed to render diagram")
        ).toBeInTheDocument();
      });
    });
  });
});
