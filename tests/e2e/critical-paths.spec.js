// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('El Legado - Critical Paths', () => {
  
  test('Homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/EL LEGADO/);
    await expect(page.locator('#inicio')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Haz Eterno');
    await expect(page.locator('[data-whatsapp]')).toBeVisible();
  });

  test('Navigation works', async ({ page }) => {
    await page.goto('/');
    
    await page.click('a[href="#filosofia"]');
    await expect(page.locator('#filosofia')).toBeInViewport();
    
    await page.click('a[href="#festin"]');
    await expect(page.locator('#festin')).toBeInViewport();
    
    await page.click('a[href="#contacto"]');
    await expect(page.locator('#contacto')).toBeInViewport();
  });

  test('Mobile menu opens and closes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    
    await page.click('#mobile-menu-btn');
    await expect(page.locator('#mobile-menu')).toBeVisible();
    
    await page.click('#close-menu-btn');
    await expect(page.locator('#mobile-menu')).not.toBeVisible();
  });

  test('Products load in DOM', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('#productos-clasicos')).toBeVisible();
    await expect(page.locator('#productos-dulces')).toBeVisible();
    
    const classicProducts = page.locator('#productos-clasicos > div');
    await expect(classicProducts).toHaveCount({ min: 1 });
  });

  test('Cotizador adds products', async ({ page }) => {
    await page.goto('/');
    
    const firstInput = page.locator('#productos-clasicos input[type="number"]').first();
    await firstInput.fill('50');
    
    await expect(page.locator('#cotizador-total')).not.toHaveText('$0');
    await expect(page.locator('#cotizador-seleccion')).not.toContainText('Selecciona los productos');
  });

  test('Experience tabs work', async ({ page }) => {
    await page.goto('/');
    
    await page.click('[data-exp="premium"]');
    await expect(page.locator('#exp-premium')).toBeVisible();
    await expect(page.locator('#exp-premium')).toHaveClass(/active/);
    
    await page.click('[data-exp="dulce"]');
    await expect(page.locator('#exp-dulce')).toBeVisible();
    await expect(page.locator('#exp-dulce')).toHaveClass(/active/);
  });

  test('Toast notification appears on product add', async ({ page }) => {
    await page.goto('/');
    
    const firstInput = page.locator('#productos-clasicos input[type="number"]').first();
    await firstInput.fill('50');
    
    await expect(page.locator('#toast-container')).toBeVisible();
  });

  test('Footer links work', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('a[href="aviso-legal.html"]')).toBeVisible();
    await expect(page.locator('a[href="privacidad.html"]')).toBeVisible();
    await expect(page.locator('a[href="terminos.html"]')).toBeVisible();
  });

  test('Skip to content link exists', async ({ page }) => {
    await page.goto('/');
    
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  test('WhatsApp floating button visible', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('.float-whatsapp')).toBeVisible();
    await expect(page.locator('.float-whatsapp')).toHaveAttribute('aria-label', /WhatsApp/i);
  });

  test('Back to top button appears on scroll', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('#back-to-top')).not.toBeVisible();
    
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(100);
    
    await expect(page.locator('#back-to-top')).toBeVisible();
  });

  test('Legal pages load', async ({ page }) => {
    const pages = ['privacidad.html', 'aviso-legal.html', 'terminos.html'];
    
    for (const p of pages) {
      await page.goto(`/${p}`);
      await expect(page).toHaveTitle(/El Legado/);
    }
  });

  test('No console errors on homepage', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    expect(errors).toEqual([]);
  });

  test('Images have alt text', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
      expect(alt?.length).toBeGreaterThan(0);
    }
  });

  test('Schema.org structured data present', async ({ page }) => {
    await page.goto('/');
    
    const schemas = page.locator('script[type="application/ld+json"]');
    await expect(schemas).toHaveCount({ min: 2 });
  });
});
