import {
  type DirectoryNode,
  type DirectoryStructure,
  calculateNodeDepth,
  findNodeByPath,
  flattenDirectoryTree,
  getDirectoryStats,
  getFileExtension,
  isMarkdownFile,
} from "../structure";

describe("Structure Model Utils", () => {
  describe("isMarkdownFile", () => {
    it("should return true for markdown files", () => {
      expect(isMarkdownFile("README.md")).toBe(true);
      expect(isMarkdownFile("guide.mdx")).toBe(true);
      expect(isMarkdownFile("docs/tutorial.md")).toBe(true);
      expect(isMarkdownFile("CHANGELOG.MD")).toBe(true);
    });

    it("should return false for non-markdown files", () => {
      expect(isMarkdownFile("index.js")).toBe(false);
      expect(isMarkdownFile("styles.css")).toBe(false);
      expect(isMarkdownFile("image.png")).toBe(false);
      expect(isMarkdownFile("markdown.txt")).toBe(false);
    });
  });

  describe("getFileExtension", () => {
    it("should extract file extensions correctly", () => {
      expect(getFileExtension("file.txt")).toBe("txt");
      expect(getFileExtension("document.pdf")).toBe("pdf");
      expect(getFileExtension("script.test.js")).toBe("js");
      expect(getFileExtension("README.md")).toBe("md");
    });

    it("should handle files without extensions", () => {
      expect(getFileExtension("README")).toBe("readme");
      expect(getFileExtension("Makefile")).toBe("makefile");
    });

    it("should handle hidden files", () => {
      expect(getFileExtension(".gitignore")).toBe("gitignore");
      expect(getFileExtension(".env.local")).toBe("local");
    });
  });

  describe("calculateNodeDepth", () => {
    const createNode = (path: string): DirectoryNode => ({
      name: path.split("/").pop() || "",
      path,
      type: "file",
      stats: {
        size: 100,
        created: new Date(),
        modified: new Date(),
      },
    });

    it("should calculate depth correctly", () => {
      expect(
        calculateNodeDepth(createNode("/project/file.txt"), "/project")
      ).toBe(1);
      expect(
        calculateNodeDepth(createNode("/project/docs/readme.md"), "/project")
      ).toBe(2);
      expect(
        calculateNodeDepth(
          createNode("/project/src/components/Button.tsx"),
          "/project"
        )
      ).toBe(3);
      expect(
        calculateNodeDepth(
          createNode("/project/src/lib/utils/helpers.js"),
          "/project"
        )
      ).toBe(4);
    });

    it("should handle root path", () => {
      expect(calculateNodeDepth(createNode("/project"), "/project")).toBe(0);
    });
  });

  describe("flattenDirectoryTree", () => {
    const createNodes = (): DirectoryNode[] => [
      {
        name: "project",
        path: "project",
        type: "directory",
        children: [
          {
            name: "src",
            path: "project/src",
            type: "directory",
            children: [
              {
                name: "index.js",
                path: "project/src/index.js",
                type: "file",
                stats: {
                  size: 1000,
                  created: new Date(),
                  modified: new Date(),
                },
              },
            ],
          },
          {
            name: "README.md",
            path: "project/README.md",
            type: "file",
            stats: {
              size: 500,
              created: new Date(),
              modified: new Date(),
            },
          },
        ],
      },
    ];

    it("should flatten directory tree correctly", () => {
      const nodes = createNodes();
      const flattened = flattenDirectoryTree(nodes);

      expect(flattened).toHaveLength(4);
      expect(flattened.map((n) => n.name)).toContain("project");
      expect(flattened.map((n) => n.name)).toContain("src");
      expect(flattened.map((n) => n.name)).toContain("index.js");
      expect(flattened.map((n) => n.name)).toContain("README.md");
    });

    it("should include all nodes regardless of type", () => {
      const nodes = createNodes();
      const flattened = flattenDirectoryTree(nodes);

      const directories = flattened.filter((n) => n.type === "directory");
      const files = flattened.filter((n) => n.type === "file");

      expect(directories).toHaveLength(2);
      expect(files).toHaveLength(2);
    });
  });

  describe("findNodeByPath", () => {
    const createNodes = (): DirectoryNode[] => [
      {
        name: "root",
        path: "root",
        type: "directory",
        children: [
          {
            name: "docs",
            path: "root/docs",
            type: "directory",
            children: [
              {
                name: "guide.md",
                path: "root/docs/guide.md",
                type: "file",
                stats: {
                  size: 1000,
                  created: new Date(),
                  modified: new Date(),
                },
              },
            ],
          },
          {
            name: "src",
            path: "root/src",
            type: "directory",
            children: [],
          },
        ],
      },
    ];

    it("should find nodes by path", () => {
      const nodes = createNodes();

      const found = findNodeByPath(nodes, "root/docs/guide.md");
      expect(found).toBeDefined();
      expect(found?.name).toBe("guide.md");
      expect(found?.type).toBe("file");
    });

    it("should find directory nodes", () => {
      const nodes = createNodes();

      const found = findNodeByPath(nodes, "root/docs");
      expect(found).toBeDefined();
      expect(found?.name).toBe("docs");
      expect(found?.type).toBe("directory");
    });

    it("should return null for non-existent paths", () => {
      const nodes = createNodes();

      const found = findNodeByPath(nodes, "root/nonexistent");
      expect(found).toBeNull();
    });

    it("should find the root node itself", () => {
      const nodes = createNodes();

      const found = findNodeByPath(nodes, "root");
      expect(found).toBe(nodes[0]);
    });
  });

  describe("getDirectoryStats", () => {
    const createStructure = (): DirectoryStructure => ({
      root: [
        {
          name: "project",
          path: "project",
          type: "directory",
          children: [
            {
              name: "README.md",
              path: "project/README.md",
              type: "file",
              isMarkdown: true,
              stats: {
                size: 1000,
                created: new Date(),
                modified: new Date(),
              },
            },
          ],
        },
      ],
      docs: [
        {
          name: "guide.md",
          path: "docs/guide.md",
          type: "file",
          isMarkdown: true,
          stats: {
            size: 500,
            created: new Date(),
            modified: new Date(),
          },
        },
      ],
      tasks: [
        {
          name: "task1.md",
          path: "tasks/task1.md",
          type: "file",
          isMarkdown: true,
          stats: {
            size: 300,
            created: new Date(),
            modified: new Date(),
          },
        },
      ],
      paths: {
        target: "/project",
        docs: "/project/docs",
        tasks: "/project/tasks",
      },
    });

    it("should calculate directory stats correctly", () => {
      const structure = createStructure();
      const stats = getDirectoryStats(structure);

      expect(stats.totalFiles).toBe(3);
      expect(stats.totalDirectories).toBe(1);
      expect(stats.markdownFiles).toBe(3);
      expect(stats.totalNodes).toBe(4);
    });

    it("should handle empty structure", () => {
      const emptyStructure: DirectoryStructure = {
        root: [],
        docs: [],
        tasks: [],
        paths: {
          target: "/empty",
          docs: "/empty/docs",
          tasks: "/empty/tasks",
        },
      };

      const stats = getDirectoryStats(emptyStructure);
      expect(stats.totalFiles).toBe(0);
      expect(stats.totalDirectories).toBe(0);
      expect(stats.markdownFiles).toBe(0);
      expect(stats.totalNodes).toBe(0);
    });
  });
});
