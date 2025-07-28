import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../card";

describe("Card Components", () => {
  describe("Card", () => {
    it("should render card with children", () => {
      render(
        <Card>
          <div>Card content</div>
        </Card>
      );

      expect(screen.getByText("Card content")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <Card className="custom-class">
          <div>Content</div>
        </Card>
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("should have default card styling", () => {
      const { container } = render(
        <Card>
          <div>Content</div>
        </Card>
      );

      expect(container.firstChild).toHaveClass(
        "bg-card",
        "flex",
        "flex-col",
        "rounded-xl",
        "border"
      );
    });
  });

  describe("CardHeader", () => {
    it("should render header with children", () => {
      render(
        <CardHeader>
          <div>Header content</div>
        </CardHeader>
      );

      expect(screen.getByText("Header content")).toBeInTheDocument();
    });

    it("should apply default styling", () => {
      const { container } = render(
        <CardHeader>
          <div>Header</div>
        </CardHeader>
      );

      expect(container.firstChild).toHaveClass("grid", "px-6");
    });
  });

  describe("CardTitle", () => {
    it("should render as div element", () => {
      const { container } = render(<CardTitle>Title</CardTitle>);

      expect(container.firstChild?.nodeName).toBe("DIV");
      expect(screen.getByText("Title")).toBeInTheDocument();
    });

    it("should apply default styling", () => {
      const { container } = render(<CardTitle>Title</CardTitle>);

      expect(container.firstChild).toHaveClass("leading-none", "font-semibold");
    });
  });

  describe("CardDescription", () => {
    it("should render description", () => {
      render(<CardDescription>This is a description</CardDescription>);

      expect(screen.getByText("This is a description")).toBeInTheDocument();
    });

    it("should apply default styling", () => {
      const { container } = render(
        <CardDescription>Description</CardDescription>
      );

      expect(container.firstChild).toHaveClass(
        "text-muted-foreground",
        "text-sm"
      );
    });
  });

  describe("CardContent", () => {
    it("should render content", () => {
      render(
        <CardContent>
          <p>Card content</p>
        </CardContent>
      );

      expect(screen.getByText("Card content")).toBeInTheDocument();
    });

    it("should apply default padding", () => {
      const { container } = render(
        <CardContent>
          <p>Content</p>
        </CardContent>
      );

      expect(container.firstChild).toHaveClass("px-6");
    });
  });

  describe("CardFooter", () => {
    it("should render footer", () => {
      render(
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      );

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should apply default styling", () => {
      const { container } = render(
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      );

      expect(container.firstChild).toHaveClass("flex", "items-center", "px-6");
    });
  });

  describe("Card composition", () => {
    it("should work together in a complete card", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>This is a test card</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Submit</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText("Test Card")).toBeInTheDocument();
      expect(screen.getByText("This is a test card")).toBeInTheDocument();
      expect(screen.getByText("Main content goes here")).toBeInTheDocument();
      expect(screen.getByRole("button")).toHaveTextContent("Submit");
    });
  });
});
