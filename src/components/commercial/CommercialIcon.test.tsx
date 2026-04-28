import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import CommercialIcon from './CommercialIcon';

describe('CommercialIcon', () => {
  it('renders an SVG with the requested size', () => {
    const { container } = render(<CommercialIcon name="clock" size={24} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('width')).toBe('24');
    expect(svg?.getAttribute('height')).toBe('24');
  });

  it('is aria-hidden by default (decorative use)', () => {
    const { container } = render(<CommercialIcon name="map" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('role')).toBe('presentation');
  });

  it('exposes role="img" + aria-label when aria-label is provided', () => {
    const { container } = render(
      <CommercialIcon name="trophy" aria-label="Trophy" />,
    );
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toBe('Trophy');
    expect(svg?.getAttribute('aria-hidden')).toBeNull();
  });

  it('renders all 6 supported icon names without throwing', () => {
    const names = ['clock', 'shuffle', 'inbox-x', 'map', 'trophy', 'gear'] as const;
    names.forEach((name) => {
      const { container } = render(<CommercialIcon name={name} />);
      expect(container.querySelector('svg')).toBeTruthy();
    });
  });
});
