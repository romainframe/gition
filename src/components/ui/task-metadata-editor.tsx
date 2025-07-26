"use client";

import { useState } from "react";

import { Save, Settings2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/language-context";
import { useTaskStore } from "@/store/useTaskStore";

interface TaskMetadata {
  title?: string;
  description?: string;
  author?: string;
  tags?: string[];
  date?: string;
  priority?: "low" | "medium" | "high";
  assignee?: string;
  due_date?: string;
  estimate?: string;
  [key: string]: string | string[] | undefined;
}

interface TaskMetadataEditorProps {
  taskId: string;
  currentMetadata?: TaskMetadata;
  className?: string;
}

export function TaskMetadataEditor({
  taskId,
  currentMetadata = {},
  className,
}: TaskMetadataEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState<TaskMetadata>(currentMetadata);
  const { updateTaskMetadata } = useTaskStore();
  const { t } = useLanguage();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateTaskMetadata(taskId, metadata);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update task metadata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagsChange = (value: string) => {
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    setMetadata((prev) => ({ ...prev, tags }));
  };

  const handleReset = () => {
    setMetadata(currentMetadata);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-1.5 h-6 px-2 text-xs hover:bg-muted/50 ${className}`}
        >
          <Settings2 className="h-3 w-3 text-muted-foreground" />
          <span className="hidden sm:inline">{t("taskMetadata.edit")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("taskMetadata.editTaskMetadata")}</DialogTitle>
          <DialogDescription>
            {t("taskMetadata.updateFrontmatter")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">{t("taskMetadata.title")}</Label>
            <Input
              id="title"
              value={metadata.title || ""}
              onChange={(e) =>
                setMetadata((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder={t("taskMetadata.taskTitle")}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">{t("taskMetadata.description")}</Label>
            <Textarea
              id="description"
              value={metadata.description || ""}
              onChange={(e) =>
                setMetadata((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder={t("taskMetadata.taskDescription")}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="priority">{t("taskMetadata.priority")}</Label>
              <Select
                value={metadata.priority || ""}
                onValueChange={(value) =>
                  setMetadata((prev) => ({
                    ...prev,
                    priority: value as "low" | "medium" | "high",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("taskMetadata.selectPriority")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t("taskMetadata.low")}</SelectItem>
                  <SelectItem value="medium">
                    {t("taskMetadata.medium")}
                  </SelectItem>
                  <SelectItem value="high">{t("taskMetadata.high")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="author">{t("taskMetadata.author")}</Label>
              <Input
                id="author"
                value={metadata.author || ""}
                onChange={(e) =>
                  setMetadata((prev) => ({ ...prev, author: e.target.value }))
                }
                placeholder={t("taskMetadata.authorName")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="assignee">{t("taskMetadata.assignee")}</Label>
              <Input
                id="assignee"
                value={metadata.assignee || ""}
                onChange={(e) =>
                  setMetadata((prev) => ({ ...prev, assignee: e.target.value }))
                }
                placeholder={t("taskMetadata.assignedTo")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="due_date">{t("taskMetadata.dueDate")}</Label>
              <Input
                id="due_date"
                type="date"
                value={metadata.due_date || ""}
                onChange={(e) =>
                  setMetadata((prev) => ({ ...prev, due_date: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="estimate">{t("taskMetadata.estimate")}</Label>
              <Input
                id="estimate"
                value={metadata.estimate || ""}
                onChange={(e) =>
                  setMetadata((prev) => ({ ...prev, estimate: e.target.value }))
                }
                placeholder="e.g., 2h, 1d, 1w"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">{t("taskMetadata.date")}</Label>
              <Input
                id="date"
                type="date"
                value={metadata.date || ""}
                onChange={(e) =>
                  setMetadata((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tags">{t("taskMetadata.tags")}</Label>
            <Input
              id="tags"
              value={metadata.tags?.join(", ") || ""}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            {t("taskMetadata.reset")}
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading
              ? t("taskMetadata.saving")
              : t("taskMetadata.saveChanges")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
