"use client";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { InteractiveCheckbox } from "@/components/ui/interactive-checkbox";
import { MermaidDiagram } from "@/components/ui/mermaid-diagram";
import { cn } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface EnhancedMarkdownRendererProps {
  content: string;
  className?: string;
  // Task-related props for interactive checkboxes
  taskGroupId?: string;
  tasks?: Array<{
    id: string;
    title: string;
    status: "todo" | "in_progress" | "done";
    completed: boolean;
    line: number;
  }>;
}

// Create custom components with task support
const createComponents = (
  taskGroupId?: string,
  tasks?: Array<{
    id: string;
    title: string;
    status: "todo" | "in_progress" | "done";
    completed: boolean;
    line: number;
  }>
) => ({
  // Enhanced code blocks with syntax highlighting
  code({ _node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";

    // Handle Mermaid diagrams specially
    if (!inline && language === "mermaid") {
      return <MermaidDiagram chart={String(children).replace(/\n$/, "")} />;
    }

    if (!inline && language) {
      return (
        <div className="relative">
          {language && (
            <div className="flex items-center justify-between bg-muted px-4 py-2 text-sm font-mono text-muted-foreground border-b">
              <span>{language}</span>
              <Badge variant="outline" className="text-xs">
                {language}
              </Badge>
            </div>
          )}
          <SyntaxHighlighter
            style={oneDark}
            language={language}
            PreTag="div"
            className="!mt-0 !rounded-t-none"
            customStyle={{
              margin: 0,
              borderRadius: language ? "0 0 0.375rem 0.375rem" : "0.375rem",
            }}
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      );
    }

    return (
      <code
        className={cn(
          "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
          className
        )}
        {...props}
      >
        {children}
      </code>
    );
  },

  // Enhanced headings with anchor links
  h1({ children, ...props }: any) {
    const id = String(children).toLowerCase().replace(/\s+/g, "-");
    return (
      <h1
        id={id}
        className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6"
        {...props}
      >
        {children}
      </h1>
    );
  },

  h2({ children, ...props }: any) {
    const id = String(children).toLowerCase().replace(/\s+/g, "-");
    return (
      <h2
        id={id}
        className="scroll-m-20 border-b border-border/50 pb-1 text-2xl font-semibold tracking-tight first:mt-0 mb-3 mt-6"
        {...props}
      >
        {children}
      </h2>
    );
  },

  h3({ children, ...props }: any) {
    const id = String(children).toLowerCase().replace(/\s+/g, "-");
    return (
      <h3
        id={id}
        className="scroll-m-20 text-xl font-semibold tracking-tight mb-2 mt-5"
        {...props}
      >
        {children}
      </h3>
    );
  },

  h4({ children, ...props }: any) {
    return (
      <h4
        className="scroll-m-20 text-lg font-semibold tracking-tight mb-1 mt-3"
        {...props}
      >
        {children}
      </h4>
    );
  },

  h5({ children, ...props }: any) {
    return (
      <h5
        className="scroll-m-20 text-base font-semibold tracking-tight mb-1 mt-2"
        {...props}
      >
        {children}
      </h5>
    );
  },

  h6({ children, ...props }: any) {
    return (
      <h6
        className="scroll-m-20 text-base font-semibold tracking-tight mb-1 mt-2"
        {...props}
      >
        {children}
      </h6>
    );
  },

  // Enhanced paragraphs
  p({ children, ...props }: any) {
    return (
      <p className="leading-7 [&:not(:first-child)]:mt-4 mb-3" {...props}>
        {children}
      </p>
    );
  },

  // Enhanced lists
  ul({ children, ...props }: any) {
    return (
      <ul className="my-4 ml-6 list-disc [&>li]:mt-1" {...props}>
        {children}
      </ul>
    );
  },

  ol({ children, ...props }: any) {
    return (
      <ol className="my-4 ml-6 list-decimal [&>li]:mt-1" {...props}>
        {children}
      </ol>
    );
  },

  li({ children, ...props }: any) {
    // Check if this is a task list item (checkbox)
    if (Array.isArray(children)) {
      const firstChild = children[0];
      if (typeof firstChild === "string") {
        const checkboxMatch = firstChild.match(/^\[([ x~])\]\s*(.*)$/);
        if (checkboxMatch && taskGroupId && tasks) {
          const [, _checkState, taskText] = checkboxMatch;

          // Find matching task by title
          const matchingTask = tasks.find(
            (task) =>
              task.title.trim() === taskText.trim() ||
              taskText.includes(task.title.trim())
          );

          if (matchingTask) {
            return (
              <li
                className="flex items-start gap-2 mt-1 list-none ml-0"
                {...props}
              >
                <InteractiveCheckbox
                  taskGroupId={taskGroupId}
                  subtaskId={matchingTask.id}
                  status={matchingTask.status}
                  completed={matchingTask.completed}
                  className="mt-1"
                />
                <span
                  className={`text-base leading-7 ${matchingTask.completed ? "line-through text-muted-foreground" : ""}`}
                >
                  {taskText}
                </span>
              </li>
            );
          }
        }
      }
    }

    return (
      <li className="mt-1" {...props}>
        {children}
      </li>
    );
  },

  // Enhanced blockquotes
  blockquote({ children, ...props }: any) {
    return (
      <blockquote
        className="mt-4 border-l-2 border-primary/30 pl-4 italic text-muted-foreground [&>*]:text-muted-foreground bg-muted/30 py-2 rounded-r-md"
        {...props}
      >
        {children}
      </blockquote>
    );
  },

  // Enhanced tables
  table({ children, ...props }: any) {
    return (
      <div className="my-4 w-full overflow-y-auto rounded-lg border border-border/50">
        <table className="w-full border-collapse" {...props}>
          {children}
        </table>
      </div>
    );
  },

  thead({ children, ...props }: any) {
    return (
      <thead className="bg-muted" {...props}>
        {children}
      </thead>
    );
  },

  tbody({ children, ...props }: any) {
    return <tbody {...props}>{children}</tbody>;
  },

  tr({ children, ...props }: any) {
    return (
      <tr className="border-b border-border even:bg-muted/50" {...props}>
        {children}
      </tr>
    );
  },

  td({ children, ...props }: any) {
    return (
      <td
        className="border-r border-border/30 px-3 py-2 text-left last:border-r-0"
        {...props}
      >
        {children}
      </td>
    );
  },

  th({ children, ...props }: any) {
    return (
      <th
        className="border-r border-border/30 px-3 py-2 text-left font-semibold last:border-r-0"
        {...props}
      >
        {children}
      </th>
    );
  },

  // Enhanced links
  a({ children, href, ...props }: any) {
    const isExternal = href?.startsWith("http");
    return (
      <a
        className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        {...props}
      >
        {children}
        {isExternal && <span className="ml-1 inline-block text-xs">↗</span>}
      </a>
    );
  },

  // Enhanced horizontal rules
  hr({ ...props }: any) {
    return <hr className="my-6 border-border/50" {...props} />;
  },

  // Custom callout component
  div({ children, className, ...props }: any) {
    // Check if this is a callout div (you can customize this logic)
    if (className?.includes("callout")) {
      const type = className.split("-")[1] || "info";
      const variants = {
        info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200",
        warning:
          "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200",
        error:
          "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200",
        success:
          "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200",
      };

      return (
        <div
          className={cn(
            "my-6 rounded-lg border p-4",
            variants[type as keyof typeof variants] || variants.info
          )}
          {...props}
        >
          {children}
        </div>
      );
    }

    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  },

  // Custom alert/admonition component
  aside({ children, className, ...props }: any) {
    if (className?.includes("alert")) {
      return (
        <Card className="my-6">
          <CardContent className="pt-6">{children}</CardContent>
        </Card>
      );
    }
    return (
      <aside className={className} {...props}>
        {children}
      </aside>
    );
  },

  // Custom details/summary component
  details({ children, ...props }: any) {
    return (
      <details
        className="my-6 rounded-lg border border-border bg-card p-4"
        {...props}
      >
        {children}
      </details>
    );
  },

  summary({ children, ...props }: any) {
    return (
      <summary
        className="cursor-pointer font-medium text-foreground hover:text-primary"
        {...props}
      >
        {children}
      </summary>
    );
  },
});

export function EnhancedMarkdownRenderer({
  content,
  className,
  taskGroupId,
  tasks,
}: EnhancedMarkdownRendererProps) {
  const components = createComponents(taskGroupId, tasks);

  return (
    <div
      className={cn(
        "prose prose-neutral max-w-none dark:prose-invert",
        className
      )}
    >
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
