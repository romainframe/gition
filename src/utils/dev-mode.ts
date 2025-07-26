/**
 * Development mode utilities for Gition
 */

/**
 * Check if the application is running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Check if vibe-inspect mode should be available
 * Only available in development mode
 */
export function isVibeInspectAvailable(): boolean {
  return isDevelopment();
}

/**
 * Get environment information for debugging
 */
export function getEnvironmentInfo() {
  return {
    nodeEnv: process.env.NODE_ENV,
    isDev: isDevelopment(),
    isVibeInspectAvailable: isVibeInspectAvailable(),
  };
}
