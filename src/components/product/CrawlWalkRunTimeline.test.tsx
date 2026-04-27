import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CrawlWalkRunTimeline from './CrawlWalkRunTimeline';

describe('CrawlWalkRunTimeline — initial state', () => {
  it('renders all 3 phase triggers with aria-expanded="false"', () => {
    render(<CrawlWalkRunTimeline />);
    const triggers = screen.getAllByRole('button');
    expect(triggers).toHaveLength(3);
    triggers.forEach((t) => expect(t).toHaveAttribute('aria-expanded', 'false'));
  });

  it('shows phase labels and headlines but not detail copy initially', () => {
    render(<CrawlWalkRunTimeline />);
    expect(screen.getByText(/Days 1–2/i)).toBeInTheDocument();
    expect(screen.getByText(/Weeks 2–3/i)).toBeInTheDocument();
    expect(screen.getByText(/Month 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Bot live on your site/i)).toBeInTheDocument();
    // Detail copy hidden via the `hidden` attribute → not in accessible tree.
    expect(screen.queryByText(/Aiden trains on your site/i)).not.toBeVisible();
  });
});

describe('CrawlWalkRunTimeline — expand / collapse', () => {
  it('clicking a trigger sets aria-expanded="true" and reveals detail copy', async () => {
    const user = userEvent.setup();
    render(<CrawlWalkRunTimeline />);
    const trigger = screen.getByRole('button', { name: /Days 1–2/i });
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Aiden trains on your site/i)).toBeVisible();
  });

  it('clicking the same trigger again collapses it', async () => {
    const user = userEvent.setup();
    render(<CrawlWalkRunTimeline />);
    const trigger = screen.getByRole('button', { name: /Days 1–2/i });
    await user.click(trigger);
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(/Aiden trains on your site/i)).not.toBeVisible();
  });

  it('exclusive accordion: opening a different phase closes the first', async () => {
    const user = userEvent.setup();
    render(<CrawlWalkRunTimeline />);
    const first = screen.getByRole('button', { name: /Days 1–2/i });
    const second = screen.getByRole('button', { name: /Weeks 2–3/i });
    await user.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'true');
    await user.click(second);
    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(second).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByText(/Aiden trains on your site/i)).not.toBeVisible();
    expect(screen.getByText(/SDR-handoff, support escalation/i)).toBeVisible();
  });

  it('chevron data-open attribute toggles to match aria-expanded', async () => {
    const user = userEvent.setup();
    const { container } = render(<CrawlWalkRunTimeline />);
    const trigger = screen.getByRole('button', { name: /Month 1/i });
    await user.click(trigger);
    const chevrons = container.querySelectorAll('.cwr-phase__chevron');
    const openChevron = Array.from(chevrons).find(
      (c) => c.getAttribute('data-open') === 'true',
    );
    expect(openChevron).not.toBeUndefined();
  });
});

describe('CrawlWalkRunTimeline — a11y wiring', () => {
  it('aria-controls on each trigger points at the matching detail panel id', () => {
    render(<CrawlWalkRunTimeline />);
    const trigger = screen.getByRole('button', { name: /Days 1–2/i });
    const controlsId = trigger.getAttribute('aria-controls');
    expect(controlsId).toBe('cwr-detail-crawl');
    expect(document.getElementById('cwr-detail-crawl')).not.toBeNull();
  });

  it('uses the .cwr-timeline class so the global mobile breakpoint rule applies', () => {
    const { container } = render(<CrawlWalkRunTimeline />);
    expect(container.querySelector('.cwr-timeline')).not.toBeNull();
  });

  it('drawer uses .cwr-drawer class so the global prefers-reduced-motion rule applies', async () => {
    const user = userEvent.setup();
    const { container } = render(<CrawlWalkRunTimeline />);
    await user.click(screen.getByRole('button', { name: /Days 1–2/i }));
    const drawers = container.querySelectorAll('.cwr-drawer');
    expect(drawers.length).toBeGreaterThan(0);
  });
});
