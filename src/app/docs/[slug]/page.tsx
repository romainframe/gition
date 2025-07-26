"use client";

import { useEffect, useMemo } from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import { ArrowLeft, Calendar, FileText, Tag, User } from "lucide-react";
import { marked } from "marked";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/language-context";
import { useDocsStore } from "@/store/useDocsStore";

export default function DocPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug)
    ? params.slug.join("/")
    : params?.slug;
  const {
    docs,
    isLoading: loading,
    error,
    fetchDocs,
    getDocBySlug,
  } = useDocsStore();
  const { t } = useLanguage();

  // Get the specific document from the docs array
  const doc = getDocBySlug(slug || "");

  useEffect(() => {
    console.log("📄 DocPage - useEffect triggered");
    console.log("📄 Current slug:", slug);
    console.log("📄 Current doc:", doc?.slug);
    console.log("📄 Docs length:", docs.length);

    if (!slug) {
      console.log("📄 No slug provided");
      return;
    }

    // Fetch all docs if we don't have them
    if (docs.length === 0) {
      console.log("📄 No docs loaded, fetching all docs first");
      fetchDocs();
    }
  }, [slug, docs.length, fetchDocs]);

  // Handle scroll restoration for navigation
  useEffect(() => {
    if (!slug) return;

    console.log("📄 Setting up scroll handling for:", slug);

    // Set scroll restoration to manual to handle it ourselves
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const handleScroll = () => {
      sessionStorage.setItem(`scroll-${slug}`, window.scrollY.toString());
    };

    window.addEventListener("scroll", handleScroll);

    // Preserve scroll position for browser back/forward
    (
      window as Window & { __preserveScrollPosition?: boolean }
    ).__preserveScrollPosition = true;

    // Also restore from sessionStorage on mount
    const savedScroll = sessionStorage.getItem(`scroll-${slug}`);
    if (savedScroll && parseFloat(savedScroll) > 0) {
      setTimeout(() => {
        window.scrollTo({ top: parseFloat(savedScroll), behavior: "instant" });
      }, 100);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      delete (window as Window & { __preserveScrollPosition?: boolean })
        .__preserveScrollPosition;
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "auto";
      }
    };
  }, [slug]);

  // Process doc data with useMemo - must be called unconditionally
  const { title, description, tags, date, author, status, processedContent } =
    useMemo(() => {
      if (!doc)
        return {
          title: "",
          description: "",
          tags: [],
          date: "",
          author: "",
          status: "",
          processedContent: "",
        };

      const title = doc.metadata.title || doc.slug;
      const description = doc.metadata.description || doc.excerpt;
      const tags = doc.metadata.tags || [];
      const date = doc.metadata.date;
      const author = doc.metadata.author;
      const status = doc.metadata.status;

      // Strip first H1 if there's a title in frontmatter to avoid duplication
      const processedContent = doc.metadata.title
        ? doc.content.replace(/^#\s+.*$/m, "")
        : doc.content;

      return {
        title,
        description,
        tags,
        date,
        author,
        status,
        processedContent,
      };
    }, [doc]);

  useEffect(() => {
    console.log("📄 DocPage rendered with:", {
      slug,
      hasDoc: !!doc,
      docSlug: doc?.slug,
      loading,
      error,
      title,
    });
  });

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted/50 rounded w-24" />
          <div className="h-10 bg-muted/50 rounded w-2/3" />
          <div className="h-4 bg-muted/30 rounded w-1/2" />
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-muted/30 rounded w-full" />
          <div className="h-4 bg-muted/30 rounded w-5/6" />
          <div className="h-4 bg-muted/30 rounded w-4/5" />
        </div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{t("docs.documentNotFound")}</h1>
          <p className="text-muted-foreground">
            {error || t("docs.documentNotFoundMessage")}
          </p>
          <Button asChild>
            <Link href="/docs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("docs.backToDocumentation")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Navigation */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/docs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("docs.backToDocumentation")}
          </Link>
        </Button>
      </div>

      {/* Document Header */}
      <div className="space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight leading-tight">
            {title}
          </h1>

          {description && (
            <p className="text-xl text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(date).toLocaleDateString()}</span>
            </div>
          )}

          {author && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{author}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>{doc.filename}</span>
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

        {/* Debug button for testing */}
        <Button
          onClick={() => {
            console.log("🔄 Manual refresh triggered");
            fetchDocs();
          }}
          variant="outline"
          size="sm"
        >
          🔄 Manual Refresh (Debug)
        </Button>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Document Content */}
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: marked(processedContent) }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
