import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HomePage from './page';

describe('HomePage — Hero (industrial-supplier rebuild)', () => {
  it('hero h1 leads with "Level Up Your Industrial Supply Lead Conversion" (title case)', () => {
    render(<HomePage />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent ?? '').toContain(
      'Level Up Your Industrial Supply Lead Conversion',
    );
  });

  it('renders the typewriter rotator inline with all 3 source phrases (sr-only)', () => {
    render(<HomePage />);
    const tw = screen.getByTestId('typewriter-rotator');
    expect(tw).toBeInTheDocument();
    // Visually-hidden sibling carries the joined phrase list for screen
    // readers — assert all three phrases are reachable in the DOM.
    const text = tw.textContent ?? '';
    expect(text).toMatch(/from your trade shows/i);
    expect(text).toMatch(/from your outbound campaigns/i);
    expect(text).toMatch(/from your inbound campaigns/i);
  });

  it('renders the heritage PillBadge in the hero', () => {
    render(<HomePage />);
    expect(
      screen.getAllByText(/17 years of live chat.*industrial supply/i).length,
    ).toBeGreaterThan(0);
  });

  it('renders the 3 hero stats (4.2× / <2 sec / 87%)', () => {
    render(<HomePage />);
    const row = screen.getByTestId('hero-stats-row');
    expect(row.textContent).toContain('4.2×');
    expect(row.textContent).toContain('< 2 sec');
    expect(row.textContent).toContain('87%');
  });
});

describe('HomePage — narrative sections', () => {
  it('renders the "expensive digital filing cabinets" callout', () => {
    render(<HomePage />);
    expect(
      screen.getByText(/expensive digital filing cabinets/i),
    ).toBeInTheDocument();
  });

  it('renders the "Engineered for Industrial Supply" pillars section with 4 pillars', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Engineered for Industrial Supply/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('industrial-pillar')).toHaveLength(4);
  });

  it('renders the WhyItMatters stats panel with 4 outcome stats', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /We Remove the Cruft\. Your Team Gets the Chats That Matter\./i,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('why-it-matters-stat')).toHaveLength(4);
  });

  it('renders the "Enhance the Human Moment" centerpiece', () => {
    render(<HomePage />);
    expect(screen.getByTestId('enhance-human-moment')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /We Enhance the Human Moment\./i,
      }),
    ).toBeInTheDocument();
  });
});

describe('HomePage — Persona tab switcher (industrial roles)', () => {
  it('renders the PersonaTabSwitcher with the 3 industrial role tabs', () => {
    render(<HomePage />);
    expect(screen.getByTestId('persona-tab-switcher')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^Sales Engineer$/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Inside Sales/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^VP of Sales$/ })).toBeInTheDocument();
  });

  it('Sales Engineer tab is the default-active persona', () => {
    render(<HomePage />);
    expect(screen.getByTestId('persona-panel-sales-engineer')).toBeInTheDocument();
    expect(
      screen.getByText(/Stop Being the Search Bar for Your Own Catalog\./i),
    ).toBeInTheDocument();
  });

  it('does NOT render the legacy SDR / RevOps Director / "All You Have to Do Is Eat" copy', () => {
    const { container } = render(<HomePage />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/^SDR$/m);
    expect(text).not.toMatch(/RevOps Director/);
    expect(text).not.toMatch(/All You Have to Do Is Eat/);
  });

  it('does NOT render the old Before/With Aiden duo', () => {
    const { container } = render(<HomePage />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/Before Aiden/i);
    expect(text).not.toMatch(/45-minute discovery calls/i);
  });
});

