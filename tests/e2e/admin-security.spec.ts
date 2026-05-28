import { test, expect } from "@playwright/test";

test.describe("RLS — Seguridad de Bóveda (Admin)", () => {
  test("admin pages serve HTML (auth is client-side via Supabase)", async ({ page }) => {
    const response = await page.request.get("/admin", { maxRedirects: 0 });
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("El Legado");
  });

  test("admin/financiero page loads (client-side auth)", async ({ page }) => {
    const response = await page.request.get("/admin/financiero", { maxRedirects: 0 });
    expect(response.status()).toBe(200);
  });

  test("admin/cotizaciones page loads (client-side auth)", async ({ page }) => {
    const response = await page.request.get("/admin/cotizaciones", { maxRedirects: 0 });
    expect(response.status()).toBe(200);
  });

  test("admin/eventos page loads (client-side auth)", async ({ page }) => {
    const response = await page.request.get("/admin/eventos", { maxRedirects: 0 });
    expect(response.status()).toBe(200);
  });

  test("admin/clientes page loads (client-side auth)", async ({ page }) => {
    const response = await page.request.get("/admin/clientes", { maxRedirects: 0 });
    expect(response.status()).toBe(200);
  });

  test("login page shows login form", async ({ page }) => {
    const response = await page.goto("/admin/login");
    expect(response?.status()).toBe(200);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
