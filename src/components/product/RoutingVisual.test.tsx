import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoutingVisual from './RoutingVisual';

describe('RoutingVisual', () => {
  it('renders 3 chat bubbles with the routing copy', () => {
    render(<RoutingVisual />);
    expect(screen.getByText(/Hi! I have a few questions before I buy/)).toBeInTheDocument();
    expect(screen.getByText(/Of course — what can I help with/)).toBeInTheDocument();
    expect(
      screen.getByText(/Great — connecting you with our sales team now/),
    ).toBeInTheDocument();
  });

  it('renders the 3 routing buttons under the second bubble', () => {
    render(<RoutingVisual />);
    expect(screen.getByText('Talk to Sales')).toBeInTheDocument();
    expect(screen.getByText('Get Support')).toBeInTheDocument();
    expect(screen.getByText('Product Details')).toBeInTheDocument();
  });

  it('marks itself as in-view after IntersectionObserver fires', () => {
    render(<RoutingVisual />);
    const root = screen.getByTestId('routing-visual');
    expect(root.getAttribute('data-in-view')).toBe('true');
  });

  it('has a min-height to prevent layout shift while bubbles fade in', () => {
    render(<RoutingVisual />);
    const root = screen.getByTestId('routing-visual');
    expect(root.style.minHeight).toBe('320px');
  });
});
