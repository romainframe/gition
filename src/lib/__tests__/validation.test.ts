import { z } from "zod";

import {
  filePathSchema,
  parseValidationError,
  sanitizeFilename,
  sanitizeHtml,
  sanitizeMarkdown,
  subtaskSchema,
  taskMetadataSchema,
} from "../validation";

describe("Validation Schemas", () => {
  describe("filePathSchema", () => {
    it("should accept valid file paths", () => {
      const validPaths = [
        "tasks/epic.mdx",
        "docs/api/reference.md",
        "src/components/Button.tsx",
        "file-with-dash.txt",
        "UPPERCASE.MD",
      ];

      validPaths.forEach((path) => {
        expect(() => filePathSchema.parse(path)).not.toThrow();
      });
    });

    it("should reject invalid file paths", () => {
      const invalidPaths = [
        "../etc/passwd", // Path traversal
        "file with spaces.txt", // Spaces
        "file@#$.txt", // Special characters
        "", // Empty
      ];

      invalidPaths.forEach((path) => {
        expect(() => filePathSchema.parse(path)).toThrow();
      });
    });
  });

  describe("taskMetadataSchema", () => {
    it("should accept valid task metadata", () => {
      const validTask = {
        title: "Implement user authentication",
        type: "epic",
        status: "in_progress",
        priority: "high",
        assignee: "john.doe",
        description: "Complete auth system with OAuth support",
        tags: ["auth", "security", "backend"],
      };

      expect(() => taskMetadataSchema.parse(validTask)).not.toThrow();
    });

    it("should accept minimal valid task", () => {
      const minimalTask = {
        title: "Fix bug",
        type: "bug",
        status: "todo",
        priority: "low",
      };

      expect(() => taskMetadataSchema.parse(minimalTask)).not.toThrow();
    });

    it("should reject invalid task metadata", () => {
      const invalidTask = {
        title: "", // Empty title
        type: "invalid", // Invalid type
        status: "todo",
        priority: "high",
      };

      expect(() => taskMetadataSchema.parse(invalidTask)).toThrow();
    });
  });

  describe("subtaskSchema", () => {
    it("should accept valid subtask", () => {
      const validSubtask = {
        id: "subtask-1",
        text: "Set up database schema",
        completed: false,
        priority: "high",
        assignee: "jane.doe",
        status: "in_progress",
      };

      expect(() => subtaskSchema.parse(validSubtask)).not.toThrow();
    });

    it("should accept minimal subtask", () => {
      const minimalSubtask = {
        id: "subtask-2",
        text: "Write tests",
        completed: true,
      };

      expect(() => subtaskSchema.parse(minimalSubtask)).not.toThrow();
    });
  });
});

describe("Sanitization Functions", () => {
  describe("sanitizeHtml", () => {
    it("should escape HTML special characters", () => {
      expect(sanitizeHtml('<script>alert("XSS")</script>')).toBe(
        "&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;"
      );
      expect(sanitizeHtml("It's a <test> & 'quoted' string")).toBe(
        "It&#x27;s a &lt;test&gt; &amp; &#x27;quoted&#x27; string"
      );
    });
  });

  describe("sanitizeFilename", () => {
    it("should sanitize filenames", () => {
      expect(sanitizeFilename("My File Name.txt")).toBe("my-file-name.txt");
      expect(sanitizeFilename("file@#$%^&*.doc")).toBe("file-.doc");
      expect(sanitizeFilename("--multiple---dashes--")).toBe("multiple-dashes");
      expect(sanitizeFilename("UPPERCASE.PDF")).toBe("uppercase.pdf");
    });

    it("should limit filename length", () => {
      const longName = "a".repeat(300) + ".txt";
      const result = sanitizeFilename(longName);
      expect(result.length).toBeLessThanOrEqual(255);
    });
  });

  describe("sanitizeMarkdown", () => {
    it("should remove dangerous patterns but preserve markdown", () => {
      const input = `# Title
      
<script>alert('XSS')</script>

Some **bold** text with [a link](javascript:alert('XSS'))

<iframe src="evil.com"></iframe>

\`\`\`javascript
const code = 'safe';
\`\`\``;

      const output = sanitizeMarkdown(input);
      expect(output).toContain("# Title");
      expect(output).toContain("**bold**");
      expect(output).not.toContain("<script>");
      expect(output).not.toContain("<iframe>");
      expect(output).not.toContain("javascript:");
      expect(output).toContain("const code = 'safe'");
    });
  });
});

describe("parseValidationError", () => {
  it("should format Zod errors nicely", () => {
    const schema = z.object({
      name: z.string().min(1),
      age: z.number().min(18),
      email: z.string().email(),
    });

    try {
      schema.parse({
        name: "",
        age: 16,
        email: "invalid",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = parseValidationError(error);
        expect(message).toContain("name:");
        expect(message).toContain("age:");
        expect(message).toContain("email:");
      }
    }
  });
});
