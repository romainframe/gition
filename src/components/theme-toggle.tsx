"use client";

import { useEffect, useState } from "react";

import { useTheme } from "next-themes";

import { Moon, Sun } from "lucide-react";

import { InspectOverlay } from "@/components/dev/inspect-overlay";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { useComponentInspect } from "@/hooks/use-inspect";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

  // Register component for inspection
  useComponentInspect({
    componentId: "theme-toggle",
    name: "ThemeToggle",
    filePath: "src/components/theme-toggle.tsx",
    description: "Theme toggle button switching between light and dark modes",
    interfaces: [],
    apiDependencies: [],
    storeDependencies: ["useTheme"],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
        <div className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <InspectOverlay componentId="theme-toggle">
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">{t("theme.toggle")}</span>
      </Button>
    </InspectOverlay>
  );
}
