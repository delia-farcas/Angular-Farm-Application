import { test, expect } from '@playwright/test';

test.describe('Farm Management Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Prep the test environment directly to the home page using a mocked session
    await page.goto('/');
    
    await page.evaluate(() => {
      // Mock an auth session to bypass login screen
      window.localStorage.setItem('current_user', 'FarmerJohn');
      window.localStorage.setItem('app_users', JSON.stringify([{ username: 'FarmerJohn' }]));
    });

    // Go directly to home page where the app is.
    await page.goto('/home');
  });

  test('should navigate to manage and update animal logs', async ({ page }) => {
    // Wait for the list page to be visible
    await expect(page.getByRole('button', { name: 'Gestionează' })).toBeVisible();

    // Navigate to manage page
    await page.getByRole('button', { name: 'Gestionează' }).click();

    // Verify manage page elements
    await expect(page.getByRole('button', { name: 'Adaugă animal' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Salvează' })).toBeVisible();

    // Find the 'Vaca' input (milk) and fill it. 
    // In manage-page, inputs are bound to the animal rows. We can locate the row containing "Vaca" 
    // and extract its input box.
    const vacaRow = page.locator('tr').filter({ hasText: 'Vaca' });
    const vacaInput = vacaRow.locator('input[type="number"]');

    await expect(vacaInput).toBeVisible();
    await vacaInput.fill('20'); // Insert 20 Liters

    // Find the 'Gaina' input (eggs) and fill it
    const gainaRow = page.locator('tr').filter({ hasText: 'Gaina' });
    const gainaInput = gainaRow.locator('input[type="number"]');
    await gainaInput.fill('45'); // Insert 45 Eggs

    // Save
    await page.getByRole('button', { name: 'Salvează' }).click();

    // Saving brings us back to ListPage component.
    await expect(page.getByRole('button', { name: 'Gestionează' })).toBeVisible();
    
    // Test passed if we navigated back without error and inputs were processed.
  });
});
