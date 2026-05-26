import { test, expect } from '@playwright/test';

test.describe('Farm Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => {
      window.localStorage.setItem('current_user', 'FarmerJohn');
      window.localStorage.setItem('app_users', JSON.stringify([{ username: 'FarmerJohn' }]));
    });

    await page.goto('/home');
  });

  test('should navigate to manage and update animal logs', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Gestionează' })).toBeVisible();

    await page.getByRole('button', { name: 'Gestionează' }).click();

    await expect(page.getByRole('button', { name: 'Adaugă animal' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Salvează' })).toBeVisible();

    const vacaRow = page.locator('tr').filter({ hasText: 'Vaca' });
    const vacaInput = vacaRow.locator('input[type="number"]');

    await expect(vacaInput).toBeVisible();
    await vacaInput.fill('20');

    const gainaRow = page.locator('tr').filter({ hasText: 'Gaina' });
    const gainaInput = gainaRow.locator('input[type="number"]');
    await gainaInput.fill('45');

    await page.getByRole('button', { name: 'Salvează' }).click();

    await expect(page.getByRole('button', { name: 'Gestionează' })).toBeVisible();
  });
});
