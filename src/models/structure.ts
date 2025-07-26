/**
 * Directory structure data models for Gition
 * Contains interfaces for file system navigation and organization
 */

export interface DirectoryNode {
  name: string; // file or directory name
  path: string; // full filesystem path
  type: "file" | "directory"; // node type
  children?: DirectoryNode[]; // child nodes (if directory)
  isMarkdown?: boolean; // true if .md/.mdx file

  // Additional metadata
  size?: number; // file size in bytes (for files)
  lastModified?: Date; // last modification timestamp
  depth?: number; // nesting depth from root
}

export interface DirectoryStructure {
  root: DirectoryNode[]; // root directory contents
  docs: DirectoryNode[]; // documentation directory tree
  tasks: DirectoryNode[]; // tasks directory tree
  paths: {
    target: string; // target directory path
    docs: string; // docs directory path
    tasks: string; // tasks directory path
  };

  // Metadata
  lastScanned?: Date; // when structure was last scanned
  totalFiles?: number; // total number of files
  totalDirectories?: number; // total number of directories
  markdownFiles?: number; // number of .md/.mdx files
}

// Utility functions
export const isMarkdownFile = (filename: string): boolean => {
  const ext = filename.toLowerCase().split(".").pop();
  return ext === "md" || ext === "mdx";
};

export const getFileExtension = (filename: string): string => {
  return filename.toLowerCase().split(".").pop() || "";
};

export const calculateNodeDepth = (
  node: DirectoryNode,
  targetPath: string
): number => {
  const relativePath = node.path.replace(targetPath, "");
  return relativePath.split("/").filter((part) => part.length > 0).length;
};

export const flattenDirectoryTree = (
  nodes: DirectoryNode[]
): DirectoryNode[] => {
  const flattened: DirectoryNode[] = [];

  const traverse = (nodeList: DirectoryNode[]) => {
    nodeList.forEach((node) => {
      flattened.push(node);
      if (node.children) {
        traverse(node.children);
      }
    });
  };

  traverse(nodes);
  return flattened;
};

export const findNodeByPath = (
  nodes: DirectoryNode[],
  targetPath: string
): DirectoryNode | null => {
  for (const node of nodes) {
    if (node.path === targetPath) {
      return node;
    }
    if (node.children) {
      const found = findNodeByPath(node.children, targetPath);
      if (found) return found;
    }
  }
  return null;
};

export const getDirectoryStats = (structure: DirectoryStructure) => {
  const allNodes = [
    ...flattenDirectoryTree(structure.root),
    ...flattenDirectoryTree(structure.docs),
    ...flattenDirectoryTree(structure.tasks),
  ];

  const files = allNodes.filter((node) => node.type === "file");
  const directories = allNodes.filter((node) => node.type === "directory");
  const markdownFiles = files.filter((node) => node.isMarkdown);

  return {
    totalFiles: files.length,
    totalDirectories: directories.length,
    markdownFiles: markdownFiles.length,
    totalNodes: allNodes.length,
  };
};
