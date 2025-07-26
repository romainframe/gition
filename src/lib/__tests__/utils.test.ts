import { cn } from "../utils";

describe("cn utility", () => {
  it("should merge class names correctly", () => {
    expect(cn("px-2 py-1", "px-3")).toBe("py-1 px-3");
  });

  it("should handle conditional classes", () => {
    expect(cn("base", true && "conditional")).toBe("base conditional");
    expect(cn("base", false && "conditional")).toBe("base");
  });

  it("should handle object syntax", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });

  it("should handle arrays", () => {
    expect(cn(["base", "array"])).toBe("base array");
  });

  it("should remove duplicate Tailwind classes", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("should handle undefined and null values", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });

  it("should handle empty inputs", () => {
    expect(cn()).toBe("");
    expect(cn("")).toBe("");
  });

  it("should merge responsive variants correctly", () => {
    expect(cn("sm:px-2 md:px-4", "md:px-6")).toBe("sm:px-2 md:px-6");
  });
});
