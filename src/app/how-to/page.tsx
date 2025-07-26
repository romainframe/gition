"use client";

import {
  CheckCircle,
  FileText,
  FolderOpen,
  ListTodo,
  Terminal,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/language-context";

export default function HowToPage() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          {t("howTo.title")}
        </h1>
        <p className="text-muted-foreground text-xl leading-relaxed">
          {t("howTo.subtitle")}
        </p>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            {t("howTo.quickStart")}
          </CardTitle>
          <CardDescription>{t("howTo.quickStartDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <Badge className="mt-1">1</Badge>
              <div>
                <p className="font-medium">{t("howTo.step1")}</p>
                <code className="text-sm bg-muted px-2 py-1 rounded mt-1 block">
                  cd your-project-folder
                </code>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge className="mt-1">2</Badge>
              <div>
                <p className="font-medium">{t("howTo.step2")}</p>
                <code className="text-sm bg-muted px-2 py-1 rounded mt-1 block">
                  npx gition
                </code>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge className="mt-1">3</Badge>
              <div>
                <p className="font-medium">{t("howTo.step3")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("howTo.step3Description")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* CLI Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            {t("howTo.cliOptions")}
          </CardTitle>
          <CardDescription>{t("howTo.cliOptionsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-3">
              <div>
                <code className="text-sm font-mono bg-muted px-3 py-2 rounded block">
                  gition [directory]
                </code>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("howTo.serveDirectory")}
                </p>
              </div>

              <div>
                <code className="text-sm font-mono bg-muted px-3 py-2 rounded block">
                  gition --port 8080
                </code>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("howTo.customPort")}
                </p>
              </div>

              <div>
                <code className="text-sm font-mono bg-muted px-3 py-2 rounded block">
                  gition --no-open
                </code>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("howTo.noOpen")}
                </p>
              </div>

              <div>
                <code className="text-sm font-mono bg-muted px-3 py-2 rounded block">
                  gition ~/my-docs --port 4000 --no-open
                </code>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("howTo.combineOptions")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("howTo.workingWithDocs")}
          </CardTitle>
          <CardDescription>
            {t("howTo.workingWithDocsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">
                {t("howTo.directoryStructure")}
              </h4>
              <div className="bg-muted p-4 rounded font-mono text-sm">
                <div>your-project/</div>
                <div className="ml-4">├── docs/</div>
                <div className="ml-8">│ ├── getting-started.md</div>
                <div className="ml-8">│ ├── api-reference.md</div>
                <div className="ml-8">│ └── guides/</div>
                <div className="ml-12">│ └── advanced.md</div>
                <div className="ml-4">└── tasks/</div>
                <div className="ml-8">└── project-tasks.md</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">
                {t("howTo.documentMetadata")}
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                {t("howTo.documentMetadataDescription")}
              </p>
              <div className="bg-muted p-4 rounded font-mono text-sm">
                <div>---</div>
                <div>title: &quot;Getting Started Guide&quot;</div>
                <div>description: &quot;Learn the basics&quot;</div>
                <div>type: &quot;guide&quot;</div>
                <div>category: &quot;documentation&quot;</div>
                <div>tags: [&quot;guide&quot;, &quot;beginner&quot;]</div>
                <div>author: &quot;Development Team&quot;</div>
                <div>created: &quot;2024-01-15&quot;</div>
                <div>status: &quot;published&quot;</div>
                <div>version: &quot;1.0.0&quot;</div>
                <div>---</div>
                <div className="mt-2"># Your content here...</div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                <strong>{t("howTo.availableFields")}</strong> title,
                description, type, category, tags, author, created, updated,
                status, version, language, section, order
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">{t("howTo.fileTypes")}</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <code>.md</code> - {t("howTo.standardMarkdown")}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <code>.mdx</code> - {t("howTo.markdownWithJsx")}
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            {t("howTo.taskManagement")}
          </CardTitle>
          <CardDescription>
            {t("howTo.taskManagementDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">
                {t("howTo.twoLevelStructure")}
              </h4>
              <div className="bg-blue-50 border border-blue-200 p-3 rounded mb-3 text-sm">
                <strong>{t("howTo.importantNote")}</strong>{" "}
                {t("howTo.twoLevelHierarchy")}
                <ul className="mt-2 space-y-1 text-xs">
                  <li>
                    • <strong>Tasks</strong> = {t("howTo.tasksAreMdxFiles")}
                  </li>
                  <li>
                    • <strong>Subtasks</strong> ={" "}
                    {t("howTo.subtasksAreCheckboxes")}
                  </li>
                </ul>
              </div>

              <h5 className="font-medium mb-2 text-sm">
                {t("howTo.creatingSubtasks")}
              </h5>
              <p className="text-sm text-muted-foreground mb-3">
                {t("howTo.creatingSubtasksDescription")}
              </p>
              <div className="bg-muted p-4 rounded font-mono text-sm space-y-1">
                <div>## Epic: User Authentication</div>
                <div></div>
                <div>- [ ] Incomplete subtask</div>
                <div>- [x] Completed subtask</div>
                <div>- [~] In progress subtask</div>
                <div>
                  - [ ] Subtask with metadata{" "}
                  {`{priority: "high", assignee: "john"}`}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">
                {t("howTo.taskFileMetadata")}
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                {t("howTo.taskFileMetadataDescription")}
              </p>
              <div className="bg-muted p-4 rounded font-mono text-sm space-y-1">
                <div>---</div>
                <div>title: &quot;User Authentication Epic&quot;</div>
                <div>type: &quot;epic&quot;</div>
                <div>priority: &quot;high&quot;</div>
                <div>assignee: &quot;backend-team&quot;</div>
                <div>due: &quot;2024-02-15&quot;</div>
                <div>---</div>
              </div>

              <h5 className="font-medium mb-2 text-sm mt-4">
                {t("howTo.subtaskInlineMetadata")}
              </h5>
              <p className="text-sm text-muted-foreground mb-3">
                {t("howTo.subtaskInlineMetadataDescription")}
              </p>
              <div className="bg-muted p-4 rounded font-mono text-sm space-y-1">
                <div>- [ ] High priority subtask {`{priority: "high"}`}</div>
                <div>
                  - [ ] Assigned subtask{" "}
                  {`{assignee: "alice", due: "2024-02-01"}`}
                </div>
                <div>- [ ] Tagged subtask {`{tags: ["frontend", "ui"]}`}</div>
                <div>
                  - [ ] Estimated subtask {`{estimate: 4, status: "blocked"}`}
                </div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                <strong>{t("howTo.subtaskFields")}</strong> priority, assignee,
                due, tags, estimate, status
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">
                {t("howTo.subtaskReferences")}
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                {t("howTo.subtaskReferencesDescription")}
              </p>
              <div className="bg-muted p-4 rounded font-mono text-sm space-y-1">
                <div>
                  - [ ] Complete user auth ref:epics/user-authentication
                </div>
                <div>- [ ] Review login form ref:stories/login-ui</div>
                <div>- [ ] Update docs ref:docs/api-guide</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">
                {t("howTo.taskFileOrganization")}
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                {t("howTo.taskFileOrganizationDescription")}
              </p>
              <div className="bg-muted p-4 rounded font-mono text-sm">
                <div>tasks/</div>
                <div className="ml-4">├── epics/</div>
                <div className="ml-8">
                  │ ├── user-authentication.mdx ← Task file
                </div>
                <div className="ml-8">│ └── payment-system.mdx ← Task file</div>
                <div className="ml-4">├── stories/</div>
                <div className="ml-8">│ ├── login-form.mdx ← Task file</div>
                <div className="ml-8">│ └── checkout-flow.mdx ← Task file</div>
                <div className="ml-4">└── docs/</div>
                <div className="ml-8">└── api-guide.mdx ← Task file</div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                {t("howTo.eachMdxFileNote")}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">{t("howTo.taskViews")}</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <FolderOpen className="h-4 w-4 mt-0.5 text-blue-500" />
                  <div>
                    <strong>{t("howTo.taskList")}</strong>{" "}
                    {t("howTo.taskListDescription")}
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <ListTodo className="h-4 w-4 mt-0.5 text-orange-500" />
                  <div>
                    <strong>{t("howTo.kanbanBoard")}</strong>{" "}
                    {t("howTo.kanbanBoardDescription")}
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                  <div>
                    <strong>{t("howTo.taskDetails")}</strong>{" "}
                    {t("howTo.taskDetailsDescription")}
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">
                {t("howTo.advancedFeatures")}
              </h4>
              <ul className="text-sm space-y-1">
                <li>
                  • <strong>Progress Tracking:</strong>{" "}
                  {t("howTo.progressTracking")}
                </li>
                <li>
                  • <strong>Cross-References:</strong>{" "}
                  {t("howTo.crossReferences")}
                </li>
                <li>
                  • <strong>MDX Rendering:</strong> {t("howTo.mdxRendering")}
                </li>
                <li>
                  • <strong>Real-time Updates:</strong>{" "}
                  {t("howTo.realTimeUpdates")}
                </li>
                <li>
                  • <strong>Metadata Validation:</strong>{" "}
                  {t("howTo.metadataValidation")}
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Tips & Tricks */}
      <Card>
        <CardHeader>
          <CardTitle>{t("howTo.tipsAndTricks")}</CardTitle>
          <CardDescription>{t("howTo.tipsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">{t("howTo.navigation")}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t("howTo.useSidebarToBrowse")}</li>
                <li>• {t("howTo.clickDocumentTitles")}</li>
                <li>• {t("howTo.navigateBetweenSections")}</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">{t("howTo.organization")}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t("howTo.createFoldersToGroup")}</li>
                <li>• {t("howTo.useDescriptiveFileNames")}</li>
                <li>• {t("howTo.addTagsInFrontmatter")}</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">{t("howTo.productivity")}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t("howTo.checkHomepageForOverview")}</li>
                <li>• {t("howTo.useTaskCompletionTracking")}</li>
                <li>• {t("howTo.keepCliRunning")}</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">{t("howTo.customization")}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t("howTo.runOnCustomPorts")}</li>
                <li>• {t("howTo.serveAnyDirectory")}</li>
                <li>• {t("howTo.useDifferentFolderStructures")}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
