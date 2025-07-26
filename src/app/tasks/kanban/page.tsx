"use client";

import { Suspense, useCallback, useEffect, useState } from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  Flag,
  Tag,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetadataEditor } from "@/components/ui/metadata-editor";
import { StatusEditor } from "@/components/ui/status-editor";
import { useLanguage } from "@/contexts/language-context";
import type { KanbanBoard, KanbanColumn, SubTask } from "@/models";
import { useTaskStore } from "@/store/useTaskStore";

function DraggableTaskCard({ task }: { task: SubTask }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-orange-500";
      case "low":
        return "text-green-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "in_progress":
        return <Clock className="h-3 w-3 text-orange-500" />;
      default:
        return <Circle className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium leading-tight line-clamp-2">
            {task.title}
          </CardTitle>
          <div className="flex items-center gap-1 flex-shrink-0">
            {task.metadata?.priority && (
              <Flag
                className={`h-3 w-3 ${getPriorityColor(task.metadata.priority)}`}
              />
            )}
            {getStatusIcon(task.status)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Metadata */}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {task.metadata?.assignee && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{task.metadata.assignee}</span>
            </div>
          )}

          {task.metadata?.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(task.metadata.due_date).toLocaleDateString()}
              </span>
            </div>
          )}

          <span>L{task.line}</span>
        </div>

        {/* Tags */}
        {task.metadata?.tags && task.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.metadata.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs h-5 px-1">
                <Tag className="h-2 w-2 mr-1" />
                {tag}
              </Badge>
            ))}
            {task.metadata.tags.length > 3 && (
              <Badge variant="outline" className="text-xs h-5 px-1">
                +{task.metadata.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* References */}
        {task.references && task.references.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.references.slice(0, 2).map((ref) => (
              <Badge key={ref} variant="secondary" className="text-xs h-5 px-1">
                {ref.split("/").pop()}
              </Badge>
            ))}
            {task.references.length > 2 && (
              <Badge variant="secondary" className="text-xs h-5 px-1">
                +{task.references.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <StatusEditor
              taskGroupId={task.file}
              subtaskId={task.id}
              currentStatus={task.status}
              className="h-6 w-6"
            />
            <MetadataEditor
              taskGroupId={task.file}
              subtaskId={task.id}
              currentMetadata={task.metadata}
              className="h-6 w-6"
            />
          </div>

          {task.metadata?.estimate && (
            <Badge variant="outline" className="text-xs">
              {task.metadata.estimate}h
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanColumn({ column }: { column: KanbanColumn }) {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const getColumnColor = (columnId: string) => {
    switch (columnId) {
      case "todo":
        return "border-l-gray-400";
      case "in_progress":
        return "border-l-orange-400";
      case "done":
        return "border-l-green-400";
      default:
        return "border-l-gray-300";
    }
  };

  const getColumnIcon = (columnId: string) => {
    switch (columnId) {
      case "todo":
        return <Circle className="h-4 w-4 text-gray-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "done":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="flex flex-col w-80 max-h-[calc(100vh-12rem)]">
      {/* Column Header */}
      <div
        className={`bg-background border-l-4 ${getColumnColor(column.id)} p-4 rounded-t-lg border border-b-0`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getColumnIcon(column.id)}
            <h3 className="font-semibold text-lg">{column.title}</h3>
          </div>
          <Badge variant="secondary" className="text-sm">
            {column.tasks.length}
          </Badge>
        </div>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className="flex-1 bg-muted/30 border border-t-0 rounded-b-lg p-4 overflow-y-auto no-scrollbar"
      >
        <SortableContext
          items={column.tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {column.tasks.map((task) => (
              <DraggableTaskCard key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>

        {column.tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanPageContent() {
  const [kanbanBoard, setKanbanBoard] = useState<KanbanBoard | null>(null);
  const [activeTask, setActiveTask] = useState<SubTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const groupId = searchParams?.get("group");

  const { taskGroups, fetchTaskGroups } = useTaskStore();
  const { t } = useLanguage();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch kanban board data
  useEffect(() => {
    fetchTaskGroups();
  }, [fetchTaskGroups]);

  const fetchKanbanBoard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        groupId
          ? `/api/tasks/kanban?group=${encodeURIComponent(groupId)}`
          : "/api/tasks/kanban"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch kanban board");
      }

      const data = await response.json();
      setKanbanBoard(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching kanban board:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load kanban board"
      );
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchKanbanBoard();
  }, [groupId, fetchKanbanBoard]);

  // Refresh when taskGroups change
  useEffect(() => {
    if (taskGroups.length > 0) {
      fetchKanbanBoard();
    }
  }, [taskGroups, fetchKanbanBoard]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    // Find the task being dragged
    const task = kanbanBoard?.columns
      .flatMap((col) => col.tasks)
      .find((task) => task.id === active.id);

    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);

    if (!over || !kanbanBoard) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the task being moved
    const task = kanbanBoard.columns
      .flatMap((col) => col.tasks)
      .find((task) => task.id === activeId);

    if (!task) return;

    // Find source and destination columns
    const sourceColumn = kanbanBoard.columns.find((col) =>
      col.tasks.some((task) => task.id === activeId)
    );

    const destColumn = kanbanBoard.columns.find(
      (col) => col.id === overId || col.tasks.some((task) => task.id === overId)
    );

    if (!sourceColumn || !destColumn) return;

    // If dropping on the same column, just reorder
    if (sourceColumn.id === destColumn.id) {
      const columnIndex = kanbanBoard.columns.findIndex(
        (col) => col.id === sourceColumn.id
      );
      const taskIndex = sourceColumn.tasks.findIndex(
        (task) => task.id === activeId
      );
      const overTaskIndex = destColumn.tasks.findIndex(
        (task) => task.id === overId
      );

      if (taskIndex !== overTaskIndex) {
        const newTasks = arrayMove(
          sourceColumn.tasks,
          taskIndex,
          overTaskIndex
        );

        const newColumns = [...kanbanBoard.columns];
        newColumns[columnIndex] = { ...sourceColumn, tasks: newTasks };

        setKanbanBoard({ ...kanbanBoard, columns: newColumns });
      }
      return;
    }

    // Move task between columns
    const newStatus = destColumn.id as "todo" | "in_progress" | "done";

    try {
      // Update task status via API
      const response = await fetch(`/api/task-management/${task.file}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subtaskId: task.id,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      // Update local state
      const sourceColumnIndex = kanbanBoard.columns.findIndex(
        (col) => col.id === sourceColumn.id
      );
      const destColumnIndex = kanbanBoard.columns.findIndex(
        (col) => col.id === destColumn.id
      );

      const newSourceTasks = sourceColumn.tasks.filter(
        (t) => t.id !== activeId
      );
      const newDestTasks = [
        ...destColumn.tasks,
        { ...task, status: newStatus, completed: newStatus === "done" },
      ];

      const newColumns = [...kanbanBoard.columns];
      newColumns[sourceColumnIndex] = {
        ...sourceColumn,
        tasks: newSourceTasks,
      };
      newColumns[destColumnIndex] = { ...destColumn, tasks: newDestTasks };

      setKanbanBoard({ ...kanbanBoard, columns: newColumns });

      // Refresh task groups to keep everything in sync
      fetchTaskGroups();
    } catch (error) {
      console.error("Error updating task:", error);
      // TODO: Show error toast
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted/50 rounded w-24" />
          <div className="h-10 bg-muted/50 rounded w-1/3" />
        </div>
        <div className="flex gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-80 h-96 bg-muted/30 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !kanbanBoard) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Error Loading Kanban Board</h1>
          <p className="text-muted-foreground">
            {error || "Failed to load kanban board data."}
          </p>
          <Button asChild>
            <Link href="/tasks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("tasks.backToTasks")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/tasks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("tasks.backToTasks")}
            </Link>
          </Button>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            {kanbanBoard?.groupName || "Task Board"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {groupId
              ? `Kanban board for ${kanbanBoard?.groupName}`
              : "Kanban-style view of your project tasks"}
          </p>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Circle className="h-4 w-4" />
            <span>{kanbanBoard.columns[0]?.tasks.length || 0} to do</span>
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span>{kanbanBoard.columns[1]?.tasks.length || 0} in progress</span>
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>{kanbanBoard.columns[2]?.tasks.length || 0} done</span>
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="font-medium">
            {kanbanBoard.totalTasks} total tasks
          </span>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-6">
          {kanbanBoard.columns.map((column) => (
            <KanbanColumn key={column.id} column={column} />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <DraggableTaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default function KanbanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">Loading...</div>
      }
    >
      <KanbanPageContent />
    </Suspense>
  );
}
