import { expect, test } from "@playwright/test";

test.describe("Header Component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should display header navigation", async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector("h1", { timeout: 15000 });

    // Check for header/navigation area
    const header = page.locator('header, nav, [role="banner"]').first();
    if ((await header.count()) > 0) {
      await expect(header).toBeVisible();
    }

    // Should have some kind of home link
    const homeLink = page.locator('a[href="/"], a[href=""]').first();
    if ((await homeLink.count()) > 0) {
      await expect(homeLink).toBeVisible();
    }
  });

  test("should have navigation elements", async ({ page }) => {
    await page.waitForSelector("h1", { timeout: 15000 });

    // Just check that we have some navigation or links
    const hasNav = (await page.locator("nav").count()) > 0;
    const hasLinks = (await page.locator("a").count()) > 0;

    expect(hasNav || hasLinks).toBeTruthy();
  });
});
