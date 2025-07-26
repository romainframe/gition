# Gition

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/gition.svg)](https://www.npmjs.com/package/gition)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

> **Gition** is a zero-config, local web interface for managing Markdown/MDX documentation and tasks. Think Notion + Jira, but for your local files with real-time hot-reload and beautiful UI.

![Gition Demo](https://via.placeholder.com/800x400/1f2937/ffffff?text=Gition+Demo+Screenshot)

## ✨ Features

### 📚 **Documentation Management**

- **📁 Smart File Explorer** - Auto-discovers `.md` & `.mdx` files with nested folder support
- **🎨 Beautiful MDX Rendering** - Rich components, syntax highlighting, and interactive elements
- **🔄 Real-time Hot-reload** - See changes instantly while preserving scroll position
- **🔍 Powerful Search** - Full-text search across all documents and metadata
- **🌐 Multi-language Support** - English, French, and Spanish built-in

### 📋 **Task Management**

- **📊 Kanban Board** - Visual task management with drag-and-drop
- **✅ Smart Task Parsing** - Extract tasks from Markdown with `[ ]`, `[x]`, and `[~]` syntax
- **⚡ Real-time Updates** - Click checkboxes to update files instantly
- **🏷️ Rich Metadata** - Priority, status, assignees, due dates, and more
- **📈 Progress Tracking** - Subtasks, dependencies, and completion status

### ⚙️ **Configuration & Customization**

- **🎯 Interactive Setup** - `npx gition init` wizard for easy configuration
- **🎨 Theme Customization** - Colors, fonts, and layout options
- **📁 Custom Task Types** - Define your own task categories and workflows
- **👥 User Management** - Multi-user support with roles and assignments
- **🚀 Feature Flags** - Enable/disable features as needed

### 🛠️ **Developer Experience**

- **⚡ Zero Configuration** - Works out of the box with sensible defaults
- **🔧 Highly Extensible** - Built on Next.js 15 with TypeScript
- **📱 Responsive Design** - Works perfectly on desktop and mobile
- **🌙 Dark Mode** - Automatic system detection with manual toggle

## 🚀 Quick Start

```bash
# Initialize a new workspace
npx gition init

# Start the server
npx gition

# Your browser opens to http://localhost:3000
```

That's it! No configuration needed to get started.

## 📦 Installation

### Option 1: Direct Usage (Recommended)

```bash
# Run in any directory with Markdown files
npx gition

# Or initialize a new workspace first
npx gition init
```

### Option 2: Global Installation

```bash
npm install -g gition
cd your-docs-folder
gition
```

## 🎯 Usage Examples

### Basic Document Structure

Create a simple documentation structure:

```bash
mkdir my-docs && cd my-docs
npx gition init

# Creates:
# ├── .gitionrc/config.yaml
# ├── docs/
# │   └── welcome.md
# ├── tasks/
# │   └── tasks/example-task.md
# └── assets/
```

### Rich MDX Documents

Create `docs/api-guide.mdx`:

```mdx
---
title: "API Guide"
description: "Complete API documentation with examples"
tags: ["api", "documentation", "guide"]
author: "Jane Doe"
date: "2024-01-15"
status: "published"
priority: "high"
---

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

# API Guide

<Badge variant="outline">Version 2.0</Badge>

## Authentication

<Card>
  <CardHeader>
    <CardTitle>JWT Authentication</CardTitle>
  </CardHeader>
  <CardContent>
    All API requests require a valid JWT token in the Authorization header.
  </CardContent>
</Card>

### Example Request

\`\`\`javascript
const response = await fetch('/api/users', {
headers: {
'Authorization': 'Bearer ' + token,
'Content-Type': 'application/json'
}
});
\`\`\`

## Endpoints

### Users API

| Method | Endpoint         | Description     |
| ------ | ---------------- | --------------- |
| GET    | `/api/users`     | List all users  |
| POST   | `/api/users`     | Create new user |
| PUT    | `/api/users/:id` | Update user     |
| DELETE | `/api/users/:id` | Delete user     |
```

### Task Management

Create `tasks/stories/user-authentication.md`:

```markdown
---
title: "Implement User Authentication"
description: "Add secure login/logout with JWT tokens"
status: "in-progress"
priority: "high"
assignee: "john-doe"
due: "2024-02-01T10:00:00Z"
tags: ["authentication", "security", "backend"]
estimatedHours: 16
---

# Implement User Authentication

## Description

Implement a secure authentication system with the following requirements:

- JWT token-based authentication
- Password hashing with bcrypt
- Session management
- Role-based access control

## Acceptance Criteria

- [x] Set up JWT token generation
- [x] Implement password hashing
- [~] Create login/logout endpoints
- [ ] Add role-based middleware
- [ ] Write comprehensive tests
- [ ] Update API documentation

## Technical Notes

Key security considerations:

- Use bcrypt with salt rounds >= 12
- JWT tokens should expire within 24 hours
- Implement proper rate limiting
- Add CSRF protection for web sessions

## Dependencies

- [x] Database schema for users table
- [ ] Email service for password reset
- [ ] Redis for session storage

## Related Tasks

- Link to [User Registration](./user-registration.md)
- Depends on [Database Setup](../tasks/database-setup.md)
```

### Configuration Examples

#### Basic Configuration (`.gitionrc/config.yaml`)

```yaml
name: "My Project Documentation"
description: "Complete project docs and task management"
docsDir: "docs"
tasksDir: "tasks"

features:
  hotReload: true
  darkMode: true
  search: true
  analytics: false

defaultLanguage: "en"
```

#### Advanced Configuration

```yaml
name: "Enterprise Project Hub"
description: "Multi-team documentation and task management"

# Custom Theme
theme:
  primaryColor: "hsl(250, 100%, 60%)"
  backgroundColor: "hsl(0, 0%, 98%)"
  fontFamily: "Inter, -apple-system, sans-serif"
  borderRadius: "0.75rem"

# Custom Task Types
taskTypes:
  - name: "Epic"
    folder: "epics"
    icon: "Target"
    color: "purple"
    description: "Large multi-sprint initiatives"
    defaultPriority: "high"
  - name: "Bug"
    folder: "bugs"
    icon: "AlertCircle"
    color: "red"
    description: "Bug reports and fixes"
    defaultPriority: "medium"
  - name: "Research"
    folder: "research"
    icon: "Search"
    color: "blue"
    description: "Research and investigation tasks"
    defaultPriority: "low"

# Team Members
users:
  - id: "alice"
    name: "Alice Johnson"
    email: "alice@company.com"
    role: "admin"
  - id: "bob"
    name: "Bob Smith"
    email: "bob@company.com"
    role: "editor"

# Environment Variables
env:
  API_BASE_URL: "https://api.company.com"
  ANALYTICS_ID: "UA-123456-1"
```

## 🎨 CLI Commands

### Core Commands

```bash
# Initialize new workspace with wizard
npx gition init [directory]

# Start server (default: current directory, port 3000)
npx gition [directory]

# Custom port
npx gition --port 3001

# Don't auto-open browser
npx gition --no-open

# Help and version
npx gition --help
npx gition --version
```

### Environment Variables

```bash
# Custom directories
GITION_TARGET_DIR=/path/to/workspace npx gition
GITION_DOCS_DIR=documentation npx gition
GITION_TASKS_DIR=todos npx gition

# Server configuration
PORT=3001 npx gition
HOST=0.0.0.0 npx gition

# Debug mode
DEBUG=gition* npx gition
```

## 🏗️ Architecture & Customization

### Built With

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful component library
- **[Zustand](https://github.com/pmndrs/zustand)** - Lightweight state management
- **[MDX](https://mdxjs.com/)** - Markdown with React components
- **[Chokidar](https://github.com/paulmillr/chokidar)** - File system watching

### Project Structure

```
gition/
├── bin/
│   └── gition.js                 # CLI entry point
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes
│   │   │   ├── docs/             # Documentation API
│   │   │   ├── tasks/            # Task management API
│   │   │   ├── config/           # Configuration API
│   │   │   └── files/watch/      # File watching SSE
│   │   ├── docs/[slug]/          # Dynamic doc pages
│   │   ├── tasks/[slug]/         # Dynamic task pages
│   │   └── layout.tsx            # Root layout
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── sidebar.tsx           # File explorer
│   │   ├── header.tsx            # Navigation header
│   │   └── config-provider.tsx   # Configuration context
│   ├── lib/                      # Core libraries
│   │   ├── mdx.ts               # MDX processing
│   │   ├── tasks.ts             # Task extraction
│   │   └── config.ts            # Configuration management
│   ├── store/                    # Zustand stores
│   │   ├── useDocsStore.ts      # Documentation state
│   │   ├── useTaskStore.ts      # Task state
│   │   └── useStructureStore.ts # File structure state
│   ├── hooks/                    # Custom React hooks
│   │   └── useFileWatcher.ts    # File watching hook
│   ├── types/                    # TypeScript definitions
│   │   └── config.ts            # Configuration types
│   └── cli/                      # CLI implementation
│       └── init.ts              # Workspace initialization
├── public/                       # Static assets
├── docs/                         # Project documentation
└── tests/                        # Test suites
```

### Extending Gition

#### Custom MDX Components

Create custom components in your workspace:

```typescript
// components/MyComponent.tsx
export function MyComponent({ title, children }) {
  return (
    <div className="my-custom-component">
      <h3>{title}</h3>
      {children}
    </div>
  );
}
```

Use in MDX files:

```mdx
import { MyComponent } from "../components/MyComponent";

# My Document

<MyComponent title="Custom Section">This is my custom content!</MyComponent>
```

#### API Integration

Access Gition's APIs from your own tools:

```javascript
// Get all documents
const docs = await fetch("/api/docs").then((r) => r.json());

// Get tasks with filtering
const tasks = await fetch("/api/tasks?status=todo&priority=high").then((r) =>
  r.json()
);

// Update configuration
await fetch("/api/config", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ theme: { primaryColor: "#3b82f6" } }),
});
```

## 🔧 Advanced Usage

### Real-time Collaboration

Configure multi-user support:

```yaml
# .gitionrc/config.yaml
features:
  collaboration: true

users:
  - id: "team-lead"
    name: "Alice Johnson"
    email: "alice@company.com"
    role: "admin"
  - id: "developer"
    name: "Bob Smith"
    email: "bob@company.com"
    role: "editor"
  - id: "designer"
    name: "Carol Davis"
    email: "carol@company.com"
    role: "viewer"
```

### Custom Workflows

Define custom task workflows:

```yaml
taskTypes:
  - name: "Feature"
    folder: "features"
    workflow: "development"
    stages: ["planning", "development", "review", "done"]
    transitions:
      planning: ["development", "cancelled"]
      development: ["review", "planning"]
      review: ["done", "development"]
```

### Integration Examples

#### Git Hooks

Set up automatic updates on git commits:

```bash
# .git/hooks/post-commit
#!/bin/bash
echo "Refreshing Gition workspace..."
curl -X POST http://localhost:3000/api/refresh
```

#### CI/CD Integration

Generate documentation during builds:

```yaml
# .github/workflows/docs.yml
name: Update Documentation
on:
  push:
    paths: ["docs/**", "tasks/**"]
jobs:
  update-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "18"
      - run: npx gition build
      - run: npx gition export
```

## 🚨 Troubleshooting

### Common Issues

**Port already in use:**

```bash
npx gition --port 3001
```

**Files not loading:**

- Check file extensions are `.md` or `.mdx`
- Verify directory structure matches config
- Ensure valid frontmatter syntax

**Hot-reload not working:**

- Check file permissions
- Verify file watcher in browser console
- Try manual refresh (Ctrl+R)

**Configuration errors:**

```bash
# Reset configuration
rm -rf .gitionrc
npx gition init
```

### Debug Mode

Enable detailed logging:

```bash
DEBUG=gition* npx gition
```

Check browser console for additional information.

### Performance Tips

- Keep files under 1MB for optimal performance
- Use subdirectories to organize large workspaces
- Restart server periodically for long sessions
- Enable only needed features in configuration

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/gition.git
cd gition

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

### Creating Issues

Please include:

- Gition version (`npx gition --version`)
- Node.js version
- Operating system
- Reproduction steps
- Expected vs actual behavior

## 📚 Documentation

- **[User Guide](USER_GUIDE.md)** - Comprehensive usage guide
- **[API Reference](API_REFERENCE.md)** - Developer API documentation
- **[Configuration Guide](CONFIGURATION.md)** - Detailed configuration options
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute
- **[Changelog](CHANGELOG.md)** - Version history

## 🎯 Roadmap

- ✅ **Core Features** - Documentation and task management
- ✅ **Configuration System** - Customizable workspaces
- ✅ **Real-time Updates** - Hot-reload and file watching
- 🚧 **Advanced MDX** - Mermaid diagrams, math formulas
- 🚧 **Collaboration** - Multi-user editing and comments
- 🚧 **Integrations** - Git, Slack, GitHub, Jira
- 🔮 **AI Features** - Content generation and summaries
- 🔮 **Mobile App** - Native iOS/Android apps

## 📄 License

MIT © [Romain Untereiner](https://github.com/romainframe)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team for the amazing framework
- [Vercel](https://vercel.com/) for inspiration and tooling
- [shadcn](https://github.com/shadcn) for the beautiful UI components
- [MDX](https://mdxjs.com/) community for markdown innovation
- All [contributors](https://github.com/yourusername/gition/graphs/contributors) who make Gition better

---

**Star ⭐ this repository if you find Gition useful!**

[Report Bug](https://github.com/yourusername/gition/issues) · [Request Feature](https://github.com/yourusername/gition/issues) · [Join Discord](https://discord.gg/gition)
