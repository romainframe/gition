/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-require-imports */
import { jest } from "@jest/globals";

// Mock the MDX utilities first
jest.mock("@/lib/mdx", () => ({
  getDocsFiles: jest.fn(),
}));

// Import route after mocking
const { GET } = require("../route");
const mockGetDocsFiles = require("@/lib/mdx").getDocsFiles;

// Mock console.error
const mockConsoleError = jest.spyOn(console, "error").mockImplementation();

describe("/api/docs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  it("should return docs files", async () => {
    const mockDocs = [
      {
        name: "Getting Started",
        slug: "getting-started",
        content: "# Getting Started\n\nWelcome to the docs!",
        metadata: { title: "Getting Started", category: "guides" },
        filepath: "/docs/getting-started.md",
      },
      {
        name: "API Reference",
        slug: "api-reference",
        content: "# API Reference\n\nAPI documentation.",
        metadata: { title: "API Reference", category: "reference" },
        filepath: "/docs/api-reference.md",
      },
    ];

    mockGetDocsFiles.mockReturnValue(mockDocs);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(mockDocs);
    expect(mockGetDocsFiles).toHaveBeenCalled();
  });

  it("should handle errors from getDocsFiles", async () => {
    mockGetDocsFiles.mockImplementation(() => {
      throw new Error("Failed to read docs directory");
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Failed to fetch docs" });
    expect(mockConsoleError).toHaveBeenCalledWith(
      "Error fetching docs:",
      expect.any(Error)
    );
  });

  it("should handle empty docs directory", async () => {
    mockGetDocsFiles.mockReturnValue([]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });
});
