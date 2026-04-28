import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommercialPage from './page';
import { VideoLightboxProvider } from '@/components/ui/VideoLightbox';

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

function renderPage() {
  return render(
    <VideoLightboxProvider>
      <CommercialPage />
    </VideoLightboxProvider>,
  );
}

describe('CommercialPage — structure', () => {
  it('has exactly one <h1>', () => {
    renderPage();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('hero h1 reads "Provable Pipeline. Full Signal Trail."', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: /Provable Pipeline\. Full Signal Trail\./i }),
    ).toBeInTheDocument();
  });

  it('renders the "Commercial Tier" PillBadge in the hero', () => {
    renderPage();
    expect(screen.getByText(/Commercial Tier/i)).toBeInTheDocument();
  });
});

describe('CommercialPage — Crawl/Walk/Run timeline', () => {
  it('renders all three phase triggers with the AC-specified headlines', () => {
    renderPage();
    expect(
      screen.getByRole('button', { name: /Days 1–2.*Bot live on your site/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Weeks 2–3.*Custom conversation flows/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /Month 1.*Full CRM integration, signal trail active, rep intelligence dashboard live/i,
      }),
    ).toBeInTheDocument();
  });

  it('phases default to collapsed (aria-expanded="false")', () => {
    renderPage();
    // Scope to the timeline triggers only — Story 8.2 added a "Get My Custom
    // Quote" button via <QuoteSection> that doesn't carry aria-expanded.
    const triggers = screen
      .getAllByRole('button')
      .filter((b) => b.hasAttribute('aria-expanded'));
    expect(triggers).toHaveLength(3);
    triggers.forEach((t) => expect(t).toHaveAttribute('aria-expanded', 'false'));
  });
});

describe('CommercialPage — capabilities', () => {
  it('lists the four required Commercial capabilities', () => {
    renderPage();
    // "Full signal trail" also appears in the hero h1 — use the longer capability copy to disambiguate.
    expect(screen.getByText(/Full signal trail — every visitor interaction logged/i)).toBeInTheDocument();
    expect(screen.getByText(/Rep intelligence brief/i)).toBeInTheDocument();
    expect(screen.getByText(/HubSpot CRM integration/i)).toBeInTheDocument();
    expect(screen.getByText(/Objection-handling flows/i)).toBeInTheDocument();
  });

  it('does NOT contain forbidden replacement language (NFR-T3)', () => {
    const { container } = renderPage();
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/replaces your SDR/i);
    expect(text).not.toMatch(/replaces your team/i);
    expect(text).not.toMatch(/AI closes for you/i);
  });
});

describe('CommercialPage — CTA', () => {
  it('primary CTA "Scope Your Build" routes to /get-started with Commercial-tier aria-label', () => {
    renderPage();
    const cta = screen.getByRole('link', { name: /Scope Your Build.*Commercial tier/i });
    expect(cta).toHaveAttribute('href', '/get-started');
  });
});

describe('CommercialPage — Story 8.4 mid-page meeting CTA', () => {
  it('renders the MidPageMeetingCTA with the Commercial title', () => {
    renderPage();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Ready to Put Aiden to Work as Your Commercial Sales Engine/i,
      }),
    ).toBeInTheDocument();
  });

  it('mid-page CTA links to /get-started', () => {
    renderPage();
    const cta = screen.getByRole('link', { name: /Schedule to Learn More About Aiden/i });
    expect(cta).toHaveAttribute('href', '/get-started');
  });
});

describe('CommercialPage — Story 8.5 video section', () => {
  it('renders the solo "Watch Aiden Handle the Entire Pre-Sales Workflow" VideoSection', () => {
    renderPage();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Watch Aiden Handle the Entire Pre-Sales Workflow/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('video-section').getAttribute('data-variant')).toBe('solo');
  });

  it('does NOT render a checklist sidebar (solo variant)', () => {
    renderPage();
    expect(screen.queryByTestId('video-section-checklist')).toBeNull();
  });

  it('opens the lightbox with the commercial wistia id when the thumbnail is clicked', async () => {
    const user = userEvent.setup();
    renderPage();
    const thumb = screen.getByTestId('video-embed-thumbnail');
    expect(thumb.getAttribute('data-media-id')).toBe('ttc5obl4nd');
    await user.click(thumb);
    const iframe = screen.getByTestId('video-lightbox-iframe') as HTMLIFrameElement;
    expect(iframe.src).toContain('/embed/iframe/ttc5obl4nd');
  });

  it('renders video section before the implementation timeline', () => {
    renderPage();
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    const videoIdx = headings.findIndex((t) =>
      /Watch Aiden Handle the Entire Pre-Sales Workflow/i.test(t ?? ''),
    );
    const timelineIdx = headings.findIndex((t) => /Crawl\. Walk\. Run\./i.test(t ?? ''));
    expect(videoIdx).toBeGreaterThan(-1);
    expect(timelineIdx).toBeGreaterThan(videoIdx);
  });
});
