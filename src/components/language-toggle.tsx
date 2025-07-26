"use client";

import { Check, ChevronDown, Languages } from "lucide-react";

import { InspectOverlay } from "@/components/dev/inspect-overlay";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/language-context";
import { useComponentInspect } from "@/hooks/use-inspect";

const languages = [
  { code: "en" as const, name: "English", flag: "🇺🇸" },
  { code: "fr" as const, name: "Français", flag: "🇫🇷" },
  { code: "es" as const, name: "Español", flag: "🇪🇸" },
];

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  // Register component for inspection
  useComponentInspect({
    componentId: "language-toggle",
    name: "LanguageToggle",
    filePath: "src/components/language-toggle.tsx",
    description: "Language selection dropdown with multi-language support",
    interfaces: ["LanguageOption"],
    apiDependencies: [],
    storeDependencies: ["useLanguage"],
  });

  const handleLanguageChange = (languageCode: "en" | "fr" | "es") => {
    setLanguage(languageCode);
  };

  const current =
    languages.find((lang) => lang.code === language) || languages[0];

  return (
    <InspectOverlay componentId="language-toggle">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 px-2 gap-1">
            <Languages className="h-4 w-4" />
            <span className="hidden sm:inline-flex">{current.flag}</span>
            <span className="hidden md:inline-flex">{current.name}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {/* <span>{lang.flag}</span> */}
                <span>{lang.name}</span>
              </div>
              {language === lang.code && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </InspectOverlay>
  );
}
