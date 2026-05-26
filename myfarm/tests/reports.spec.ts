import { test, expect } from '@playwright/test';

test.describe('Reports and Charting Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.setItem('current_user', 'ReportViewer');
      window.localStorage.setItem('app_users', JSON.stringify([{ username: 'ReportViewer' }]));
    });

    await page.goto('/raports');
  });

  test('should navigate between lunar and yearly reports and toggle views', async ({ page }) => {
    const lunarHeader = page.locator('h1', { hasText: 'Raport Lunar' }).first();
    const anualHeader = page.locator('h1', { hasText: 'Raport Anual' }).first();

    const lunarTab = page.getByText(/lunar/i).first();
    const anualTab = page.getByText(/anual/i).first();

    if (await lunarTab.isVisible()) await lunarTab.click();
    await expect(lunarHeader).toBeVisible();

    if (await anualTab.isVisible()) await anualTab.click();
    await expect(anualHeader).toBeVisible();

    const viewSwitch = page.locator('label.switch[for="view-switch"]').first();
    await viewSwitch.click();

    const chartCanvas = page.locator('canvas').first();
    await expect(chartCanvas).toBeVisible();

    const genSwitchYr = page.locator('label.switch[for="gen-switch-yr"]');

    if (await genSwitchYr.isVisible()) {
      await genSwitchYr.click();

      await page.waitForTimeout(1000);

      await genSwitchYr.click();
    }
  });
});
