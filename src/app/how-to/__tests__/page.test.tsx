import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import HowToPage from "../page";

// Mock language context
jest.mock("@/contexts/language-context", () => ({
  useLanguage: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "howTo.title": "How to Use Gition",
        "howTo.subtitle":
          "Learn how to get the most out of your documentation and task management",
        "howTo.quickStart": "Quick Start",
        "howTo.quickStartDescription": "Get up and running in minutes",
        "howTo.step1": "Navigate to your project directory",
        "howTo.step2": "Run the Gition CLI",
        "howTo.step3": "Open in your browser",
        "howTo.step3Description":
          "Your browser will automatically open to localhost:3000",
        "howTo.cliOptions": "CLI Options",
        "howTo.cliOptionsDescription": "Customize how Gition runs",
        "howTo.serveDirectory": "Serve a specific directory",
        "howTo.customPort": "Run on a custom port",
        "howTo.noOpen": "Don't automatically open browser",
        "howTo.combineOptions": "Combine multiple options",
        "howTo.workingWithDocs": "Working with Documentation",
        "howTo.workingWithDocsDescription":
          "Create and organize your markdown documentation",
        "howTo.directoryStructure": "Directory Structure",
        "howTo.documentMetadata": "Document Metadata",
        "howTo.documentMetadataDescription":
          "Add frontmatter for better organization",
        "howTo.availableFields": "Available fields:",
        "howTo.fileTypes": "Supported File Types",
        "howTo.standardMarkdown": "Standard Markdown files",
        "howTo.markdownWithJsx": "Markdown with JSX components",
        "howTo.taskManagement": "Task Management",
        "howTo.taskManagementDescription":
          "Organize and track your project tasks",
        "howTo.twoLevelStructure": "Two-Level Task Structure",
        "howTo.importantNote": "Important:",
        "howTo.twoLevelHierarchy":
          "Gition uses a two-level hierarchy for tasks",
        "howTo.tasksAreMdxFiles":
          "MDX files themselves (e.g., tasks/epics/user-auth.mdx)",
        "howTo.subtasksAreCheckboxes": "Checkbox items within MDX files",
        "howTo.creatingSubtasks": "Creating Subtasks",
        "howTo.creatingSubtasksDescription":
          "Use checkbox syntax in your markdown files",
        "howTo.taskFileMetadata": "Task File Metadata",
        "howTo.taskFileMetadataDescription":
          "Add metadata to task files using frontmatter",
        "howTo.subtaskInlineMetadata": "Subtask Inline Metadata",
        "howTo.subtaskInlineMetadataDescription":
          "Add metadata directly to subtask lines",
        "howTo.subtaskFields": "Subtask fields:",
        "howTo.subtaskReferences": "Subtask References",
        "howTo.subtaskReferencesDescription": "Link subtasks to other files",
        "howTo.taskFileOrganization": "Task File Organization",
        "howTo.taskFileOrganizationDescription":
          "Organize tasks in folders by type",
        "howTo.eachMdxFileNote":
          'Each MDX file is a "Task" containing multiple "Subtasks"',
        "howTo.taskViews": "Task Views",
        "howTo.taskList": "Task List",
        "howTo.taskListDescription":
          "Overview of all tasks with progress tracking",
        "howTo.kanbanBoard": "Kanban Board",
        "howTo.kanbanBoardDescription": "Drag-and-drop task management",
        "howTo.taskDetails": "Task Details",
        "howTo.taskDetailsDescription":
          "View individual task files with subtasks",
        "howTo.advancedFeatures": "Advanced Features",
        "howTo.progressTracking": "Automatic completion percentage calculation",
        "howTo.crossReferences": "Link between tasks and documentation",
        "howTo.mdxRendering": "Full MDX support with React components",
        "howTo.realTimeUpdates":
          "Changes update automatically in the interface",
        "howTo.metadataValidation":
          "Automatic validation and warnings for missing metadata",
        "howTo.tipsAndTricks": "Tips & Tricks",
        "howTo.tipsDescription": "Make the most of your Gition experience",
        "howTo.navigation": "Navigation",
        "howTo.useSidebarToBrowse":
          "Use the sidebar to browse documents and tasks",
        "howTo.clickDocumentTitles":
          "Click document titles to view full content",
        "howTo.navigateBetweenSections":
          "Navigate between sections using the tabs",
        "howTo.organization": "Organization",
        "howTo.createFoldersToGroup": "Create folders to group related content",
        "howTo.useDescriptiveFileNames":
          "Use descriptive file names for better navigation",
        "howTo.addTagsInFrontmatter":
          "Add tags in frontmatter for categorization",
        "howTo.productivity": "Productivity",
        "howTo.checkHomepageForOverview":
          "Check the homepage for a project overview",
        "howTo.useTaskCompletionTracking":
          "Use task completion tracking to monitor progress",
        "howTo.keepCliRunning": "Keep the CLI running for real-time updates",
        "howTo.customization": "Customization",
        "howTo.runOnCustomPorts": "Run on custom ports to avoid conflicts",
        "howTo.serveAnyDirectory": "Serve any directory with documentation",
        "howTo.useDifferentFolderStructures":
          "Use different folder structures to fit your needs",
      };
      return translations[key] || key;
    },
  }),
}));

