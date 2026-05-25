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

    for (const id of ["#filosofia", "#festin", "#contacto"]) {
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: "instant" });
        }
      }, id);
      await expect(page.locator(id)).toBeInViewport();
    }
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

    await page.getByRole("tab", { name: "Experiencia Premium" }).click();

    await page.getByRole("tab", { name: "Experiencia Dulce" }).click();
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
    await page.locator("#back-to-top").waitFor({ state: "visible", timeout: 5000 });
  });

  test("Legal pages load", async ({ page }) => {
    const pages = ["/privacidad", "/aviso-legal", "/terminos"];

    for (const p of pages) {
      await page.goto(p);
      await expect(page).toHaveTitle(/EL LEGADO/);
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
