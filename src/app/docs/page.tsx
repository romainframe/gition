"use client";

import { useEffect } from "react";

import Link from "next/link";

import { CalendarIcon, FileText, TagIcon } from "lucide-react";

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
import { useDocsStore } from "@/store/useDocsStore";

export default function DocsPage() {
  const { docs, isLoading: loading, error, fetchDocs } = useDocsStore();
  const { t } = useLanguage();

  // Register component for inspection
  useComponentInspect({
    componentId: "docs-overview-page",
    name: "DocsPage",
    filePath: "src/app/docs/page.tsx",
    description: "Documentation overview page listing all available documents",
    interfaces: ["DocMetadata", "DocItem"],
    apiDependencies: ["/api/docs"],
    storeDependencies: ["useDocsStore"],
  });

  useEffect(() => {
    if (docs.length === 0) {
      console.log("📚 Fetching docs for docs page");
      fetchDocs();
    }
  }, [docs.length, fetchDocs]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted/50 rounded-lg w-1/4" />
          <div className="h-6 bg-muted/30 rounded-lg w-1/2" />
        </div>
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-40 bg-muted/30 rounded-xl animate-pulse"
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

  if (docs.length === 0) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            {t("docs.title")}
          </h1>
          <p className="text-muted-foreground text-lg">{t("docs.subtitle")}</p>
        </div>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>{t("docs.noDocuments")}</CardTitle>
            <CardDescription>{t("docs.createFiles")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-medium">{t("docs.toAddDocumentation")}</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  {t("docs.createDocsFolder")}{" "}
                  <code className="bg-muted px-1.5 py-0.5 rounded font-mono">
                    docs/
                  </code>{" "}
                  {t("docs.folder")}
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  {t("docs.addFiles")}{" "}
                  <code className="bg-muted px-1.5 py-0.5 rounded font-mono">
                    .md
                  </code>{" "}
                  {t("docs.or")}{" "}
                  <code className="bg-muted px-1.5 py-0.5 rounded font-mono">
                    .mdx
                  </code>{" "}
                  {t("docs.files")}
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  {t("docs.refreshPage")}
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <InspectOverlay componentId="docs-overview-page">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            {t("docs.title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("docs.documentsFound", { count: docs.length })}
          </p>
        </div>

        {/* Documents Grid */}
        <div className="grid gap-6">
          {docs.map((doc) => {
            const title = doc.metadata.title || doc.slug;
            const description = doc.metadata.description || doc.excerpt;
            const tags = doc.metadata.tags || [];
            const date = doc.metadata.date;
            const status = doc.metadata.status;

            return (
              <Card
                key={doc.slug}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <Link
                          href={`/docs/${encodeURIComponent(doc.slug)}`}
                          className="hover:underline"
                        >
                          {title}
                        </Link>
                      </CardTitle>
                      {description && (
                        <CardDescription className="line-clamp-2">
                          {description}
                        </CardDescription>
                      )}
                    </div>

                    {status && (
                      <Badge
                        variant={
                          status === "published"
                            ? "default"
                            : status === "draft"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {status === "published"
                          ? t("docs.published")
                          : status === "draft"
                            ? t("docs.draft")
                            : status === "archived"
                              ? t("docs.archived")
                              : status}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {date && (
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{new Date(date).toLocaleDateString()}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{doc.filename}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <TagIcon className="h-4 w-4 text-muted-foreground" />
                          <div className="flex gap-1">
                            {tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <Button asChild size="sm" variant="outline">
                        <Link href={`/docs/${encodeURIComponent(doc.slug)}`}>
                          {t("docs.read")} →
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </InspectOverlay>
  );
}
