import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EssentialsPage from './page';
import { VideoLightboxProvider } from '@/components/ui/VideoLightbox';

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

function renderPage() {
  return render(
    <VideoLightboxProvider>
      <EssentialsPage />
    </VideoLightboxProvider>,
  );
}

describe('EssentialsPage — structure', () => {
  it('has exactly one <h1>', () => {
    renderPage();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('hero h1 reads "Smart Chat, Ready in Minutes"', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: /Smart Chat, Ready in Minutes/i }),
    ).toBeInTheDocument();
  });

  it('renders the "Essentials Tier" PillBadge', () => {
    renderPage();
    expect(screen.getByText(/Essentials Tier/i)).toBeInTheDocument();
  });
});

describe('EssentialsPage — TierCard', () => {
  it('renders the TierCard with role="article"', () => {
    const { container } = renderPage();
    // Story 8.4 added EssentialsFeatureGroups with feature-card <article>s, so
    // scope to the TierCard's class explicitly rather than getByRole('article').
    expect(container.querySelector('article.tier-card')).not.toBeNull();
  });

  it('lists Essentials-tier capabilities', () => {
    renderPage();
    expect(screen.getByText(/One-click install/i)).toBeInTheDocument();
    expect(screen.getByText(/Live in 48 hours, not 6 months/i)).toBeInTheDocument();
    expect(screen.getByText(/Self-serve dashboard/i)).toBeInTheDocument();
  });

  it('does NOT list cross-tier capabilities or upgrade language', () => {
    renderPage();
    expect(screen.queryByText(/upgrade available/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/full pipeline/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/most popular/i)).not.toBeInTheDocument();
  });
});

describe('EssentialsPage — CTAs', () => {
  it('primary CTA "Get Started Today" routes to /get-started with Essentials-tier aria-label', () => {
    renderPage();
    const cta = screen.getByRole('link', { name: /Get Started Today.*Essentials tier/i });
    expect(cta).toHaveAttribute('href', '/get-started');
  });

  it('secondary "See Lead-Gen →" link routes to /lead-gen', () => {
    renderPage();
    const link = screen.getByRole('link', { name: /See Lead-Gen/i });
    expect(link).toHaveAttribute('href', '/lead-gen');
  });
});

describe('EssentialsPage — Story 8.4 content expansion', () => {
  it('renders the EssentialsFeatureGroups section with all 3 group labels', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 2, name: /Everything You Need to Start Smart/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Training')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Usage & Reporting')).toBeInTheDocument();
  });

  it('renders the SupportPromise section', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 2, name: /You.re Never on Your Own/i }),
    ).toBeInTheDocument();
    // PillBadge text (no longer also rendered as <h3>)
    expect(screen.getByText(/Support That Comes Standard/i)).toBeInTheDocument();
  });

  it('renders the MidPageMeetingCTA with the Essentials title', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 2, name: /The Smartest First Step in AI Starts Here/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Schedule to Learn More About Aiden/i }),
    ).toHaveAttribute('href', '/get-started');
  });

  it('renders new sections in the correct DOM order: feature groups → support promise → meeting CTA', () => {
    renderPage();
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    const featuresIdx = headings.findIndex((t) => /Everything You Need to Start Smart/i.test(t ?? ''));
    const supportIdx = headings.findIndex((t) => /You.re Never on Your Own/.test(t ?? ''));
    const meetingIdx = headings.findIndex((t) =>
      /The Smartest First Step in AI Starts Here/i.test(t ?? ''),
    );
    expect(featuresIdx).toBeGreaterThan(-1);
    expect(supportIdx).toBeGreaterThan(featuresIdx);
    expect(meetingIdx).toBeGreaterThan(supportIdx);
  });
});

describe('EssentialsPage — Story 8.5 video sections', () => {
  it('renders the Live Search VideoSection above the EssentialsFeatureGroups', () => {
    renderPage();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Your Bot Is Ready Before Your First Customer Arrives/i,
      }),
    ).toBeInTheDocument();
    const liveSearchLabels = screen.getAllByText(/Live Search/i);
    expect(liveSearchLabels.length).toBeGreaterThan(0);
  });

  it('renders the AI Analyst FeatureSpotlight with an embedded video thumbnail', () => {
    renderPage();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Your Chat History Has Been Sitting on a Goldmine/i,
      }),
    ).toBeInTheDocument();
    // The AI Analyst spotlight uses VideoEmbedThumbnail as its graphic
    const aiAnalystThumb = screen
      .getAllByTestId('video-embed-thumbnail')
      .find((t) => t.getAttribute('data-media-id') === '654bn7hwb5');
    expect(aiAnalystThumb).toBeDefined();
  });

  it('renders TWO video thumbnails on the page (Live Search + AI Analyst)', () => {
    renderPage();
    const thumbs = screen.getAllByTestId('video-embed-thumbnail');
    expect(thumbs).toHaveLength(2);
    const ids = thumbs.map((t) => t.getAttribute('data-media-id'));
    expect(ids).toContain('fgqmk8acw5');
    expect(ids).toContain('654bn7hwb5');
  });

  it('opens the lightbox when the Live Search thumbnail is clicked', async () => {
    const user = userEvent.setup();
    renderPage();
    const liveSearchThumb = screen
      .getAllByTestId('video-embed-thumbnail')
      .find((t) => t.getAttribute('data-media-id') === 'fgqmk8acw5');
    expect(liveSearchThumb).toBeDefined();
    await user.click(liveSearchThumb!);
    const iframe = screen.getByTestId('video-lightbox-iframe') as HTMLIFrameElement;
    expect(iframe.src).toContain('/embed/iframe/fgqmk8acw5');
  });
});
