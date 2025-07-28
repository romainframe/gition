/**
 * @jest-environment node
 */
// Import the mocked module properly
import * as mdxLib from "@/lib/mdx";

import { GET } from "../route";

// Mock dependencies
jest.mock("@/lib/mdx", () => ({
  getTargetDirectory: jest.fn(),
  getDocsDirectory: jest.fn(),
  getTasksDirectory: jest.fn(),
  getDirectoryStructure: jest.fn(),
}));

const mockMdx = mdxLib as jest.Mocked<typeof mdxLib>;

// Mock console.error
const mockConsoleError = jest.spyOn(console, "error").mockImplementation();

describe("/api/structure", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  it("should return directory structure", async () => {
    const mockDirectoryStructure = {
      name: "root",
      path: "/test",
      children: [],
    };

    mockMdx.getTargetDirectory.mockReturnValue("/test");
    mockMdx.getDocsDirectory.mockReturnValue("/test/docs");
    mockMdx.getTasksDirectory.mockReturnValue("/test/tasks");
    mockMdx.getDirectoryStructure.mockReturnValue(mockDirectoryStructure);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      root: mockDirectoryStructure,
      docs: mockDirectoryStructure,
      tasks: mockDirectoryStructure,
      paths: {
        target: "/test",
        docs: "/test/docs",
        tasks: "/test/tasks",
      },
    });

    expect(mockMdx.getTargetDirectory).toHaveBeenCalled();
    expect(mockMdx.getDocsDirectory).toHaveBeenCalled();
    expect(mockMdx.getTasksDirectory).toHaveBeenCalled();
    expect(mockMdx.getDirectoryStructure).toHaveBeenCalledTimes(3);
  });

  it("should handle errors", async () => {
    mockMdx.getTargetDirectory.mockImplementation(() => {
      throw new Error("Directory error");
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Failed to fetch directory structure" });
    expect(mockConsoleError).toHaveBeenCalledWith(
      "Error fetching directory structure:",
      expect.any(Error)
    );
  });

  it("should handle getDirectoryStructure errors", async () => {
    mockMdx.getTargetDirectory.mockReturnValue("/test");
    mockMdx.getDocsDirectory.mockReturnValue("/test/docs");
    mockMdx.getTasksDirectory.mockReturnValue("/test/tasks");
    mockMdx.getDirectoryStructure.mockImplementation(() => {
      throw new Error("Structure error");
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Failed to fetch directory structure" });
  });
});
