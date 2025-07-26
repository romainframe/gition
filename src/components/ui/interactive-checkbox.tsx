"use client";

import { useState } from "react";

import { CheckCircle, Circle, Clock } from "lucide-react";

import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/store/useTaskStore";

export interface InteractiveCheckboxProps {
  taskGroupId: string;
  subtaskId: string;
  status: "todo" | "in_progress" | "done";
  completed: boolean;
  disabled?: boolean;
  className?: string;
}

export function InteractiveCheckbox({
  taskGroupId,
  subtaskId,
  status,
  completed,
  disabled = false,
  className,
}: InteractiveCheckboxProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toggleSubtaskCompleted } = useTaskStore();
  const { t } = useLanguage();

  const handleClick = async () => {
    if (disabled || isUpdating) return;

    setIsUpdating(true);
    try {
      await toggleSubtaskCompleted(taskGroupId, subtaskId);
    } catch (error) {
      console.error("Failed to update subtask:", error);
      // TODO: Show error toast/notification
    } finally {
      setIsUpdating(false);
    }
  };

  const getIcon = () => {
    if (isUpdating) {
      return <Circle className="h-4 w-4 text-muted-foreground animate-pulse" />;
    }

    switch (status) {
      case "done":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isUpdating}
      className={cn(
        "flex-shrink-0 transition-colors duration-200",
        !disabled && !isUpdating && "hover:scale-110 cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      title={
        disabled
          ? t("checkbox.disabled")
          : isUpdating
            ? t("checkbox.updating")
            : completed
              ? t("checkbox.markIncomplete")
              : t("checkbox.markComplete")
      }
    >
      {getIcon()}
    </button>
  );
}
