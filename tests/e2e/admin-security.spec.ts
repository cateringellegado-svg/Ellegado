import { test, expect } from "@playwright/test";

test.describe("RLS — Seguridad de Bóveda (Admin)", () => {
  const adminRoutes = ["/admin", "/admin/financiero", "/admin/cotizaciones", "/admin/eventos", "/admin/clientes"];

  for (const route of adminRoutes) {
    test(`redirects unauthenticated user from ${route} to /admin/login`, async ({ page }) => {
      const response = await page.request.get(route, { maxRedirects: 0 });
      expect(response.status()).toBe(307);
      expect(response.headers()["location"]).toContain("/admin/login");
    });
  }

  test("login page loads without redirect", async ({ page }) => {
    const response = await page.goto("/admin/login");
    expect(response?.status()).toBe(200);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
