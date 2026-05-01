import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HomePage from './page';

describe('HomePage — Hero (industrial-supplier rebuild)', () => {
  it('hero h1 reads "AI for Industrial Suppliers."', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /AI for Industrial Suppliers\./i,
      }),
    ).toBeInTheDocument();
  });

  it('renders the heritage PillBadge in the hero', () => {
    render(<HomePage />);
    // PillBadge nests text inside a wrapper span — getAllByText catches both.
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

describe('HomePage — Final CTA + Quiz block (kept from prior build)', () => {
  it('renders the "Still Not Sure" headline', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { level: 2, name: /Still Not Sure Which Tier Fits/i }),
    ).toBeInTheDocument();
  });

  it('renders both quiz CTAs — hero link to #quiz + Final CTA start-quiz button', () => {
    render(<HomePage />);
    const heroLink = screen.getByRole('link', { name: /Take the 60-Second Quiz/i });
    expect(heroLink).toHaveAttribute('href', '#quiz');
    const finalCtaButton = screen.getByRole('button', {
      name: /Take the 60-Second Quiz/i,
    });
    expect(finalCtaButton).toBeInTheDocument();
    expect(finalCtaButton).not.toHaveAttribute('href');
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
      'AI for Industrial Suppliers.',
      'expensive digital filing cabinets',
      'Engineered for Industrial Supply',
      'We Remove the Cruft',
      'Stop Being the Search Bar',
      'We Enhance the Human Moment',
      'Trusted by industrial suppliers',
      'Still Not Sure Which Tier Fits',
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
