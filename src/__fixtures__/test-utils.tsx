import React from "react";

import { ThemeProvider } from "next-themes";

import "@testing-library/jest-dom";
import { RenderOptions, render } from "@testing-library/react";

// Mock providers wrapper
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {children}
    </ThemeProvider>
  );
};

// Custom render method
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from "@testing-library/react";
export { customRender as render };

// Common test utilities
export const waitForLoadingToFinish = async () => {
  const { waitFor } = await import("@testing-library/react");
  await waitFor(() => {
    expect(
      document.querySelector('[aria-busy="true"]')
    ).not.toBeInTheDocument();
  });
};

// Mock next/router
export const mockRouter = {
  basePath: "",
  pathname: "/",
  route: "/",
  asPath: "/",
  query: {},
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
};

// Mock next/navigation
export const mockUseRouter = jest.fn(() => mockRouter);
export const mockUsePathname = jest.fn(() => "/");
export const mockUseSearchParams = jest.fn(() => new URLSearchParams());

jest.mock("next/navigation", () => ({
  useRouter: () => mockUseRouter(),
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
}));