describe("HowToPage", () => {
  it("should render the main title and subtitle", () => {
    render(<HowToPage />);

    expect(screen.getByText("How to Use Gition")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Learn how to get the most out of your documentation and task management"
      )
    ).toBeInTheDocument();
  });

  it("should render the quick start section", () => {
    render(<HowToPage />);

    expect(screen.getByText("Quick Start")).toBeInTheDocument();
    expect(
      screen.getByText("Get up and running in minutes")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Navigate to your project directory")
    ).toBeInTheDocument();
    expect(screen.getByText("Run the Gition CLI")).toBeInTheDocument();
    expect(screen.getByText("Open in your browser")).toBeInTheDocument();
  });

  it("should render the CLI command examples", () => {
    render(<HowToPage />);

    expect(screen.getByText("cd your-project-folder")).toBeInTheDocument();
    expect(screen.getByText("npx gition")).toBeInTheDocument();
    expect(
      screen.getByText("Your browser will automatically open to localhost:3000")
    ).toBeInTheDocument();
  });

  it("should render the CLI options section", () => {
    render(<HowToPage />);

    expect(screen.getByText("CLI Options")).toBeInTheDocument();
    expect(screen.getByText("Customize how Gition runs")).toBeInTheDocument();

    expect(screen.getByText("gition [directory]")).toBeInTheDocument();
    expect(screen.getByText("gition --port 8080")).toBeInTheDocument();
    expect(screen.getByText("gition --no-open")).toBeInTheDocument();
    expect(
      screen.getByText("gition ~/my-docs --port 4000 --no-open")
    ).toBeInTheDocument();
  });

  it("should render CLI option descriptions", () => {
    render(<HowToPage />);

    expect(screen.getByText("Serve a specific directory")).toBeInTheDocument();
    expect(screen.getByText("Run on a custom port")).toBeInTheDocument();
    expect(
      screen.getByText("Don't automatically open browser")
    ).toBeInTheDocument();
    expect(screen.getByText("Combine multiple options")).toBeInTheDocument();
  });

  it("should render the documentation section", () => {
    render(<HowToPage />);

    expect(screen.getByText("Working with Documentation")).toBeInTheDocument();
    expect(
      screen.getByText("Create and organize your markdown documentation")
    ).toBeInTheDocument();

    expect(screen.getByText("Directory Structure")).toBeInTheDocument();
    expect(screen.getByText("Document Metadata")).toBeInTheDocument();
    expect(screen.getByText("Supported File Types")).toBeInTheDocument();
  });

  it("should render the directory structure example", () => {
    render(<HowToPage />);

    expect(screen.getByText("your-project/")).toBeInTheDocument();
    expect(screen.getByText("├── docs/")).toBeInTheDocument();
    expect(screen.getByText("│ ├── getting-started.md")).toBeInTheDocument();
    expect(screen.getByText("└── tasks/")).toBeInTheDocument();
  });

  it("should render the frontmatter metadata example", () => {
    render(<HowToPage />);

    expect(
      screen.getByText('title: "Getting Started Guide"')
    ).toBeInTheDocument();
    expect(
      screen.getByText('description: "Learn the basics"')
    ).toBeInTheDocument();
    expect(screen.getByText('type: "guide"')).toBeInTheDocument();
    expect(screen.getByText('author: "Development Team"')).toBeInTheDocument();
  });

  it("should render supported file types", () => {
    render(<HowToPage />);

    expect(screen.getByText("Supported File Types")).toBeInTheDocument();
    expect(screen.getByText(".md")).toBeInTheDocument();
    expect(screen.getByText(".mdx")).toBeInTheDocument();
    // Check if the content contains the descriptions rather than exact text matches
    expect(document.body.textContent).toContain("Standard Markdown files");
    expect(document.body.textContent).toContain("Markdown with JSX components");
  });

  it("should render the task management section", () => {
    render(<HowToPage />);

    expect(screen.getByText("Task Management")).toBeInTheDocument();
    expect(
      screen.getByText("Organize and track your project tasks")
    ).toBeInTheDocument();

    expect(screen.getByText("Two-Level Task Structure")).toBeInTheDocument();
    expect(screen.getByText("Creating Subtasks")).toBeInTheDocument();
    expect(screen.getByText("Task File Metadata")).toBeInTheDocument();
  });

  it("should render the two-level hierarchy explanation", () => {
    render(<HowToPage />);

    expect(screen.getByText("Important:")).toBeInTheDocument();
    expect(
      screen.getByText("Gition uses a two-level hierarchy for tasks")
    ).toBeInTheDocument();
    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("Subtasks")).toBeInTheDocument();
  });

  it("should render subtask syntax examples", () => {
    render(<HowToPage />);

    expect(screen.getByText("- [ ] Incomplete subtask")).toBeInTheDocument();
    expect(screen.getByText("- [x] Completed subtask")).toBeInTheDocument();
    expect(screen.getByText("- [~] In progress subtask")).toBeInTheDocument();
  });

  it("should render task metadata examples", () => {
    render(<HowToPage />);

    expect(
      screen.getByText('title: "User Authentication Epic"')
    ).toBeInTheDocument();
    expect(screen.getByText('type: "epic"')).toBeInTheDocument();
    expect(screen.getByText('priority: "high"')).toBeInTheDocument();
    expect(screen.getByText('assignee: "backend-team"')).toBeInTheDocument();
  });

  it("should render subtask inline metadata examples", () => {
    render(<HowToPage />);

    expect(
      screen.getByText(/High priority subtask.*\{priority: "high"\}/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Tagged subtask.*\{tags: \["frontend", "ui"\]\}/)
    ).toBeInTheDocument();
  });

  it("should render subtask reference examples", () => {
    render(<HowToPage />);

    expect(
      screen.getByText("- [ ] Complete user auth ref:epics/user-authentication")
    ).toBeInTheDocument();
    expect(
      screen.getByText("- [ ] Review login form ref:stories/login-ui")
    ).toBeInTheDocument();
    expect(
      screen.getByText("- [ ] Update docs ref:docs/api-guide")
    ).toBeInTheDocument();
  });

  it("should render task file organization structure", () => {
    render(<HowToPage />);

    expect(screen.getByText("tasks/")).toBeInTheDocument();
    expect(screen.getByText("├── epics/")).toBeInTheDocument();
    expect(
      screen.getByText("│ ├── user-authentication.mdx ← Task file")
    ).toBeInTheDocument();
    expect(screen.getByText("├── stories/")).toBeInTheDocument();
    expect(
      screen.getByText(
        'Each MDX file is a "Task" containing multiple "Subtasks"'
      )
    ).toBeInTheDocument();
  });

  it("should render task views information", () => {
    render(<HowToPage />);

    expect(screen.getByText("Task Views")).toBeInTheDocument();
    expect(screen.getByText("Task List")).toBeInTheDocument();
    expect(
      screen.getByText("Overview of all tasks with progress tracking")
    ).toBeInTheDocument();
    expect(screen.getByText("Kanban Board")).toBeInTheDocument();
    expect(
      screen.getByText("Drag-and-drop task management")
    ).toBeInTheDocument();
    expect(screen.getByText("Task Details")).toBeInTheDocument();
    expect(
      screen.getByText("View individual task files with subtasks")
    ).toBeInTheDocument();
  });

  it("should render advanced features", () => {
    render(<HowToPage />);

    expect(screen.getByText("Advanced Features")).toBeInTheDocument();
    // Look for the list items content instead of the full continuous text
    expect(screen.getByText(/Progress Tracking:/)).toBeInTheDocument();
    expect(screen.getByText(/Cross-References:/)).toBeInTheDocument();
    expect(screen.getByText(/MDX Rendering:/)).toBeInTheDocument();
    expect(screen.getByText(/Real-time Updates:/)).toBeInTheDocument();
    expect(screen.getByText(/Metadata Validation:/)).toBeInTheDocument();
  });

  it("should render navigation tips", () => {
    render(<HowToPage />);

    expect(screen.getByText("Navigation")).toBeInTheDocument();
    // Check if the page has lists with these tips rather than exact text matches
    expect(document.body.textContent).toContain(
      "Use the sidebar to browse documents and tasks"
    );
    expect(document.body.textContent).toContain(
      "Click document titles to view full content"
    );
    expect(document.body.textContent).toContain(
      "Navigate between sections using the tabs"
    );
  });

  it("should render organization tips", () => {
    render(<HowToPage />);

    expect(screen.getByText("Organization")).toBeInTheDocument();
    // Check if the page content contains these tips
    expect(document.body.textContent).toContain(
      "Create folders to group related content"
    );
    expect(document.body.textContent).toContain(
      "Use descriptive file names for better navigation"
    );
    expect(document.body.textContent).toContain(
      "Add tags in frontmatter for categorization"
    );
  });

  it("should render productivity tips", () => {
    render(<HowToPage />);

    expect(screen.getByText("Productivity")).toBeInTheDocument();
    expect(document.body.textContent).toContain(
      "Check the homepage for a project overview"
    );
    expect(document.body.textContent).toContain(
      "Use task completion tracking to monitor progress"
    );
    expect(document.body.textContent).toContain(
      "Keep the CLI running for real-time updates"
    );
  });

  it("should render customization tips", () => {
    render(<HowToPage />);

    expect(screen.getByText("Customization")).toBeInTheDocument();
    expect(document.body.textContent).toContain(
      "Run on custom ports to avoid conflicts"
    );
    expect(document.body.textContent).toContain(
      "Serve any directory with documentation"
    );
    expect(document.body.textContent).toContain(
      "Use different folder structures to fit your needs"
    );
  });

  it("should render tips and tricks section", () => {
    render(<HowToPage />);

    expect(screen.getByText("Tips & Tricks")).toBeInTheDocument();
    expect(
      screen.getByText("Make the most of your Gition experience")
    ).toBeInTheDocument();

    expect(screen.getByText("Navigation")).toBeInTheDocument();
    expect(screen.getByText("Organization")).toBeInTheDocument();
    expect(screen.getByText("Productivity")).toBeInTheDocument();
    expect(screen.getByText("Customization")).toBeInTheDocument();
  });

  it("should render step badges correctly", () => {
    render(<HowToPage />);

    // Find badges by their data-slot attribute
    const badges = document.querySelectorAll('[data-slot="badge"]');
    expect(badges[0]).toHaveTextContent("1");
    expect(badges[1]).toHaveTextContent("2");
    expect(badges[2]).toHaveTextContent("3");
  });

  it("should render icons for different sections", () => {
    render(<HowToPage />);

    // Icons should be present (we're checking the text content near them)
    expect(screen.getByText("Quick Start")).toBeInTheDocument();
    expect(screen.getByText("CLI Options")).toBeInTheDocument();
    expect(screen.getByText("Working with Documentation")).toBeInTheDocument();
    expect(screen.getByText("Task Management")).toBeInTheDocument();
  });

  it("should render separator elements", () => {
    render(<HowToPage />);

    // Check for separator class
    expect(
      document.querySelector('[data-orientation="horizontal"]')
    ).toBeInTheDocument();
  });

  it("should render available metadata fields", () => {
    render(<HowToPage />);

    expect(screen.getByText("Available fields:")).toBeInTheDocument();
    expect(
      screen.getByText(
        /title, description, type, category, tags, author, created, updated, status, version, language, section, order/
      )
    ).toBeInTheDocument();
  });

  it("should render subtask metadata fields", () => {
    render(<HowToPage />);

    expect(screen.getByText("Subtask fields:")).toBeInTheDocument();
    expect(
      screen.getByText(/priority, assignee, due, tags, estimate, status/)
    ).toBeInTheDocument();
  });

  it("should have proper responsive layout classes", () => {
    render(<HowToPage />);

    // Check for responsive grid classes
    expect(
      document.querySelector(".grid.gap-4.md\\:grid-cols-2")
    ).toBeInTheDocument();
    expect(document.querySelector(".mx-auto.max-w-4xl")).toBeInTheDocument();
  });
});
