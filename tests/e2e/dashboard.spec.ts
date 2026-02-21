import { test, expect } from "@playwright/test";

test.describe("Dashboard Navigation", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("admin@acme.com");
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should display KPI cards on dashboard", async ({ page }) => {
    await expect(page.getByText("Overview")).toBeVisible();
    // Check for KPI cards
    await expect(page.getByText(/MRR|Revenue/i).first()).toBeVisible();
  });

  test("should navigate to Analytics page", async ({ page }) => {
    await page.getByRole("link", { name: /analytics/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/analytics/);
  });

  test("should navigate to Customers page", async ({ page }) => {
    await page.getByRole("link", { name: /customers/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/customers/);
    await expect(page.getByText(/customer/i).first()).toBeVisible();
  });

  test("should navigate to AI Assistant page", async ({ page }) => {
    await page.getByRole("link", { name: /ai assistant/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/ai/);
  });

  test("should navigate to Billing page", async ({ page }) => {
    await page.getByRole("link", { name: /billing/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/billing/);
    await expect(page.getByText(/plan/i).first()).toBeVisible();
  });

  test("should navigate to Settings page", async ({ page }) => {
    await page.getByRole("link", { name: /settings/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/settings/);
  });
});
