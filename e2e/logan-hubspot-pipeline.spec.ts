import { test, expect } from '@playwright/test';

test.describe('Logan journey: HubSpot pipeline creation', () => {
  test('essentials page loads with correct title', async ({ page }) => {
    await page.goto('/essentials');
    await expect(page).toHaveTitle(/Aiden Essentials/);
  });

  test.skip('completed quiz creates HubSpot contact with correct properties', async ({ page }) => {
    // TODO: implement in Story 4.4 (quiz HubSpot wiring)
  });

  test.skip('/get-started booking creates HubSpot deal', async ({ page }) => {
    // TODO: implement in Story 6.2
  });
});
