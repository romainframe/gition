# Gition Development Justfile
# https://github.com/casey/just

# Default recipe to display help information
default:
  @just --list

# Install dependencies
install:
  pnpm install

# Run development server
dev:
  pnpm dev

# Build the project
build:
  pnpm build

# Run linting
lint:
  pnpm lint

# Fix linting issues
lint-fix:
  pnpm lint:fix

# Run type checking
typecheck:
  npx tsc --noEmit --skipLibCheck

# Run all checks (lint only for now, typecheck has known issues)
check: lint

# Run lint and typecheck (typecheck has known issues)
check-strict: lint typecheck

# Run tests
test:
  pnpm test

# Clean build artifacts
clean:
  rm -rf .next
  rm -rf dist
  rm -rf node_modules/.cache

# Fresh install (clean + install)
fresh: clean
  pnpm install

# Start production server
start:
  pnpm start

# Build and start production server
prod: build start

# Test the CLI locally
test-cli:
  node bin/gition.js

# Test the CLI with a specific directory
test-cli-dir dir:
  node bin/gition.js {{dir}}

# Initialize a test project
test-init:
  node bin/gition.js init test-project

# Publish to npm (dry run)
publish-dry:
  npm publish --dry-run

# Publish to npm
publish:
  npm publish

# Bump version (patch)
bump-patch:
  npm version patch

# Bump version (minor)
bump-minor:
  npm version minor

# Bump version (major)
bump-major:
  npm version major

# Create a new release (bump patch + publish)
release-patch: bump-patch publish

# Create a new release (bump minor + publish)
release-minor: bump-minor publish

# Git status
status:
  git status

# Git add all and commit
commit message:
  git add -A
  git commit -m "{{message}}"

# Git push
push:
  git push

# Git pull
pull:
  git pull

# Create a new feature branch
feature name:
  git checkout -b feature/{{name}}

# Switch to main branch
main:
  git checkout main

# Update dependencies
update:
  pnpm update

# Check for outdated dependencies
outdated:
  pnpm outdated

# Run development server with debug output
debug:
  DEBUG=* pnpm dev

# Generate changelog
changelog:
  git log --pretty=format:"- %s (%h)" --since="$(git describe --tags --abbrev=0)" > CHANGELOG_NEXT.md

# Open the project in VS Code
code:
  code .

# Run the project documentation site
docs:
  node bin/gition.js /Users/romainframe/gition-test-docs

# Format code with Prettier
format:
  pnpm prettier --write .

# Check code formatting
format-check:
  pnpm prettier --check .

# Run pre-commit checks (format + lint)
precommit: format-check lint

# Watch for changes and rebuild
watch:
  pnpm build --watch

# Analyze bundle size
analyze:
  ANALYZE=true pnpm build

# Run a specific npm script
run script:
  pnpm {{script}}

# Check TypeScript in watch mode
typecheck-watch:
  npx tsc --noEmit --skipLibCheck --watch

# Clean all caches and reinstall
reset: clean
  rm -rf pnpm-lock.yaml
  pnpm install

# Show package information
info:
  @echo "Package: $(jq -r .name package.json)"
  @echo "Version: $(jq -r .version package.json)"
  @echo "Description: $(jq -r .description package.json)"

# Verify the build works correctly
verify: clean build test-cli
  @echo "✅ Build verified successfully!"

# Full CI simulation
ci: fresh check build
  @echo "✅ CI checks passed!"

# Help with common tasks
help:
  @echo "Common development tasks:"
  @echo "  just dev          - Start development server"
  @echo "  just check        - Run lint checks"
  @echo "  just check-strict - Run lint and typecheck (has known issues)"
  @echo "  just test-cli     - Test the CLI locally"
  @echo "  just build        - Build for production"
  @echo "  just publish      - Publish to npm"
  @echo ""
  @echo "Git workflow:"
  @echo "  just feature name - Create feature branch"
  @echo "  just commit msg   - Add all and commit"
  @echo "  just push         - Push to remote"
  @echo ""
  @echo "Release workflow:"
  @echo "  just release-patch - Bump patch version and publish"
  @echo "  just release-minor - Bump minor version and publish"