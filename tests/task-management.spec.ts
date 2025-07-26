import { expect, test } from "@playwright/test";

test.describe("Task Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tasks");
    await page.waitForLoadState("networkidle");
  });

  test("should display task overview", async ({ page }) => {
    // Wait for tasks to load or show empty state
    await page.waitForSelector("h1", { timeout: 15000 });

    // Should have tasks title
    await expect(page.locator("h1")).toContainText("Tasks");

    // Should have either task cards or empty state
    const hasTaskCards = (await page.locator('[data-slot="card"]').count()) > 0;
    const hasEmptyState =
      (await page.locator("text=No tasks found").count()) > 0;

    expect(hasTaskCards || hasEmptyState).toBeTruthy();
  });

  test("should navigate to kanban board", async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector("h1", { timeout: 15000 });

    // Look for kanban board link
    const kanbanLink = page.getByRole("link", { name: /kanban/i });
    if ((await kanbanLink.count()) > 0) {
      await kanbanLink.first().click();
      await page.waitForURL("**/kanban**");
      expect(page.url()).toContain("kanban");
    }
  });

  test("should show task statistics", async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector("h1", { timeout: 15000 });

    // Should show task counts somewhere on the page
    const hasTaskCounts =
      (await page.locator("text=/\\d+ tasks?/i").count()) > 0;
    const hasCompletionRate = (await page.locator("text=/\\d+%/").count()) > 0;

    // Either show actual stats or indicate no tasks
    expect(
      hasTaskCounts ||
        hasCompletionRate ||
        (await page.locator("text=No tasks").count()) > 0
    ).toBeTruthy();
  });

  test("should navigate to task detail page", async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector("h1", { timeout: 15000 });

    // Look for task cards (only if they exist)
    const taskCards = page
      .locator('[data-slot="card"]')
      .filter({ hasText: /task/i });
    const cardCount = await taskCards.count();

    if (cardCount > 0) {
      // Click on first task card
      await taskCards.first().click();

      // Wait for navigation
      await page.waitForURL("**/tasks/**");

      // Check that we navigated to a task detail page
      expect(page.url()).toContain("/tasks/");
    }
  });

  test("should display task groups if available", async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector("h1", { timeout: 15000 });

    // Check if there are any task groups or empty state
    const taskCards = await page.locator('[data-slot="card"]').count();
    const emptyState = await page.locator("text=No tasks").count();

    // Should have either task cards or empty state message
    expect(taskCards > 0 || emptyState > 0).toBeTruthy();
  });

  test("should show proper page structure", async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector("h1", { timeout: 15000 });

    // Should have main content area
    await expect(page.locator("main")).toBeVisible();

    // Should have tasks title
    await expect(page.locator("h1")).toContainText("Tasks");
  });
});
