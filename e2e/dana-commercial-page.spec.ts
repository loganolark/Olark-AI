import { test, expect } from '@playwright/test';

test.describe('Dana journey: Commercial page → booking', () => {
  test('commercial page loads with correct title', async ({ page }) => {
    await page.goto('/commercial');
    await expect(page).toHaveTitle(/Aiden Commercial/);
  });

  test('Crawl/Walk/Run timeline renders and a phase expands on click', async ({ page }) => {
    await page.goto('/commercial');
    const trigger = page.getByRole('button', { name: /Days 1–2.*Bot live on your site/i });
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByText(/Aiden trains on your site/i)).toBeVisible();
  });

  test('"Scope Your Build" CTA is present and links to /get-started', async ({ page }) => {
    await page.goto('/commercial');
    const cta = page.getByRole('link', { name: /Scope Your Build.*Commercial tier/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/get-started');
  });

  test.skip('Talk to Us CTA navigates to /get-started', async ({ page }) => {
    // TODO: implement in Story 6.1
  });
});
