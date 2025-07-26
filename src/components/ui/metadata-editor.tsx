"use client";

import { useState } from "react";

import { Calendar, Flag, Hash, Settings, Timer, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/store/useTaskStore";

export interface MetadataEditorProps {
  taskGroupId: string;
  subtaskId: string;
  currentMetadata?: {
    priority?: "low" | "medium" | "high";
    due_date?: string;
    assignee?: string;
    tags?: string[];
    estimate?: number;
    status?: "blocked" | "waiting" | "review";
  };
  disabled?: boolean;
  className?: string;
}

export function MetadataEditor({
  taskGroupId,
  subtaskId,
  currentMetadata = {},
  disabled = false,
  className,
}: MetadataEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [metadata, setMetadata] = useState(currentMetadata);
  const [newTag, setNewTag] = useState("");
  const { updateSubtaskMetadata } = useTaskStore();
  const { t } = useLanguage();

  const handleSave = async () => {
    if (disabled || isUpdating) return;

    setIsUpdating(true);
    try {
      // Clean up empty values
      const cleanedMetadata = Object.fromEntries(
        Object.entries(metadata).filter(([, value]) => {
          if (Array.isArray(value)) return value.length > 0;
          return value !== undefined && value !== null && value !== "";
        })
      );

      await updateSubtaskMetadata(taskGroupId, subtaskId, cleanedMetadata);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update metadata:", error);
      // TODO: Show error toast/notification
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !metadata.tags?.includes(newTag.trim())) {
      setMetadata((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setMetadata((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={cn(
            "h-6 w-6 p-0 text-muted-foreground hover:text-foreground",
            className
          )}
        >
          <Settings className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("taskMetadata.editTaskMetadata")}</DialogTitle>
          <DialogDescription>
            {t("taskMetadata.updateSubtaskMetadata")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Priority */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              {t("taskMetadata.priority")}
            </Label>
            <Select
              value={metadata.priority || ""}
              onValueChange={(value) =>
                setMetadata((prev) => ({
                  ...prev,
                  priority: value as "low" | "medium" | "high" | undefined,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("taskMetadata.selectPriority")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("taskMetadata.none")}</SelectItem>
                <SelectItem value="low">{t("taskMetadata.low")}</SelectItem>
                <SelectItem value="medium">
                  {t("taskMetadata.medium")}
                </SelectItem>
                <SelectItem value="high">{t("taskMetadata.high")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t("taskMetadata.assignee")}
            </Label>
            <Input
              placeholder={t("taskMetadata.enterAssigneeName")}
              value={metadata.assignee || ""}
              onChange={(e) =>
                setMetadata((prev) => ({
                  ...prev,
                  assignee: e.target.value || undefined,
                }))
              }
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t("taskMetadata.dueDate")}
            </Label>
            <Input
              type="date"
              value={metadata.due_date || ""}
              onChange={(e) =>
                setMetadata((prev) => ({
                  ...prev,
                  due_date: e.target.value || undefined,
                }))
              }
            />
          </div>

          {/* Estimate */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              {t("taskMetadata.estimateHours")}
            </Label>
            <Input
              type="number"
              min="0"
              step="0.5"
              placeholder="0"
              value={metadata.estimate || ""}
              onChange={(e) =>
                setMetadata((prev) => ({
                  ...prev,
                  estimate: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </div>

          {/* Additional Status */}
          <div className="space-y-2">
            <Label>{t("taskMetadata.additionalStatus")}</Label>
            <Select
              value={metadata.status || ""}
              onValueChange={(value) =>
                setMetadata((prev) => ({
                  ...prev,
                  status: value as "blocked" | "waiting" | "review" | undefined,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("taskMetadata.selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("taskMetadata.none")}</SelectItem>
                <SelectItem value="blocked">
                  {t("taskMetadata.blocked")}
                </SelectItem>
                <SelectItem value="waiting">
                  {t("taskMetadata.waiting")}
                </SelectItem>
                <SelectItem value="review">
                  {t("taskMetadata.review")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              {t("taskMetadata.tags")}
            </Label>
            <div className="flex flex-wrap gap-1 mb-2">
              {metadata.tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder={t("taskMetadata.addTag")}
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button onClick={handleAddTag} disabled={!newTag.trim()}>
                {t("taskMetadata.add")}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {t("taskMetadata.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating
              ? t("taskMetadata.saving")
              : t("taskMetadata.saveChanges")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
