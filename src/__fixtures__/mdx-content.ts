export const sampleMdxFiles = {
  epicFile: {
    path: "tasks/epics/payment-integration.mdx",
    content: `---
title: "Payment System Integration"
type: "epic"
status: "todo"
priority: "high"
assignee: "team-lead"
description: "Integrate payment processing system with multiple providers"
tags: ["payments", "integration", "backend"]
---

# Payment System Integration

Implement a comprehensive payment processing system that supports multiple payment providers.

## Objectives

- Support for Stripe, PayPal, and Square
- PCI compliance
- Webhook handling for payment events
- Refund and dispute management

## Subtasks

- [ ] Research payment provider APIs {priority: "high"}
- [ ] Design payment abstraction layer {priority: "high", assignee: "architect"}
- [ ] Implement Stripe integration {priority: "high", status: "todo"}
- [ ] Implement PayPal integration {priority: "medium", status: "todo"}
- [ ] Add webhook handlers {priority: "high"}
- [ ] Create payment dashboard UI {priority: "medium", assignee: "frontend-dev"}
- [ ] Add comprehensive logging {priority: "high"}
- [ ] Write integration tests {priority: "high"}
`,
  },
  storyFile: {
    path: "tasks/stories/user-profile.mdx",
    content: `---
title: "User Profile Page"
type: "story"
status: "in_progress"
priority: "medium"
assignee: "jane.developer"
description: "Create user profile page with settings"
tags: ["frontend", "ui", "user-experience"]
---

# User Profile Page

Create a comprehensive user profile page where users can manage their account settings.

## Requirements

- Display user information
- Allow editing of profile details
- Avatar upload functionality
- Password change option
- Notification preferences

## Implementation

- [x] Create profile component structure {status: "done"}
- [x] Design profile UI mockup {status: "done", assignee: "designer"}
- [ ] Implement avatar upload {priority: "high", status: "in_progress"}
- [ ] Add form validation {priority: "high"}
- [ ] Connect to backend API {priority: "high", assignee: "jane.developer"}
- [ ] Add loading states {priority: "medium"}
- [ ] Write unit tests {priority: "medium"}
`,
  },
  bugFile: {
    path: "tasks/bugs/login-error.mdx",
    content: `---
title: "Login Form Error on Mobile"
type: "bug"
status: "in_progress"
priority: "high"
assignee: "bob.fixer"
description: "Users unable to login on mobile devices"
tags: ["bug", "mobile", "authentication", "urgent"]
---

# Login Form Error on Mobile

Users are reporting that they cannot log in when using mobile devices. The login button appears to be unresponsive.

## Bug Details

- **Affected Versions**: v1.2.0 - v1.2.3
- **Browsers**: Safari iOS, Chrome Android
- **First Reported**: 2024-01-15
- **Severity**: High

## Steps to Reproduce

1. Open application on mobile device
2. Navigate to login page
3. Enter credentials
4. Tap login button
5. Button does not respond

## Tasks

- [x] Reproduce bug on test devices {status: "done", assignee: "qa-team"}
- [x] Identify root cause {status: "done", assignee: "bob.fixer"}
- [ ] Fix touch event handling {status: "in_progress", priority: "high"}
- [ ] Test fix on multiple devices {priority: "high"}
- [ ] Deploy hotfix {priority: "high"}
- [ ] Update release notes {priority: "medium"}
`,
  },
  docFile: {
    path: "docs/api-guide.mdx",
    content: `---
title: "API Documentation"
type: "documentation"
status: "done"
priority: "low"
description: "Complete API reference guide"
tags: ["docs", "api", "reference"]
---

# API Documentation

Complete reference for all API endpoints.

## Authentication

All API requests require authentication using Bearer tokens.

## Endpoints

### GET /api/users

Returns list of users.

### POST /api/users

Creates a new user.

## Rate Limiting

API requests are limited to 100 requests per minute.
`,
  },
};
