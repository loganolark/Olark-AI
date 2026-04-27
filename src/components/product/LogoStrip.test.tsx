import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LogoStrip from './LogoStrip';

// Each logo appears in multiple DOM nodes (desktop grid + accessible list + marquee duplicates).
// Use getAllByAltText and assert at least one instance is in the document.
describe('LogoStrip — logo presence', () => {
  it('renders Rackspace logo with correct alt text', () => {
    render(<LogoStrip />);
    expect(screen.getAllByAltText('Rackspace').length).toBeGreaterThan(0);
  });

  it('renders Greenpeace logo with correct alt text', () => {
    render(<LogoStrip />);
    expect(screen.getAllByAltText('Greenpeace').length).toBeGreaterThan(0);
  });

  it('renders Hulu logo with correct alt text', () => {
    render(<LogoStrip />);
    expect(screen.getAllByAltText('Hulu').length).toBeGreaterThan(0);
  });

  it('renders J.Crew logo with correct alt text', () => {
    render(<LogoStrip />);
    expect(screen.getAllByAltText('J.Crew').length).toBeGreaterThan(0);
  });

  it('renders Medium logo with correct alt text', () => {
    render(<LogoStrip />);
    expect(screen.getAllByAltText('Medium').length).toBeGreaterThan(0);
  });

  it('renders Shopify logo with correct alt text', () => {
    render(<LogoStrip />);
    expect(screen.getAllByAltText('Shopify').length).toBeGreaterThan(0);
  });
});

describe('LogoStrip — structure', () => {
  it('renders desktop grid container', () => {
    const { container } = render(<LogoStrip />);
    const grid = container.querySelector('[data-testid="logo-grid"]');
    expect(grid).not.toBeNull();
  });

  it('renders marquee track for mobile animation', () => {
    const { container } = render(<LogoStrip />);
    const track = container.querySelector('.logo-marquee-track');
    expect(track).not.toBeNull();
  });

  it('marquee track contains duplicated logos for seamless loop', () => {
    const { container } = render(<LogoStrip />);
    const track = container.querySelector('.logo-marquee-track');
    // 6 logos × 2 copies = 12 children
    expect(track?.children.length).toBe(12);
  });

  it('marquee track is aria-hidden (decorative duplicate)', () => {
    const { container } = render(<LogoStrip />);
    const track = container.querySelector('.logo-marquee-track');
    expect(track).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('LogoStrip — accessibility', () => {
  it('has accessible label for the logo region', () => {
    render(<LogoStrip />);
    // Outer wrapper div carries aria-label="Trusted by leading teams"
    expect(screen.getByLabelText('Trusted by leading teams')).toBeInTheDocument();
  });
});
