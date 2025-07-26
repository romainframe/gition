import { expect, test } from "@playwright/test";

test.describe("Theme Toggle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should toggle between light and dark themes", async ({ page }) => {
    // Wait for the page to load completely
    await page.waitForSelector('[data-slot="card"]', { timeout: 15000 });

    // Find and click theme toggle button (look for sun/moon icons)
    const themeToggle = page
      .locator("button")
      .filter({ has: page.locator(".lucide-sun, .lucide-moon") });
    await expect(themeToggle).toBeVisible();
    await themeToggle.click();

    // Wait a moment for the theme to change
    await page.waitForTimeout(100);

    // Check that html class changed (should have dark class now)
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);

    // Click again to switch back to light
    await themeToggle.click();
    await page.waitForTimeout(100);

    // Check that theme changed back to light
    await expect(html).not.toHaveClass(/dark/);
  });

  test("should persist theme preference across page reloads", async ({
    page,
  }) => {
    // Wait for page to load
    await page.waitForSelector('[data-slot="card"]', { timeout: 15000 });

    // Find theme toggle and switch to dark theme
    const themeToggle = page
      .locator("button")
      .filter({ has: page.locator(".lucide-sun, .lucide-moon") });
    await themeToggle.click();
    await page.waitForTimeout(100);

    // Verify dark theme is applied
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);

    // Reload the page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Check that dark theme persists
    await expect(html).toHaveClass(/dark/);
  });

  test("should have theme toggle button", async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('[data-slot="card"]', { timeout: 15000 });

    // Just check that theme toggle button exists and is clickable
    const themeToggle = page
      .locator("button")
      .filter({ has: page.locator(".lucide-sun, .lucide-moon") });
    await expect(themeToggle).toBeVisible();

    // Should be able to click it
    await themeToggle.click();
    await page.waitForTimeout(100);

    // Should still be visible after click
    await expect(themeToggle).toBeVisible();
  });
});
