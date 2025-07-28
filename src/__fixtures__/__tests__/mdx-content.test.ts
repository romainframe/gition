import { sampleMdxFiles } from "../mdx-content";

describe("MDX Content Fixtures", () => {
  describe("sampleMdxFiles", () => {
    it("should export all required sample MDX files", () => {
      expect(sampleMdxFiles).toBeDefined();
      expect(sampleMdxFiles.epicFile).toBeDefined();
      expect(sampleMdxFiles.storyFile).toBeDefined();
      expect(sampleMdxFiles.bugFile).toBeDefined();
      expect(sampleMdxFiles.docFile).toBeDefined();
    });

    describe("epicFile", () => {
      const { epicFile } = sampleMdxFiles;

      it("should have correct structure", () => {
        expect(epicFile).toHaveProperty("path");
        expect(epicFile).toHaveProperty("content");
        expect(typeof epicFile.path).toBe("string");
        expect(typeof epicFile.content).toBe("string");
      });

      it("should have valid file path", () => {
        expect(epicFile.path).toBe("tasks/epics/payment-integration.mdx");
        expect(epicFile.path).toMatch(/\.mdx$/);
        expect(epicFile.path).toMatch(/^tasks\/epics\//);
      });

      it("should contain valid frontmatter", () => {
        const content = epicFile.content;

        // Should start with frontmatter delimiter
        expect(content).toMatch(/^---\n/);

        // Should contain required frontmatter fields
        expect(content).toMatch(/title: ["']Payment System Integration["']/);
        expect(content).toMatch(/type: ["']epic["']/);
        expect(content).toMatch(/status: ["']todo["']/);
        expect(content).toMatch(/priority: ["']high["']/);
        expect(content).toMatch(/assignee: ["']team-lead["']/);
        expect(content).toMatch(/description: ["'][^"']+["']/);
        expect(content).toMatch(/tags: \[[^\]]+\]/);
      });

      it("should contain markdown content", () => {
        const content = epicFile.content;

        // Should contain markdown headers
        expect(content).toMatch(/# Payment System Integration/);
        expect(content).toMatch(/## Objectives/);
        expect(content).toMatch(/## Subtasks/);

        // Should contain task list items
        expect(content).toMatch(/- \[ \] Research payment provider APIs/);
        expect(content).toMatch(/- \[ \] Design payment abstraction layer/);
        expect(content).toMatch(/- \[ \] Implement Stripe integration/);
      });

      it("should contain subtasks with metadata", () => {
        const content = epicFile.content;

        // Should contain subtasks with priority metadata
        expect(content).toContain('priority: "high"');
        expect(content).toContain('priority: "medium"');

        // Should contain assignee metadata
        expect(content).toContain('assignee: "architect"');
        expect(content).toContain('assignee: "frontend-dev"');

        // Should contain status metadata
        expect(content).toContain('status: "todo"');
      });

      it("should have realistic epic content structure", () => {
        const content = epicFile.content;

        // Epic should mention multiple payment providers
        expect(content).toMatch(/Stripe/);
        expect(content).toMatch(/PayPal/);
        expect(content).toMatch(/Square/);

        // Should mention compliance and security
        expect(content).toMatch(/PCI compliance/);
        expect(content).toMatch(/webhook/i);

        // Should have comprehensive task breakdown
        const taskMatches = content.match(/- \[ \]/g);
        expect(taskMatches).toBeTruthy();
        expect(taskMatches!.length).toBeGreaterThan(5);
      });
    });

    describe("storyFile", () => {
      const { storyFile } = sampleMdxFiles;

      it("should have correct structure", () => {
        expect(storyFile).toHaveProperty("path");
        expect(storyFile).toHaveProperty("content");
        expect(typeof storyFile.path).toBe("string");
        expect(typeof storyFile.content).toBe("string");
      });

      it("should have valid file path", () => {
        expect(storyFile.path).toBe("tasks/stories/user-profile.mdx");
        expect(storyFile.path).toMatch(/\.mdx$/);
        expect(storyFile.path).toMatch(/^tasks\/stories\//);
      });

      it("should contain valid frontmatter for story type", () => {
        const content = storyFile.content;

        expect(content).toMatch(/type: ["']story["']/);
        expect(content).toMatch(/status: ["']in_progress["']/);
        expect(content).toMatch(/priority: ["']medium["']/);
        expect(content).toMatch(/assignee: ["']jane\.developer["']/);
        expect(content).toMatch(/title: ["']User Profile Page["']/);
      });

      it("should contain user story structure", () => {
        const content = storyFile.content;

        // Should have requirements section
        expect(content).toMatch(/## Requirements/);
        expect(content).toMatch(/## Implementation/);

        // Should mention user-focused features
        expect(content).toMatch(/user/i);
        expect(content).toMatch(/profile/i);
        expect(content).toMatch(/settings/i);
      });

      it("should contain mixed task states", () => {
        const content = storyFile.content;

        // Should have completed tasks
        expect(content).toMatch(/- \[x\]/);

        // Should have pending tasks
        expect(content).toMatch(/- \[ \]/);

        // Should have status metadata
        expect(content).toMatch(/status: "done"/);
        expect(content).toMatch(/status: "in_progress"/);
      });

      it("should contain frontend-related tags", () => {
        const content = storyFile.content;

        expect(content).toMatch(/frontend/);
        expect(content).toMatch(/ui/);
        expect(content).toMatch(/user-experience/);
      });
    });

    describe("bugFile", () => {
      const { bugFile } = sampleMdxFiles;

      it("should have correct structure", () => {
        expect(bugFile).toHaveProperty("path");
        expect(bugFile).toHaveProperty("content");
        expect(typeof bugFile.path).toBe("string");
        expect(typeof bugFile.content).toBe("string");
      });

      it("should have valid file path", () => {
        expect(bugFile.path).toBe("tasks/bugs/login-error.mdx");
        expect(bugFile.path).toMatch(/\.mdx$/);
        expect(bugFile.path).toMatch(/^tasks\/bugs\//);
      });

      it("should contain valid bug frontmatter", () => {
        const content = bugFile.content;

        expect(content).toMatch(/type: ["']bug["']/);
        expect(content).toMatch(/status: ["']in_progress["']/);
        expect(content).toMatch(/priority: ["']high["']/);
        expect(content).toMatch(/assignee: ["']bob\.fixer["']/);
        expect(content).toMatch(/title: ["']Login Form Error on Mobile["']/);
      });

      it("should contain bug report structure", () => {
        const content = bugFile.content;

        expect(content).toMatch(/## Bug Details/);
        expect(content).toMatch(/## Steps to Reproduce/);
        expect(content).toMatch(/## Tasks/);

        // Should mention affected versions
        expect(content).toMatch(/Affected Versions/);
        expect(content).toMatch(/Browsers/);
        expect(content).toMatch(/Severity/);
      });

      it("should contain bug-specific information", () => {
        const content = bugFile.content;

        // Should mention mobile-specific issues
        expect(content).toMatch(/mobile/i);
        expect(content).toMatch(/Safari iOS/);
        expect(content).toMatch(/Chrome Android/);

        // Should have reproduction steps
        expect(content).toMatch(/1\./);
        expect(content).toMatch(/2\./);
        expect(content).toMatch(/3\./);

        // Should mention specific browsers and versions
        expect(content).toMatch(/v\d+\.\d+\.\d+/);
      });

      it("should contain bug resolution tasks", () => {
        const content = bugFile.content;

        // Should have completed investigation tasks
        expect(content).toMatch(/- \[x\] Reproduce bug/);
        expect(content).toMatch(/- \[x\] Identify root cause/);

        // Should have pending fix tasks
        expect(content).toMatch(/- \[ \] Fix touch event handling/);
        expect(content).toMatch(/- \[ \] Test fix on multiple devices/);
        expect(content).toMatch(/- \[ \] Deploy hotfix/);
      });

      it("should contain urgent bug tags", () => {
        const content = bugFile.content;

        expect(content).toMatch(/bug/);
        expect(content).toMatch(/mobile/);
        expect(content).toMatch(/authentication/);
        expect(content).toMatch(/urgent/);
      });
    });

    describe("docFile", () => {
      const { docFile } = sampleMdxFiles;

      it("should have correct structure", () => {
        expect(docFile).toHaveProperty("path");
        expect(docFile).toHaveProperty("content");
        expect(typeof docFile.path).toBe("string");
        expect(typeof docFile.content).toBe("string");
      });

      it("should have valid file path", () => {
        expect(docFile.path).toBe("docs/api-guide.mdx");
        expect(docFile.path).toMatch(/\.mdx$/);
        expect(docFile.path).toMatch(/^docs\//);
      });

      it("should contain valid documentation frontmatter", () => {
        const content = docFile.content;

        expect(content).toMatch(/type: ["']documentation["']/);
        expect(content).toMatch(/status: ["']done["']/);
        expect(content).toMatch(/priority: ["']low["']/);
        expect(content).toMatch(/title: ["']API Documentation["']/);
      });

      it("should contain documentation structure", () => {
        const content = docFile.content;

        expect(content).toMatch(/# API Documentation/);
        expect(content).toMatch(/## Authentication/);
        expect(content).toMatch(/## Endpoints/);
        expect(content).toMatch(/## Rate Limiting/);
      });

      it("should contain API documentation content", () => {
        const content = docFile.content;

        // Should mention API endpoints
        expect(content).toMatch(/GET \/api\/users/);
        expect(content).toMatch(/POST \/api\/users/);

        // Should mention authentication
        expect(content).toMatch(/Bearer tokens/);

        // Should mention rate limiting
        expect(content).toMatch(/100 requests per minute/);
      });

      it("should contain documentation-specific tags", () => {
        const content = docFile.content;

        expect(content).toMatch(/docs/);
        expect(content).toMatch(/api/);
        expect(content).toMatch(/reference/);
      });
    });
  });

  describe("fixture content validation", () => {
    it("should have unique file paths across all fixtures", () => {
      const paths = [
        sampleMdxFiles.epicFile.path,
        sampleMdxFiles.storyFile.path,
        sampleMdxFiles.bugFile.path,
        sampleMdxFiles.docFile.path,
      ];

      const uniquePaths = new Set(paths);
      expect(uniquePaths.size).toBe(paths.length);
    });

    it("should have realistic content length for each fixture", () => {
      Object.values(sampleMdxFiles).forEach((file) => {
        expect(file.content.length).toBeGreaterThan(200);
        expect(file.content.length).toBeLessThan(5000);
      });
    });

    it("should contain valid YAML frontmatter for all fixtures", () => {
      Object.values(sampleMdxFiles).forEach((file) => {
        const content = file.content;

        // Should start and end frontmatter properly
        expect(content).toMatch(/^---\n/);
        expect(content).toMatch(/\n---\n/);

        // Should have required fields
        expect(content).toMatch(/title:/);
        expect(content).toMatch(/type:/);
        expect(content).toMatch(/status:/);
        expect(content).toMatch(/priority:/);
      });
    });

    it("should use consistent metadata format across fixtures", () => {
      Object.values(sampleMdxFiles).forEach((file) => {
        const content = file.content;

        // Priority should be one of expected values
        expect(content).toMatch(/priority: ["'](low|medium|high|critical)["']/);

        // Status should be one of expected values
        expect(content).toMatch(/status: ["'](todo|in_progress|done)["']/);

        // Type should be one of expected values
        expect(content).toMatch(
          /type: ["'](epic|story|bug|task|documentation)["']/
        );
      });
    });

    it("should contain realistic assignee names", () => {
      const allContent = Object.values(sampleMdxFiles)
        .map((file) => file.content)
        .join(" ");

      // Should contain realistic developer names
      expect(allContent).toMatch(
        /john\.doe|jane\.developer|bob\.fixer|team-lead|architect|frontend-dev|designer|qa-team/
      );
    });

    it("should contain appropriate tags for each content type", () => {
      // Epic should have backend/integration tags
      expect(sampleMdxFiles.epicFile.content).toMatch(
        /backend|integration|payments/
      );

      // Story should have frontend/UI tags
      expect(sampleMdxFiles.storyFile.content).toMatch(
        /frontend|ui|user-experience/
      );

      // Bug should have bug/urgent tags
      expect(sampleMdxFiles.bugFile.content).toMatch(
        /bug|mobile|authentication|urgent/
      );

      // Doc should have docs/reference tags
      expect(sampleMdxFiles.docFile.content).toMatch(/docs|api|reference/);
    });
  });

  describe("fixture usage scenarios", () => {
    it("should be suitable for testing MDX parsing", () => {
      Object.values(sampleMdxFiles).forEach((file) => {
        const content = file.content;

        // Should have both frontmatter and markdown content
        const frontmatterMatch = content.match(
          /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
        );
        expect(frontmatterMatch).toBeTruthy();

        if (frontmatterMatch) {
          const [, frontmatter, markdown] = frontmatterMatch;
          expect(frontmatter.trim()).not.toBe("");
          expect(markdown.trim()).not.toBe("");
        }
      });
    });

    it("should be suitable for testing task parsing", () => {
      const tasksWithCheckboxes = [
        sampleMdxFiles.epicFile,
        sampleMdxFiles.storyFile,
        sampleMdxFiles.bugFile,
      ];

      tasksWithCheckboxes.forEach((file) => {
        const content = file.content;

        // Should contain task list items
        expect(content).toMatch(/- \[ \]/); // Uncompleted tasks

        // Some should have completed tasks
        const hasCompletedTasks = content.includes("- [x]");
        if (file !== sampleMdxFiles.epicFile) {
          expect(hasCompletedTasks).toBe(true);
        }
      });
    });

    it("should provide diverse content for comprehensive testing", () => {
      const allContent = Object.values(sampleMdxFiles)
        .map((file) => file.content)
        .join(" ");

      // Should cover different task types
      expect(allContent).toMatch(/epic|story|bug|documentation/);

      // Should cover different priorities
      expect(allContent).toMatch(/low|medium|high/);

      // Should cover different statuses
      expect(allContent).toMatch(/todo|in_progress|done/);

      // Should have varied content domains
      expect(allContent).toMatch(/payment|profile|login|api/i);
    });
  });
});
