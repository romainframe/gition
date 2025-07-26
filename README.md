# Gition

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/gition-ui.svg)](https://www.npmjs.com/package/gition-ui)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Build Status](https://img.shields.io/github/actions/workflow/status/romainframe/gition/ci.yml)](https://github.com/romainframe/gition/actions)

> Zero-config local web interface for Markdown documentation and task management. Think Notion + Jira for your local files.

![Gition Demo](https://via.placeholder.com/800x400/1f2937/ffffff?text=Gition+Demo+Screenshot)

## Features

- 📚 **Documentation**: Auto-discover and render Markdown/MDX files with real-time editing
- 📋 **Task Management**: Kanban board with smart task parsing from Markdown syntax
- 🔄 **Real-time Updates**: File watching with instant UI updates and scroll preservation
- 🎨 **Customizable**: Themes, task types, and flexible configuration
- 🌐 **Multi-language**: English, French, and Spanish support
- 📱 **Responsive**: Works on desktop and mobile devices

## Quick Start

```bash
# Install globally
npm install -g gition-ui

# Initialize a new workspace
npx gition-ui init

# Start the server
npx gition-ui

# Or serve a specific directory
npx gition-ui /path/to/docs
```

Open http://localhost:3000 to see your documentation and tasks.

## Basic Usage

### Documentation

Create `.md` or `.mdx` files in your `docs/` folder:

```markdown
---
title: "My Document"
tags: ["guide", "getting-started"]
---

# My Document

Content with **formatting** and [links](https://example.com).
```

### Tasks

Add tasks to Markdown files using checkbox syntax:

```markdown
# Project Tasks

- [ ] Todo item
- [~] In progress item
- [x] Completed item
```

Tasks automatically appear in the Kanban board and can be managed with drag-and-drop.

## Configuration

Customize your workspace with `.gitionrc/config.yaml`:

```yaml
name: "My Project"
docsDir: "docs"
tasksDir: "tasks"
theme:
  primaryColor: "#3b82f6"
  darkMode: true
features:
  taskManagement: true
  realTimeUpdates: true
```

See the [Configuration Guide](./docs/configuration.mdx) for all options.

## Documentation

- 📖 [Getting Started](./docs/getting-started.mdx) - Complete setup and usage guide
- ⚙️ [Configuration](./docs/configuration.mdx) - Customization options
- 🛠️ [Development](./docs/development.mdx) - Contributing and development setup
- 🔧 [API Reference](./docs/api-reference.mdx) - REST API documentation

## Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/contributing.mdx) for details.

### Development Setup

```bash
# Clone and install
git clone https://github.com/romainframe/gition.git
cd gition
pnpm install

# Start development server
pnpm dev

# Or use just for common tasks
just dev
```

See [Development Guide](./docs/development.mdx) for detailed instructions.

## Roadmap

- ✅ **v0.1**: Core features, CLI, task management, real-time updates
- 🚧 **v0.2**: Advanced MDX features, collaboration, performance improvements
- 🎯 **v0.3**: AI features, enterprise deployment, plugin system

See our [roadmap](./tasks/v0.2-roadmap.md) for detailed plans.

## Support

- 🐛 [Issues](https://github.com/romainframe/gition/issues) - Bug reports and feature requests
- 💬 [Discussions](https://github.com/romainframe/gition/discussions) - Questions and community
- 📧 [Email](mailto:support@gition.dev) - Direct support

## License

MIT © [Romain Frame](https://github.com/romainframe)

---

<p align="center">
  <strong>Made with ❤️ for developers who love Markdown</strong>
</p>
