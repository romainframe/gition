"use client";

import { useState } from "react";

import { Check, CheckCircle, ChevronDown, Circle, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/store/useTaskStore";

export interface StatusEditorProps {
  taskGroupId: string;
  subtaskId: string;
  currentStatus: "todo" | "in_progress" | "done";
  disabled?: boolean;
  className?: string;
}

const statusOptions = [
  {
    value: "todo" as const,
    label: "To Do",
    icon: Circle,
    color: "text-muted-foreground",
    bgColor: "hover:bg-muted/50",
  },
  {
    value: "in_progress" as const,
    label: "In Progress",
    icon: Clock,
    color: "text-orange-500",
    bgColor: "hover:bg-orange-50",
  },
  {
    value: "done" as const,
    label: "Done",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "hover:bg-green-50",
  },
];

export function StatusEditor({
  taskGroupId,
  subtaskId,
  currentStatus,
  disabled = false,
  className,
}: StatusEditorProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateSubtaskStatus } = useTaskStore();

  const currentOption = statusOptions.find(
    (option) => option.value === currentStatus
  );

  const handleStatusChange = async (
    newStatus: "todo" | "in_progress" | "done"
  ) => {
    if (disabled || isUpdating || newStatus === currentStatus) return;

    setIsUpdating(true);
    try {
      await updateSubtaskStatus(taskGroupId, subtaskId, newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
      // TODO: Show error toast/notification
    } finally {
      setIsUpdating(false);
    }
  };

  if (!currentOption) {
    return null;
  }

  const IconComponent = currentOption.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled || isUpdating}
          className={cn(
            "h-auto p-1 gap-1.5 text-xs font-medium",
            currentOption.color,
            currentOption.bgColor,
            isUpdating && "opacity-50",
            className
          )}
        >
          <IconComponent className="h-3 w-3" />
          <span>{currentOption.label}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        {statusOptions.map((option) => {
          const OptionIcon = option.icon;
          const isSelected = option.value === currentStatus;

          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                option.bgColor,
                isSelected && "bg-accent"
              )}
            >
              <OptionIcon className={cn("h-4 w-4", option.color)} />
              <span>{option.label}</span>
              {isSelected && <Check className="h-3 w-3 ml-auto" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
