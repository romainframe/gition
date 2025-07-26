# Development Guide

This guide covers how to set up and develop the Gition project locally.

## Prerequisites

- **Node.js** 18+ (v24.2.0 recommended)
- **pnpm** (package manager)
- **Git**

## Initial Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd gition
pnpm install
```

### 2. Understand the Project Structure

```
gition/
├── bin/gition.js           # CLI entry point
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Home page
│   │   └── globals.css    # Global styles
│   └── lib/
│       └── utils.ts       # Utility functions (cn helper)
├── package.json           # Dependencies & scripts
├── tsconfig.json          # TypeScript config
├── tailwind.config.js     # Tailwind CSS config
├── components.json        # shadcn/ui config
└── TODO.md               # Development roadmap
```

## Development Commands

### Core Commands

```bash
# Set environment variables
export GITION_TARGET_DIR=./examples/first

# Start Next.js development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
pnpm lint:fix

# Format code
pnpm format
pnpm format:check
```

### Code Quality

- **ESLint**: Configured with Next.js rules
- **Prettier**: Code formatting with import sorting
- **Husky**: Pre-commit hooks
- **lint-staged**: Runs linting/formatting on staged files

## Local Testing

### Method 1: Link for Global Testing (Recommended)

```bash
# From project root, create global symlink
pnpm link --global

# Now you can use `gition` anywhere
gition --version
gition ~/path/to/docs --port 8080
```

### Method 2: Direct Node Execution

```bash
# Test CLI directly
node bin/gition.js --help
node bin/gition.js ~/test-docs --no-open
```

### Method 3: Test with Sample Data

```bash
# Use the pre-created test directory
gition ~/gition-test-docs
```

The test directory contains realistic markdown files with:

- Project documentation
- Task lists for Kanban testing
- Nested folder structure
- Various content types

## Development Workflow

### 1. Working on CLI Features

- Edit `bin/gition.js`
- Test with `node bin/gition.js [args]`
- Or use linked version: `gition [args]`

### 2. Working on Web Interface

- Edit files in `src/app/`
- Run `pnpm dev` for hot reload
- Access at `http://localhost:3000`

### 3. Adding Dependencies

```bash
# Runtime dependencies
pnpm add package-name

# Development dependencies
pnpm add -D package-name
```

### 4. Testing Changes

```bash
# Lint and format
pnpm lint:fix
pnpm format

# Test CLI in different scenarios
gition ~/test-directory
gition ~/test-directory --port 3001 --no-open
```

## Environment Variables

The CLI sets these for the Next.js app:

- `GITION_TARGET_DIR`: Directory being served
- `PORT`: Server port (default: 3000)

Access in Next.js via `process.env.GITION_TARGET_DIR`

## Tech Stack Details

### Frontend

- **Next.js 15**: React framework with App Router
- **React 19**: Latest React version
- **TypeScript**: Type safety
- **Tailwind CSS 4**: Utility-first styling
- **shadcn/ui**: Component library (new-york style)

### CLI

- **commander**: Argument parsing
- **open**: Browser launching
- **Node.js spawn**: Process management

### Development Tools

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **lint-staged**: Staged file processing

## Architecture Notes

### CLI Flow

1. `bin/gition.js` parses arguments
2. Sets environment variables
3. Spawns `pnpm dev` in project root
4. Next.js reads `GITION_TARGET_DIR` to serve files
5. Opens browser automatically (unless `--no-open`)

### Path Aliases

- `@/*` maps to `./src/*`
- Configured in `tsconfig.json`
- Used for clean imports: `import { cn } from '@/lib/utils'`

## Common Development Tasks

### Adding a New CLI Option

1. Edit `bin/gition.js`
2. Add option to commander configuration
3. Handle the option in the action function
4. Test with `gition --new-option`

### Adding UI Components

1. Use shadcn/ui: `pnpm dlx shadcn@latest add button`
2. Components go in `src/components/ui/`
3. Import and use in pages/layouts

### Debugging

- CLI: Add `console.log()` in `bin/gition.js`
- Web: Use browser dev tools + React DevTools
- Server: Check terminal output from `pnpm dev`

## Current Development Status

### ✅ Completed

- Project scaffolding (Next.js + TypeScript)
- CLI with argument parsing
- Local development server integration
- Code quality setup (ESLint, Prettier, Husky)

### 🚧 In Progress

- Markdown/MDX processing
- Document viewer UI
- Task extraction and Kanban board

### 📋 Next Steps

See `TODO.md` for detailed roadmap and current priorities.

## Troubleshooting

### CLI Not Found After Link

```bash
# Check if linked correctly
which gition
# Should show: /Users/[username]/Library/pnpm/gition

# Re-link if needed
pnpm unlink --global
pnpm link --global
```

### Port Already in Use

```bash
# Use different port
gition --port 3001

# Or kill existing process
lsof -ti:3000 | xargs kill
```

### Module Not Found Errors

```bash
# Clean and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Contributing

1. Create feature branch from `main`
2. Make changes following existing code style
3. Test CLI functionality thoroughly
4. Run `pnpm lint:fix && pnpm format`
5. Commit with descriptive message
6. Open pull request

Pre-commit hooks will automatically run linting and formatting.
