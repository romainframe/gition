/**
 * @deprecated Use @/models instead
 * This file exists for backward compatibility
 */

// Re-export all config types from the new models location
export type {
  GitionThemeConfig,
  GitionTaskType,
  GitionUser,
  GitionEnvironmentVars,
  GitionConfig,
} from "@/models/config";

export {
  DEFAULT_CONFIG,
  validateConfig,
  mergeConfig,
  getTaskTypeByFolder,
  getUserById,
} from "@/models/config";
