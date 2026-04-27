import { test, expect } from '@playwright/test';

test.describe('Dana journey: Commercial page → booking', () => {
  test('commercial page loads with correct title', async ({ page }) => {
    await page.goto('/commercial');
    await expect(page).toHaveTitle(/Aiden Commercial/);
  });

  test.skip('Crawl/Walk/Run timeline is visible on commercial page', async ({ page }) => {
    // TODO: implement in Story 5.4
  });

  test.skip('Talk to Us CTA navigates to /get-started', async ({ page }) => {
    // TODO: implement in Story 6.1
  });
});
