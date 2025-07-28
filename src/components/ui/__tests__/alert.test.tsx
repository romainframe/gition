import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import { Alert, AlertDescription, AlertTitle } from "../alert";

describe("Alert Components", () => {
  describe("Alert", () => {
    it("should render alert with children", () => {
      render(
        <Alert>
          <div>Alert content</div>
        </Alert>
      );

      expect(screen.getByText("Alert content")).toBeInTheDocument();
    });

    it("should apply default variant", () => {
      const { container } = render(
        <Alert>
          <div>Default alert</div>
        </Alert>
      );

      expect(container.firstChild).toHaveClass(
        "bg-background",
        "text-foreground"
      );
    });

    it("should apply destructive variant", () => {
      const { container } = render(
        <Alert variant="destructive">
          <div>Error alert</div>
        </Alert>
      );

      expect(container.firstChild).toHaveClass(
        "border-destructive/50",
        "text-destructive"
      );
    });

    it("should apply custom className", () => {
      const { container } = render(
        <Alert className="custom-alert">
          <div>Custom alert</div>
        </Alert>
      );

      expect(container.firstChild).toHaveClass("custom-alert");
    });

    it("should have proper alert role", () => {
      render(
        <Alert>
          <div>Alert content</div>
        </Alert>
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  describe("AlertTitle", () => {
    it("should render alert title", () => {
      render(<AlertTitle>Alert Title</AlertTitle>);

      expect(screen.getByText("Alert Title")).toBeInTheDocument();
    });

    it("should apply default styling", () => {
      const { container } = render(<AlertTitle>Title</AlertTitle>);

      expect(container.firstChild).toHaveClass(
        "mb-1",
        "font-medium",
        "leading-none",
        "tracking-tight"
      );
    });

    it("should apply custom className", () => {
      const { container } = render(
        <AlertTitle className="custom-title">Title</AlertTitle>
      );

      expect(container.firstChild).toHaveClass("custom-title");
    });
  });

  describe("AlertDescription", () => {
    it("should render alert description", () => {
      render(<AlertDescription>Alert description text</AlertDescription>);

      expect(screen.getByText("Alert description text")).toBeInTheDocument();
    });

    it("should apply default styling", () => {
      const { container } = render(
        <AlertDescription>Description</AlertDescription>
      );

      expect(container.firstChild).toHaveClass(
        "text-sm",
        "[&_p]:leading-relaxed"
      );
    });

    it("should apply custom className", () => {
      const { container } = render(
        <AlertDescription className="custom-desc">Description</AlertDescription>
      );

      expect(container.firstChild).toHaveClass("custom-desc");
    });
  });

  describe("Alert composition", () => {
    it("should work together in complete alert", () => {
      render(
        <Alert>
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>This is a warning message.</AlertDescription>
        </Alert>
      );

      expect(screen.getByText("Warning")).toBeInTheDocument();
      expect(
        screen.getByText("This is a warning message.")
      ).toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("should work with destructive variant", () => {
      render(
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong.</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("border-destructive/50");
      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
    });
  });
});
