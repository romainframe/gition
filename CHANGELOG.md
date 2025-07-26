# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-01-25

### 🎉 Initial Release

This is the first release of Gition - a zero-config, local web interface for managing Markdown/MDX documentation and tasks.

### ✨ Added

#### 🖥️ CLI & Core

- **Interactive CLI tool** with `npx gition` command
- **Workspace initialization** with `npx gition init` wizard
- **Zero-config setup** - works out of the box
- **Hot-reload functionality** with scroll position preservation
- **Real-time file watching** using Server-Sent Events

#### 📚 Documentation System

- **MDX support** with React components
- **Frontmatter metadata** parsing (YAML)
- **File explorer sidebar** with collapsible folders
- **Responsive design** for desktop and mobile
- **Syntax highlighting** for code blocks
- **Smart file discovery** for `.md` and `.mdx` files

#### 📋 Task Management

- **Kanban board** with drag-and-drop functionality
- **Task parsing** from Markdown checkboxes (`[ ]`, `[x]`, `[~]`)
- **Real-time task updates** - click checkboxes to update files instantly
- **Rich metadata support** - priority, status, assignees, due dates
- **Task organization** by type (epics, stories, tasks, bugs)
- **Subtask management** with progress tracking

#### ⚙️ Configuration System

- **YAML configuration** (`.gitionrc/config.yaml`)
- **Interactive setup wizard** for workspace initialization
- **Theme customization** - colors, fonts, layout options
- **Custom task types** - define your own categories and workflows
- **User management** - multi-user support with roles
- **Feature flags** - enable/disable functionality as needed
- **Environment variable** support for overrides

#### 🎨 UI & Experience

- **Modern design** using Tailwind CSS and shadcn/ui
- **Dark mode support** with automatic system detection
- **Internationalization** - English, French, Spanish
- **Search functionality** across all documents and tasks
- **Accessibility features** with keyboard navigation
- **Loading states** and error handling

#### 🛠️ Developer Experience

- **TypeScript support** throughout
- **Next.js 15** with App Router
- **Zustand** for state management
- **Production optimizations** - bundle splitting, compression
- **Security headers** and best practices
- **Comprehensive documentation** and user guide

### 🔧 Technical Details

#### Architecture

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **State Management**: Zustand
- **File Processing**: MDX, gray-matter, chokidar
- **CLI**: Commander.js, Inquirer.js

#### Performance

- **Bundle optimization** with code splitting
- **Image optimization** with WebP/AVIF support
- **File watching** with debounced updates
- **Memory management** with cleanup on unmount
- **Caching strategies** for static assets

#### Security

- **Content Security Policy** headers
- **XSS protection** and frame options
- **Input validation** for all user inputs
- **Safe file operations** with permission checks

### 📚 Documentation

#### Included Guides

- **README.md** - Complete project overview with examples
- **USER_GUIDE.md** - Comprehensive usage guide (650+ lines)
- **TEST_CASES.md** - Detailed test specifications (800+ cases)
- **CODE_OF_CONDUCT.md** - Community guidelines
- **API examples** - Integration patterns and usage

#### Configuration Examples

- **Basic setup** for simple workspaces
- **Advanced configuration** for enterprise use
- **Custom task types** with workflows
- **Multi-user setups** with roles and permissions
- **Theme customization** examples

### 🔮 Roadmap

#### Upcoming Features (v0.2.0)

- **Mermaid diagrams** support in MDX
- **Advanced search** with filters and sorting
- **Export functionality** to various formats
- **Plugin system** for extensibility

#### Future Plans

- **Real-time collaboration** with multi-user editing
- **Mobile applications** for iOS/Android
- **Cloud synchronization** options
- **AI-powered features** for content generation

### 🙏 Credits

- Built with [Next.js](https://nextjs.org/) and [React](https://reactjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Markdown processing with [MDX](https://mdxjs.com/)
- File watching with [Chokidar](https://github.com/paulmillr/chokidar)

### 📄 License

MIT © [Romain Untereiner](https://github.com/romainframe)

---

## Release Notes

### Installation

```bash
# Run directly with npx (recommended)
npx gition

# Or install globally
npm install -g gition
```

### Quick Start

```bash
# Initialize a new workspace
npx gition init

# Start the server
npx gition

# Your browser opens to http://localhost:3000
```

### System Requirements

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **Operating System**: macOS, Linux, Windows
- **Browser**: Modern browsers with ES2020 support

### Known Issues

- Large files (>1MB) may have slower hot-reload performance
- Symbolic links in directories are not fully supported
- Some Windows file paths may require escaping

### Migration Guide

This is the initial release, so no migration is required.

### Breaking Changes

None (initial release).

---

For complete documentation, visit the [GitHub repository](https://github.com/romainframe/gition) or check the included `USER_GUIDE.md`.
