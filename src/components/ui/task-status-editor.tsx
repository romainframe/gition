"use client";

import { useState } from "react";

import { CheckCircle, Circle, Clock, Edit3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTaskStore } from "@/store/useTaskStore";

interface TaskStatusEditorProps {
  taskId: string;
  currentStatus?:
    | "todo"
    | "in_progress"
    | "done"
    | "draft"
    | "published"
    | "archived";
  className?: string;
}

const statusOptions = [
  {
    value: "todo",
    label: "To Do",
    icon: Circle,
    color: "text-muted-foreground",
  },
  {
    value: "in_progress",
    label: "In Progress",
    icon: Clock,
    color: "text-orange-500",
  },
  { value: "done", label: "Done", icon: CheckCircle, color: "text-green-600" },
  { value: "draft", label: "Draft", icon: Edit3, color: "text-gray-500" },
  {
    value: "published",
    label: "Published",
    icon: CheckCircle,
    color: "text-blue-600",
  },
  {
    value: "archived",
    label: "Archived",
    icon: Circle,
    color: "text-gray-400",
  },
];

export function TaskStatusEditor({
  taskId,
  currentStatus = "todo",
  className,
}: TaskStatusEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { updateTaskStatus } = useTaskStore();

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus || isLoading) return;

    setIsLoading(true);
    try {
      // Only call updateTaskStatus for document statuses
      if (["draft", "published", "archived"].includes(newStatus)) {
        await updateTaskStatus(
          taskId,
          newStatus as "draft" | "published" | "archived"
        );
      }
      // TODO: Add handling for task statuses (todo, in_progress, done)
    } catch (error) {
      console.error("Failed to update task status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentOption =
    statusOptions.find((option) => option.value === currentStatus) ||
    statusOptions[0];
  const CurrentIcon = currentOption.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-1.5 h-6 px-2 text-xs hover:bg-muted/50 ${className}`}
          disabled={isLoading}
        >
          <CurrentIcon className={`h-3 w-3 ${currentOption.color}`} />
          <span className="hidden sm:inline">{currentOption.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[160px]">
        {statusOptions.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className="flex items-center gap-2 cursor-pointer"
              disabled={isLoading || option.value === currentStatus}
            >
              <Icon className={`h-4 w-4 ${option.color}`} />
              <span>{option.label}</span>
              {option.value === currentStatus && (
                <span className="ml-auto text-xs text-muted-foreground">•</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
