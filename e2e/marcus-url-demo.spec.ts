import { test, expect } from '@playwright/test';

test.describe('Marcus journey: URL demo → conversion', () => {
  test('homepage loads and has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Aiden by Olark/);
  });

  test.skip('url demo widget accepts URL and trains Aiden', async ({ page }) => {
    // TODO: implement in Story 3.2 (URLWidget built)
  });

  test.skip('trained demo shows chat and "Unlock More" CTA', async ({ page }) => {
    // TODO: implement in Story 3.3
  });

  test.skip('unlock more routes to /get-started with tier context', async ({ page }) => {
    // TODO: implement in Story 6.1
  });
});
