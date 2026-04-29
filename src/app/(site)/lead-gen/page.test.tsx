import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LeadGenPage from './page';
import { VideoLightboxProvider } from '@/components/ui/VideoLightbox';

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

function renderPage() {
  return render(
    <VideoLightboxProvider>
      <LeadGenPage />
    </VideoLightboxProvider>,
  );
}

describe('LeadGenPage — structure', () => {
  it('has exactly one <h1>', () => {
    renderPage();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('hero h1 reads "Your Team Just Got an Extra SDR"', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: /Your Team Just Got an Extra SDR/i }),
    ).toBeInTheDocument();
  });

  it('renders the "Lead-Gen Tier" PillBadge in the hero', () => {
    renderPage();
    expect(screen.getByText(/Lead-Gen Tier/i)).toBeInTheDocument();
  });
});

describe('LeadGenPage — TierCard relocation', () => {
  it('does NOT render a TierCard (moved to /get-started as the dynamic recommendation)', () => {
    const { container } = renderPage();
    expect(container.querySelector('article.tier-card')).toBeNull();
  });

  it('does NOT show big-card capability copy on the product page', () => {
    renderPage();
    expect(screen.queryByText(/Visitors qualified by company size/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Pipeline-ready leads, not raw form fills/i)).not.toBeInTheDocument();
  });

  it('does NOT render the "Most Popular" pill anywhere', () => {
    renderPage();
    expect(screen.queryByText(/Most Popular/i)).toBeNull();
  });
});

describe('LeadGenPage — rep section', () => {
  it('renders "All You Have to Do Is Eat." verbatim', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { name: /All You Have to Do Is Eat\./i }),
    ).toBeInTheDocument();
  });

  it('rep section uses Priya-voice copy describing her workflow', () => {
    renderPage();
    expect(screen.getByText(/Monday morning, you open your queue/i)).toBeInTheDocument();
    expect(screen.getByText(/cold-opening conversations/i)).toBeInTheDocument();
  });

  it('does NOT contain forbidden replacement-language phrases (NFR-T3)', () => {
    const { container } = renderPage();
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/replaces your team/i);
    expect(text).not.toMatch(/automates your sales/i);
    expect(text).not.toMatch(/AI closes for you/i);
  });
});

describe('LeadGenPage — Story 8.4 feature spotlights + meeting CTA', () => {
  it('renders all 3 FeatureSpotlight headings (Routing, Pipeline, Automation)', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 2, name: /Guide Every Conversation From the Start/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Turn Chats Into Sales Opportunities/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Automate the Routine\. Elevate the Human\./i }),
    ).toBeInTheDocument();
  });

  it('renders representative pills from each spotlight', () => {
    renderPage();
    expect(screen.getByText('Smart Routing')).toBeInTheDocument();
    expect(screen.getByText('Hot Handoff')).toBeInTheDocument();
    expect(screen.getByText('Knowledge Base Answers')).toBeInTheDocument();
  });

  it('renders the MidPageMeetingCTA with the Lead-Gen title', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 2, name: /Put Aiden to Work as Your New Sales/i }),
    ).toBeInTheDocument();
  });

  it('feature spotlights render before the rep section in the DOM', () => {
    renderPage();
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    const routingIdx = headings.findIndex((t) =>
      /Guide Every Conversation From the Start/i.test(t ?? ''),
    );
    const repIdx = headings.findIndex((t) => /All You Have to Do Is Eat/i.test(t ?? ''));
    expect(routingIdx).toBeGreaterThan(-1);
    expect(repIdx).toBeGreaterThan(routingIdx);
  });
});

describe('LeadGenPage — Story 8.5 video + animated visuals', () => {
  it('renders the "Watch Aiden Work" VideoSection between hero and Routing spotlight', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 2, name: /Watch Aiden Work/i }),
    ).toBeInTheDocument();
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    const watchIdx = headings.findIndex((t) => /Watch Aiden Work/i.test(t ?? ''));
    const routingIdx = headings.findIndex((t) =>
      /Guide Every Conversation From the Start/i.test(t ?? ''),
    );
    expect(watchIdx).toBeGreaterThan(-1);
    expect(routingIdx).toBeGreaterThan(watchIdx);
  });

  it('opens the lightbox when the "Watch Aiden Work" thumbnail is clicked', async () => {
    const user = userEvent.setup();
    renderPage();
    const thumb = screen
      .getAllByTestId('video-embed-thumbnail')
      .find((t) => t.getAttribute('data-media-id') === 'tx6su2gamj');
    expect(thumb).toBeDefined();
    await user.click(thumb!);
    const iframe = screen.getByTestId('video-lightbox-iframe') as HTMLIFrameElement;
    expect(iframe.src).toContain('/embed/iframe/tx6su2gamj');
  });

  it('renders RoutingVisual, PipelineVisual, and AutomationVisual (no dashed placeholder)', () => {
    renderPage();
    expect(screen.getByTestId('routing-visual')).toBeInTheDocument();
    expect(screen.getByTestId('pipeline-visual')).toBeInTheDocument();
    expect(screen.getByTestId('automation-visual')).toBeInTheDocument();
    expect(screen.queryByText(/Visual coming soon/i)).toBeNull();
  });

  it('PipelineVisual shows the 4 stage names', () => {
    renderPage();
    expect(screen.getByText('Aiden Qualified')).toBeInTheDocument();
    expect(screen.getByText('Passed to Sales')).toBeInTheDocument();
    expect(screen.getByText('Active Conversations')).toBeInTheDocument();
    expect(screen.getByText('Closed / Won')).toBeInTheDocument();
  });
});
