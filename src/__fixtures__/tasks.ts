export const mockTaskGroups = [
  {
    id: "user-authentication",
    path: "tasks/epics/user-authentication.mdx",
    title: "User Authentication System",
    type: "epic",
    status: "in_progress",
    priority: "high",
    assignee: "john.doe",
    description: "Implement complete user authentication flow",
    tags: ["auth", "security", "backend"],
    subtasks: [
      {
        id: "setup-oauth",
        text: "Set up OAuth provider",
        completed: true,
        priority: "high",
        assignee: "john.doe",
        status: "done",
      },
      {
        id: "create-user-model",
        text: "Create user model",
        completed: true,
        priority: "medium",
        status: "done",
      },
      {
        id: "password-validation",
        text: "Add password validation",
        completed: false,
        priority: "high",
        assignee: "alice.smith",
        status: "in_progress",
      },
    ],
  },
  {
    id: "dashboard-redesign",
    path: "tasks/stories/dashboard-redesign.mdx",
    title: "Dashboard UI Redesign",
    type: "story",
    status: "todo",
    priority: "medium",
    assignee: "jane.smith",
    description: "Redesign the main dashboard with new components",
    tags: ["ui", "frontend", "design"],
    subtasks: [
      {
        id: "wireframe-design",
        text: "Create wireframe designs",
        completed: false,
        priority: "high",
        status: "todo",
      },
      {
        id: "component-library",
        text: "Build component library",
        completed: false,
        priority: "medium",
        assignee: "bob.johnson",
        status: "todo",
      },
    ],
  },
];

export const mockSubtask = {
  id: "test-subtask",
  text: "Sample subtask for testing",
  completed: false,
  priority: "medium",
  status: "todo",
  assignee: "test.user",
};

export const mockFileStructure = [
  {
    path: "tasks",
    type: "directory",
    children: [
      {
        path: "tasks/epics",
        type: "directory",
        children: [
          {
            path: "tasks/epics/user-authentication.mdx",
            type: "file",
          },
        ],
      },
      {
        path: "tasks/stories",
        type: "directory",
        children: [
          {
            path: "tasks/stories/dashboard-redesign.mdx",
            type: "file",
          },
        ],
      },
    ],
  },
  {
    path: "docs",
    type: "directory",
    children: [
      {
        path: "docs/getting-started.mdx",
        type: "file",
      },
      {
        path: "docs/api-reference.mdx",
        type: "file",
      },
    ],
  },
];

export const mockMarkdownContent = `---
title: "Sample Task"
type: "story"
status: "in_progress"
priority: "high"
assignee: "test.user"
description: "This is a sample task for testing"
tags: ["test", "sample"]
---

# Sample Task

This is a sample task content for testing purposes.

## Acceptance Criteria

- [ ] First criterion {priority: "high"}
- [x] Second criterion {status: "done"}
- [ ] Third criterion {assignee: "another.user"}

## Implementation Notes

This section contains implementation details.
`;
