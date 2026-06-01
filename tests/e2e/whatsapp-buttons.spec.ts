import { test, expect } from "@playwright/test";

test.describe("WhatsApp Buttons — Verificación de enlaces", () => {
  test("floating WhatsApp button opens correct URL", async ({ page, context }) => {
    await page.goto("/");

    const pagePromise = context.waitForEvent("page");
    await page.locator('button[aria-label="Contactar por WhatsApp"]').click();

    const waPage = await pagePromise;
    await expect(waPage.url()).toMatch(/^https:\/\/wa\.me\/541176753854\?text=/);
    await waPage.close();
  });

  test("Hero CTA WhatsApp button opens correct URL", async ({ page, context }) => {
    await page.goto("/");

    const pagePromise = context.waitForEvent("page");
    await page.locator('button[aria-label="Cotizar evento por WhatsApp"]').click();

    const waPage = await pagePromise;
    await expect(waPage.url()).toMatch(/^https:\/\/wa\.me\/541176753854\?text=/);
    await waPage.close();
  });

  test("CTA section WhatsApp button opens correct URL", async ({ page, context }) => {
    await page.goto("/");

    const pagePromise = context.waitForEvent("page");
    await page.locator('button[aria-label="Enviar mensaje a WhatsApp"]').click();

    const waPage = await pagePromise;
    await expect(waPage.url()).toMatch(/^https:\/\/wa\.me\/541176753854\?text=/);
    await waPage.close();
  });

  test("WhatsApp number comes from config, not phantom env var", async ({ page }) => {
    await page.goto("/");

    const pagePromise = page.context().waitForEvent("page");
    await page.locator('button[aria-label="Contactar por WhatsApp"]').click();

    const waPage = await pagePromise;
    const url = waPage.url();
    expect(url).toContain("541176753854");
    await waPage.close();
  });
});
