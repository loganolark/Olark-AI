import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PillBadge from './PillBadge';

describe('PillBadge — variants', () => {
  it('renders gold variant with correct background and border tokens', () => {
    render(<PillBadge variant="gold">Live</PillBadge>);
    const badge = screen.getByText('Live').closest('span')!;
    expect(badge.style.backgroundColor).toBe('rgba(250, 201, 23, 0.15)');
    expect(badge.style.border).toBe('1px solid rgba(250, 201, 23, 0.3)');
    expect(badge.style.color).toBe('var(--od-gold)');
  });

  it('renders pink variant', () => {
    render(<PillBadge variant="pink">Hot</PillBadge>);
    const badge = screen.getByText('Hot').closest('span')!;
    expect(badge.style.backgroundColor).toBe('rgba(239, 78, 115, 0.15)');
    expect(badge.style.color).toBe('var(--od-pink)');
  });

  it('renders muted variant', () => {
    render(<PillBadge variant="muted">Beta</PillBadge>);
    const badge = screen.getByText('Beta').closest('span')!;
    expect(badge.style.color).toBe('var(--od-muted)');
  });

  it('defaults to gold variant when no variant prop provided', () => {
    render(<PillBadge>Default</PillBadge>);
    const badge = screen.getByText('Default').closest('span')!;
    expect(badge.style.color).toBe('var(--od-gold)');
  });
});

describe('PillBadge — border-radius', () => {
  it('has border-radius 100px (pill shape)', () => {
    render(<PillBadge>Pill</PillBadge>);
    const badge = screen.getByText('Pill').closest('span')!;
    expect(badge.style.borderRadius).toBe('100px');
  });
});

describe('PillBadge — pulse prop', () => {
  it('renders a pulsing dot when pulse=true', () => {
    render(<PillBadge pulse>Active</PillBadge>);
    const badge = screen.getByText('Active').closest('span')!;
    const dot = badge.querySelector('span[aria-hidden="true"]');
    expect(dot).not.toBeNull();
    expect((dot as HTMLElement).style.animation).toContain('pulse-dot');
  });

  it('does NOT render a dot when pulse is false (default)', () => {
    render(<PillBadge>Inactive</PillBadge>);
    const badge = screen.getByText('Inactive').closest('span')!;
    const dot = badge.querySelector('span[aria-hidden="true"]');
    expect(dot).toBeNull();
  });

  it('dot is aria-hidden so it does not pollute screen reader output', () => {
    render(<PillBadge pulse>Live Status</PillBadge>);
    const badge = screen.getByText('Live Status').closest('span')!;
    const dot = badge.querySelector('span');
    expect(dot).toHaveAttribute('aria-hidden', 'true');
  });
});
