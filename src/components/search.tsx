"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { FileText, ListTodo, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "doc" | "task";
  title: string;
  description?: string;
  href: string;
  filename?: string;
}

interface SearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchContent = async () => {
      setLoading(true);
      try {
        const [docsResponse, tasksResponse] = await Promise.all([
          fetch("/api/docs"),
          fetch("/api/tasks"),
        ]);

        const docs = await docsResponse.json();
        const tasks = await tasksResponse.json();

        const searchResults: SearchResult[] = [];

        // Search through documents
        docs.forEach(
          (doc: {
            slug: string;
            metadata?: { title?: string; description?: string };
            excerpt?: string;
            content?: string;
            filename: string;
          }) => {
            const title = doc.metadata?.title || doc.slug;
            const description = doc.metadata?.description || doc.excerpt || "";
            const content = doc.content || "";

            if (
              title.toLowerCase().includes(query.toLowerCase()) ||
              description.toLowerCase().includes(query.toLowerCase()) ||
              content.toLowerCase().includes(query.toLowerCase())
            ) {
              searchResults.push({
                type: "doc",
                title,
                description,
                href: `/docs/${encodeURIComponent(doc.slug)}`,
                filename: doc.filename,
              });
            }
          }
        );

        // Search through tasks
        tasks.forEach(
          (task: { title: string; completed: boolean; file: string }) => {
            if (task.title.toLowerCase().includes(query.toLowerCase())) {
              const filename = task.file.split("/").pop() || task.file;
              searchResults.push({
                type: "task",
                title: task.title,
                description: `${task.completed ? t("search.completedTask") : t("search.pendingTask")} task in ${filename}`,
                href: `/docs/${encodeURIComponent(filename.replace(/\.(md|mdx)$/, ""))}`,
                filename,
              });
            }
          }
        );

        setResults(searchResults.slice(0, 20)); // Limit to 20 results
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchContent, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, t]);

  const handleResultClick = () => {
    onOpenChange(false);
    setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {t("search.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("search.placeholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 h-7 w-7 p-0 transform -translate-y-1/2"
                onClick={() => setQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-96">
          {loading && (
            <div className="px-6 py-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {t("search.searching")}
              </div>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                {t("search.noResults", { query })}
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="pb-4">
              {results.map((result, index) => (
                <div key={index}>
                  <Link
                    href={result.href}
                    onClick={handleResultClick}
                    className="flex items-start gap-3 px-6 py-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {result.type === "doc" ? (
                        <FileText className="h-4 w-4 text-blue-500" />
                      ) : (
                        <ListTodo className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">
                          {result.title}
                        </h4>
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            result.type === "doc"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                              : "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                          )}
                        >
                          {result.type === "doc"
                            ? t("search.doc")
                            : t("search.task")}
                        </span>
                      </div>
                      {result.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {result.description}
                        </p>
                      )}
                      {result.filename && (
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {result.filename}
                        </p>
                      )}
                    </div>
                  </Link>
                  {index < results.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {!query && (
          <div className="px-6 pb-6">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">{t("search.searchTips")}</p>
              <ul className="space-y-1 text-xs">
                <li>• {t("search.tipDocuments")}</li>
                <li>• {t("search.tipTasks")}</li>
                <li>• {t("search.tipKeywords")}</li>
              </ul>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function SearchTrigger() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="relative h-9 w-full justify-start rounded-lg border-border/40 bg-background/50 text-sm font-normal text-muted-foreground shadow-none hover:bg-accent/50"
        onClick={() => setOpen(true)}
        data-search-trigger
      >
        <Search className="h-4 w-4 mr-2 flex-shrink-0" />
        <span className="flex-1 text-left truncate">
          {t("search.searchButton")}
        </span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground opacity-100 ml-2 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <SearchDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
