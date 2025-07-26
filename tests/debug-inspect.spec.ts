import { expect, test } from "@playwright/test";

test.describe("Debug and Inspect Mode Testing", () => {
  test("should load page successfully", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Wait for page to load completely
    await page.waitForSelector("h1", { timeout: 15000 });

    // Should have main content
    await expect(page.locator("main")).toBeVisible();

    // Should have title
    await expect(page.locator("h1")).toBeVisible();
  });
});
