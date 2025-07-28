import {
  getEnvironmentInfo,
  isDevelopment,
  isVibeInspectAvailable,
} from "../dev-mode";

declare global {
  var assignEnvVar: (key: string, value?: string) => void;
}

describe("dev-mode utilities", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    assignEnvVar("NODE_ENV", originalEnv);
  });

  describe("isDevelopment", () => {
    it("should return true when NODE_ENV is development", () => {
      assignEnvVar("NODE_ENV", "development");
      expect(isDevelopment()).toBe(true);
    });

    it("should return false when NODE_ENV is production", () => {
      assignEnvVar("NODE_ENV", "production");
      expect(isDevelopment()).toBe(false);
    });

    it("should return false when NODE_ENV is test", () => {
      assignEnvVar("NODE_ENV", "test");
      expect(isDevelopment()).toBe(false);
    });

    it("should return false when NODE_ENV is undefined", () => {
      assignEnvVar("NODE_ENV", undefined);
      expect(isDevelopment()).toBe(false);
    });
  });

  describe("isVibeInspectAvailable", () => {
    it("should return true when in development mode", () => {
      assignEnvVar("NODE_ENV", "development");
      expect(isVibeInspectAvailable()).toBe(true);
    });

    it("should return false when in production mode", () => {
      assignEnvVar("NODE_ENV", "production");
      expect(isVibeInspectAvailable()).toBe(false);
    });

    it("should return false when in test mode", () => {
      assignEnvVar("NODE_ENV", "test");
      expect(isVibeInspectAvailable()).toBe(false);
    });
  });

  describe("getEnvironmentInfo", () => {
    it("should return environment info for development", () => {
      assignEnvVar("NODE_ENV", "development");

      const info = getEnvironmentInfo();

      expect(info).toEqual({
        nodeEnv: "development",
        isDev: true,
        isVibeInspectAvailable: true,
      });
    });

    it("should return environment info for production", () => {
      assignEnvVar("NODE_ENV", "production");

      const info = getEnvironmentInfo();

      expect(info).toEqual({
        nodeEnv: "production",
        isDev: false,
        isVibeInspectAvailable: false,
      });
    });

    it("should return environment info for test", () => {
      assignEnvVar("NODE_ENV", "test");

      const info = getEnvironmentInfo();

      expect(info).toEqual({
        nodeEnv: "test",
        isDev: false,
        isVibeInspectAvailable: false,
      });
    });

    it("should handle undefined NODE_ENV", () => {
      assignEnvVar("NODE_ENV", undefined);

      const info = getEnvironmentInfo();

      expect(info).toEqual({
        nodeEnv: undefined,
        isDev: false,
        isVibeInspectAvailable: false,
      });
    });
  });
});
