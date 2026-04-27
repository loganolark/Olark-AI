import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ConsentProvider } from '@/lib/consent';
import CookieConsentBanner from './CookieConsentBanner';

const renderWithProvider = () =>
  render(
    <ConsentProvider>
      <CookieConsentBanner />
    </ConsentProvider>
  );

describe('CookieConsentBanner', () => {
  beforeEach(() => {
    document.cookie = 'olark_consent=; Max-Age=0; Path=/';
  });

  it('shows banner when no consent cookie exists', () => {
    renderWithProvider();
    expect(screen.getByRole('region', { name: /cookie consent/i })).toBeInTheDocument();
  });

  it('hides banner after clicking Accept', async () => {
    renderWithProvider();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /accept/i }));
    });
    expect(screen.queryByRole('region', { name: /cookie consent/i })).not.toBeInTheDocument();
  });

  it('sets olark_consent cookie on Accept with analytics: true', async () => {
    renderWithProvider();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /accept/i }));
    });
    expect(document.cookie).toContain('olark_consent');
    const match = document.cookie.match(/olark_consent=([^;]+)/);
    const parsed = JSON.parse(decodeURIComponent(match![1]));
    expect(parsed).toEqual({ analytics: true, marketing: true });
  });

  it('opens preference dialog on Manage click', async () => {
    renderWithProvider();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /manage/i }));
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes dialog on Escape and returns focus to Manage button', async () => {
    renderWithProvider();
    const manageBtn = screen.getByRole('button', { name: /manage/i });
    await act(async () => { fireEvent.click(manageBtn); });
    await act(async () => {
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    });
    // Flush Radix onCloseAutoFocus callback (schedules a microtask in jsdom)
    await act(async () => {});
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(manageBtn);
  });

  it('does not show banner when olark_consent cookie already exists', () => {
    document.cookie = `olark_consent=${encodeURIComponent(JSON.stringify({ analytics: true, marketing: true }))}; Path=/`;
    renderWithProvider();
    expect(screen.queryByRole('region', { name: /cookie consent/i })).not.toBeInTheDocument();
  });

  it('sets analytics: false when Analytics checkbox unchecked and saved', async () => {
    renderWithProvider();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /manage/i }));
    });
    const analyticsCheckbox = screen.getByLabelText(/analytics/i);
    fireEvent.click(analyticsCheckbox);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save preferences/i }));
    });
    const match = document.cookie.match(/olark_consent=([^;]+)/);
    const parsed = JSON.parse(decodeURIComponent(match![1]));
    expect(parsed.analytics).toBe(false);
  });
});
