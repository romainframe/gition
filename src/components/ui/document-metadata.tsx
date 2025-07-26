"use client";

import { VariantProps } from "class-variance-authority";
import {
  BookOpen,
  Calendar,
  Clock,
  FileText,
  GitBranch,
  Globe,
  Hash,
  Layers,
  MapPin,
  Star,
  Tag,
  Target,
  User,
  Users,
  Zap,
} from "lucide-react";

import { Badge, badgeVariants } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface DocumentMetadata {
  title?: string;
  description?: string;
  type?: string;
  category?: string;
  tags?: string[];
  author?: string;
  contributors?: string[];
  created?: string;
  updated?: string;
  lastModified?: string;
  status?: string;
  version?: string;
  language?: string;
  section?: string;
  order?: number;
  priority?: "low" | "medium" | "high";
  difficulty?: "beginner" | "intermediate" | "advanced";
  readingTime?: number;
  wordCount?: number;
  reviewers?: string[];
  approvedBy?: string;
  publishedDate?: string;
  expiryDate?: string;
  dependencies?: string[];
  relatedDocs?: string[];
  audience?: string[];
  [key: string]: unknown;
}

interface DocumentMetadataProps {
  metadata: DocumentMetadata;
  filename?: string;
  className?: string;
  showExtended?: boolean;
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

function getPriorityColor(priority?: string): string {
  switch (priority) {
    case "high":
      return "destructive";
    case "medium":
      return "default";
    case "low":
      return "secondary";
    default:
      return "outline";
  }
}

function getDifficultyColor(difficulty?: string): string {
  switch (difficulty) {
    case "beginner":
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    case "intermediate":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
    case "advanced":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
  }
}

function getStatusColor(status?: string): string {
  switch (status) {
    case "published":
      return "default";
    case "draft":
      return "secondary";
    case "archived":
      return "outline";
    case "review":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    case "approved":
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    default:
      return "outline";
  }
}

export function DocumentMetadata({
  metadata,
  filename,
  className,
  showExtended = false,
}: DocumentMetadataProps) {
  const coreFields = [
    "title",
    "description",
    "author",
    "created",
    "updated",
    "lastModified",
    "status",
    "tags",
  ];

  const extendedFields = Object.keys(metadata).filter(
    (key) => !coreFields.includes(key) && metadata[key] != null
  );

  const hasExtendedFields = extendedFields.length > 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Core Metadata */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Info */}
        {metadata.author && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Author:</span>
            <span className="font-medium">{metadata.author}</span>
          </div>
        )}

        {filename && (
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">File:</span>
            <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
              {filename}
            </code>
          </div>
        )}

        {metadata.type && (
          <div className="flex items-center gap-2 text-sm">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Type:</span>
            <Badge variant="outline" className="text-xs">
              {metadata.type}
            </Badge>
          </div>
        )}

        {metadata.category && (
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Category:</span>
            <Badge variant="outline" className="text-xs">
              {metadata.category}
            </Badge>
          </div>
        )}

        {metadata.status && (
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Status:</span>
            <Badge
              variant={
                getStatusColor(metadata.status) as VariantProps<
                  typeof badgeVariants
                >["variant"]
              }
              className="text-xs"
            >
              {metadata.status}
            </Badge>
          </div>
        )}

        {metadata.priority && (
          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Priority:</span>
            <Badge
              variant={
                getPriorityColor(metadata.priority) as VariantProps<
                  typeof badgeVariants
                >["variant"]
              }
              className="text-xs"
            >
              {metadata.priority}
            </Badge>
          </div>
        )}

        {/* Dates */}
        {(metadata.created || metadata.publishedDate) && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Created:</span>
            <span className="font-medium">
              {formatDate(metadata.created || metadata.publishedDate!)}
            </span>
          </div>
        )}

        {(metadata.updated || metadata.lastModified) && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Updated:</span>
            <span className="font-medium">
              {formatDate(metadata.updated || metadata.lastModified!)}
            </span>
          </div>
        )}

        {metadata.version && (
          <div className="flex items-center gap-2 text-sm">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Version:</span>
            <Badge variant="outline" className="text-xs font-mono">
              {metadata.version}
            </Badge>
          </div>
        )}

        {metadata.language && (
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Language:</span>
            <Badge variant="outline" className="text-xs">
              {metadata.language}
            </Badge>
          </div>
        )}

        {metadata.difficulty && (
          <div className="flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Difficulty:</span>
            <Badge
              className={cn("text-xs", getDifficultyColor(metadata.difficulty))}
            >
              {metadata.difficulty}
            </Badge>
          </div>
        )}

        {metadata.readingTime && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Reading time:</span>
            <span className="font-medium">{metadata.readingTime} min</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {metadata.tags && metadata.tags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span>Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {metadata.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Hash className="h-2 w-2 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Contributors */}
      {metadata.contributors && metadata.contributors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>Contributors</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {metadata.contributors.map((contributor) => (
              <Badge key={contributor} variant="secondary" className="text-xs">
                <User className="h-2 w-2 mr-1" />
                {contributor}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Related Documents */}
      {metadata.relatedDocs && metadata.relatedDocs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span>Related Documents</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {metadata.relatedDocs.map((doc) => (
              <Badge key={doc} variant="outline" className="text-xs">
                <MapPin className="h-2 w-2 mr-1" />
                {doc}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Extended Metadata */}
      {showExtended && hasExtendedFields && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Extended Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {extendedFields.map((key) => {
                  const value = metadata[key];
                  if (value == null) return null;

                  return (
                    <div key={key} className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground min-w-0 flex-shrink-0 capitalize">
                        {key.replace(/([A-Z])/g, " $1").toLowerCase()}:
                      </span>
                      <span className="font-medium break-words">
                        {Array.isArray(value)
                          ? value.join(", ")
                          : String(value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
