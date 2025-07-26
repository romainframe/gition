"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Circle,
  Folder,
  ListTodo,
  MapPin,
  Tag,
  Target,
  User,
} from "lucide-react";
import path from "path";

import { InspectOverlay } from "@/components/dev/inspect-overlay";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EnhancedMarkdownRenderer } from "@/components/ui/enhanced-markdown-renderer";
import { MetadataEditor } from "@/components/ui/metadata-editor";
import { StatusEditor } from "@/components/ui/status-editor";
import { TaskMetadataEditor } from "@/components/ui/task-metadata-editor";
import { useLanguage } from "@/contexts/language-context";
import { useComponentInspect } from "@/hooks/use-inspect";
import { useTaskStore } from "@/store/useTaskStore";

interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  status: "todo" | "in_progress" | "done";
  line: number;
  file: string;
  type: "doc" | "epic" | "story" | "bug" | "custom";
  folder?: string;
  references?: string[];
  metadata?: {
    priority?: "low" | "medium" | "high" | "critical";
    due_date?: string;
    assignee?: string;
    tags?: string[];
    estimate?: number;
    status?: "blocked" | "waiting" | "review";
  };
}

interface TaskGroup {
  id: string;
  name: string;
  type: "doc" | "epic" | "story" | "bug" | "custom";
  file: string;
  folder?: string;
  tasks: TaskItem[];
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  content?: string;
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
    author?: string;
    date?: string;
    priority?: "low" | "medium" | "high" | "critical";
    assignee?: string;
    due_date?: string;
    estimate?: string;
    status?: string;
  };
}

interface TaskFile {
  group: TaskGroup | null;
  tasks: TaskItem[];
  content: string;
  filename: string;
}

interface TaskReference {
  id: string;
  title: string;
  file: string;
  type: "doc" | "epic" | "story" | "bug" | "custom";
  folder?: string;
}

