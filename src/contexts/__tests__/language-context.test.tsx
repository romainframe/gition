import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

import { LanguageProvider, useLanguage } from "../language-context";

// Test component to use the language context
function TestComponent() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div>
      <div data-testid="current-language">{language}</div>
      <div data-testid="translated-text">{t("welcome")}</div>
      <div data-testid="nested-translation">{t("nav.home")}</div>
      <div data-testid="parameterized-translation">
        {t("greeting", { name: "John" })}
      </div>
      <button onClick={() => setLanguage("fr")} data-testid="change-to-french">
        Change to French
      </button>
      <button onClick={() => setLanguage("es")} data-testid="change-to-spanish">
        Change to Spanish
      </button>
    </div>
  );
}

describe("LanguageProvider", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it("should provide default language (en)", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId("current-language")).toHaveTextContent("en");
  });

  it("should translate simple keys", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // Should return the key if no translation found (default behavior)
    expect(screen.getByTestId("translated-text")).toHaveTextContent("welcome");
  });

  it("should handle nested translation keys", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId("nested-translation")).toHaveTextContent(
      "nav.home"
    );
  });

  it("should handle parameterized translations", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // Should return the key if no translation found
    expect(screen.getByTestId("parameterized-translation")).toHaveTextContent(
      "greeting"
    );
  });

  it("should change language when setLanguage is called", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId("current-language")).toHaveTextContent("en");

    // Change to French
    fireEvent.click(screen.getByTestId("change-to-french"));
    expect(screen.getByTestId("current-language")).toHaveTextContent("fr");

    // Change to Spanish
    fireEvent.click(screen.getByTestId("change-to-spanish"));
    expect(screen.getByTestId("current-language")).toHaveTextContent("es");
  });

  it("should persist language to localStorage", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // Change language
    fireEvent.click(screen.getByTestId("change-to-french"));

    // Check if localStorage was updated
    expect(localStorage.getItem("gition-language")).toBe("fr");
  });

  it("should load language from localStorage on initialization", () => {
    // Set language in localStorage before rendering
    localStorage.setItem("gition-language", "es");

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId("current-language")).toHaveTextContent("es");
  });

  it("should handle invalid language in localStorage", () => {
    // Set invalid language in localStorage
    localStorage.setItem("gition-language", "invalid");

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // Should fallback to default language
    expect(screen.getByTestId("current-language")).toHaveTextContent("en");
  });
});

describe("useLanguage", () => {
  it("should throw error when used outside LanguageProvider", () => {
    const TestComponentOutsideProvider = () => {
      useLanguage();
      return <div>Test</div>;
    };

    // Suppress console.error for this test
    const mockConsoleError = jest.spyOn(console, "error").mockImplementation();

    expect(() => {
      render(<TestComponentOutsideProvider />);
    }).toThrow("useLanguage must be used within a LanguageProvider");

    mockConsoleError.mockRestore();
  });
});
