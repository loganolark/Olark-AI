import { test, expect } from '@playwright/test';

test.describe('Logan journey: HubSpot pipeline creation', () => {
  test('essentials page loads with correct title', async ({ page }) => {
    await page.goto('/essentials');
    await expect(page).toHaveTitle(/Aiden Essentials/);
  });

  test.skip('completed quiz creates HubSpot contact with correct properties', async ({ page }) => {
    // TODO: implement in Story 4.4 (quiz HubSpot wiring)
  });

  test('/get-started loads with booking section + Scope My Build CTA', async ({ page }) => {
    await page.goto('/get-started');
    const booking = page.locator('#booking');
    await expect(booking).toBeVisible();
    const iframe = page.locator('iframe[title="Book a scoping call with Aiden"]');
    const fallbackCta = page.getByRole('link', { name: /Book Your Scoping Call/i });
    const hasIframe = await iframe.count();
    const hasFallback = await fallbackCta.count();
    expect(hasIframe + hasFallback).toBeGreaterThanOrEqual(1);
    await expect(page.getByRole('link', { name: /Scope My Build/i })).toBeVisible();
  });
});
