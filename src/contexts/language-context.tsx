"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Language = "en" | "fr" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, unknown>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Translation function
function translate(
  translations: Record<string, unknown>,
  key: string,
  params: Record<string, unknown> = {}
): string {
  const keys = key.split(".");
  let value: unknown = translations;

  for (const k of keys) {
    if (value && typeof value === "object" && value !== null && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key; // Return key if translation not found
    }
  }

  if (typeof value !== "string") {
    return key;
  }

  // Handle pluralization syntax: {count, plural, =1 {singular} other {plural}}
  let processedValue = value.replace(
    /\{(\w+),\s*plural,\s*=1\s*\{([^}]+)\}\s*other\s*\{([^}]+)\}\}/g,
    (match, paramKey, singular, plural) => {
      const count = params[paramKey];
      if (typeof count === "number") {
        return count === 1 ? singular : plural;
      }
      return match;
    }
  );

  // Simple parameter replacement
  processedValue = processedValue.replace(/\{(\w+)\}/g, (match, paramKey) => {
    const replacement = params[paramKey];
    return typeof replacement === "string" || typeof replacement === "number"
      ? replacement.toString()
      : match;
  });

  return processedValue;
}

// Import translations dynamically
const loadTranslations = async (language: Language) => {
  try {
    const translations = await import(`../locales/${language}/common.json`);
    return translations.default;
  } catch (error) {
    console.error(`Failed to load translations for ${language}:`, error);
    // Fallback to English
    const fallback = await import("../locales/en/common.json");
    return fallback.default;
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [translations, setTranslations] = useState<Record<string, unknown>>({});

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("gition-language") as Language;
    if (savedLanguage && ["en", "fr", "es"].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Load translations when language changes
  useEffect(() => {
    loadTranslations(language).then(setTranslations);
  }, [language]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem("gition-language", newLanguage);
  };

  const t = (key: string, params?: Record<string, unknown>) => {
    return translate(translations, key, params);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
