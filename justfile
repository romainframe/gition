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
  npx tsc --noEmit

# Run prettier
check-pretty:
  pnpm prettier --check .

# Run lint, typecheck, and prettier
validate: lint typecheck check-pretty

# Run prettier
prettify:
  pnpm prettier --write .

# Run unit tests
test:
  pnpm test

# Run unit tests in watch mode
test-watch:
  pnpm test:watch

# Run unit tests with coverage
test-coverage:
  pnpm test:coverage

# Run E2E tests
test-e2e:
  pnpm test:e2e

# Run E2E tests with UI
test-e2e-ui:
  pnpm test:e2e:ui

# Run E2E tests in headed mode
test-e2e-headed:
  pnpm test:e2e:headed

# Debug E2E tests
test-e2e-debug:
  pnpm test:e2e:debug

# Run all tests (unit + E2E)
test-all: test test-e2e

# Run tests with coverage and open report
test-coverage-open: test-coverage
  open coverage/lcov-report/index.html

# Run specific test file
test-file file:
  pnpm test {{file}}

# Run tests matching pattern
test-match pattern:
  pnpm test -t "{{pattern}}"

# Update test snapshots
test-update-snapshots:
  pnpm test -u

# Run accessibility tests only
test-a11y:
  pnpm test:e2e tests/accessibility.spec.ts

# Install Playwright browsers
test-install-browsers:
  pnpm exec playwright install --with-deps

# Run tests in CI mode
test-ci: test-coverage test-e2e
  @echo "✅ All tests passed!"

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

# Test the CLI locally (runs for 10 seconds then auto-shuts down)
test-cli:
  node bin/gition.js

# Test the CLI with a specific directory
test-cli-dir dir:
  node bin/gition.js {{dir}}

# Initialize a test project
test-init:
  node bin/gition.js init test-project

# Publish to pnpm (dry run)
publish-dry:
  pnpm publish --dry-run

# Publish to pnpm
publish:
  pnpm publish

# Bump version (patch)
bump-patch:
  pnpm version patch

# Bump version (minor)
bump-minor:
  pnpm version minor

# Bump version (major)
bump-major:
  pnpm version major

# Create a new release (bump patch + publish)
release-patch:
  just validate
  pnpm build
  just bump-patch
  git push
  just release patch
  just publish

# Create a new release (bump minor + publish)
release-minor:
  just validate
  pnpm build
  just bump-minor
  git push
  just release minor
  just publish

# Create a GitHub release with automatic version detection
release type="patch":
  #!/usr/bin/env bash
  set -euo pipefail

  # Capture the new version
  NEW_VERSION=$(jq -r .version package.json)
  
  # Create GitHub release
  echo "🚀 Creating GitHub release v${NEW_VERSION}..."
  gh release create "v${NEW_VERSION}" \
    --title "v${NEW_VERSION}" \
    --target main \
    --generate-notes \
    --latest
  
  echo "✅ Released v${NEW_VERSION} successfully!"

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

# Run a specific pnpm script
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
ci: fresh validate build test-ci
  @echo "✅ CI checks passed!"

# Help with common tasks
help:
  @echo "Common development tasks:"
  @echo "  just dev          - Start development server"
  @echo "  just lint         - Run lint checks"
  @echo "  just validate     - Run lint, typecheck, and prettier"
  @echo "  just prettify     - Run prettier"
  @echo "  just test-cli     - Test the CLI locally"
  @echo "  just build        - Build for production"
  @echo "  just publish      - Publish to npm"
  @echo ""
  @echo "Testing commands:"
  @echo "  just test         - Run unit tests"
  @echo "  just test-watch   - Run unit tests in watch mode"
  @echo "  just test-coverage - Run tests with coverage"
  @echo "  just test-e2e     - Run E2E tests"
  @echo "  just test-all     - Run all tests (unit + E2E)"
  @echo "  just test-ci      - Run tests in CI mode"
  @echo "  just test-a11y    - Run accessibility tests only"
  @echo ""
  @echo "Git workflow:"
  @echo "  just feature name - Create feature branch"
  @echo "  just commit msg   - Add all and commit"
  @echo "  just push         - Push to remote"
  @echo ""
  @echo "Release workflow:"
  @echo "  just release       - Create GitHub release (default: patch)"
  @echo "  just release minor - Create GitHub release with minor bump"
  @echo "  just release major - Create GitHub release with major bump"
  @echo "  just release-patch - Bump patch version and publish to npm"
  @echo "  just release-minor - Bump minor version and publish to npm"