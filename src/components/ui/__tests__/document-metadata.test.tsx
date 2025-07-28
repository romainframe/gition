import { render, screen } from "@testing-library/react";

import { DocumentMetadata } from "../document-metadata";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  BookOpen: () => <div data-testid="book-open-icon">BookOpen</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  FileText: () => <div data-testid="file-text-icon">FileText</div>,
  GitBranch: () => <div data-testid="git-branch-icon">GitBranch</div>,
  Globe: () => <div data-testid="globe-icon">Globe</div>,
  Hash: () => <div data-testid="hash-icon">Hash</div>,
  Layers: () => <div data-testid="layers-icon">Layers</div>,
  MapPin: () => <div data-testid="map-pin-icon">MapPin</div>,
  Star: () => <div data-testid="star-icon">Star</div>,
  Tag: () => <div data-testid="tag-icon">Tag</div>,
  Target: () => <div data-testid="target-icon">Target</div>,
  User: () => <div data-testid="user-icon">User</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  Zap: () => <div data-testid="zap-icon">Zap</div>,
}));

describe("DocumentMetadata", () => {
  const baseMetadata = {
    title: "Test Document",
    description: "A test document description",
    author: "John Doe",
    created: "2024-01-15",
    updated: "2024-01-20",
    status: "published",
    type: "guide",
    tags: ["react", "typescript", "testing"],
  };

  describe("basic rendering", () => {
    it("should render document metadata without errors", () => {
      expect(() => {
        render(<DocumentMetadata metadata={baseMetadata} />);
      }).not.toThrow();
    });

    it("should render author information", () => {
      render(<DocumentMetadata metadata={baseMetadata} />);

      expect(screen.getByTestId("user-icon")).toBeInTheDocument();
      expect(screen.getByText("Author:")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("should render filename when provided", () => {
      render(
        <DocumentMetadata metadata={baseMetadata} filename="test-doc.md" />
      );

      expect(screen.getByTestId("file-text-icon")).toBeInTheDocument();
      expect(screen.getByText("File:")).toBeInTheDocument();
      expect(screen.getByText("test-doc.md")).toBeInTheDocument();
    });

    it("should render document type", () => {
      render(<DocumentMetadata metadata={baseMetadata} />);

      expect(screen.getByTestId("layers-icon")).toBeInTheDocument();
      expect(screen.getByText("Type:")).toBeInTheDocument();
      expect(screen.getByText("guide")).toBeInTheDocument();
    });

    it("should render status with appropriate styling", () => {
      render(<DocumentMetadata metadata={baseMetadata} />);

      expect(screen.getByTestId("target-icon")).toBeInTheDocument();
      expect(screen.getByText("Status:")).toBeInTheDocument();
      expect(screen.getByText("published")).toBeInTheDocument();
    });
  });

  describe("date formatting", () => {
    it("should format created date correctly", () => {
      render(<DocumentMetadata metadata={baseMetadata} />);

      expect(screen.getByTestId("calendar-icon")).toBeInTheDocument();
      expect(screen.getByText("Created:")).toBeInTheDocument();
      expect(screen.getByText("January 15, 2024")).toBeInTheDocument();
    });

    it("should format updated date correctly", () => {
      render(<DocumentMetadata metadata={baseMetadata} />);

      expect(screen.getByTestId("clock-icon")).toBeInTheDocument();
      expect(screen.getByText("Updated:")).toBeInTheDocument();
      expect(screen.getByText("January 20, 2024")).toBeInTheDocument();
    });

    it("should handle invalid date strings gracefully", () => {
      const metadataWithInvalidDate = {
        ...baseMetadata,
        created: "invalid-date",
      };

      render(<DocumentMetadata metadata={metadataWithInvalidDate} />);

      // Invalid dates should return 'Invalid Date' from the Date constructor
      expect(screen.getByText("Invalid Date")).toBeInTheDocument();
    });

    it("should prefer created over publishedDate", () => {
      const metadata = {
        ...baseMetadata,
        created: "2024-01-15",
        publishedDate: "2024-01-10",
      };

      render(<DocumentMetadata metadata={metadata} />);

      expect(screen.getByText("January 15, 2024")).toBeInTheDocument();
      expect(screen.queryByText("January 10, 2024")).not.toBeInTheDocument();
    });

    it("should use publishedDate when created is not available", () => {
      const metadata = {
        ...baseMetadata,
        created: undefined,
        publishedDate: "2024-01-10",
      };

      render(<DocumentMetadata metadata={metadata} />);

      expect(screen.getByText("January 10, 2024")).toBeInTheDocument();
    });

    it("should prefer updated over lastModified", () => {
      const metadata = {
        ...baseMetadata,
        updated: "2024-01-20",
        lastModified: "2024-01-18",
      };

      render(<DocumentMetadata metadata={metadata} />);

      expect(screen.getByText("January 20, 2024")).toBeInTheDocument();
      expect(screen.queryByText("January 18, 2024")).not.toBeInTheDocument();
    });
  });

  describe("priority and status colors", () => {
    it("should render critical priority with destructive color", () => {
      const metadata = {
        ...baseMetadata,
        priority: "critical" as const,
      };

      render(<DocumentMetadata metadata={metadata} />);

      expect(screen.getByTestId("zap-icon")).toBeInTheDocument();
      expect(screen.getByText("Priority:")).toBeInTheDocument();
      expect(screen.getByText("critical")).toBeInTheDocument();
    });

    it("should render high priority with destructive color", () => {
      const metadata = {
        ...baseMetadata,
        priority: "high" as const,
      };

      render(<DocumentMetadata metadata={metadata} />);

      expect(screen.getByText("high")).toBeInTheDocument();
    });

    it("should render medium priority with default color", () => {
      const metadata = {
        ...baseMetadata,
        priority: "medium" as const,
      };

      render(<DocumentMetadata metadata={metadata} />);

      expect(screen.getByText("medium")).toBeInTheDocument();
    });

    it("should render low priority with secondary color", () => {
      const metadata = {
        ...baseMetadata,
        priority: "low" as const,
      };

      render(<DocumentMetadata metadata={metadata} />);

      expect(screen.getByText("low")).toBeInTheDocument();
    });

    it("should render draft status correctly", () => {
      const metadata = {
        ...baseMetadata,
        status: "draft",
      };

      render(<DocumentMetadata metadata={metadata} />);

      expect(screen.getByText("draft")).toBeInTheDocument();
    });

    it("should render review status correctly", () => {
      const metadata = {
        ...baseMetadata,
        status: "review",
      };

      render(<DocumentMetadata metadata={metadata} />);

      expect(screen.getByText("review")).toBeInTheDocument();
    });

    it("should render approved status correctly", () => {
      const metadata = {
        ...baseMetadata,
        status: "approved",
      };

      render(<DocumentMetadata metadata={metadata} />);

      expect(screen.getByText("approved")).toBeInTheDocument();
    });
  });

  describe("difficulty levels", () => {
    it("should render beginner difficulty with green styling", () => {
      const metadata = {
        ...baseMetadata,
        difficulty: "beginner" as const,
      };

      render(<DocumentMetadata metadata={metadata} />);

      expect(screen.getByTestId("star-icon")).toBeInTheDocument();
      expect(screen.getByText("Difficulty:")).toBeInTheDocument();
      expect(screen.getByText("beginner")).toBeInTheDocument();
    });

    it("should render intermediate difficulty with yellow styling", () => {
      const metadata = {
        ...baseMetadata,
        difficulty: "intermediate" as const,
      };

      render(<DocumentMetadata metadata={metadata} />);

      expect(screen.getByText("intermediate")).toBeInTheDocument();
    });

    it("should render advanced difficulty with red styling", () => {
      const metadata = {
        ...baseMetadata,
        difficulty: "advanced" as const,
      };

      render(<DocumentMetadata metadata={metadata} />);

      expect(screen.getByText("advanced")).toBeInTheDocument();
    });
  });

  describe("tags rendering", () => {
    it("should render tags section with icons", () => {
      render(<DocumentMetadata metadata={baseMetadata} />);

      expect(screen.getByTestId("tag-icon")).toBeInTheDocument();
      expect(screen.getByText("Tags")).toBeInTheDocument();

      // Check individual tags
      expect(screen.getByText("react")).toBeInTheDocument();
      expect(screen.getByText("typescript")).toBeInTheDocument();
      expect(screen.getByText("testing")).toBeInTheDocument();

      // Check hash icons for tags
      expect(screen.getAllByTestId("hash-icon")).toHaveLength(3);
    });

    it("should not render tags section when tags array is empty", () => {
      const metadata = {
        ...baseMetadata,
        tags: [],
      };

      render(<DocumentMetadata metadata={metadata} />);

      expect(screen.queryByText("Tags")).not.toBeInTheDocument();
    });

    it("should not render tags section when tags is undefined", () => {
      const metadata = {
        ...baseMetadata,
        tags: undefined,
      };

      render(<DocumentMetadata metadata={metadata} />);

      expect(screen.queryByText("Tags")).not.toBeInTheDocument();
    });
  });

  describe("contributors rendering", () => {
    it("should render contributors section", () => {
      const metadata = {
        ...baseMetadata,
        contributors: ["Alice Smith", "Bob Jones", "Charlie Brown"],
      };

      render(<DocumentMetadata metadata={metadata} />);

      expect(screen.getByTestId("users-icon")).toBeInTheDocument();
      expect(screen.getByText("Contributors")).toBeInTheDocument();
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Jones")).toBeInTheDocument();
      expect(screen.getByText("Charlie Brown")).toBeInTheDocument();
    });

    it("should not render contributors section when array is empty", () => {
      const metadata = {
        ...baseMetadata,
        contributors: [],
      };

      render(<DocumentMetadata metadata={metadata} />);

      expect(screen.queryByText("Contributors")).not.toBeInTheDocument();
    });
  });

  describe("related documents", () => {
    it("should render related documents section", () => {
      const metadata = {
        ...baseMetadata,
        relatedDocs: [
          "getting-started.md",
          "advanced-guide.md",
          "api-reference.md",
        ],
      };

      render(<DocumentMetadata metadata={metadata} />);

      expect(screen.getByTestId("book-open-icon")).toBeInTheDocument();
      expect(screen.getByText("Related Documents")).toBeInTheDocument();
      expect(screen.getByText("getting-started.md")).toBeInTheDocument();
      expect(screen.getByText("advanced-guide.md")).toBeInTheDocument();
      expect(screen.getByText("api-reference.md")).toBeInTheDocument();

      // Check map pin icons for related docs
      expect(screen.getAllByTestId("map-pin-icon")).toHaveLength(3);
    });

    it("should not render related documents section when array is empty", () => {
      const metadata = {
        ...baseMetadata,
        relatedDocs: [],
      };

      render(<DocumentMetadata metadata={metadata} />);

      expect(screen.queryByText("Related Documents")).not.toBeInTheDocument();
    });
  });

  describe("additional metadata fields", () => {
    it("should render version information", () => {
      const metadata = {
        ...baseMetadata,
        version: "v2.1.0",
      };

      render(<DocumentMetadata metadata={metadata} />);

      expect(screen.getByTestId("git-branch-icon")).toBeInTheDocument();
      expect(screen.getByText("Version:")).toBeInTheDocument();
      expect(screen.getByText("v2.1.0")).toBeInTheDocument();
    });

    it("should render language information", () => {
      const metadata = {
        ...baseMetadata,
        language: "TypeScript",
      };

      render(<DocumentMetadata metadata={metadata} />);

      expect(screen.getByTestId("globe-icon")).toBeInTheDocument();
      expect(screen.getByText("Language:")).toBeInTheDocument();
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });

    it("should render category information", () => {
      const metadata = {
        ...baseMetadata,
        category: "Tutorial",
      };

      render(<DocumentMetadata metadata={metadata} />);

      expect(screen.getByTestId("book-open-icon")).toBeInTheDocument();
      expect(screen.getByText("Category:")).toBeInTheDocument();
      expect(screen.getByText("Tutorial")).toBeInTheDocument();
    });

    it("should render reading time", () => {
      const metadata = {
        ...baseMetadata,
        readingTime: 15,
      };

      render(<DocumentMetadata metadata={metadata} />);

      expect(screen.getByText("Reading time:")).toBeInTheDocument();
      expect(screen.getByText("15 min")).toBeInTheDocument();
    });
  });

  describe("extended metadata", () => {
    it("should render extended metadata when showExtended is true", () => {
      const metadata = {
        ...baseMetadata,
        wordCount: 1500,
        reviewers: ["reviewer1", "reviewer2"],
        approvedBy: "admin",
        customField: "custom value",
      };

      render(<DocumentMetadata metadata={metadata} showExtended={true} />);

      expect(screen.getByText("Extended Metadata")).toBeInTheDocument();
      expect(screen.getByText("word count:")).toBeInTheDocument();
      expect(screen.getByText("1500")).toBeInTheDocument();
      expect(screen.getByText("approved by:")).toBeInTheDocument();
      expect(screen.getByText("admin")).toBeInTheDocument();
      expect(screen.getByText("custom field:")).toBeInTheDocument();
      expect(screen.getByText("custom value")).toBeInTheDocument();
    });

    it("should handle array values in extended metadata", () => {
      const metadata = {
        ...baseMetadata,
        reviewers: ["reviewer1", "reviewer2"],
        audience: ["developers", "beginners"],
      };

      render(<DocumentMetadata metadata={metadata} showExtended={true} />);

      expect(screen.getByText("Extended Metadata")).toBeInTheDocument();
      expect(screen.getByText("reviewer1, reviewer2")).toBeInTheDocument();
      expect(screen.getByText("developers, beginners")).toBeInTheDocument();
    });

    it("should not render extended metadata when showExtended is false", () => {
      const metadata = {
        ...baseMetadata,
        wordCount: 1500,
        customField: "custom value",
      };

      render(<DocumentMetadata metadata={metadata} showExtended={false} />);

      expect(screen.queryByText("Extended Metadata")).not.toBeInTheDocument();
      expect(screen.queryByText("word count:")).not.toBeInTheDocument();
      expect(screen.queryByText("custom field:")).not.toBeInTheDocument();
    });

    it("should not render extended metadata when no extended fields exist", () => {
      const coreOnlyMetadata = {
        title: "Test Document",
        description: "A test document description",
        author: "John Doe",
        created: "2024-01-15",
        updated: "2024-01-20",
        status: "published",
        tags: ["react", "typescript"],
      };

      render(
        <DocumentMetadata metadata={coreOnlyMetadata} showExtended={true} />
      );

      expect(screen.queryByText("Extended Metadata")).not.toBeInTheDocument();
    });

    it("should format camelCase field names correctly", () => {
      const metadata = {
        ...baseMetadata,
        lastModifiedBy: "user123",
        maxRetryCount: 5,
      };

      render(<DocumentMetadata metadata={metadata} showExtended={true} />);

      expect(screen.getByText("last modified by:")).toBeInTheDocument();
      expect(screen.getByText("max retry count:")).toBeInTheDocument();
    });
  });

  describe("className and styling", () => {
    it("should accept and apply custom className", () => {
      const { container } = render(
        <DocumentMetadata
          metadata={baseMetadata}
          className="custom-metadata-class"
        />
      );

      const metadataElement = container.querySelector(".custom-metadata-class");
      expect(metadataElement).toBeInTheDocument();
      expect(metadataElement).toHaveClass("space-y-6");
    });

    it("should apply default spacing classes", () => {
      const { container } = render(
        <DocumentMetadata metadata={baseMetadata} />
      );

      const metadataElement = container.firstChild;
      expect(metadataElement).toHaveClass("space-y-6");
    });
  });

  describe("missing fields handling", () => {
    it("should not render sections for undefined fields", () => {
      const minimalMetadata = {
        title: "Minimal Doc",
      };

      render(<DocumentMetadata metadata={minimalMetadata} />);

      expect(screen.queryByText("Author:")).not.toBeInTheDocument();
      expect(screen.queryByText("Type:")).not.toBeInTheDocument();
      expect(screen.queryByText("Status:")).not.toBeInTheDocument();
      expect(screen.queryByText("Tags")).not.toBeInTheDocument();
    });

    it("should not render sections for null fields in extended metadata", () => {
      const metadata = {
        ...baseMetadata,
        nullField: null,
        undefinedField: undefined,
        validField: "valid",
      };

      render(<DocumentMetadata metadata={metadata} showExtended={true} />);

      expect(screen.getByText("valid field:")).toBeInTheDocument();
      expect(screen.getByText("valid")).toBeInTheDocument();
      expect(screen.queryByText("null field:")).not.toBeInTheDocument();
      expect(screen.queryByText("undefined field:")).not.toBeInTheDocument();
    });
  });
});
