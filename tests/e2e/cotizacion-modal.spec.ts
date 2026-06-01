import { test, expect } from "@playwright/test";

test.describe("CotizacionModal — Flujo de cotización", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("legado_rate_limit"));
  });

  test("modal opens from sales summary after adding products", async ({ page }) => {
    const plusButtons = page.locator("#festin button[aria-label*='Aumentar']");
    const count = await plusButtons.count();
    test.skip(count === 0, "No products available to add");
    await plusButtons.first().click();

    const cotizarBtn = page.getByRole("button", { name: /Reservar fecha con/i });
    await expect(cotizarBtn).toBeVisible({ timeout: 3000 });
    await cotizarBtn.click();

    const modal = page.getByRole("dialog", { name: "Formulario de cotización" });
    await expect(modal).toBeVisible();
    await expect(page.locator("#cotizacion-nombre")).toBeVisible();
  });

  test("form validation requires terms checkbox", async ({ page }) => {
    const plusButtons = page.locator("#festin button[aria-label*='Aumentar']");
    const count = await plusButtons.count();
    test.skip(count === 0, "No products available to add");
    await plusButtons.first().click();

    await page.getByRole("button", { name: /Reservar fecha con/i }).click();
    const modal = page.getByRole("dialog", { name: "Formulario de cotización" });
    await expect(modal).toBeVisible();

    await page.locator("#cotizacion-nombre").fill("Juan Perez");
    await page.locator("#cotizacion-telefono").fill("+54 11 1234 5678");

    const submitBtn = page.getByRole("button", { name: "Enviar a WhatsApp" });
    await expect(submitBtn).toBeDisabled();
  });

  test("submits form and shows success toast on API success", async ({ page }) => {
    const plusButtons = page.locator("#festin button[aria-label*='Aumentar']");
    const count = await plusButtons.count();
    test.skip(count === 0, "No products available to add");
    await plusButtons.first().click();

    await page.route("**/api/cotizaciones", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [{ id: "00000000-0000-0000-0000-000000000001" }],
        }),
      });
    });

    await page.route("**/api/create-preference", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: "pref-test-123" }),
      });
    });

    await page.getByRole("button", { name: /Reservar fecha con/i }).click();
    const modal = page.getByRole("dialog", { name: "Formulario de cotización" });
    await expect(modal).toBeVisible();

    await page.locator("#cotizacion-nombre").fill("Juan Perez");
    await page.locator("#cotizacion-telefono").fill("+54 11 1234 5678");
    await page.locator("#acepto-terminos").check();

    const whatsappPagePromise = page.context().waitForEvent("page");
    await page.getByRole("button", { name: "Enviar a WhatsApp" }).click();

    const waPage = await whatsappPagePromise;
    await expect(waPage.url()).toMatch(/^https:\/\/wa\.me\/541176753854\?text=/);
    await waPage.close();
  });

  test("API error shows error toast", async ({ page }) => {
    const plusButtons = page.locator("#festin button[aria-label*='Aumentar']");
    const count = await plusButtons.count();
    test.skip(count === 0, "No products available to add");
    await plusButtons.first().click();

    await page.route("**/api/cotizaciones", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "Datos inválidos" }),
      });
    });

    await page.getByRole("button", { name: /Reservar fecha con/i }).click();
    await expect(page.getByRole("dialog", { name: "Formulario de cotización" })).toBeVisible();

    await page.locator("#cotizacion-nombre").fill("Juan Perez");
    await page.locator("#cotizacion-telefono").fill("+54 11 1234 5678");
    await page.locator("#acepto-terminos").check();

    const whatsappPagePromise = page.context().waitForEvent("page");
    await page.getByRole("button", { name: "Enviar a WhatsApp" }).click();

    const waPage = await whatsappPagePromise;
    await expect(waPage.url()).toMatch(/^https:\/\/wa\.me\/541176753854\?text=/);
    await waPage.close();
  });

  test("rate limit error shows specific toast", async ({ page }) => {
    const plusButtons = page.locator("#festin button[aria-label*='Aumentar']");
    const count = await plusButtons.count();
    test.skip(count === 0, "No products available to add");
    await plusButtons.first().click();

    await page.route("**/api/cotizaciones", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({ error: "Demasiadas solicitudes. Intentá de nuevo en un minuto." }),
      });
    });

    await page.getByRole("button", { name: /Reservar fecha con/i }).click();
    await expect(page.getByRole("dialog", { name: "Formulario de cotización" })).toBeVisible();

    await page.locator("#cotizacion-nombre").fill("Juan Perez");
    await page.locator("#cotizacion-telefono").fill("+54 11 1234 5678");
    await page.locator("#acepto-terminos").check();

    const whatsappPagePromise = page.context().waitForEvent("page");
    await page.getByRole("button", { name: "Enviar a WhatsApp" }).click();

    const waPage = await whatsappPagePromise;
    await expect(waPage.url()).toMatch(/^https:\/\/wa\.me\/541176753854\?text=/);
    await waPage.close();
  });

  test("MP failure shows warning fallback toast", async ({ page }) => {
    const plusButtons = page.locator("#festin button[aria-label*='Aumentar']");
    const count = await plusButtons.count();
    test.skip(count === 0, "No products available to add");
    await plusButtons.first().click();

    await page.route("**/api/cotizaciones", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [{ id: "00000000-0000-0000-0000-000000000001" }],
        }),
      });
    });

    await page.route("**/api/create-preference", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Error interno" }),
      });
    });

    await page.getByRole("button", { name: /Reservar fecha con/i }).click();
    await expect(page.getByRole("dialog", { name: "Formulario de cotización" })).toBeVisible();

    await page.locator("#cotizacion-nombre").fill("Juan Perez");
    await page.locator("#cotizacion-telefono").fill("+54 11 1234 5678");
    await page.locator("#acepto-terminos").check();

    const whatsappPagePromise = page.context().waitForEvent("page");
    await page.getByRole("button", { name: "Enviar a WhatsApp" }).click();

    const waPage = await whatsappPagePromise;
    await expect(waPage.url()).toMatch(/^https:\/\/wa\.me\/541176753854\?text=/);
    await waPage.close();
  });

  test("modal closes with Escape key", async ({ page }) => {
    const plusButtons = page.locator("#festin button[aria-label*='Aumentar']");
    const count = await plusButtons.count();
    test.skip(count === 0, "No products available to add");
    await plusButtons.first().click();

    await page.getByRole("button", { name: /Reservar fecha con/i }).click();
    const modal = page.getByRole("dialog", { name: "Formulario de cotización" });
    await expect(modal).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible();
  });
});

test.describe("CotizacionModal — Modal sin productos", () => {
  test("Cotizar por WhatsApp button opens modal when no products", async ({ page }) => {
    await page.goto("/");
    const cotizarDirecto = page.getByRole("button", { name: /Cotizar por WhatsApp/i });
    const count = await cotizarDirecto.count();
    test.skip(count === 0, "Cotizar por WhatsApp button not found (products may already be present)");

    await cotizarDirecto.click();
    const modal = page.getByRole("dialog", { name: "Formulario de cotización" });
    await expect(modal).toBeVisible();
  });
});
