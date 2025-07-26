import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dump, load } from "js-yaml";
import { join } from "path";

import { DEFAULT_CONFIG, GitionConfig, validateConfig } from "@/types/config";

export class ConfigManager {
  private configPath: string;
  private configDir: string;
  private config: GitionConfig;

  constructor(workspaceDir: string) {
    this.configDir = join(workspaceDir, ".gitionrc");
    this.configPath = join(this.configDir, "config.yaml");
    this.config = { ...DEFAULT_CONFIG };
    this.loadConfig();
  }

  /**
   * Load configuration from .gitionrc/config.yaml
   */
  private loadConfig(): void {
    try {
      if (existsSync(this.configPath)) {
        const configContent = readFileSync(this.configPath, "utf8");
        const userConfig = load(configContent) as Partial<GitionConfig>;

        // Validate configuration
        const validation = validateConfig(userConfig);
        if (!validation.valid) {
          console.warn("⚠️ Configuration validation errors:");
          validation.errors.forEach((error) => console.warn(`  - ${error}`));
        }

        // Merge with defaults (deep merge for nested objects)
        this.config = this.deepMerge(DEFAULT_CONFIG, userConfig);
        console.log("✅ Configuration loaded from", this.configPath);
      } else {
        console.log(
          "📝 Using default configuration (no .gitionrc/config.yaml found)"
        );
      }
    } catch (error) {
      console.error("❌ Error loading configuration:", error);
      console.log("📝 Falling back to default configuration");
    }
  }

  /**
   * Save configuration to .gitionrc/config.yaml
   */
  public saveConfig(config: Partial<GitionConfig>): void {
    try {
      // Ensure config directory exists
      if (!existsSync(this.configDir)) {
        mkdirSync(this.configDir, { recursive: true });
      }

      // Validate configuration
      const validation = validateConfig(config);
      if (!validation.valid) {
        throw new Error(
          "Configuration validation failed: " + validation.errors.join(", ")
        );
      }

      // Merge with current config
      this.config = this.deepMerge(this.config, config);

      // Save to file
      const yamlContent = dump(this.config, {
        indent: 2,
        lineWidth: 100,
        noRefs: true,
      });

      writeFileSync(this.configPath, yamlContent, "utf8");
      console.log("✅ Configuration saved to", this.configPath);
    } catch (error) {
      console.error("❌ Error saving configuration:", error);
      throw error;
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): GitionConfig {
    return { ...this.config };
  }

  /**
   * Get specific config value with dot notation
   */
  public get<T>(path: string): T | undefined {
    return this.getNestedValue(this.config, path);
  }

  /**
   * Set specific config value with dot notation
   */
  public set(path: string, value: unknown): void {
    const config = { ...this.config };
    this.setNestedValue(config, path, value);
    this.saveConfig(config);
  }

  /**
   * Initialize default configuration file
   */
  public initializeConfig(customConfig?: Partial<GitionConfig>): void {
    const initialConfig = customConfig
      ? this.deepMerge(DEFAULT_CONFIG, customConfig)
      : DEFAULT_CONFIG;
    this.saveConfig(initialConfig);
  }

  /**
   * Check if configuration file exists
   */
  public configExists(): boolean {
    return existsSync(this.configPath);
  }

  /**
   * Get configuration file path
   */
  public getConfigPath(): string {
    return this.configPath;
  }

  /**
   * Get configuration directory path
   */
  public getConfigDir(): string {
    return this.configDir;
  }

  /**
   * Deep merge two objects
   */
  private deepMerge(
    target: Record<string, unknown>,
    source: Record<string, unknown>
  ): Record<string, unknown> {
    const result = { ...target };

    for (const key in source) {
      if (
        source[key] !== null &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * Get nested value using dot notation
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  /**
   * Set nested value using dot notation
   */
  private setNestedValue(
    obj: Record<string, unknown>,
    path: string,
    value: unknown
  ): void {
    const keys = path.split(".");
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!(key in current)) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }
}

// Global config manager instance
let configManager: ConfigManager | null = null;

/**
 * Initialize configuration manager
 */
export function initializeConfig(workspaceDir: string): ConfigManager {
  configManager = new ConfigManager(workspaceDir);
  return configManager;
}

/**
 * Get configuration manager instance
 */
export function getConfigManager(): ConfigManager {
  if (!configManager) {
    throw new Error(
      "Configuration manager not initialized. Call initializeConfig() first."
    );
  }
  return configManager;
}

/**
 * Get configuration value
 */
export function getConfig(): GitionConfig {
  return getConfigManager().getConfig();
}

/**
 * Get specific configuration value
 */
export function getConfigValue<T>(path: string): T | undefined {
  return getConfigManager().get<T>(path);
}
