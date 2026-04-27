import { test, expect } from '@playwright/test';

test.describe('Priya journey: Rep section visibility', () => {
  test('lead-gen page loads with correct title', async ({ page }) => {
    await page.goto('/lead-gen');
    await expect(page).toHaveTitle(/Aiden Lead-Gen/);
  });

  test.skip('rep-facing section "All You Have to Do Is Eat" is visible', async ({ page }) => {
    // TODO: implement in Story 5.3
  });
});
