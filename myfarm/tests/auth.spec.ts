import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {

  test('should successfully sign up and redirect to home', async ({ page }) => {
    // Navigate to root
    await page.goto('/');

    // Click 'Să începem!' on welcome page
    await page.getByText('Să începem!').click();

    // Now on login page, click 'Creează cont' to go to signup
    await page.getByText('Creează cont').click();

    // Ensure we are on signup wrapper
    await expect(page.getByRole('heading', { name: 'Creează contul' })).toBeVisible();

    // Fill form
    await page.locator('input#email').fill('testuser@playwright.com');
    await page.locator('input#signup-username').fill('PlaywrightTester');
    await page.locator('input#signup-password').fill('pass123');
    await page.locator('input#confirm-password').fill('pass123');

    // Click register
    await page.getByRole('button', { name: 'Înregistrare' }).click();

    // Should redirect to dashboard /home
    await expect(page).toHaveURL(/\/home/);

    // Verify localStorage has the user and greeting is updated
    const greeting = page.locator('.greeting').first();
    await expect(greeting).toHaveText('Salut, PlaywrightTester!');
  });

  test('should verify login validation and success', async ({ page }) => {
    // Seed localStorage with a test user to avoid relying on signup in this test context
    await page.goto('/');
    
    await page.evaluate(() => {
      const mockUser = [{ email: 'fake@auth.com', username: 'TestLoginUser', password: 'secretpassword' }];
      window.localStorage.setItem('app_users', JSON.stringify(mockUser));
      // Reset cookies consent if needed
      window.localStorage.setItem('cookieConsent', 'accepted');
    });

    // Start flow
    await page.getByText('Să începem!').click();
    await expect(page.getByRole('heading', { name: 'Accesează contul' })).toBeVisible();

    // 1. Try incorrect login
    await page.locator('input#username').fill('TestLoginUser');
    await page.locator('input#password').fill('wrongpass');
    
    // Catch alert for wrong password
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('Username sau parolă incorectă!');
      dialog.dismiss();
    });
    await page.getByRole('button', { name: 'Conectare' }).click();

    // 2. Try correct login
    await page.locator('input#password').fill('secretpassword');
    await page.getByRole('button', { name: 'Conectare' }).click();

    // Assert redirection and greeting
    await expect(page).toHaveURL(/\/home/);
    const greeting = page.locator('.greeting').first();
    await expect(greeting).toHaveText('Salut, TestLoginUser!');
  });
});
