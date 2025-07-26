"use client";

import { useCallback, useEffect, useState } from "react";

import { useTaskStore } from "@/store/useTaskStore";

interface TaskFile {
  slug: string;
  content: string;
  frontmatter: Record<string, unknown>;
  tasks: Array<Record<string, unknown>>;
  group: Record<string, unknown> | null;
  relatedTasks: Array<Record<string, unknown>>;
  referencedBy: Array<Record<string, unknown>>;
  isDocsFile: boolean;
}

export function useTaskFile(slug: string) {
  const [taskFile, setTaskFile] = useState<TaskFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { taskGroups, selectedTaskGroup, fetchTaskGroups } = useTaskStore();

  // Ensure task groups are loaded
  useEffect(() => {
    if (taskGroups.length === 0) {
      console.log("🎯 useTaskFile - Fetching task groups");
      fetchTaskGroups();
    }
  }, [taskGroups.length, fetchTaskGroups]);

  const fetchTaskFile = useCallback(async () => {
    if (!slug) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/${slug}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch task file");
      }
      const taskFileData: TaskFile = await response.json();
      setTaskFile(taskFileData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // Initial fetch
  useEffect(() => {
    fetchTaskFile();
  }, [fetchTaskFile]);

  // Update local task file when store data changes
  useEffect(() => {
    console.log("🎯 useTaskFile effect triggered for slug:", slug);
    console.log("🎯 taskGroups length:", taskGroups.length);
    console.log(
      "🎯 taskGroups IDs:",
      taskGroups.map((g) => g.id)
    );
    console.log("🎯 selectedTaskGroup:", selectedTaskGroup?.id);

    if (!taskFile) {
      console.log("🎯 No taskFile yet, skipping update");
      return;
    }

    // Find the matching task group in the store
    // Try exact match first, then try with folder prefix
    let matchingGroup = taskGroups.find((group) => group.id === slug);

    if (!matchingGroup) {
      // Try matching with different folder prefixes
      matchingGroup = taskGroups.find(
        (group) =>
          group.id.endsWith(`/${slug}`) ||
          group.id === `epics/${slug}` ||
          group.id === `docs/${slug}` ||
          group.id === `stories/${slug}`
      );
    }

    if (!matchingGroup) {
      matchingGroup = selectedTaskGroup;
    }

    console.log("🎯 matchingGroup found:", matchingGroup?.id);
    console.log(
      "🎯 matchingGroup subtasks count:",
      matchingGroup?.subtasks?.length
    );

    if (matchingGroup) {
      setTaskFile((prev) => {
        if (!prev) return null;

        // Update both metadata and subtasks
        const currentData = JSON.stringify({
          frontmatter: prev.frontmatter,
          tasks: prev.tasks,
        });
        const newData = JSON.stringify({
          frontmatter: {
            ...prev.frontmatter,
            ...(matchingGroup.metadata || {}),
          },
          tasks: matchingGroup.subtasks,
        });

        console.log("🎯 Data comparison - changed:", currentData !== newData);
        if (currentData !== newData) {
          console.log("🎯 Updating taskFile with new data");
          return {
            ...prev,
            frontmatter: {
              ...prev.frontmatter,
              ...(matchingGroup.metadata || {}),
            },
            tasks: matchingGroup.subtasks,
            group: matchingGroup,
          };
        }

        return prev;
      });
    }
  }, [taskGroups, selectedTaskGroup, slug, taskFile]);

  return {
    taskFile,
    loading,
    error,
    refetch: fetchTaskFile,
  };
}
