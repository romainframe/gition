"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { DEFAULT_CONFIG, GitionConfig } from "@/types/config";

interface ConfigContextType {
  config: GitionConfig;
  updateConfig: (newConfig: Partial<GitionConfig>) => void;
  isLoading: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<GitionConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  // Load config from server
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch("/api/config");
        if (response.ok) {
          const serverConfig = await response.json();
          setConfig(serverConfig);
        }
      } catch (error) {
        console.warn("Failed to load config, using defaults:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Apply theme variables to CSS
  useEffect(() => {
    if (config.theme && typeof window !== "undefined") {
      const root = document.documentElement;

      // Apply CSS custom properties for theme
      if (config.theme.primaryColor) {
        root.style.setProperty("--config-primary", config.theme.primaryColor);
      }
      if (config.theme.backgroundColor) {
        root.style.setProperty(
          "--config-background",
          config.theme.backgroundColor
        );
      }
      if (config.theme.textColor) {
        root.style.setProperty("--config-foreground", config.theme.textColor);
      }
      if (config.theme.accentColor) {
        root.style.setProperty("--config-accent", config.theme.accentColor);
      }
      if (config.theme.borderRadius) {
        root.style.setProperty("--config-radius", config.theme.borderRadius);
      }
      if (config.theme.fontFamily) {
        root.style.setProperty("--config-font-family", config.theme.fontFamily);
      }
    }
  }, [config.theme]);

  const updateConfig = async (newConfig: Partial<GitionConfig>) => {
    try {
      const response = await fetch("/api/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newConfig),
      });

      if (response.ok) {
        const updatedConfig = await response.json();
        setConfig(updatedConfig);
      }
    } catch (error) {
      console.error("Failed to update config:", error);
    }
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig, isLoading }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}
