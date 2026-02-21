import { test, expect } from "@playwright/test";

test.describe("AI Chat", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("admin@acme.com");
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should open AI chat widget", async ({ page }) => {
    // Click the floating chat button
    const chatButton = page.getByLabel("Open AI chat");
    await chatButton.click();

    // Chat panel should appear
    await expect(page.getByText("Conversations")).toBeVisible();
    await expect(page.getByText("New Conversation")).toBeVisible();
  });

  test("should create a new conversation and send message", async ({ page }) => {
    // Open chat widget
    await page.getByLabel("Open AI chat").click();
    await expect(page.getByText("New Conversation")).toBeVisible();

    // Create new conversation
    await page.getByRole("button", { name: /new conversation/i }).click();

    // Type and send a message
    const input = page.getByPlaceholder(/ask me anything/i);
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill("What is my revenue?");
    await page.getByRole("button", { name: /send/i }).click();

    // Should see the user message
    await expect(page.getByText("What is my revenue?")).toBeVisible();

    // Should see AI response streaming in (wait longer for SSE)
    await expect(page.getByText(/MRR|revenue/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("should use full-page AI assistant", async ({ page }) => {
    await page.goto("/dashboard/ai");
    await expect(page.getByText("AI Assistant")).toBeVisible();

    // Start a conversation
    await page.getByRole("button", { name: /start conversation|new conversation/i }).click();

    const input = page.getByPlaceholder(/type your message/i);
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill("Tell me about my customers");
    await input.press("Enter");

    // Wait for AI response
    await expect(page.getByText(/Total Customers|customer/i).first()).toBeVisible({
      timeout: 15000,
    });
  });
});
