'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import CTAButton from '@/components/ui/CTAButton';
import { useConsent } from '@/lib/consent';
import { trackEvent } from '@/lib/analytics';
import {
  readDemoSignals,
  readPagesVisited,
  readSessionSignalsCookie,
} from '@/lib/session-signals';
import type { ConversionVariant } from '@/types/conversion';
import type { HubSpotContactPayload } from '@/types/hubspot';
import type { TierSignal } from '@/types/quiz';

const EMBED_SRC = 'https://hello.olark.com/meetings/logan-stuard/aiden?embed=true';
const FALLBACK_HREF = 'https://hello.olark.com/meetings/logan-stuard/aiden';
const LOAD_TIMEOUT_MS = 10_000;

export interface HubSpotMeetingEmbedProps {
  variant: ConversionVariant;
}

type LoadStatus = 'loading' | 'loaded' | 'error';

const VARIANT_TO_TIER: Record<ConversionVariant, TierSignal | null> = {
  'commercial-high-intent': 'commercial',
  'commercial-quiz-only': 'commercial',
  'lead-gen': 'lead_gen',
  essentials: 'essentials',
  anonymous: null,
};

function looksLikeMeetingsBooked(data: unknown): boolean {
  if (!data) return false;
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (obj.meetingsPayload) return true;
  }
  try {
    const stringified = JSON.stringify(data);
    return stringified.includes('meetings') && /book/i.test(stringified);
  } catch {
    return false;
  }
}

function extractEmail(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;
  const payload = (obj.meetingsPayload ?? obj) as Record<string, unknown>;
  const bookingResponse = payload?.bookingResponse as Record<string, unknown> | undefined;
  const postResponse = bookingResponse?.postResponse as Record<string, unknown> | undefined;
  const contact = postResponse?.contact as Record<string, unknown> | undefined;
  const email = contact?.email;
  if (typeof email === 'string' && email.includes('@')) return email;
  // Fallback paths
  const directContact = (payload as { contact?: { email?: string } } | undefined)?.contact;
  if (directContact && typeof directContact.email === 'string') return directContact.email;
  return null;
}

function postHubSpot(payload: HubSpotContactPayload): void {
  if (typeof window === 'undefined') return;
  try {
    const body = JSON.stringify(payload);
    void fetch('/api/hubspot/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      /* swallow */
    });
  } catch {
    /* defensive */
  }
}

export default function HubSpotMeetingEmbed({ variant }: HubSpotMeetingEmbedProps) {
  const { consent } = useConsent();
  const consentAnalytics = consent.analytics;
  const [status, setStatus] = useState<LoadStatus>('loading');
  const bookingFiredRef = useRef<boolean>(false);

  const tierSignal = VARIANT_TO_TIER[variant];
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Load timeout
  useEffect(() => {
    if (status !== 'loading') return undefined;
    const timer = window.setTimeout(() => {
      setStatus((s) => (s === 'loading' ? 'error' : s));
    }, LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [status]);

  // Native load/error listeners (React onLoad/onError on iframe is unreliable in JSDOM
  // and inconsistent across browsers for cross-origin frames).
  useEffect(() => {
    const node = iframeRef.current;
    if (!node) return undefined;
    function onLoad() {
      setStatus('loaded');
    }
    function onError() {
      setStatus('error');
    }
    node.addEventListener('load', onLoad);
    node.addEventListener('error', onError);
    return () => {
      node.removeEventListener('load', onLoad);
      node.removeEventListener('error', onError);
    };
  }, [status]);

  const handleBooking = useCallback(
    (data: unknown) => {
      if (bookingFiredRef.current) return;
      bookingFiredRef.current = true;

      // GA4 event (consent-gated). Fires regardless of email presence.
      if (consentAnalytics) {
        trackEvent('booking_completed', {
          tier_signal: tierSignal,
          source: 'conversion_page',
        });
      }

      // HubSpot upsert: requires an email from the postMessage payload.
      const email = extractEmail(data);
      if (!email) return;

      const cookie = readSessionSignalsCookie();
      const { demoDepth, demoUrl } = readDemoSignals();
      const pagesVisited = readPagesVisited();

      const payload: HubSpotContactPayload = {
        email,
        ...(cookie?.tier_signal ? { olark_tier_signal: cookie.tier_signal } : {}),
        olark_demo_depth: demoDepth,
        olark_demo_url: demoUrl,
        olark_pages_visited: pagesVisited,
      };

      postHubSpot(payload);
    },
    [consentAnalytics, tierSignal],
  );

  // PostMessage listener
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!looksLikeMeetingsBooked(event.data)) return;
      handleBooking(event.data);
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [handleBooking]);

  return (
    <div
      data-testid="hubspot-meeting-embed"
      className="hubspot-embed-wrap"
      style={{
        width: '100%',
      }}
    >
      {status === 'loading' && (
        <div
          aria-hidden="true"
          className="hubspot-embed-skeleton hubspot-embed-frame"
          data-testid="hubspot-embed-skeleton"
        />
      )}

      {status !== 'error' && (
        <iframe
          ref={iframeRef}
          title="Book a scoping call with Aiden"
          src={EMBED_SRC}
          className="hubspot-embed-frame"
          style={{
            display: status === 'loaded' ? 'block' : 'none',
          }}
        />
      )}

      {status === 'error' && (
        <div
          data-testid="hubspot-embed-fallback"
          style={{
            padding: '2.5rem 1.5rem',
            border: '1px solid var(--od-border)',
            borderRadius: '16px',
            background: 'var(--od-card)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              color: 'var(--od-text)',
              fontSize: '0.9375rem',
              lineHeight: 1.6,
              marginBottom: '1.25rem',
            }}
          >
            The booking embed couldn’t load. Use the direct link below — it goes to the same
            scheduler.
          </p>
          <CTAButton variant="primary" size="lg" href={FALLBACK_HREF}>
            Book Your Scoping Call →
          </CTAButton>
        </div>
      )}

      {/* Render tier-signal context as a hidden marker so tests / analytics tools
          can verify the variant routing without inspecting iframe internals. */}
      <span data-testid="hubspot-embed-variant" aria-hidden="true" hidden>
        {variant}:{tierSignal ?? 'none'}
      </span>
    </div>
  );
}
