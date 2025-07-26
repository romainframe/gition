"use client";

import { useEffect, useMemo } from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import { ArrowLeft, AlertTriangle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DocumentMetadata } from "@/components/ui/document-metadata";
import { EnhancedMarkdownRenderer } from "@/components/ui/enhanced-markdown-renderer";
import { InspectOverlay } from "@/components/dev/inspect-overlay";
import { useLanguage } from "@/contexts/language-context";
import { useComponentInspect } from "@/hooks/use-inspect";
import { useDocsStore } from "@/store/useDocsStore";

// Helper function to remove first H1 line if it exists
function removeFirstH1(content: string): string {
  const lines = content.split('\n');
  
  // Skip frontmatter if it exists
  let startIndex = 0;
  if (lines[0] && lines[0].trim() === '---') {
    // Find the closing ---
    for (let i = 1; i < lines.length; i++) {
      if (lines[i] && lines[i].trim() === '---') {
        startIndex = i + 1;
        break;
      }
    }
  }
  
  // Look for the first H1 after frontmatter
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('# ')) {
      // Remove this line and return the content
      return [...lines.slice(0, i), ...lines.slice(i + 1)].join('\n');
    }
    // If we encounter non-empty content that's not an H1, stop looking
    if (line && !line.startsWith('#')) {
      break;
    }
  }
  
  return content;
}

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

  // Register component for inspection
  useComponentInspect({
    componentId: "doc-detail-page",
    name: "DocPage",
    filePath: "src/app/docs/[slug]/page.tsx",
    description: "Documentation detail page with markdown content rendering",
    interfaces: ["DocMetadata", "DocContent"],
    apiDependencies: ["/api/docs"],
    storeDependencies: ["useDocsStore"],
  });

  useEffect(() => {
    if (!slug) {
      return;
    }

    // Fetch all docs if we don't have them
    if (docs.length === 0) {
      fetchDocs();
    }
  }, [slug, docs.length, fetchDocs, doc?.slug]);

  // Handle scroll restoration for navigation
  useEffect(() => {
    if (!slug) return;

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
  const { title, description, processedContent } = useMemo(() => {
    if (!doc)
      return {
        title: "",
        description: "",
        processedContent: "",
      };

    const title = doc.metadata.title || doc.slug;
    const description = doc.metadata.description || doc.excerpt;

    // Strip first H1 to avoid duplication with header title
    const processedContent = removeFirstH1(doc.content);

    return {
      title,
      description,
      processedContent,
    };
  }, [doc]);


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
    <InspectOverlay componentId="doc-detail-page">
      <div className="flex flex-col h-[calc(100vh-6rem)]">
        {/* Fixed Info Section */}
        <div className="flex-shrink-0 space-y-6 pb-3 border-b border-border/40">
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
          <div className="space-y-4">
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

            {/* Enhanced Metadata Display */}
            <DocumentMetadata 
              metadata={doc.metadata} 
              filename={doc.filename}
              showExtended={false}
            />

            {/* Metadata Alerts */}
            {!doc.metadata && (
              <Alert variant="destructive" className="bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No metadata found. Add frontmatter to this file for better organization.
                </AlertDescription>
              </Alert>
            )}

            {doc.metadata && !doc.metadata.title && (
              <Alert variant="destructive" className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No title found in metadata. Add a &quot;title&quot; field to the frontmatter.
                </AlertDescription>
              </Alert>
            )}

          </div>
        </div>

        {/* Scrollable Content Section */}
        <div className="flex-1 overflow-auto no-scrollbar pt-3">
          <EnhancedMarkdownRenderer 
            content={processedContent}
            className="max-w-none"
          />
        </div>
      </div>
    </InspectOverlay>
  );
}