// Component to show task references
const TaskReferences = ({ references }: { references: TaskReference[] }) => {
  if (references.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Referenced Tasks</CardTitle>
        <CardDescription>Tasks that reference this task file</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {references.map((ref) => (
            <div
              key={ref.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {ref.type === "epic" && (
                    <Target className="h-4 w-4 text-purple-500" />
                  )}
                  {ref.type === "story" && (
                    <Archive className="h-4 w-4 text-blue-500" />
                  )}
                  {ref.type === "doc" && (
                    <BookOpen className="h-4 w-4 text-green-500" />
                  )}
                  {!["epic", "story", "doc"].includes(ref.type) && (
                    <Folder className="h-4 w-4 text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{ref.title}</p>
                  <p className="text-sm text-muted-foreground">{ref.file}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {ref.type}
                </Badge>
                {ref.folder && (
                  <Badge variant="secondary" className="text-xs">
                    {ref.folder}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Component for individual tasks
const TaskList = ({
  tasks,
  taskGroupId,
  showCompleted = true,
}: {
  tasks: TaskItem[];
  taskGroupId: string;
  showCompleted?: boolean;
}) => {
  const filteredTasks = showCompleted
    ? tasks
    : tasks.filter((task) => !task.completed);

  return (
    <div className="space-y-3">
      {filteredTasks
        .sort((a, b) => Number(a.completed) - Number(b.completed))
        .map((task) => {
          const statusIcon =
            task.status === "done" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : task.status === "in_progress" ? (
              <Circle className="h-4 w-4 text-orange-500 fill-orange-100" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            );

          return (
            <div
              key={task.id}
              className="flex items-start gap-3 p-4 border rounded-lg bg-card"
            >
              <div className="flex-shrink-0 mt-0.5">{statusIcon}</div>

              <div className="flex-1 min-w-0 space-y-2">
                <p
                  className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}
                >
                  {task.title}
                </p>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>Line {task.line}</span>

                  <StatusEditor
                    taskGroupId={taskGroupId}
                    subtaskId={task.id}
                    currentStatus={task.status}
                  />

                  <MetadataEditor
                    taskGroupId={taskGroupId}
                    subtaskId={task.id}
                    currentMetadata={task.metadata}
                  />

                  {task.metadata?.priority && (
                    <Badge
                      variant={
                        task.metadata.priority === "high"
                          ? "destructive"
                          : task.metadata.priority === "medium"
                            ? "default"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {task.metadata.priority}
                    </Badge>
                  )}

                  {task.metadata?.assignee && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span className="text-xs">{task.metadata.assignee}</span>
                    </div>
                  )}

                  {task.metadata?.due_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span className="text-xs">
                        {new Date(task.metadata.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {(task.references && task.references.length > 0) ||
                (task.metadata?.tags && task.metadata.tags.length > 0) ? (
                  <div className="flex flex-wrap gap-1">
                    {task.references &&
                      task.references.map((ref) => (
                        <Badge key={ref} variant="outline" className="text-xs">
                          ref: {ref.split("/").pop()}
                        </Badge>
                      ))}

                    {task.metadata?.tags &&
                      task.metadata.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
    </div>
  );
};

// Helper function to remove first H1 line if it exists
function removeFirstH1(content: string): string {
  const lines = content.split("\n");

  // Skip frontmatter if it exists
  let startIndex = 0;
  if (lines[0] && lines[0].trim() === "---") {
    // Find the closing ---
    for (let i = 1; i < lines.length; i++) {
      if (lines[i] && lines[i].trim() === "---") {
        startIndex = i + 1;
        break;
      }
    }
  }

  // Look for the first H1 after frontmatter
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("# ")) {
      // Remove this line and return the content
      return [...lines.slice(0, i), ...lines.slice(i + 1)].join("\n");
    }
    // If we encounter non-empty content that's not an H1, stop looking
    if (line && !line.startsWith("#")) {
      break;
    }
  }

  return content;
}

export default function TaskDetailPage() {
  const resolvedParams = useParams();
  const slug = Array.isArray(resolvedParams?.slug)
    ? resolvedParams.slug.join("/")
    : resolvedParams?.slug;

  const [taskFile, setTaskFile] = useState<TaskFile | null>(null);
  const [references, setReferences] = useState<TaskReference[]>([]);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const {
    taskGroups,
    isLoading: loading,
    error,
    fetchTaskGroups,
  } = useTaskStore();
  const { t } = useLanguage();

  // Register component for inspection
  useComponentInspect({
    componentId: "task-detail-page",
    name: "TaskDetailPage",
    filePath: "src/app/tasks/[...slug]/page.tsx",
    description:
      "Task detail page showing task metadata, content, and subtasks",
    interfaces: ["TaskItem", "TaskGroup", "TaskFile", "TaskReference"],
    apiDependencies: ["/api/tasks"],
    storeDependencies: ["useTaskStore"],
  });

  useEffect(() => {
    fetchTaskGroups();
  }, [fetchTaskGroups]);

  useEffect(() => {
    if (!slug || taskGroups.length === 0) return;

    // Find the task group that matches this slug
    const group = taskGroups.find((group) => {
      const groupSlug = path.basename(group.file, path.extname(group.file));
      const matches = [
        groupSlug === slug,
        group.id === slug,
        group.file === slug,
        `${group.folder}/${groupSlug}` === slug,
        `${group.folder}/${group.file}` === slug,
      ].some(Boolean);

      return matches;
    });

    if (group) {
      setTaskFile({
        group: {
          ...group,
          tasks: group.subtasks || [],
        },
        tasks: group.subtasks || [],
        content: group.content || "",
        filename: group.file,
      });

      // Find references to this task file
      const refs = taskGroups
        .filter((g) => g.id !== group.id)
        .flatMap((g) =>
          (g.subtasks || [])
            .filter(
              (task) =>
                task.references &&
                task.references.some(
                  (ref) =>
                    ref.includes(slug) ||
                    ref.includes(group.name) ||
                    ref.includes(
                      path.basename(group.file, path.extname(group.file))
                    )
                )
            )
            .map(() => ({
              id: g.id,
              title: g.name,
              file: g.file,
              type: g.type,
              folder: g.folder,
            }))
        );

      setReferences(refs);
    } else {
      setTaskFile(null);
      setReferences([]);
    }
  }, [slug, taskGroups]);

  // Measure content height to match sidebar height
  useEffect(() => {
    const measureContentHeight = () => {
      if (contentRef.current) {
        const height = contentRef.current.scrollHeight;
        setContentHeight(height);
      }
    };

    // Measure after content loads and when taskFile changes
    if (taskFile?.content) {
      // Use setTimeout to ensure content is rendered
      setTimeout(measureContentHeight, 100);

      // Also measure on window resize
      window.addEventListener("resize", measureContentHeight);
      return () => window.removeEventListener("resize", measureContentHeight);
    }
  }, [taskFile?.content]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted/50 rounded w-24" />
          <div className="h-10 bg-muted/50 rounded w-2/3" />
          <div className="h-4 bg-muted/30 rounded w-1/2" />
        </div>
        <div className="space-y-4">
          <div className="h-20 bg-muted/30 rounded" />
          <div className="h-20 bg-muted/30 rounded" />
          <div className="h-20 bg-muted/30 rounded" />
        </div>
      </div>
    );
  }

  if (error || !taskFile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{t("tasks.taskNotFound")}</h1>
          <p className="text-muted-foreground">
            {error || t("tasks.taskNotFoundMessage")}
          </p>
          <Button asChild>
            <Link href="/tasks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("tasks.backToTasks")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const getGroupIcon = (type: string) => {
    switch (type) {
      case "epic":
        return <Target className="h-5 w-5 text-purple-500" />;
      case "story":
        return <Archive className="h-5 w-5 text-blue-500" />;
      case "doc":
        return <BookOpen className="h-5 w-5 text-green-500" />;
      default:
        return <Folder className="h-5 w-5 text-gray-500" />;
    }
  };

  const getGroupBadgeColor = (type: string) => {
    switch (type) {
      case "epic":
        return "bg-purple-100 text-purple-700";
      case "story":
        return "bg-blue-100 text-blue-700";
      case "doc":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <InspectOverlay componentId="task-detail-page">
      <div className="flex flex-col h-[calc(100vh-6rem)]">
        {/* Fixed Info Section */}
        <div className="flex-shrink-0 space-y-6 pb-3 border-b border-border/40">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/tasks">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("tasks.backToTasks")}
                </Link>
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {taskFile.group && getGroupIcon(taskFile.group.type)}
                <h1 className="text-4xl font-bold tracking-tight">
                  {taskFile.group?.metadata?.title ||
                    taskFile.group?.name ||
                    path.basename(
                      taskFile.filename,
                      path.extname(taskFile.filename)
                    )}
                </h1>
                {taskFile.group && (
                  <Badge
                    className={`${getGroupBadgeColor(taskFile.group.type)}`}
                  >
                    {taskFile.group.type}
                  </Badge>
                )}
                {taskFile.group?.folder && (
                  <Badge variant="outline">{taskFile.group.folder}</Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{taskFile.filename}</span>
                </div>

                {taskFile.group?.metadata?.author && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{taskFile.group.metadata.author}</span>
                  </div>
                )}

                {taskFile.group?.metadata?.date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(
                        taskFile.group.metadata.date
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {taskFile.group?.metadata?.description && (
                <p className="text-muted-foreground">
                  {taskFile.group.metadata.description}
                </p>
              )}

              {/* Metadata Alerts */}
              {!taskFile.group?.metadata && (
                <Alert
                  variant="destructive"
                  className="bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No metadata found. Add frontmatter to this file for better
                    organization.
                  </AlertDescription>
                </Alert>
              )}

              {taskFile.group?.metadata && !taskFile.group.metadata.title && (
                <Alert
                  variant="destructive"
                  className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No title found in metadata. Add a &quot;title&quot; field to
                    the frontmatter.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {taskFile.group && (
                <TaskMetadataEditor
                  taskId={taskFile.group.id}
                  currentMetadata={taskFile.group.metadata}
                />
              )}
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/tasks/kanban?group=${encodeURIComponent(taskFile.group?.id || slug)}`}
                >
                  {t("tasks.viewKanban")}
                </Link>
              </Button>
              {taskFile.tasks.length > 0 && (
                <Badge variant="secondary" className="text-sm">
                  {taskFile.tasks.length} tasks
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Main Content with Right Sidebar */}
        <div className="flex-1 flex gap-6 pt-3 overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 overflow-auto no-scrollbar">
            <div ref={contentRef}>
              {/* Task Content */}
              {taskFile.content && (
                <EnhancedMarkdownRenderer
                  content={removeFirstH1(taskFile.content)}
                  taskGroupId={taskFile.group?.id || slug}
                  tasks={taskFile.tasks}
                  className="max-w-none"
                />
              )}

              {/* References */}
              {references.length > 0 && (
                <div className="mt-6">
                  <TaskReferences references={references} />
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div
            ref={sidebarRef}
            className="w-80 flex-shrink-0"
            style={{
              height: contentHeight ? `${contentHeight}px` : "auto",
              maxHeight: "100%",
            }}
          >
            <div className="h-full flex flex-col space-y-4">
              {/* Compact Task Statistics */}
              <div className="flex-shrink-0 space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Task Overview
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <ListTodo className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Total</span>
                    </div>
                    <span className="text-lg font-bold">
                      {taskFile.tasks.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Circle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Pending</span>
                    </div>
                    <span className="text-lg font-bold">
                      {taskFile.tasks.filter((task) => !task.completed).length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                    <span className="text-lg font-bold">
                      {taskFile.tasks.filter((task) => task.completed).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scrollable Task List */}
              {taskFile.tasks.length > 0 && (
                <div className="flex-1 flex flex-col min-h-0">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex-shrink-0">
                    Subtasks
                  </h3>
                  <div className="flex-1 overflow-auto no-scrollbar pr-2">
                    <TaskList
                      tasks={taskFile.tasks}
                      taskGroupId={taskFile.group?.id || slug}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </InspectOverlay>
  );
}
