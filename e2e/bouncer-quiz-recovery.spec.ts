import { test, expect } from '@playwright/test';

/**
 * ─── HubSpot Re-engagement Workflow Contract (Story 7.1) ──────────────────
 *
 * Workflow lives in HubSpot (configured manually by Logan), not in this codebase.
 * This test file documents the contract so future debuggers can trace the URL shape.
 *
 *  Trigger / enrollment criteria:
 *    olark_quiz_partial = true
 *    AND olark_tier_signal IS KNOWN (one of: 'essentials' | 'lead_gen' | 'commercial')
 *    AND email IS NOT BLANK
 *    AND email-consent (NFR-S5) granted via quiz step 4
 *
 *  Action sequence:
 *    1. 24-hour DELAY step (FR31)
 *    2. SEND email
 *
 *  Email body deep-link URL pattern (FR32):
 *    https://olark.ai/<tier-slug>?resume=true&session=<sessionId>
 *
 *      tier-slug map:
 *        olark_tier_signal === 'essentials'   →  /essentials
 *        olark_tier_signal === 'lead_gen'     →  /lead-gen
 *        olark_tier_signal === 'commercial'   →  /commercial
 *
 *      Examples:
 *        https://olark.ai/lead-gen?resume=true&session=abc123-def456
 *        https://olark.ai/commercial?resume=true&session=q-1714000000000-z9k2x4
 *
 *  Exit criteria:
 *    olark_quiz_partial = false
 *    (Workflow auto-suppresses send if the contact completes the quiz before 24h fires.)
 *
 *  Email template branding (NFR-B1):
 *    Background: #0F0D2E (var(--od-dark))
 *    CTA button: #F5C200 (var(--od-gold))
 *    Footer: HubSpot-native unsubscribe token (CAN-SPAM, FR33)
 */

test.describe('Bouncer journey: quiz localStorage recovery', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Aiden by Olark/);
  });

  test('deep link to /lead-gen?resume=true with matching localStorage shows the resume banner', async ({
    page,
  }) => {
    const seededSessionId = 'test-session-abc123';
    await page.addInitScript((sessionId) => {
      localStorage.setItem(
        'olark_quiz_state',
        JSON.stringify({
          currentStep: 3,
          answers: {
            olark_company_size: '11-50',
            olark_use_case: 'inbound_qual',
            olark_inbound_volume: 'medium',
          },
          emailCaptured: false,
          sessionId,
          startedAt: '2026-04-26T00:00:00.000Z',
        }),
      );
    }, seededSessionId);

    await page.goto(`/lead-gen?resume=true&session=${seededSessionId}`);
    const banner = page.getByRole('link', { name: /pick up where you left off/i });
    await expect(banner).toBeVisible();
    await expect(banner).toContainText(/3 steps in/i);
    await expect(banner).toHaveAttribute('href', '/#quiz');
  });
});
