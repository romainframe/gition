"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { FileText, FolderOpen, ListTodo } from "lucide-react";
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
import { useLanguage } from "@/contexts/language-context";
import { useComponentInspect } from "@/hooks/use-inspect";

interface ProjectStats {
  folderName: string;
  folderPath: string;
  docsCount: number;
  tasksCount: number;
  completedTasks: number;
}

export default function Home() {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  // Register component for inspection
  useComponentInspect({
    componentId: "homepage",
    name: "Homepage",
    filePath: "src/app/page.tsx",
    description:
      "Main overview page showing project statistics and quick start guide",
    interfaces: ["ProjectStats"],
    apiDependencies: ["/api/docs", "/api/tasks", "/api/structure"],
    storeDependencies: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [docsResponse, tasksResponse, structureResponse] =
          await Promise.all([
            fetch("/api/docs"),
            fetch("/api/tasks"),
            fetch("/api/structure"),
          ]);

        const docs = await docsResponse.json();
        const tasks = await tasksResponse.json();
        const structure = await structureResponse.json();

        const folderPath = structure.paths.target;
        const folderName = path.basename(folderPath);
        const completedTasks = tasks.filter(
          (task: { completed: boolean }) => task.completed
        ).length;

        setStats({
          folderName,
          folderPath,
          docsCount: docs.length,
          tasksCount: tasks.length,
          completedTasks,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-10 bg-muted/50 rounded-lg w-1/3" />
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-muted/30 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">
            {t("homepage.failedToLoadProject")}
          </h1>
        </div>
      </div>
    );
  }

  const taskProgress =
    stats.tasksCount > 0
      ? Math.round((stats.completedTasks / stats.tasksCount) * 100)
      : 0;

  return (
    <InspectOverlay componentId="homepage">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            {stats.folderName}
          </h1>
          <p className="text-muted-foreground font-mono text-sm bg-muted/30 rounded-lg px-3 py-2 break-all">
            {stats.folderPath}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("homepage.documentation")}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.docsCount}</div>
              <p className="text-xs text-muted-foreground">
                {stats.docsCount === 1
                  ? t("homepage.document")
                  : t("homepage.documents")}{" "}
                found
              </p>
              <div className="mt-4">
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href="/docs">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    {t("homepage.browseDocs")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("homepage.tasks")}
              </CardTitle>
              <ListTodo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tasksCount}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedTasks} {t("homepage.completed")}
              </p>
              <div className="mt-2">
                <Badge variant={taskProgress === 100 ? "default" : "secondary"}>
                  {taskProgress}% {t("homepage.complete")}
                </Badge>
              </div>
              <div className="mt-4">
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href="/tasks">
                    <ListTodo className="h-4 w-4 mr-2" />
                    {t("homepage.viewTasks")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("homepage.quickStart")}
              </CardTitle>
              <div className="h-4 w-4 rounded-sm bg-primary" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t("homepage.newToGition")}
                </p>
                <div className="space-y-2">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    <Link href="/how-to">📖 {t("homepage.howToGuide")}</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    <Link href="/docs">🚀 {t("homepage.exploreDocs")}</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>{t("homepage.gettingStarted")}</CardTitle>
            <CardDescription>{t("homepage.workspaceReady")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">
                  📁 {t("homepage.documentationSection")}
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    • {t("homepage.browseDocuments")}{" "}
                    <strong>{t("homepage.docsTab")}</strong> tab
                  </li>
                  <li>• {t("homepage.useSidebar")}</li>
                  <li>• {t("homepage.createNewFiles")}</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">
                  ✅ {t("homepage.taskManagement")}
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    • {t("homepage.addTasks")}{" "}
                    <code className="bg-muted px-1 py-0.5 rounded text-xs">
                      - [ ] {t("homepage.taskDescription")}
                    </code>{" "}
                    {t("homepage.forIncompleteTasks")}
                  </li>
                  <li>
                    • {t("homepage.markComplete")}{" "}
                    <code className="bg-muted px-1 py-0.5 rounded text-xs">
                      - [x] {t("homepage.done")}
                    </code>{" "}
                    {t("homepage.forCompletedTasks")}
                  </li>
                  <li>
                    • {t("homepage.viewAllTasks")}{" "}
                    <strong>{t("homepage.tasksTab")}</strong> tab
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </InspectOverlay>
  );
}
