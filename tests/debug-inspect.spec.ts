import { expect, test } from "@playwright/test";
import { promises as fs } from "fs";

test.describe("Debug and Inspect Mode Testing", () => {
  test("capture homepage state and test inspect mode", async ({ page }) => {
    await page.goto("/");

    // Wait for page to load completely
    await page.waitForLoadState("networkidle");

    // Take a screenshot of the homepage
    await page.screenshot({
      path: "debug-screenshots/homepage-full.png",
      fullPage: true,
    });

    // Get the full DOM structure
    const htmlContent = await page.content();
    await fs.writeFile("debug-screenshots/homepage-dom.html", htmlContent);

    // Check if inspect mode toggle is available (development mode)
    const inspectToggle = page.locator(
      'button[title*="Vibe Inspect"], button[title*="inspect"]'
    );
    const isInspectAvailable = (await inspectToggle.count()) > 0;

    console.log("Inspect mode available:", isInspectAvailable);

    if (isInspectAvailable) {
      // Enable inspect mode
      await inspectToggle.click();

      // Wait a bit for inspect mode to activate
      await page.waitForTimeout(500);

      // Take screenshot with inspect mode enabled
      await page.screenshot({
        path: "debug-screenshots/homepage-inspect-enabled.png",
        fullPage: true,
      });

      // Look for inspect overlays
      const inspectOverlays = page.locator('[class*="group"]');
      const overlayCount = await inspectOverlays.count();
      console.log("Number of potential inspect overlays:", overlayCount);

      // Try to hover over the header to see if inspect works
      const header = page.locator("header");
      await header.hover();

      // Wait for potential inspect tooltip
      await page.waitForTimeout(500);

      // Take screenshot after hovering
      await page.screenshot({
        path: "debug-screenshots/homepage-inspect-hover.png",
        fullPage: true,
      });

      // Check for inspect tooltip
      const tooltip = page
        .locator('[class*="fixed"][class*="z-"]')
        .filter({ hasText: /(Header|Component|metadata)/i });
      const hasTooltip = (await tooltip.count()) > 0;
      console.log("Inspect tooltip visible:", hasTooltip);

      if (hasTooltip) {
        const tooltipText = await tooltip.textContent();
        console.log("Tooltip content:", tooltipText);
      }
    }

    // Test header components are present
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("text=Gition")).toBeVisible();

    // Test navigation links
    await expect(page.locator('a[href="/"]')).toBeVisible();
    await expect(page.locator('a[href="/docs"]')).toBeVisible();
    await expect(page.locator('a[href="/tasks"]')).toBeVisible();

    // Get console logs
    const logs: string[] = [];
    page.on("console", (msg) => logs.push(`${msg.type()}: ${msg.text()}`));

    // Navigate to docs page to test routing
    await page.click('a[href="/docs"]');
    await page.waitForLoadState("networkidle");

    // Take screenshot of docs page
    await page.screenshot({
      path: "debug-screenshots/docs-page.png",
      fullPage: true,
    });

    await expect(page).toHaveURL("/docs");

    // Save console logs
    await fs.writeFile("debug-screenshots/console-logs.txt", logs.join("\n"));

    console.log("Debug inspection complete! Check debug-screenshots/ folder");
  });

  test("test search functionality", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Click search trigger
    const searchTrigger = page.locator("[data-search-trigger]");
    await expect(searchTrigger).toBeVisible();
    await searchTrigger.click();

    // Wait for search dialog
    await page.waitForSelector('[role="dialog"]');

    // Take screenshot of search dialog
    await page.screenshot({
      path: "debug-screenshots/search-dialog.png",
    });

    // Type in search
    const searchInput = page.locator(
      'input[placeholder*="Search"], input[placeholder*="search"]'
    );
    await searchInput.fill("test");

    // Wait a bit for search results
    await page.waitForTimeout(1000);

    // Take screenshot with search results
    await page.screenshot({
      path: "debug-screenshots/search-results.png",
    });
  });
});
