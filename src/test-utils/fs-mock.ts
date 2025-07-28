import { Dirent } from "fs";

/**
 * Helper function to create properly typed Dirent mock objects
 * Solves the TypeScript issue: Type 'Dirent<string>' is not assignable to type 'Dirent<Buffer<ArrayBufferLike>>'
 */
export const createMockDirent = (name: string, isFile = true): Dirent =>
  ({
    name: name as unknown as Buffer,
    isFile: () => isFile,
    isDirectory: () => !isFile,
    isBlockDevice: () => false,
    isCharacterDevice: () => false,
    isFIFO: () => false,
    isSocket: () => false,
    isSymbolicLink: () => false,
  }) as unknown as Dirent;
