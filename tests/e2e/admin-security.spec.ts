import { test, expect } from "@playwright/test";

test.describe("RLS — Seguridad de Bóveda (Admin)", () => {
  const adminRoutes = [
    "/admin",
    "/admin/financiero",
    "/admin/cotizaciones",
    "/admin/eventos",
    "/admin/clientes",
  ];

  for (const route of adminRoutes) {
    test(`redirects unauthenticated user from ${route} to /admin/login`, async ({
      page,
    }) => {
      const response = await page.request.get(route, { maxRedirects: 0 });
      expect(response.status()).toBe(307);
      expect(response.headers()["location"]).toContain("/admin/login");
    });
  }

  test("login page loads without redirect", async ({ page }) => {
    const response = await page.goto("/admin/login");
    expect(response?.status()).toBe(200);
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toBeVisible();
  });

  test("login with invalid credentials shows error message", async ({ page }) => {
    await page.goto("/admin/login");

    await page.locator("#email").fill("fake@email.com");
    await page.locator("#password").fill("wrongpassword");
    await page.locator("button[type='submit']").click();

    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("login page redirects to /admin/financiero after successful auth", async ({
    page,
  }) => {
    const email = process.env.E2E_ADMIN_EMAIL || "admin@example.com";
    const password = process.env.E2E_ADMIN_PASSWORD || "password123";

    await page.goto("/admin/login");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.locator("button[type='submit']").click();

    await expect(page).toHaveURL(/\/admin\/(financiero|$)/, { timeout: 15000 });
  });

  test("dashboard loads protected content after login", async ({ page }) => {
    const email = process.env.E2E_ADMIN_EMAIL || "admin@example.com";
    const password = process.env.E2E_ADMIN_PASSWORD || "password123";

    await page.goto("/admin/login");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.locator("button[type='submit']").click();

    await expect(page).toHaveURL(/\/admin\/(financiero|$)/, { timeout: 15000 });
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({
      timeout: 10000,
    });
  });
});
