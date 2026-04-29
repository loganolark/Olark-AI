import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CTAButton from './CTAButton';

describe('CTAButton — variants', () => {
  it('renders primary variant with gold background token', () => {
    render(<CTAButton variant="primary">Click me</CTAButton>);
    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeInTheDocument();
    expect(btn.style.backgroundColor).toBe('var(--od-gold)');
    expect(btn.style.color).toBe('var(--od-dark)');
  });

  it('renders secondary variant with transparent background', () => {
    render(<CTAButton variant="secondary">Secondary</CTAButton>);
    const btn = screen.getByRole('button', { name: /secondary/i });
    expect(btn.style.backgroundColor).toBe('transparent');
    expect(btn.style.color).toBe('var(--od-white)');
  });

  it('renders ghost variant', () => {
    render(<CTAButton variant="ghost">Ghost</CTAButton>);
    const btn = screen.getByRole('button', { name: /ghost/i });
    expect(btn.style.color).toBe('var(--od-muted)');
  });
});

describe('CTAButton — sizes', () => {
  it('sm renders with height 36px', () => {
    render(<CTAButton size="sm">Small</CTAButton>);
    const btn = screen.getByRole('button', { name: /small/i });
    expect(btn.style.height).toBe('36px');
  });

  it('md (default) renders with height 44px', () => {
    render(<CTAButton>Default</CTAButton>);
    const btn = screen.getByRole('button', { name: /default/i });
    expect(btn.style.height).toBe('44px');
  });

  it('lg renders with height 52px', () => {
    render(<CTAButton size="lg">Large</CTAButton>);
    const btn = screen.getByRole('button', { name: /large/i });
    expect(btn.style.height).toBe('52px');
  });
});

describe('CTAButton — disabled state', () => {
  it('sets aria-disabled="true" when disabled prop is true', () => {
    render(<CTAButton disabled>Disabled</CTAButton>);
    const btn = screen.getByRole('button', { name: /disabled/i });
    expect(btn).toHaveAttribute('aria-disabled', 'true');
  });

  it('does NOT set HTML disabled attribute (must remain focusable)', () => {
    render(<CTAButton disabled>Disabled</CTAButton>);
    const btn = screen.getByRole('button', { name: /disabled/i });
    expect(btn).not.toBeDisabled();
  });

  it('applies opacity 0.4 when disabled', () => {
    render(<CTAButton disabled>Disabled</CTAButton>);
    const btn = screen.getByRole('button', { name: /disabled/i });
    expect(btn.style.opacity).toBe('0.4');
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<CTAButton disabled onClick={handleClick}>Disabled</CTAButton>);
    fireEvent.click(screen.getByRole('button', { name: /disabled/i }));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('button is still in the tab order when disabled (not removed from DOM)', () => {
    render(<CTAButton disabled>Disabled</CTAButton>);
    const btn = screen.getByRole('button', { name: /disabled/i });
    expect(btn).not.toHaveAttribute('tabindex', '-1');
  });
});

describe('CTAButton — loading state', () => {
  it('renders spinner and hides children when loading', () => {
    render(<CTAButton loading>Submit</CTAButton>);
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
    expect(screen.queryByText('Submit')).not.toBeInTheDocument();
  });

  it('sets aria-busy="true" when loading', () => {
    render(<CTAButton loading>Submit</CTAButton>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('does not call onClick when loading', () => {
    const handleClick = vi.fn();
    render(<CTAButton loading onClick={handleClick}>Submit</CTAButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});

describe('CTAButton — onClick', () => {
  it('calls onClick when clicked in normal state', () => {
    const handleClick = vi.fn();
    render(<CTAButton onClick={handleClick}>Click me</CTAButton>);
    fireEvent.click(screen.getByRole('button', { name: /click me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('CTAButton — href renders as link', () => {
  it('renders an anchor element when href is provided', () => {
    render(<CTAButton href="/get-started">Get Started</CTAButton>);
    const link = screen.getByRole('link', { name: /get started/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/get-started');
  });
});
