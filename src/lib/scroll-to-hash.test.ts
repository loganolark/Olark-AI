import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { smoothScrollToHash } from './scroll-to-hash';

describe('smoothScrollToHash', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // jsdom doesn't implement scrollIntoView; stub a spyable one on the
    // prototype so every newly-created element inherits it.
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false when href is not a hash anchor', () => {
    expect(smoothScrollToHash('/page')).toBe(false);
    expect(smoothScrollToHash('https://example.com')).toBe(false);
    expect(smoothScrollToHash('')).toBe(false);
    expect(smoothScrollToHash('#')).toBe(false);
  });

  it('returns false when no element matches the id', () => {
    expect(smoothScrollToHash('#does-not-exist')).toBe(false);
  });

  it('calls scrollIntoView on the matching element with smooth+start', () => {
    const target = document.createElement('section');
    target.id = 'quote-section';
    document.body.appendChild(target);
    const spy = vi.fn();
    target.scrollIntoView = spy;

    expect(smoothScrollToHash('#quote-section')).toBe(true);
    expect(spy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('updates window.history.replaceState with the hash', () => {
    const target = document.createElement('div');
    target.id = 'demo';
    document.body.appendChild(target);
    const replaceSpy = vi.spyOn(window.history, 'replaceState');

    expect(smoothScrollToHash('#demo')).toBe(true);
    expect(replaceSpy).toHaveBeenCalledWith(null, '', '#demo');
  });

  it('decodes percent-encoded ids', () => {
    const target = document.createElement('div');
    target.id = 'with space';
    document.body.appendChild(target);
    const spy = vi.fn();
    target.scrollIntoView = spy;

    expect(smoothScrollToHash('#with%20space')).toBe(true);
    expect(spy).toHaveBeenCalled();
  });

  it('returns true even when scrollIntoView is missing on the element (graceful)', () => {
    const target = document.createElement('div');
    target.id = 'foo';
    document.body.appendChild(target);
    // Replace scrollIntoView with a non-function to simulate missing support.
    Object.defineProperty(target, 'scrollIntoView', {
      value: undefined,
      configurable: true,
    });
    expect(smoothScrollToHash('#foo')).toBe(true);
  });
});
