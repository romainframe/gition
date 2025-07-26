"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  Archive,
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  Target,
} from "lucide-react";

import { InspectOverlay } from "@/components/dev/inspect-overlay";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/language-context";
import { useComponentInspect } from "@/hooks/use-inspect";
import { cn } from "@/lib/utils";
import type { DirectoryNode } from "@/models";
import { useStructureStore } from "@/store/useStructureStore";
import { GitionConfig } from "@/types/config";

import { useConfig } from "./config-provider";

// Format display name: capitalize first letter and replace dashes/underscores with spaces
function formatDisplayName(name: string): string {
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

interface TreeNodeProps {
  node: DirectoryNode;
  level?: number;
  basePath?: string;
}

function TreeNode({ node, level = 0, basePath = "" }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Expand first 2 levels by default
  const { config } = useConfig();

  const hasChildren = node.children && node.children.length > 0;
  const isMarkdown = node.type === "file" && node.isMarkdown;

  // Determine if this is a task file and its type
  const isTaskFile = basePath === "/tasks";
  const taskType =
    isTaskFile && level > 0 ? getTaskTypeFromPath(node.path, config) : null;

  const href = isMarkdown
    ? `${basePath}/${encodeURIComponent(node.name.replace(/\.(md|mdx)$/, ""))}`
    : "#";

  function getTaskTypeFromPath(
    path: string,
    config: GitionConfig
  ): string | null {
    // Check against configured task types
    const taskTypes = config.taskTypes || [];
    for (const taskType of taskTypes) {
      if (path.includes(`/${taskType.folder}/`)) {
        return taskType.name.toLowerCase();
      }
    }

    // Fallback to default logic
    if (path.includes("/epics/")) return "epic";
    if (path.includes("/stories/")) return "story";
    if (path.includes("/docs/")) return "doc";
    return "custom";
  }

  function getTaskIcon(taskType: string | null) {
    if (!taskType)
      return <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />;

    switch (taskType) {
      case "epic":
        return <Target className="h-4 w-4 text-purple-500 flex-shrink-0" />;
      case "story":
        return <Archive className="h-4 w-4 text-blue-500 flex-shrink-0" />;
      case "doc":
        return <BookOpen className="h-4 w-4 text-green-500 flex-shrink-0" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />;
    }
  }

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent/50 transition-all duration-200",
          level > 0 && "ml-4"
        )}
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}

        <div className="flex items-center gap-2 flex-1 min-w-0">
          {node.type === "directory" ? (
            <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          ) : isTaskFile && isMarkdown ? (
            getTaskIcon(taskType)
          ) : (
            <FileText
              className={cn(
                "h-4 w-4 flex-shrink-0",
                isMarkdown ? "text-blue-500" : "text-muted-foreground"
              )}
            />
          )}

          {isMarkdown ? (
            <Link
              href={href}
              className="truncate hover:underline"
              title={node.name}
            >
              {formatDisplayName(node.name.replace(/\.(md|mdx)$/, ""))}
            </Link>
          ) : (
            <span className="truncate" title={node.name}>
              {formatDisplayName(node.name)}
            </span>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-2">
          {node.children!.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              level={level + 1}
              basePath={basePath}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SidebarSectionProps {
  title: string;
  nodes: DirectoryNode[];
  basePath: string;
}

function SidebarSection({ title, nodes, basePath }: SidebarSectionProps) {
  const { t } = useLanguage();

  if (nodes.length === 0) {
    return (
      <div>
        <h4 className="mb-3 text-sm font-semibold text-foreground">{title}</h4>
        <div className="rounded-lg bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            {t("sidebar.noFiles")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-foreground">{title}</h4>
      <div className="space-y-1">
        {nodes.map((node) => (
          <TreeNode key={node.path} node={node} basePath={basePath} />
        ))}
      </div>
    </div>
  );
}

export function Sidebar() {
  const {
    structure,
    isLoading: loading,
    error,
    fetchStructure,
  } = useStructureStore();
  const { t } = useLanguage();

  // Register component for inspection
  useComponentInspect({
    componentId: "sidebar",
    name: "Sidebar",
    filePath: "src/components/sidebar.tsx",
    description: "Navigation sidebar showing documentation and task structure",
    interfaces: ["DirectoryNode", "TreeNodeProps", "SidebarSectionProps"],
    apiDependencies: ["/api/structure"],
    storeDependencies: ["useStructureStore"],
  });

  useEffect(() => {
    if (!structure) {
      fetchStructure();
    }
  }, [structure, fetchStructure]);

  if (loading) {
    return (
      <div className="w-64 border-r bg-background/50 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-64 border-r bg-background/50 p-4">
        <p className="text-sm text-destructive">
          {t("sidebar.error", { error })}
        </p>
      </div>
    );
  }

  if (!structure) {
    return (
      <div className="w-64 border-r bg-background/50 p-4">
        <p className="text-sm text-muted-foreground">
          {t("sidebar.noStructureData")}
        </p>
      </div>
    );
  }

  return (
    <InspectOverlay componentId="sidebar">
      <div className="w-72 h-full border-r border-border/40 bg-background/95 backdrop-blur-sm">
        <ScrollArea className="h-full no-scrollbar">
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {t("sidebar.workspace")}
              </h3>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground font-mono break-all leading-relaxed">
                  {structure.paths.target}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <SidebarSection
                title={t("sidebar.documentation")}
                nodes={structure.docs}
                basePath="/docs"
              />

              <SidebarSection
                title={t("sidebar.tasks")}
                nodes={structure.tasks}
                basePath="/tasks"
              />
            </div>
          </div>
        </ScrollArea>
      </div>
    </InspectOverlay>
  );
}
