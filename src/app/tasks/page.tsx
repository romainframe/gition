"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  Archive,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Circle,
  FileText,
  Folder,
  ListTodo,
  MapPin,
  Target,
} from "lucide-react";
import path from "path";

import { InspectOverlay } from "@/components/dev/inspect-overlay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MetadataEditor } from "@/components/ui/metadata-editor";
import { StatusEditor } from "@/components/ui/status-editor";
import { TaskMetadataEditor } from "@/components/ui/task-metadata-editor";
import { TaskStatusEditor } from "@/components/ui/task-status-editor";
import { useLanguage } from "@/contexts/language-context";
import { useComponentInspect } from "@/hooks/use-inspect";
import { useTaskStore } from "@/store/useTaskStore";

export default function TasksPage() {
  const {
    taskGroups,
    isLoading: loading,
    error,
    fetchTaskGroups,
  } = useTaskStore();

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const { t } = useLanguage();

  // Register component for inspection
  useComponentInspect({
    componentId: "tasks-overview-page",
    name: "TasksPage",
    filePath: "src/app/tasks/page.tsx",
    description:
      "Tasks overview page with expandable task groups and statistics",
    interfaces: ["TaskGroup", "TaskItem"],
    apiDependencies: ["/api/tasks"],
    storeDependencies: ["useTaskStore"],
  });

  useEffect(() => {
    fetchTaskGroups();
  }, [fetchTaskGroups]);

  // Expand all groups by default when data loads
  useEffect(() => {
    if (taskGroups.length > 0 && expandedGroups.size === 0) {
      setExpandedGroups(new Set(taskGroups.map((group) => group.id)));
    }
  }, [taskGroups, expandedGroups.size]);

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

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
        return "bg-purple-100 text-purple-700 hover:bg-purple-200";
      case "story":
        return "bg-blue-100 text-blue-700 hover:bg-blue-200";
      case "doc":
        return "bg-green-100 text-green-700 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted/50 rounded-lg w-1/4" />
          <div className="h-6 bg-muted/30 rounded-lg w-1/2" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-muted/30 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const totalTasks = taskGroups.reduce(
    (sum, group) => sum + group.totalTasks,
    0
  );
  const completedTasks = taskGroups.reduce(
    (sum, group) => sum + group.completedTasks,
    0
  );
  const pendingTasks = taskGroups.reduce(
    (sum, group) => sum + group.pendingTasks,
    0
  );
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (taskGroups.length === 0) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            {t("tasks.title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("tasks.manageProject")}
          </p>
        </div>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>{t("tasks.noTasks")}</CardTitle>
            <CardDescription>{t("tasks.createTasks")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-medium">{t("tasks.toAddTasks")}</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-2" />
                  <div>
                    Use{" "}
                    <code className="bg-muted px-1.5 py-0.5 rounded font-mono">
                      - [ ] {t("tasks.incompleteTask")}
                    </code>{" "}
                    {t("tasks.forIncompleteTasks")}
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-2" />
                  <div>
                    Use{" "}
                    <code className="bg-muted px-1.5 py-0.5 rounded font-mono">
                      - [x] {t("tasks.completedTask")}
                    </code>{" "}
                    {t("tasks.forCompletedTasks")}
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-2" />
                  <div>{t("tasks.addToAnyFile")}</div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-2" />
                  <div>{t("tasks.organizeTasksInSubfolders")}</div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-2" />
                  <div>{t("tasks.referenceOtherTasks")}</div>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <InspectOverlay componentId="tasks-overview-page">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold tracking-tight">
              {t("tasks.title")}
            </h1>
            <Button asChild variant="outline">
              <Link href="/tasks/kanban">
                <ListTodo className="h-4 w-4 mr-2" />
                {t("tasks.kanbanBoard")}
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              {totalTasks} {t("tasks.totalTasks")}
            </span>
            <span className="text-muted-foreground">
              {pendingTasks} {t("tasks.pending")}
            </span>
            <span className="text-muted-foreground">
              {completedTasks} {t("tasks.completed")}
            </span>
            <Badge
              variant={completionRate === 100 ? "default" : "secondary"}
              className="font-medium"
            >
              {completionRate}% {t("tasks.complete")}
            </Badge>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("tasks.pendingTasks")}
              </CardTitle>
              <Circle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("tasks.completedTasks")}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("tasks.files")}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskGroups.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Task Groups */}
        <div className="space-y-6">
          {taskGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.id);

            return (
              <Card
                key={group.id}
                className="max-h-80 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <Link
                  href={`/tasks/${group.folder || "docs"}/${path.basename(group.file, path.extname(group.file))}`}
                  className="block"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-1 hover:bg-muted/50 rounded transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleGroup(group.id);
                            }}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                          {getGroupIcon(group.type)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {group.name}
                            </CardTitle>
                            <Badge
                              className={`text-xs ${getGroupBadgeColor(group.type)}`}
                            >
                              {group.type}
                            </Badge>
                            {group.folder && (
                              <Badge variant="outline" className="text-xs">
                                {group.folder}
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="flex items-center gap-2 text-xs line-clamp-2">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{group.file}</span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="font-medium">
                            {group.totalTasks} {t("tasks.tasksLowercase")}
                          </div>
                          <div className="flex gap-3 text-xs">
                            <span className="text-orange-600">
                              {group.pendingTasks} {t("tasks.pending")}
                            </span>
                            <span className="text-green-600">
                              {group.completedTasks} {t("tasks.done")}
                            </span>
                          </div>
                        </div>
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <TaskStatusEditor
                            taskId={group.id}
                            currentStatus={group.metadata?.status}
                            className="text-xs"
                          />
                          <TaskMetadataEditor
                            taskId={group.id}
                            currentMetadata={group.metadata}
                            className="text-xs"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link
                              href={`/tasks/kanban?group=${encodeURIComponent(group.id)}`}
                            >
                              <ListTodo className="h-4 w-4 mr-2" />
                              {t("tasks.kanban")}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Link>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="overflow-y-auto no-scrollbar max-h-48">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 ml-6">
                        {group.subtasks
                          .sort(
                            (a, b) => Number(a.completed) - Number(b.completed)
                          )
                          .map((task) => {
                            const statusIcon =
                              task.status === "done" ? (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              ) : task.status === "in_progress" ? (
                                <Circle className="h-3 w-3 text-orange-500 fill-orange-100" />
                              ) : (
                                <Circle className="h-3 w-3 text-muted-foreground" />
                              );

                            return (
                              <div
                                key={task.id}
                                className="flex items-start gap-2 p-2 rounded border bg-card/50"
                              >
                                <div className="flex-shrink-0 mt-0.5">
                                  {statusIcon}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-xs font-medium line-clamp-2 ${task.completed ? "line-through text-muted-foreground" : ""}`}
                                  >
                                    {task.title}
                                  </p>

                                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                    <span className="text-xs">
                                      L{task.line}
                                    </span>

                                    <StatusEditor
                                      taskGroupId={group.id}
                                      subtaskId={task.id}
                                      currentStatus={task.status}
                                      className="text-xs"
                                    />

                                    <MetadataEditor
                                      taskGroupId={group.id}
                                      subtaskId={task.id}
                                      currentMetadata={task.metadata}
                                      className="text-xs"
                                    />

                                    {task.metadata?.priority && (
                                      <Badge
                                        variant={
                                          task.metadata.priority === "high"
                                            ? "destructive"
                                            : task.metadata.priority ===
                                                "medium"
                                              ? "default"
                                              : "secondary"
                                        }
                                        className="text-xs h-4 px-1"
                                      >
                                        {task.metadata.priority
                                          .charAt(0)
                                          .toUpperCase()}
                                      </Badge>
                                    )}
                                  </div>

                                  {(task.references &&
                                    task.references.length > 0) ||
                                  (task.metadata?.tags &&
                                    task.metadata.tags.length > 0) ? (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {task.references &&
                                        task.references.map((ref) => (
                                          <Badge
                                            key={ref}
                                            variant="outline"
                                            className="text-xs h-4 px-1"
                                          >
                                            {ref.split("/").pop()}
                                          </Badge>
                                        ))}

                                      {task.metadata?.tags &&
                                        task.metadata.tags
                                          .slice(0, 2)
                                          .map((tag) => (
                                            <Badge
                                              key={tag}
                                              variant="outline"
                                              className="text-xs h-4 px-1"
                                            >
                                              #{tag}
                                            </Badge>
                                          ))}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </InspectOverlay>
  );
}
