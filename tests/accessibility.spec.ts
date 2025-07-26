import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Accessibility", () => {
  test("should not have critical accessibility issues on homepage", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("h1", { timeout: 15000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(["color-contrast", "button-name", "link-name"])
      .analyze();

    // Only check for critical violations, not all minor ones
    const criticalViolations = accessibilityScanResults.violations.filter(
      (violation) =>
        violation.impact === "critical" || violation.impact === "serious"
    );

    expect(criticalViolations).toEqual([]);
  });

  test("should not have critical accessibility issues on docs page", async ({
    page,
  }) => {
    await page.goto("/docs");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(["color-contrast", "button-name", "link-name"])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (violation) =>
        violation.impact === "critical" || violation.impact === "serious"
    );

    expect(criticalViolations).toEqual([]);
  });

  test("should not have critical accessibility issues on tasks page", async ({
    page,
  }) => {
    await page.goto("/tasks");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("h1", { timeout: 15000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(["color-contrast", "button-name", "link-name"])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (violation) =>
        violation.impact === "critical" || violation.impact === "serious"
    );

    expect(criticalViolations).toEqual([]);
  });

  test("should have basic keyboard navigation", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("h1", { timeout: 15000 });

    // Just check that we can tab to some interactive element
    await page.keyboard.press("Tab");
    const focusedElement = page.locator(":focus");

    // Should have some focused element (button, link, etc.)
    const elementExists = (await focusedElement.count()) > 0;
    expect(elementExists).toBeTruthy();
  });

  test("should have main heading", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("h1", { timeout: 15000 });

    // Should have at least one h1
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });
});
