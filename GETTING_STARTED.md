# Getting Started with Gition

Welcome to **Gition** - a zero-config, local web interface for serving and managing your project's Markdown and MDX files with Notion-like doc viewing and Kanban-style task boards.

## Quick Start

### 1. Installation

For the quickest start, use npx (no installation required):

```bash
cd your-markdown-project
npx gition
```

Or install globally:

```bash
npm install -g gition
cd your-docs-folder
gition
```

### 2. Basic Usage

**Serve current directory:**

```bash
gition
```

**Serve specific directory:**

```bash
gition /path/to/your/docs
```

**Custom port:**

```bash
gition --port 8080
```

**Don't auto-open browser:**

```bash
gition --no-open
```

## Command Line Options

```
Usage: gition [options] [directory]

Zero-config local web interface for Markdown/MDX files

Arguments:
  directory          Directory to serve (defaults to current directory)

Options:
  -V, --version      Output the version number
  -p, --port <port>  Port to run on (default: "3000")
  --no-open          Do not automatically open browser
  -h, --help         Display help for command
```

## What Happens When You Run Gition

1. **Directory Scanning**: Gition automatically scans your target directory for `.md` and `.mdx` files
2. **Server Launch**: Starts a local development server (default: http://localhost:3000)
3. **Browser Opens**: Automatically opens your default browser (unless `--no-open` is used)
4. **Live Reload**: File changes are reflected immediately in the browser

## Expected Directory Structure

Gition works with any directory containing Markdown files. Here's an example:

```
your-project/
├── README.md
├── docs/
│   ├── getting-started.md
│   ├── api-reference.md
│   └── guides/
│       ├── installation.md
│       └── configuration.md
├── TODO.md
└── other-files...
```

## Supported File Types

- **`.md`** - Standard Markdown files
- **`.mdx`** - Markdown with JSX support (coming soon)

## Task Management Features

Gition automatically detects task lists in your Markdown files:

```markdown
# My Project Tasks

- [ ] Incomplete task
- [x] Completed task
- [ ] Another todo item
```

These tasks will be available in the Kanban board view (feature coming soon).

## Frontmatter Support

Add metadata to your Markdown files using YAML frontmatter (coming soon):

```markdown
---
title: "My Document"
tags: ["documentation", "guide"]
due_date: "2024-12-31"
status: "draft"
---

# My Document Content

Your markdown content here...
```

## Development Status

Gition is currently in early development. The CLI and basic server functionality are working, but many features are still being implemented:

### ✅ Working Now

- CLI with argument parsing
- Local development server
- Automatic browser opening
- Basic Next.js integration

### 🚧 Coming Soon

- Markdown/MDX file processing
- Document viewer UI
- Task board/Kanban interface
- File explorer sidebar
- Theme customization

## Getting Help

- Run `gition --help` for command-line help
- Check the [project repository](https://github.com/romainframe/gition) for updates
- Report issues or contribute to development

## Next Steps

1. Try running `gition` in a directory with some Markdown files
2. Explore the web interface (currently shows Next.js default page)
3. Check back for updates as new features are added

---

**Note**: Gition is under active development. The interface and features will be enhanced significantly in upcoming releases.
