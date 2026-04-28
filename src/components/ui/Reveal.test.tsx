import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Reveal from './Reveal';

describe('Reveal', () => {
  it('renders children inside a div by default', () => {
    render(
      <Reveal>
        <span>hello</span>
      </Reveal>,
    );
    expect(screen.getByText('hello').parentElement?.tagName).toBe('DIV');
  });

  it('renders as the chosen element when "as" is provided', () => {
    render(
      <Reveal as="section">
        <span>section-content</span>
      </Reveal>,
    );
    expect(screen.getByText('section-content').parentElement?.tagName).toBe('SECTION');
  });

  it('renders as <li> when as="li"', () => {
    render(
      <ul>
        <Reveal as="li">
          <span>item</span>
        </Reveal>
      </ul>,
    );
    expect(screen.getByText('item').parentElement?.tagName).toBe('LI');
  });

  it('falls back to inView=true in jsdom (no IntersectionObserver) → data-reveal="in"', () => {
    render(
      <Reveal data-testid="reveal">
        <span>hello</span>
      </Reveal>,
    );
    const wrapper = screen.getByTestId('reveal');
    expect(wrapper.getAttribute('data-reveal')).toBe('in');
    expect(wrapper.style.opacity).toBe('1');
  });

  it('disabled=true → opacity:1 with transition:none', () => {
    render(
      <Reveal disabled data-testid="reveal">
        <span>hi</span>
      </Reveal>,
    );
    const wrapper = screen.getByTestId('reveal');
    expect(wrapper.style.opacity).toBe('1');
    expect(wrapper.style.transition).toBe('none');
  });

  it('passes className, style, and id through', () => {
    render(
      <Reveal className="foo-class" style={{ color: 'red' }} id="my-id" data-testid="r">
        <span>hi</span>
      </Reveal>,
    );
    const wrapper = screen.getByTestId('r');
    expect(wrapper.className).toBe('foo-class');
    expect(wrapper.style.color).toBe('red');
    expect(wrapper.id).toBe('my-id');
  });

  it('honors custom delay/duration in the transition string', () => {
    render(
      <Reveal delay={250} duration={700} data-testid="r">
        <span>hi</span>
      </Reveal>,
    );
    const wrapper = screen.getByTestId('r');
    expect(wrapper.style.transition).toContain('700ms');
    expect(wrapper.style.transition).toContain('250ms');
  });
});
