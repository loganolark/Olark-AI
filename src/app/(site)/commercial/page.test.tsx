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

describe('CommercialPage — TierCard relocation', () => {
  it('does NOT render a TierCard (moved to /get-started as the dynamic recommendation)', () => {
    const { container } = renderPage();
    expect(container.querySelector('article.tier-card')).toBeNull();
  });

  it('does NOT show big-card capability copy on the product page', () => {
    renderPage();
    // "Full signal trail" still appears in the hero h1 + commercial narrative
    // sections — assert only the longer capability-list strings are absent.
    expect(
      screen.queryByText(/Rep intelligence brief on every contact — context/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Tier-segmented routing gives your reps better leads/i),
    ).not.toBeInTheDocument();
  });

  it('does NOT contain forbidden replacement language (NFR-T3)', () => {
    const { container } = renderPage();
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/replaces your SDR/i);
    expect(text).not.toMatch(/replaces your team/i);
    expect(text).not.toMatch(/AI closes for you/i);
  });
});

describe('CommercialPage — bottom QuoteSection (merged with former MidPageMeetingCTA copy)', () => {
  it('renders the QuoteSection at the bottom with the merged "Ready to Put Aiden to Work" headline', () => {
    renderPage();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Ready to Put Aiden to Work as Your Commercial Sales Engine/i,
      }),
    ).toBeInTheDocument();
  });

  it('does NOT render a separate "Schedule to Learn More" meeting-CTA link', () => {
    renderPage();
    expect(screen.queryByRole('link', { name: /Schedule to Learn More About Aiden/i })).toBeNull();
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

describe('CommercialPage — Story 8.6 narrative sections', () => {
  it('renders the problem section blockquote', () => {
    renderPage();
    expect(
      screen.getByText(
        /How much of your team’s day is spent on work that happens/i,
      ),
    ).toBeInTheDocument();
  });

  it('renders all 3 problem-signal cards', () => {
    renderPage();
    const signals = screen.getAllByTestId('commercial-problem-signal');
    expect(signals).toHaveLength(3);
  });

  it('renders the Aiden quote attribution', () => {
    renderPage();
    expect(
      screen.getByText(/From the Commercial Presales Desk at Olark/i),
    ).toBeInTheDocument();
  });

  it('renders the How It Works h2 and all 7 step cards', () => {
    renderPage();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Seven Steps From First Click to Closed Deal/i,
      }),
    ).toBeInTheDocument();
    const stepCards = screen.getAllByTestId('commercial-step-card');
    expect(stepCards).toHaveLength(7);
  });

  it('renders the Net Result callout (merged from former OutcomeFlow) inside HowItWorks', () => {
    renderPage();
    const callout = screen.getByTestId('commercial-net-result');
    expect(callout).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /SDR Prep Is Nearly Eliminated\./i,
      }),
    ).toBeInTheDocument();
    const bullets = callout.querySelectorAll('li');
    expect(bullets).toHaveLength(6);
  });

  it('renders the Built For h2 and all 3 who-cards', () => {
    renderPage();
    const builtForHeading = screen.getByRole('heading', {
      level: 2,
      name: /This Is a Commercial Product\./i,
    });
    expect(builtForHeading.textContent).toContain('Here’s Who We Built It For.');
    const whoCards = screen.getAllByTestId('commercial-who-card');
    expect(whoCards).toHaveLength(3);
  });

  it('places narrative sections in the correct DOM order between video and timeline', () => {
    renderPage();
    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map((h) => h.textContent ?? '');

    const expectedOrder = [
      /Watch Aiden Handle the Entire Pre-Sales Workflow/i,
      /Seven Steps From First Click to Closed Deal/i,
      /This Is a Commercial Product\./i,
      /Crawl\. Walk\. Run\./i,
      /Ready to Put Aiden to Work as Your Commercial Sales Engine/i,
    ];
    // The QuoteSection now carries the bottom-CTA "Ready to Put Aiden to Work…"
    // h2 (merged from the former standalone MidPageMeetingCTA).

    const indexes = expectedOrder.map((re) =>
      headings.findIndex((t) => re.test(t)),
    );
    indexes.forEach((idx) => expect(idx).toBeGreaterThan(-1));
    for (let i = 1; i < indexes.length; i++) {
      expect(indexes[i]).toBeGreaterThan(indexes[i - 1]);
    }
  });
});
