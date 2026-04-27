import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';

vi.mock('@/lib/consent', () => ({
  useConsent: vi.fn(),
}));

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

import { useConsent } from '@/lib/consent';
import { trackEvent } from '@/lib/analytics';
import HubSpotMeetingEmbed from './HubSpotMeetingEmbed';

function setConsent(analytics: boolean) {
  vi.mocked(useConsent).mockReturnValue({
    consent: { analytics, marketing: false },
    hasInteracted: true,
    acceptAll: vi.fn(),
    updateConsent: vi.fn(),
  });
}

beforeEach(() => {
  vi.mocked(trackEvent).mockClear();
  setConsent(true);
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ data: { contactId: 'c1' }, error: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  document.cookie = 'olark_quiz_state=; Path=/; Max-Age=0';
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('HubSpotMeetingEmbed — render states', () => {
  it('renders the skeleton + iframe with the correct src and title on initial render', () => {
    render(<HubSpotMeetingEmbed variant="anonymous" />);
    expect(screen.getByTestId('hubspot-embed-skeleton')).toBeInTheDocument();
    const iframe = document.querySelector('iframe[title="Book a scoping call with Aiden"]');
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute('src')).toBe(
      'https://hello.olark.com/meetings/logan-stuard/aiden?embed=true',
    );
  });

  it('hides the skeleton and shows the iframe after onLoad fires', () => {
    render(<HubSpotMeetingEmbed variant="anonymous" />);
    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    fireEvent.load(iframe);
    expect(screen.queryByTestId('hubspot-embed-skeleton')).not.toBeInTheDocument();
    expect(iframe.style.display).toBe('block');
  });

  it('renders the fallback CTA when the iframe fires onError', () => {
    render(<HubSpotMeetingEmbed variant="anonymous" />);
    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    fireEvent.error(iframe);
    expect(screen.getByTestId('hubspot-embed-fallback')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Book Your Scoping Call/i }),
    ).toHaveAttribute('href', 'https://hello.olark.com/meetings/logan-stuard/aiden');
  });
});

describe('HubSpotMeetingEmbed — postMessage booking handler', () => {
  function dispatchBookingMessage(email = 'm@acme.com') {
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            meetingsPayload: {
              bookingResponse: {
                postResponse: {
                  contact: { email },
                },
              },
            },
          },
        }),
      );
    });
  }

  it('fires the HubSpot upsert with full session context on booking', async () => {
    document.cookie = `olark_quiz_state=${encodeURIComponent(
      JSON.stringify({ tier_signal: 'commercial', demo_run: true, quiz_completed: true }),
    )}; Path=/`;
    render(<HubSpotMeetingEmbed variant="commercial-high-intent" />);
    dispatchBookingMessage('marcus@acme.com');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(url).toBe('/api/hubspot/contact');
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.email).toBe('marcus@acme.com');
    expect(body.olark_tier_signal).toBe('commercial');
    expect(body).toHaveProperty('olark_demo_depth');
    expect(body).toHaveProperty('olark_pages_visited');
  });

  it('fires booking_completed GA4 event when consent is granted', () => {
    render(<HubSpotMeetingEmbed variant="lead-gen" />);
    dispatchBookingMessage();
    expect(trackEvent).toHaveBeenCalledWith('booking_completed', {
      tier_signal: 'lead_gen',
      source: 'conversion_page',
    });
  });

  it('does NOT fire GA4 when consent is denied', () => {
    setConsent(false);
    render(<HubSpotMeetingEmbed variant="commercial-high-intent" />);
    dispatchBookingMessage();
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it('does NOT fire HubSpot upsert when the postMessage has no email', () => {
    render(<HubSpotMeetingEmbed variant="anonymous" />);
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { meetingsPayload: { bookingResponse: { postResponse: {} } } },
        }),
      );
    });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('still fires GA4 (consent-gated) even when email is missing', () => {
    render(<HubSpotMeetingEmbed variant="essentials" />);
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { meetingsPayload: { bookingResponse: {} } },
        }),
      );
    });
    expect(trackEvent).toHaveBeenCalledWith('booking_completed', {
      tier_signal: 'essentials',
      source: 'conversion_page',
    });
  });

  it('ignores unrelated postMessage events', () => {
    render(<HubSpotMeetingEmbed variant="anonymous" />);
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', { data: { type: 'something-else' } }),
      );
    });
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it('only fires once even if multiple booking messages arrive', () => {
    render(<HubSpotMeetingEmbed variant="lead-gen" />);
    dispatchBookingMessage();
    dispatchBookingMessage();
    dispatchBookingMessage();
    expect(trackEvent).toHaveBeenCalledTimes(1);
  });
});
