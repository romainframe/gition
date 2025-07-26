"use client";

import { useMemo } from "react";

import { InteractiveCheckbox } from "./interactive-checkbox";

interface InteractiveMarkdownProps {
  content: string;
  taskGroupId?: string;
  tasks?: Array<{
    id: string;
    title: string;
    status: "todo" | "in_progress" | "done";
    completed: boolean;
    line: number;
  }>;
  className?: string;
}

export function InteractiveMarkdown({
  content,
  taskGroupId,
  tasks = [],
  className,
}: InteractiveMarkdownProps) {
  const processedContent = useMemo(() => {
    if (!taskGroupId || tasks.length === 0) {
      return content;
    }

    // Split content into lines to match with tasks by line number
    const lines = content.split("\n");
    const processedLines = lines.map((line, index) => {
      const lineNumber = index + 1;

      // Check if this line contains a checkbox
      const checkboxMatch = line.match(/^(\s*)- \[([ x~])\] (.+)$/);
      if (checkboxMatch) {
        const [, indent, , taskText] = checkboxMatch;

        // Find matching task by line number or title
        const matchingTask = tasks.find(
          (task) =>
            task.line === lineNumber ||
            task.title.trim() === taskText.trim() ||
            taskText.includes(task.title.trim())
        );

        if (matchingTask) {
          // Replace with a special marker that we'll process later
          return `${indent}__INTERACTIVE_CHECKBOX__${matchingTask.id}__${taskText}__`;
        }
      }

      return line;
    });

    return processedLines.join("\n");
  }, [content, taskGroupId, tasks]);

  const renderContent = useMemo(() => {
    const parts = processedContent.split(
      /(__INTERACTIVE_CHECKBOX__[^_]+__[^_]+__)/
    );

    return parts.map((part, index) => {
      const checkboxMatch = part.match(
        /^__INTERACTIVE_CHECKBOX__([^_]+)__(.+)__$/
      );
      if (checkboxMatch) {
        const [, taskId, taskText] = checkboxMatch;
        const task = tasks.find((t) => t.id === taskId);

        if (task && taskGroupId) {
          return (
            <div key={index} className="flex items-start gap-2 my-1">
              <InteractiveCheckbox
                taskGroupId={taskGroupId}
                subtaskId={task.id}
                status={task.status}
                completed={task.completed}
                className="mt-1"
              />
              <span
                className={`text-base leading-7 ${task.completed ? "line-through text-muted-foreground" : ""}`}
              >
                {taskText}
              </span>
            </div>
          );
        }
      }

      // Regular content - split by newlines and render as paragraphs
      return part.split("\n").map((line, lineIndex) => {
        if (line.trim() === "") return <br key={`${index}-${lineIndex}`} />;

        // Handle headers
        if (line.startsWith("### ")) {
          return (
            <h3
              key={`${index}-${lineIndex}`}
              className="text-2xl font-semibold tracking-tight mb-3 mt-6"
            >
              {line.slice(4)}
            </h3>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2
              key={`${index}-${lineIndex}`}
              className="text-3xl font-semibold tracking-tight mb-4 mt-8"
            >
              {line.slice(3)}
            </h2>
          );
        }
        if (line.startsWith("# ")) {
          return (
            <h1
              key={`${index}-${lineIndex}`}
              className="text-4xl font-bold tracking-tight mb-6"
            >
              {line.slice(2)}
            </h1>
          );
        }

        // Regular paragraph
        return (
          <p key={`${index}-${lineIndex}`} className="text-base leading-7 mb-4">
            {line}
          </p>
        );
      });
    });
  }, [processedContent, tasks, taskGroupId]);

  return <div className={className}>{renderContent}</div>;
}
