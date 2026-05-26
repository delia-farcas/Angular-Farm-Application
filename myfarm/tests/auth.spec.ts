import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should successfully sign up and redirect to home', async ({ page }) => {
    await page.goto('/');

    await page.getByText('Să începem!').click();

    await page.getByText('Creează cont').click();

    await expect(page.getByRole('heading', { name: 'Creează contul' })).toBeVisible();

    await page.locator('input#email').fill('testuser@playwright.com');
    await page.locator('input#signup-username').fill('PlaywrightTester');
    await page.locator('input#signup-password').fill('pass123');
    await page.locator('input#confirm-password').fill('pass123');

    await page.getByRole('button', { name: 'Înregistrare' }).click();

    await expect(page).toHaveURL(/\/home/);

    const greeting = page.locator('.greeting').first();
    await expect(greeting).toHaveText('Salut, PlaywrightTester!');
  });

  test('should verify login validation and success', async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => {
      const mockUser = [
        { email: 'fake@auth.com', username: 'TestLoginUser', password: 'secretpassword' },
      ];
      window.localStorage.setItem('app_users', JSON.stringify(mockUser));

      window.localStorage.setItem('cookieConsent', 'accepted');
    });

    await page.getByText('Să începem!').click();
    await expect(page.getByRole('heading', { name: 'Accesează contul' })).toBeVisible();

    await page.locator('input#username').fill('TestLoginUser');
    await page.locator('input#password').fill('wrongpass');

    page.once('dialog', (dialog) => {
      expect(dialog.message()).toContain('Username sau parolă incorectă!');
      dialog.dismiss();
    });
    await page.getByRole('button', { name: 'Conectare' }).click();

    await page.locator('input#password').fill('secretpassword');
    await page.getByRole('button', { name: 'Conectare' }).click();

    await expect(page).toHaveURL(/\/home/);
    const greeting = page.locator('.greeting').first();
    await expect(greeting).toHaveText('Salut, TestLoginUser!');
  });
});
