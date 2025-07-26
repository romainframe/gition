import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load and display main content", async ({ page }) => {
    await page.goto("/");

    // Should have a main heading with project name
    const mainHeading = page.locator("h1").first();
    await expect(mainHeading).toBeVisible();

    // Should have project path displayed
    const projectPath = page.locator("p").filter({ hasClass: /font-mono/ });
    await expect(projectPath).toBeVisible();

    // Should have stats cards
    const statsCards = page.locator('[data-slot="card"]');
    await expect(statsCards).toHaveCount(3);

    // Documentation card
    const docsCard = statsCards.filter({ hasText: "Documentation" });
    await expect(docsCard).toBeVisible();
    await expect(docsCard).toContainText("Browse Docs");

    // Tasks card
    const tasksCard = statsCards.filter({ hasText: "Tasks" });
    await expect(tasksCard).toBeVisible();
    await expect(tasksCard).toContainText("View Tasks");

    // Quick Start card
    const quickStartCard = statsCards.filter({ hasText: "Quick Start" });
    await expect(quickStartCard).toBeVisible();
  });

  test("should have functional Browse Docs button", async ({ page }) => {
    await page.goto("/");

    const browseDocsButton = page
      .locator("a")
      .filter({ hasText: "Browse Docs" });
    await expect(browseDocsButton).toBeVisible();

    await browseDocsButton.click();
    await expect(page).toHaveURL("/docs");
  });

  test("should have functional View Tasks button", async ({ page }) => {
    await page.goto("/");

    const viewTasksButton = page.locator("a").filter({ hasText: "View Tasks" });
    await expect(viewTasksButton).toBeVisible();

    await viewTasksButton.click();
    await expect(page).toHaveURL("/tasks");
  });

  test("should display getting started section", async ({ page }) => {
    await page.goto("/");

    // Should have Getting Started card
    const gettingStartedCard = page
      .locator('[data-slot="card"]')
      .filter({ hasText: "Getting Started" });
    await expect(gettingStartedCard).toBeVisible();

    // Should have documentation and task management sections
    await expect(gettingStartedCard).toContainText("Documentation Section");
    await expect(gettingStartedCard).toContainText("Task Management");

    // Should have task syntax examples
    await expect(gettingStartedCard).toContainText("- [ ]");
    await expect(gettingStartedCard).toContainText("- [x]");
  });
});
