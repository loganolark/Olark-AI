import { test, expect } from '@playwright/test';

test.describe('Bouncer journey: quiz localStorage recovery', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Aiden by Olark/);
  });

  test.skip('quiz resumes from localStorage on return visit', async ({ page }) => {
    // TODO: implement in Story 7.2 (deep-link quiz resume)
  });
});
