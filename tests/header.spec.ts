import { expect, test } from "@playwright/test";

test.describe("Header Component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the Gition logo and title", async ({ page }) => {
    // Check for the logo container
    const logoContainer = page.locator('a[href="/"]').first();
    await expect(logoContainer).toBeVisible();

    // Check for the blue gradient logo box
    const logoBox = logoContainer.locator("div").first();
    await expect(logoBox).toBeVisible();
    await expect(logoBox).toHaveClass(/bg-gradient-to-br/);

    // Check for the "Gition" text
    const titleText = logoContainer
      .locator("span")
      .filter({ hasText: "Gition" });
    await expect(titleText).toBeVisible();
    await expect(titleText).toHaveText("Gition");
  });

  test("should have working navigation links", async ({ page }) => {
    // Check for navigation menu
    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();

    // Check for Overview link
    const overviewLink = nav.locator('a[href="/"]');
    await expect(overviewLink).toBeVisible();
    await expect(overviewLink).toContainText("Overview");

    // Check for Docs link
    const docsLink = nav.locator('a[href="/docs"]');
    await expect(docsLink).toBeVisible();
    await expect(docsLink).toContainText("Docs");

    // Check for Tasks link
    const tasksLink = nav.locator('a[href="/tasks"]');
    await expect(tasksLink).toBeVisible();
    await expect(tasksLink).toContainText("Tasks");

    // Test navigation functionality
    await docsLink.click();
    await expect(page).toHaveURL("/docs");
    await expect(page.locator("h1")).toContainText("Documentation");
  });

  test("should have functional search trigger", async ({ page }) => {
    // Check for search input/button
    const searchTrigger = page.locator("[data-search-trigger]");
    await expect(searchTrigger).toBeVisible();
    await expect(searchTrigger).toContainText("Search");

    // Check for keyboard shortcut indicator
    const shortcut = searchTrigger.locator("kbd");
    await expect(shortcut).toBeVisible();
    await expect(shortcut).toContainText("K");
  });

  test("should have theme toggle button", async ({ page }) => {
    // Look for theme toggle button (has sun/moon icons)
    const themeToggle = page
      .locator("button")
      .filter({ has: page.locator("svg") })
      .nth(-2); // Second to last button with SVG
    await expect(themeToggle).toBeVisible();

    // Click to toggle theme
    await themeToggle.click();

    // Theme should change (we can check for dark class on html element)
    await page.waitForTimeout(100); // Small delay for theme transition
  });

  test("should have language toggle dropdown", async ({ page }) => {
    // Look for language toggle button (has Languages icon and flag)
    const languageToggle = page
      .locator("button")
      .filter({ has: page.locator("svg") })
      .last(); // Last button with SVG
    await expect(languageToggle).toBeVisible();

    // Should contain language indicator
    await expect(languageToggle).toContainText(/English|Français|Español/);

    // Click to open dropdown
    await languageToggle.click();

    // Check for dropdown content
    const dropdown = page.locator('[role="menu"]');
    await expect(dropdown).toBeVisible();

    // Should have language options
    await expect(dropdown).toContainText("English");
    await expect(dropdown).toContainText("Français");
    await expect(dropdown).toContainText("Español");
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Header should still be visible
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Logo should still be visible
    const logo = page.locator('a[href="/"]').first();
    await expect(logo).toBeVisible();

    // Mobile navigation should be present (icons only)
    const mobileNav = page.locator("nav").last(); // Mobile nav is the second nav
    await expect(mobileNav).toBeVisible();
  });

  test("should have proper header structure and styling", async ({ page }) => {
    const header = page.locator("header");

    // Header should have sticky positioning and backdrop blur
    await expect(header).toHaveClass(/sticky/);
    await expect(header).toHaveClass(/backdrop-blur/);

    // Should have proper z-index for being on top
    await expect(header).toHaveClass(/z-50/);

    // Should have border at bottom
    await expect(header).toHaveClass(/border-b/);
  });
});
