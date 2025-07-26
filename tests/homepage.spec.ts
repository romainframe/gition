import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for the page to load completely
    await page.waitForLoadState("networkidle");
  });

  test("should load and display main content", async ({ page }) => {
    // Wait for stats to load (the page shows loading state first)
    await page.waitForSelector("h1:not(.text-muted-foreground)", {
      timeout: 15000,
    });

    // Should have a main heading with project name
    const mainHeading = page.locator("h1").first();
    await expect(mainHeading).toBeVisible();

    // Should have project path displayed somewhere
    await expect(page.locator("text=/Users/").first()).toBeVisible();

    // Should have 4 cards total (3 stats + 1 getting started)
    const allCards = page.locator('[data-slot="card"]');
    await expect(allCards).toHaveCount(4);

    // Documentation card
    const docsCard = allCards.filter({ hasText: "Documentation" });
    await expect(docsCard).toBeVisible();

    // Tasks card
    const tasksCard = allCards.filter({ hasText: "Tasks" });
    await expect(tasksCard).toBeVisible();

    // Quick Start card
    const quickStartCard = allCards.filter({ hasText: "Quick Start" });
    await expect(quickStartCard).toBeVisible();
  });

  test("should have functional Browse Docs button", async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-slot="card"]', { timeout: 15000 });

    const browseDocsButton = page.getByRole("link", { name: /docs/i }).first();
    await expect(browseDocsButton).toBeVisible();

    await browseDocsButton.click();
    await expect(page).toHaveURL("/docs");
  });

  test("should have functional View Tasks button", async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-slot="card"]', { timeout: 15000 });

    const viewTasksButton = page.getByRole("link", { name: /tasks/i }).first();
    await expect(viewTasksButton).toBeVisible();

    await viewTasksButton.click();
    await expect(page).toHaveURL("/tasks");
  });

  test("should display getting started section", async ({ page }) => {
    // Wait for all cards to load
    await page.waitForSelector('[data-slot="card"]', { timeout: 15000 });

    // The last card should be the getting started card
    const gettingStartedCard = page.locator('[data-slot="card"]').last();
    await expect(gettingStartedCard).toBeVisible();
    await expect(gettingStartedCard).toContainText("Getting Started");

    // Should have documentation and task management sections
    await expect(gettingStartedCard).toContainText("Documentation");
    await expect(gettingStartedCard).toContainText("Task Management");

    // Should have task syntax examples
    await expect(gettingStartedCard).toContainText("- [ ]");
    await expect(gettingStartedCard).toContainText("- [x]");
  });
});
