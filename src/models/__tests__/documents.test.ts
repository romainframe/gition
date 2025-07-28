import {
  type Doc,
  type FileMetadata,
  isDocumentStatus,
  isPriority,
} from "../documents";

describe("Document Model Utils", () => {
  describe("isDocumentStatus", () => {
    it("should return true for valid document statuses", () => {
      expect(isDocumentStatus("draft")).toBe(true);
      expect(isDocumentStatus("published")).toBe(true);
      expect(isDocumentStatus("archived")).toBe(true);
    });

    it("should return false for invalid document statuses", () => {
      expect(isDocumentStatus("pending")).toBe(false);
      expect(isDocumentStatus("active")).toBe(false);
      expect(isDocumentStatus("")).toBe(false);
      expect(isDocumentStatus("todo")).toBe(false);
    });
  });

  describe("isPriority", () => {
    it("should return true for valid priorities", () => {
      expect(isPriority("low")).toBe(true);
      expect(isPriority("medium")).toBe(true);
      expect(isPriority("high")).toBe(true);
      expect(isPriority("critical")).toBe(true);
    });

    it("should return false for invalid priorities", () => {
      expect(isPriority("urgent")).toBe(false);
      expect(isPriority("normal")).toBe(false);
      expect(isPriority("")).toBe(false);
      expect(isPriority("highest")).toBe(false);
    });
  });
});

describe("Document Interfaces", () => {
  it("should create a valid FileMetadata", () => {
    const metadata: FileMetadata = {
      title: "Getting Started Guide",
      description: "A comprehensive guide to get started",
      tags: ["tutorial", "beginner"],
      date: "2024-01-15",
      author: "John Doe",
      status: "published",
      priority: "high",
      readingTime: 10,
      wordCount: 1500,
    };

    expect(metadata.title).toBe("Getting Started Guide");
    expect(metadata.status).toBe("published");
    expect(metadata.tags).toContain("tutorial");
    expect(metadata.priority).toBe("high");
  });

  it("should create a valid Doc", () => {
    const doc: Doc = {
      id: "getting-started",
      name: "Getting Started",
      file: "/docs/getting-started.mdx",
      slug: "docs/getting-started",
      folder: "docs",
      content: "# Getting Started\n\nWelcome to the guide...",
      excerpt: "A comprehensive guide to get started with our application",
      category: "tutorials",
      section: "basics",
      order: 1,
      difficulty: "beginner",
      readingTime: 10,
      wordCount: 1500,
      metadata: {
        title: "Getting Started Guide",
        description: "A comprehensive guide to get started",
        status: "published",
      },
    };

    expect(doc.id).toBe("getting-started");
    expect(doc.difficulty).toBe("beginner");
    expect(doc.category).toBe("tutorials");
    expect(doc.metadata?.status).toBe("published");
  });

  it("should allow optional fields in FileMetadata", () => {
    const minimalMetadata: FileMetadata = {
      title: "Simple Doc",
    };

    expect(minimalMetadata.title).toBe("Simple Doc");
    expect(minimalMetadata.description).toBeUndefined();
    expect(minimalMetadata.tags).toBeUndefined();
  });
});
