import { test, expect } from "@playwright/test";

test.describe("Customer Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("admin@acme.com");
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto("/dashboard/customers");
  });

  test("should display customer list", async ({ page }) => {
    await expect(page.getByText(/customer/i).first()).toBeVisible();
    // Wait for data to load
    await expect(page.locator("table")).toBeVisible({ timeout: 10000 });
  });

  test("should create a new customer", async ({ page }) => {
    await page.getByRole("button", { name: /add customer|new customer/i }).click();

    // Fill in the form
    await page.getByLabel(/name/i).fill("E2E Test Customer");
    await page.getByLabel(/email/i).fill(`e2e-${Date.now()}@test.com`);

    // Submit
    await page.getByRole("button", { name: /save|create|add/i }).click();

    // Should see success or the new customer in the list
    await expect(page.getByText("E2E Test Customer")).toBeVisible({ timeout: 10000 });
  });

  test("should search for customers", async ({ page }) => {
    // Wait for table to load
    await expect(page.locator("table")).toBeVisible({ timeout: 10000 });

    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill("Acme");
      // Allow search debounce
      await page.waitForTimeout(500);
    }
  });

  test("should navigate to customer detail", async ({ page }) => {
    await expect(page.locator("table")).toBeVisible({ timeout: 10000 });

    // Click on first customer row
    const firstRow = page.locator("table tbody tr").first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await expect(page).toHaveURL(/\/dashboard\/customers\/.+/);
    }
  });
});
