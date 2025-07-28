/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";

// Import the mocked module properly
import * as configLib from "@/lib/config";

import { GET, POST, PUT } from "../route";

// Mock dependencies
jest.mock("@/lib/config", () => ({
  initializeConfig: jest.fn(),
}));

jest.mock("@/lib/mdx", () => ({
  getTargetDirectory: jest.fn().mockReturnValue("/test/workspace"),
}));

const mockConfigManager = {
  getConfig: jest.fn(),
  saveConfig: jest.fn(),
  initializeConfig: jest.fn(),
};

const mockInitializeConfig = configLib.initializeConfig as jest.MockedFunction<
  typeof configLib.initializeConfig
>;
mockInitializeConfig.mockReturnValue(mockConfigManager);

// Mock console.error
const mockConsoleError = jest.spyOn(console, "error").mockImplementation();

describe("/api/config", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe("GET", () => {
    it("should return current configuration", async () => {
      const mockConfig = {
        name: "Test Workspace",
        server: { port: 3000 },
      };

      mockConfigManager.getConfig.mockReturnValue(mockConfig);

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual(mockConfig);
      expect(mockConfigManager.getConfig).toHaveBeenCalled();
    });

    it("should handle errors", async () => {
      mockConfigManager.getConfig.mockImplementation(() => {
        throw new Error("Config error");
      });

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ error: "Failed to load configuration" });
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error getting config:",
        expect.any(Error)
      );
    });
  });

  describe("POST", () => {
    it("should update configuration", async () => {
      const updateData = { name: "Updated Workspace" };
      const updatedConfig = {
        name: "Updated Workspace",
        server: { port: 3000 },
      };

      mockConfigManager.saveConfig.mockImplementation();
      mockConfigManager.getConfig.mockReturnValue(updatedConfig);

      const request = new NextRequest("http://localhost/api/config", {
        method: "POST",
        body: JSON.stringify(updateData),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual(updatedConfig);
      expect(mockConfigManager.saveConfig).toHaveBeenCalledWith(updateData);
    });

    it("should handle JSON parsing errors", async () => {
      const request = new NextRequest("http://localhost/api/config", {
        method: "POST",
        body: "invalid json",
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ error: "Failed to update configuration" });
    });

    it("should handle save errors", async () => {
      const updateData = { name: "Test" };

      mockConfigManager.saveConfig.mockImplementation(() => {
        throw new Error("Save failed");
      });

      const request = new NextRequest("http://localhost/api/config", {
        method: "POST",
        body: JSON.stringify(updateData),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ error: "Failed to update configuration" });
    });
  });

  describe("PUT", () => {
    it("should replace entire configuration", async () => {
      const newConfig = { name: "New Workspace", server: { port: 4000 } };

      mockConfigManager.initializeConfig.mockImplementation();
      mockConfigManager.getConfig.mockReturnValue(newConfig);

      const request = new NextRequest("http://localhost/api/config", {
        method: "PUT",
        body: JSON.stringify(newConfig),
        headers: { "Content-Type": "application/json" },
      });

      const response = await PUT(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual(newConfig);
      expect(mockConfigManager.initializeConfig).toHaveBeenCalledWith(
        newConfig
      );
    });

    it("should handle initialization errors", async () => {
      const newConfig = { name: "Test" };

      mockConfigManager.initializeConfig.mockImplementation(() => {
        throw new Error("Init failed");
      });

      const request = new NextRequest("http://localhost/api/config", {
        method: "PUT",
        body: JSON.stringify(newConfig),
        headers: { "Content-Type": "application/json" },
      });

      const response = await PUT(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ error: "Failed to replace configuration" });
    });
  });
});