describe('HomePage — Quiz block', () => {
  it('renders the "Still Not Sure Which Tier Fits?" headline above the quiz card', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { level: 2, name: /Still Not Sure Which Tier Fits/i }),
    ).toBeInTheDocument();
  });

  it('renders the hero quiz CTA scrolling to #quiz', () => {
    render(<HomePage />);
    const heroLink = screen.getByRole('link', { name: /Take the 60-Second Quiz/i });
    expect(heroLink).toHaveAttribute('href', '#quiz');
  });

  it('does NOT render the redundant subhead + "Take the 60-Second Quiz" button (collapsed into the placeholder card)', () => {
    render(<HomePage />);
    expect(screen.queryByText(/Sixty seconds, then you decide/i)).toBeNull();
    expect(
      screen.queryByRole('button', { name: /Take the 60-Second Quiz/i }),
    ).toBeNull();
  });

  it('does NOT render the old 3-button tier-specific CTA bridge', () => {
    render(<HomePage />);
    expect(screen.queryByRole('link', { name: /Start Today, See Results This Week/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /Give Your Reps a Teammate/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /Build Your Full Pipeline Signal/i })).toBeNull();
  });
});

describe('HomePage — TierCard removal (collapsed into /commercial)', () => {
  it('does NOT render any TierCard on the homepage', () => {
    const { container } = render(<HomePage />);
    expect(container.querySelector('article.tier-card')).toBeNull();
  });

  it('does NOT render the legacy "How Aiden Works for Your Team" tier-card section heading', () => {
    render(<HomePage />);
    expect(
      screen.queryByRole('heading', {
        level: 2,
        name: /How Aiden Works for Your Team/i,
      }),
    ).toBeNull();
  });
});

describe('HomePage — Placeholders', () => {
  it('renders URL demo widget section (loading state while JS loads)', () => {
    render(<HomePage />);
    expect(screen.getByText(/Loading demo/i)).toBeInTheDocument();
  });

  it('renders the QuizPlaceholder by default (PathFinderQuiz is gated behind it)', () => {
    render(<HomePage />);
    expect(screen.getByTestId('quiz-placeholder')).toBeInTheDocument();
    expect(
      screen.queryByRole('radiogroup', { name: /How big is your company/i }),
    ).toBeNull();
  });

  it('renders the #quiz section anchor that the hero CTA scrolls to', () => {
    const { container } = render(<HomePage />);
    expect(container.querySelector('#quiz')).not.toBeNull();
  });
});

describe('HomePage — DOM order of major sections', () => {
  it('places sections in the expected narrative order', () => {
    render(<HomePage />);
    const text = (document.body.textContent ?? '').replace(/\s+/g, ' ');
    const markers = [
      'Level Up Your Industrial Supply Lead Conversion',
      'expensive digital filing cabinets',
      'A Real Industrial-Supply Conversation',
      'Engineered for Industrial Supply',
      'We Remove the Cruft',
      'Stop Being the Search Bar',
      'We Enhance the Human Moment',
      'Trusted by industrial suppliers',
      'Still Not Sure Which Tier Fits',
      'Find Your Tier in About a Minute',
    ];
    let lastIdx = -1;
    for (const m of markers) {
      const idx = text.indexOf(m);
      expect(idx, `expected marker "${m}" to appear in DOM`).toBeGreaterThanOrEqual(0);
      expect(idx, `expected "${m}" to come AFTER previous marker`).toBeGreaterThan(lastIdx);
      lastIdx = idx;
    }
  });
});

describe('HomePage — Boltz chat demo', () => {
  it('renders the BoltzChatDemo section between filing-cabinet callout and URL demo', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /A Real Industrial-Supply Conversation\. Try It\./i,
      }),
    ).toBeInTheDocument();
  });

  it('renders Boltz initial greeting + 4 starting chips + powered-by-Aiden badge', () => {
    render(<HomePage />);
    expect(screen.getByText(/Boltz here, Crestline/i)).toBeInTheDocument();
    expect(screen.getAllByTestId('boltz-chip')).toHaveLength(4);
    expect(screen.getByTestId('powered-by-aiden')).toBeInTheDocument();
  });

  it('renders the freeform input + reset controls', () => {
    render(<HomePage />);
    expect(screen.getByTestId('boltz-freeform-input')).toBeInTheDocument();
    expect(screen.getByTestId('boltz-reset')).toBeInTheDocument();
  });
});
