import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";

import { ConfigProvider, useConfig } from "../config-provider";

// Mock fetch
global.fetch = jest.fn();

// Test component to use the config context
function TestComponent() {
  const { config, updateConfig, isLoading } = useConfig();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div data-testid="config-name">{config.name}</div>
      <div data-testid="config-port">{config.port}</div>
      <div data-testid="config-host">{config.host}</div>
      <button
        onClick={() => updateConfig({ name: "Updated Name" })}
        data-testid="update-button"
      >
        Update Config
      </button>
    </div>
  );
}

describe("ConfigProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it("should provide default config initially", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(
      <ConfigProvider>
        <TestComponent />
      </ConfigProvider>
    );

    // Should show loading initially
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("config-name")).toHaveTextContent(
      "Gition Workspace"
    );
    expect(screen.getByTestId("config-port")).toHaveTextContent("3000");
    expect(screen.getByTestId("config-host")).toHaveTextContent("localhost");
  });

  it("should load config from server", async () => {
    const serverConfig = {
      name: "My Workspace",
      port: 4000,
      host: "localhost",
      docsDir: "documentation",
      tasksDir: "todo",
      theme: { primaryColor: "#blue" },
      features: { hotReload: true, darkMode: true },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(serverConfig),
    });

    render(
      <ConfigProvider>
        <TestComponent />
      </ConfigProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("config-name")).toHaveTextContent("My Workspace");
    expect(screen.getByTestId("config-port")).toHaveTextContent("4000");
    expect(global.fetch).toHaveBeenCalledWith("/api/config");
  });

  it("should handle fetch errors gracefully", async () => {
    const mockConsoleWarn = jest.spyOn(console, "warn").mockImplementation();

    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    render(
      <ConfigProvider>
        <TestComponent />
      </ConfigProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    // Should fall back to default config
    expect(screen.getByTestId("config-name")).toHaveTextContent(
      "Gition Workspace"
    );
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      "Failed to load config, using defaults:",
      expect.any(Error)
    );

    mockConsoleWarn.mockRestore();
  });

  it("should update config via updateConfig function", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false, // Initial load fails
      })
      .mockResolvedValueOnce({
        ok: true, // Update succeeds
        json: jest.fn().mockResolvedValueOnce({
          name: "Updated Name",
          port: 3000,
          host: "localhost",
        }),
      });

    render(
      <ConfigProvider>
        <TestComponent />
      </ConfigProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    // Click update button
    const updateButton = screen.getByTestId("update-button");

    await act(async () => {
      updateButton.click();
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated Name" }),
      });
    });
  });

  it("should handle update config errors", async () => {
    const mockConsoleError = jest.spyOn(console, "error").mockImplementation();

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false, // Initial load fails
      })
      .mockRejectedValueOnce(new Error("Update failed"));

    render(
      <ConfigProvider>
        <TestComponent />
      </ConfigProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    const updateButton = screen.getByTestId("update-button");

    await act(async () => {
      updateButton.click();
    });

    // Wait for the fetch call to happen and the error to be logged
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2); // Initial load + update
    });

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Failed to update config:",
        expect.any(Error)
      );
    });

    mockConsoleError.mockRestore();
  });
});

describe("useConfig", () => {
  it("should throw error when used outside ConfigProvider", () => {
    const TestComponentOutsideProvider = () => {
      useConfig();
      return <div>Test</div>;
    };

    expect(() => {
      render(<TestComponentOutsideProvider />);
    }).toThrow("useConfig must be used within a ConfigProvider");
  });
});
