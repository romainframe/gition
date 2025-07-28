// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

global.assignEnvVar = (key, value) => {
  if (value === undefined) {
    delete global.process.env[key];
  } else {
    global.process.env[key] = value;
  }
};

// Only mock window properties if we're in a browser-like environment
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}
