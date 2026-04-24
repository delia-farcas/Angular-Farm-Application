import { test, expect } from '@playwright/test';

test.describe('Reports and Charting Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate and set auth
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.setItem('current_user', 'ReportViewer');
      window.localStorage.setItem('app_users', JSON.stringify([{ username: 'ReportViewer' }]));
    });

    // Go to reports page
    await page.goto('/raports');
  });

  test('should navigate between lunar and yearly reports and toggle views', async ({ page }) => {
    // 1. Verify Lunar Reports (Default or explicitly navigate)
    // Wait for the lunar reports container or header. There is a "Raport Lunar" and "Raport Anual"
    // that might be visible based on a tab toggle on the RaportsPage components.
    
    // Check if the tabs exist to switch reports. Typical names might be "Lunar" and "Anual" based on app language.
    // If we're on Lunar by default:
    const lunarHeader = page.locator('h1', { hasText: 'Raport Lunar' }).first();
    const anualHeader = page.locator('h1', { hasText: 'Raport Anual' }).first();

    // Depending on what shows up first, we'll try switching to ensure the toggles work.
    // Assuming RaportsPage has "Lunar" and "Anual" buttons/tabs.
    const lunarTab = page.getByText(/lunar/i).first();
    const anualTab = page.getByText(/anual/i).first();

    if (await lunarTab.isVisible()) await lunarTab.click();
    await expect(lunarHeader).toBeVisible();

    if (await anualTab.isVisible()) await anualTab.click();
    await expect(anualHeader).toBeVisible();

    // 2. Test chart/table toggles inside the report
    // They share the same class "switch-input" with ids "view-switch"
    const viewSwitch = page.locator('label.switch[for="view-switch"]').first();
    await viewSwitch.click();

    // Verify canvas is now rendered (or stays rendered)
    const chartCanvas = page.locator('canvas').first();
    await expect(chartCanvas).toBeVisible();

    // 3. Test random data Generator Toggle
    // Has id "gen-switch-yr" on Yearly or "gen-switch-lun" on Lunar 
    const genSwitchYr = page.locator('label.switch[for="gen-switch-yr"]');
    
    // ensure it starts unchecked, then we check it.
    if (await genSwitchYr.isVisible()) {
      await genSwitchYr.click();
      
      // wait a bit for generation intervals (500ms)
      await page.waitForTimeout(1000);
      
      // Stop the generator
      await genSwitchYr.click();
    }
  });

});
