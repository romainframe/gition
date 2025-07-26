import { z } from "zod";

// Common validation schemas
export const idSchema = z.string().min(1).max(255);
export const slugSchema = z.string().regex(/^[a-z0-9-]+$/);
export const emailSchema = z.string().email();
export const urlSchema = z.string().url();

// File path validation
export const filePathSchema = z
  .string()
  .min(1)
  .max(1000)
  .refine((path) => !path.includes(".."), {
    message: "Path traversal not allowed",
  })
  .refine((path) => /^[a-zA-Z0-9-_/\\.]+$/.test(path), {
    message: "Invalid characters in file path",
  });

// Task validation schemas
export const taskTypeSchema = z.enum(["epic", "story", "bug", "task"]);
export const taskStatusSchema = z.enum(["todo", "in_progress", "done"]);
export const taskPrioritySchema = z.enum(["low", "medium", "high"]);

export const taskMetadataSchema = z.object({
  title: z.string().min(1).max(200),
  type: taskTypeSchema,
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  assignee: z.string().optional(),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const subtaskSchema = z.object({
  id: idSchema,
  text: z.string().min(1).max(500),
  completed: z.boolean(),
  priority: taskPrioritySchema.optional(),
  assignee: z.string().max(100).optional(),
  status: taskStatusSchema.optional(),
});

export const taskGroupSchema = z.object({
  id: idSchema,
  path: filePathSchema,
  title: z.string().min(1).max(200),
  type: taskTypeSchema,
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  assignee: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  subtasks: z.array(subtaskSchema),
});

// API request validation schemas
export const updateSubtaskRequestSchema = z.object({
  completed: z.boolean().optional(),
  text: z.string().min(1).max(500).optional(),
  priority: taskPrioritySchema.optional(),
  assignee: z.string().max(100).optional(),
  status: taskStatusSchema.optional(),
});

export const createTaskRequestSchema = z.object({
  title: z.string().min(1).max(200),
  type: taskTypeSchema,
  status: taskStatusSchema.default("todo"),
  priority: taskPrioritySchema.default("medium"),
  assignee: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  content: z.string().optional(),
});

// Search and filter validation
export const searchQuerySchema = z
  .string()
  .max(200)
  .transform((val) => val.trim())
  .refine((val) => val.length > 0, {
    message: "Search query cannot be empty",
  });

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Sanitization utilities
export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9-_.]/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 255);
}

export function sanitizeMarkdown(input: string): string {
  // Remove potentially dangerous patterns while preserving Markdown
  return input
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "");
}

// Validation error handler
export function parseValidationError(error: z.ZodError): string {
  const issues = error.issues.map((issue) => {
    const path = issue.path.join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });

  return issues.join(", ");
}

// Type guards
export type TaskType = z.infer<typeof taskTypeSchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type TaskMetadata = z.infer<typeof taskMetadataSchema>;
export type Subtask = z.infer<typeof subtaskSchema>;
export type TaskGroup = z.infer<typeof taskGroupSchema>;
export type UpdateSubtaskRequest = z.infer<typeof updateSubtaskRequestSchema>;
export type CreateTaskRequest = z.infer<typeof createTaskRequestSchema>;
