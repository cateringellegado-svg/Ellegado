import { test, expect } from "@playwright/test";

test.describe("RLS — Seguridad de Bóveda (Admin)", () => {
  test("redirects unauthenticated user from /admin to /admin/login", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL("**/admin/login");
    expect(page.url()).toContain("/admin/login");
  });

  test("redirects unauthenticated user from /admin/financiero to /admin/login", async ({ page }) => {
    await page.goto("/admin/financiero");
    await page.waitForURL("**/admin/login");
    expect(page.url()).toContain("/admin/login");
  });

  test("redirects unauthenticated user from /admin/cotizaciones to /admin/login", async ({ page }) => {
    await page.goto("/admin/cotizaciones");
    await page.waitForURL("**/admin/login");
    expect(page.url()).toContain("/admin/login");
  });

  test("redirects unauthenticated user from /admin/eventos to /admin/login", async ({ page }) => {
    await page.goto("/admin/eventos");
    await page.waitForURL("**/admin/login");
    expect(page.url()).toContain("/admin/login");
  });

  test("redirects unauthenticated user from /admin/clientes to /admin/login", async ({ page }) => {
    await page.goto("/admin/clientes");
    await page.waitForURL("**/admin/login");
    expect(page.url()).toContain("/admin/login");
  });

  test("login page loads without redirect", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
