import { test, expect } from "@playwright/test";

test.describe("El Legado - Critical Paths", () => {
  test("Homepage loads correctly", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/EL LEGADO/);
    await expect(page.locator("#inicio")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Haz Eterno");
    await expect(page.locator('button[aria-label="Contactar por WhatsApp"]')).toBeVisible();
  });

  test("Navigation scrolls to sections", async ({ page }) => {
    await page.goto("/");

    await page.click('a[href="#filosofia"]');
    await expect(page.locator("#filosofia")).toBeInViewport();

    await page.click('a[href="#festin"]');
    await expect(page.locator("#festin")).toBeInViewport();

    await page.click('a[href="#contacto"]');
    await expect(page.locator("#contacto")).toBeInViewport();
  });

  test("Mobile menu opens and closes", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    await page.click('button[aria-label="Abrir menú"]');
    await expect(page.locator("#mobile-menu")).toBeVisible();

    await page.click('button[aria-label="Cerrar menú"]');
    await expect(page.locator("#mobile-menu")).not.toBeVisible();
  });

  test("Experience tabs work", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Experiencia Premium" }).click();

    await page.getByRole("button", { name: "Experiencia Dulce" }).click();
  });

  test("Toast notification appears on product add", async ({ page }) => {
    await page.goto("/");

    const plusButtons = page.locator("#festin button[aria-label*='Aumentar']");
    const count = await plusButtons.count();
    if (count > 0) {
      await plusButtons.first().click();
      await expect(page.locator("#toast-container")).toBeVisible();
    }
  });

  test("Footer legal links exist", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator('a[href="/aviso-legal"]')).toBeVisible();
    await expect(page.locator('a[href="/privacidad"]')).toBeVisible();
    await expect(page.locator('a[href="/terminos"]')).toBeVisible();
  });

  test("Skip to content link exists", async ({ page }) => {
    await page.goto("/");

    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeVisible();
  });

  test("WhatsApp floating button visible", async ({ page }) => {
    await page.goto("/");

    const waBtn = page.locator('button[aria-label="Contactar por WhatsApp"]');
    await expect(waBtn).toBeVisible();
  });

  test("Back to top button appears on scroll", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#back-to-top")).not.toBeVisible();

    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(100);

    await expect(page.locator("#back-to-top")).toBeVisible();
  });

  test("Legal pages load", async ({ page }) => {
    const pages = ["/privacidad", "/aviso-legal", "/terminos"];

    for (const p of pages) {
      await page.goto(p);
      await expect(page).toHaveTitle(/El Legado/);
    }
  });

  test("No console errors on homepage", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(errors).toEqual([]);
  });

  test("Images have alt text", async ({ page }) => {
    await page.goto("/");

    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt).toBeTruthy();
      expect(alt?.length).toBeGreaterThan(0);
    }
  });

  test("Schema.org structured data present", async ({ page }) => {
    await page.goto("/");

    const schemas = page.locator('script[type="application/ld+json"]');
    const count = await schemas.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});
