"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Eye,
  EyeOff,
  FileText,
  FolderOpen,
  ListTodo,
  Search,
} from "lucide-react";

import { InspectOverlay } from "@/components/dev/inspect-overlay";
import { LanguageToggle } from "@/components/language-toggle";
import { SearchTrigger } from "@/components/search";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { useComponentInspect, useInspect } from "@/hooks/use-inspect";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const {
    isInspectMode,
    toggleInspectMode,
    isAvailable: isInspectAvailable,
  } = useInspect();

  // Register component for inspection
  useComponentInspect({
    componentId: "header",
    name: "Header",
    filePath: "src/components/header.tsx",
    description: "Main navigation header with search and toggles",
    interfaces: ["NavigationItem"],
    apiDependencies: [],
    storeDependencies: [],
  });

  const navigation = [
    {
      name: t("header.overview"),
      href: "/",
      icon: FolderOpen,
      current: pathname === "/",
    },
    {
      name: t("header.docs"),
      href: "/docs",
      icon: FileText,
      current: pathname.startsWith("/docs"),
    },
    {
      name: t("header.tasks"),
      href: "/tasks",
      icon: ListTodo,
      current: pathname.startsWith("/tasks"),
    },
    {
      name: t("header.howTo"),
      href: "/how-to",
      icon: FileText,
      current: pathname === "/how-to",
    },
  ];

  return (
    <InspectOverlay componentId="header">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 items-center px-6 lg:px-8">
          {/* Left: Logo */}
          <div className="flex">
            <Link className="flex items-center space-x-3" href="/">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm">
                <div className="h-4 w-4 rounded-sm bg-white/90" />
              </div>
              <span className="text-xl font-semibold tracking-tight">
                Gition
              </span>
            </Link>
          </div>

          <div className="flex-1 flex max-w-80"></div>

          {/* Center: Navigation */}
          <div className="flex-1 flex justify-left">
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent/50",
                    item.current
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Search + Actions */}
          <div className="flex items-center space-x-3">
            <div className="w-48 lg:w-64 hidden sm:block">
              <SearchTrigger />
            </div>
            <div className="sm:hidden">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => {
                  // This would open the search dialog on mobile
                  const searchTrigger = document.querySelector(
                    "[data-search-trigger]"
                  ) as HTMLButtonElement;
                  searchTrigger?.click();
                }}
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">{t("search.searchLabel")}</span>
              </Button>
            </div>
            {/* Inspect Toggle - Only in development */}
            {isInspectAvailable && (
              <Button
                variant={isInspectMode ? "default" : "ghost"}
                size="sm"
                className="h-9 w-9 p-0"
                onClick={toggleInspectMode}
                title={
                  isInspectMode ? "Disable Vibe Inspect" : "Enable Vibe Inspect"
                }
              >
                {isInspectMode ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {isInspectMode ? "Disable" : "Enable"} Vibe Inspect
                </span>
              </Button>
            )}
            <LanguageToggle />
            <ThemeToggle />
          </div>

          {/* Mobile Navigation - Only show on smaller screens where desktop nav is hidden */}
          <nav className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex md:hidden items-center space-x-1">
            {navigation.slice(0, 3).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-center rounded-lg p-2 transition-all duration-200 hover:bg-accent/50",
                  item.current
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="sr-only">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </InspectOverlay>
  );
}
