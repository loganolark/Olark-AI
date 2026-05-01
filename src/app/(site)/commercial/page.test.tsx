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

  it('hero h1 reads "Industrial Intelligence. Human Connection."', () => {
    renderPage();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Industrial Intelligence\. Human Connection\./i,
      }),
    ).toBeInTheDocument();
  });

  it('renders the heritage PillBadge in the hero (17 years + industrial supply)', () => {
    renderPage();
    expect(
      screen.getByText(/17 years of live chat.*industrial supply/i),
    ).toBeInTheDocument();
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
    // Quote" button via <QuoteSection>, the compare-tier toggle in
    // QuoteBuilder, and inheritance toggles. Filter to the triggers we expect.
    const triggers = screen
      .getAllByRole('button')
      .filter(
        (b) =>
          b.hasAttribute('aria-expanded') &&
          b.textContent &&
          /Crawl|Walk|Run|Days|Weeks|Month/i.test(b.textContent),
      );
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
  it('renders the solo industrial-conversation VideoSection', () => {
    renderPage();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Watch Aiden Run a Real Industrial-Supply Conversation/i,
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
      /Watch Aiden Run a Real Industrial-Supply Conversation/i.test(t ?? ''),
    );
    const timelineIdx = headings.findIndex((t) => /Crawl\. Walk\. Run\./i.test(t ?? ''));
    expect(videoIdx).toBeGreaterThan(-1);
    expect(timelineIdx).toBeGreaterThan(videoIdx);
  });
});

describe('CommercialPage — narrative sections (industrial-supplier rebuild)', () => {
  it('renders the "expensive digital filing cabinets" problem blockquote', () => {
    renderPage();
    expect(
      screen.getByText(/Most B2B sites are/i),
    ).toBeInTheDocument();
  });

  it('renders all 3 industrial-archetype problem cards', () => {
    renderPage();
    const signals = screen.getAllByTestId('commercial-problem-signal');
    expect(signals).toHaveLength(3);
    expect(signals[0].textContent).toContain('Filtering Real Projects from Tire-Kickers');
    expect(signals[1].textContent).toContain('Capturing the Spec Without Losing It in Translation');
    expect(signals[2].textContent).toContain('Routing to the Right Dealer, Not the Wrong Region');
  });

  it('renders the heritage Aiden quote attribution', () => {
    renderPage();
    expect(screen.getByText(/The Aiden by Olark team/i)).toBeInTheDocument();
  });

  it('renders the How It Works h2 and all 7 step cards', () => {
    renderPage();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Seven Steps From Spec Question to Logged Pipeline/i,
      }),
    ).toBeInTheDocument();
    const stepCards = screen.getAllByTestId('commercial-step-card');
    expect(stepCards).toHaveLength(7);
  });

  it('renders the Net Result callout with the new "Sales Engineers Get Their Time Back" headline', () => {
    renderPage();
    const callout = screen.getByTestId('commercial-net-result');
    expect(callout).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Your Sales Engineers Get Their Time Back\./i,
      }),
    ).toBeInTheDocument();
    const bullets = callout.querySelectorAll('li');
    expect(bullets).toHaveLength(6);
  });

  it('renders the IndustrialFeatureGrid (4 cards: Doc Scanning / Lead Scoring / Geo Routing / Heritage)', () => {
    renderPage();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Four Capabilities Industrial Supply Actually Asks For/i,
      }),
    ).toBeInTheDocument();
    const cards = screen.getAllByTestId('industrial-feature-card');
    expect(cards).toHaveLength(4);
  });

  it('renders the PlatformProofSection with three dashboard frames', () => {
    renderPage();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /See the Platform, Not Just the Pitch/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('platform-shot-frame')).toHaveLength(3);
  });

  it('renders the Built For h2 with the new industrial framing', () => {
    renderPage();
    const builtForHeading = screen.getByRole('heading', {
      level: 2,
      name: /Built for Industrial Supply\./i,
    });
    expect(builtForHeading.textContent).toContain(
      'Calibrated for the Way You Actually Sell.',
    );
    const whoCards = screen.getAllByTestId('commercial-who-card');
    expect(whoCards).toHaveLength(3);
  });

  it('renders the PlaysWithYourStackStrip with the no-rip-and-replace promise', () => {
    renderPage();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /No Rip and Replace\. No New Tool for Your Team to Learn\./i,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('stack-item').length).toBeGreaterThan(0);
  });

  it('places narrative sections in the correct DOM order between video and timeline', () => {
    renderPage();
    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map((h) => h.textContent ?? '');

    const expectedOrder = [
      /Watch Aiden Run a Real Industrial-Supply Conversation/i,
      /Seven Steps From Spec Question to Logged Pipeline/i,
      /Four Capabilities Industrial Supply Actually Asks For/i,
      /See the Platform, Not Just the Pitch/i,
      /Built for Industrial Supply\./i,
      /No Rip and Replace\./i,
      /Crawl\. Walk\. Run\./i,
      /Ready to Put Aiden to Work as Your Commercial Sales Engine/i,
    ];

    const indexes = expectedOrder.map((re) =>
      headings.findIndex((t) => re.test(t)),
    );
    indexes.forEach((idx, i) =>
      expect(idx, `section ${i} (${expectedOrder[i]}) not found in DOM`).toBeGreaterThan(-1),
    );
    for (let i = 1; i < indexes.length; i++) {
      expect(indexes[i]).toBeGreaterThan(indexes[i - 1]);
    }
  });
});
