import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePathname } from 'next/navigation';
import { ConsentProvider } from '@/lib/consent';
import SiteNav from './SiteNav';

const renderNav = () =>
  render(
    <ConsentProvider>
      <SiteNav />
    </ConsentProvider>
  );

describe('SiteNav', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue('/');
    document.cookie = 'olark_consent=; Max-Age=0; Path=/';
  });

  it('renders all three nav links and the CTA', () => {
    renderNav();
    expect(screen.getByRole('link', { name: /essentials/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /lead-gen/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /commercial/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /talk to us/i })).toBeInTheDocument();
  });

  it('sets aria-current="page" on the active nav link', () => {
    vi.mocked(usePathname).mockReturnValue('/commercial');
    renderNav();
    const commercialLink = screen.getAllByRole('link', { name: /commercial/i })[0];
    expect(commercialLink).toHaveAttribute('aria-current', 'page');
  });

  it('does not set aria-current on inactive links', () => {
    vi.mocked(usePathname).mockReturnValue('/commercial');
    renderNav();
    const essentialsLink = screen.getAllByRole('link', { name: /essentials/i })[0];
    expect(essentialsLink).not.toHaveAttribute('aria-current');
  });

  it('opens mobile overlay on hamburger click and moves focus to close button', async () => {
    renderNav();
    const hamburger = screen.getByRole('button', { name: /open navigation/i });
    expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    await act(async () => {
      fireEvent.click(hamburger);
    });
    expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('dialog', { name: /navigation menu/i })).toBeInTheDocument();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /close navigation/i }));
  });

  it('closes mobile overlay on close button click and returns focus to hamburger', async () => {
    renderNav();
    const hamburger = screen.getByRole('button', { name: /open navigation/i });
    await act(async () => { fireEvent.click(hamburger); });
    const closeBtn = screen.getByRole('button', { name: /close navigation/i });
    await act(async () => { fireEvent.click(closeBtn); });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(hamburger);
  });

  it('closes mobile overlay on Escape key and returns focus to hamburger', async () => {
    renderNav();
    const hamburger = screen.getByRole('button', { name: /open navigation/i });
    await act(async () => { fireEvent.click(hamburger); });
    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(hamburger);
  });

  it('nav has aria-label="Main navigation"', () => {
    renderNav();
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
  });
});

describe('SiteNav — sliding underline + hover affordances', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue('/');
    document.cookie = 'olark_consent=; Max-Age=0; Path=/';
  });

  it('renders the sliding-underline element next to the desktop link list', () => {
    renderNav();
    expect(screen.getByTestId('site-nav-underline')).toBeInTheDocument();
  });

  it('each desktop nav link carries data-nav-href so the underline can target it', () => {
    renderNav();
    expect(
      screen.getAllByRole('link', { name: /essentials/i })[0],
    ).toHaveAttribute('data-nav-href', '/essentials');
    expect(
      screen.getAllByRole('link', { name: /lead-gen/i })[0],
    ).toHaveAttribute('data-nav-href', '/lead-gen');
    expect(
      screen.getAllByRole('link', { name: /commercial/i })[0],
    ).toHaveAttribute('data-nav-href', '/commercial');
  });

  it('Talk to Us CTA carries the primary-CTA hover-animation class', () => {
    renderNav();
    expect(screen.getByRole('link', { name: /Talk to Us/i })).toHaveClass(
      'site-nav-cta-primary',
    );
  });

  it('Get a Quote CTA carries the secondary-CTA hover-animation class on product pages', () => {
    vi.mocked(usePathname).mockReturnValue('/essentials');
    renderNav();
    expect(screen.getByTestId('nav-get-a-quote')).toHaveClass('site-nav-cta-secondary');
  });

  it('Aiden brand link carries the brand hover-animation class', () => {
    renderNav();
    expect(screen.getByRole('link', { name: /Aiden by Olark/i })).toHaveClass(
      'site-nav-brand',
    );
  });
});

// ─── Story 8.2: product-page-only "Get a Quote" CTA ───────────────────────

describe('SiteNav — "Get a Quote" CTA visibility (Story 8.2)', () => {
  beforeEach(() => {
    document.cookie = 'olark_consent=; Max-Age=0; Path=/';
  });

  it('renders the CTA when on /essentials, linking to #quote-section', () => {
    vi.mocked(usePathname).mockReturnValue('/essentials');
    renderNav();
    const cta = screen.getByTestId('nav-get-a-quote');
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '#quote-section');
  });

  it('renders the CTA when on /lead-gen', () => {
    vi.mocked(usePathname).mockReturnValue('/lead-gen');
    renderNav();
    expect(screen.getByTestId('nav-get-a-quote')).toBeInTheDocument();
  });

  it('renders the CTA when on /commercial', () => {
    vi.mocked(usePathname).mockReturnValue('/commercial');
    renderNav();
    expect(screen.getByTestId('nav-get-a-quote')).toBeInTheDocument();
  });

  it('does NOT render the CTA on /', () => {
    vi.mocked(usePathname).mockReturnValue('/');
    renderNav();
    expect(screen.queryByTestId('nav-get-a-quote')).not.toBeInTheDocument();
  });

  it('does NOT render the CTA on /get-started', () => {
    vi.mocked(usePathname).mockReturnValue('/get-started');
    renderNav();
    expect(screen.queryByTestId('nav-get-a-quote')).not.toBeInTheDocument();
  });

  it('always renders the primary "Talk to Us" CTA alongside Get a Quote', () => {
    vi.mocked(usePathname).mockReturnValue('/essentials');
    renderNav();
    expect(screen.getByRole('link', { name: /Talk to Us/i })).toBeInTheDocument();
    expect(screen.getByTestId('nav-get-a-quote')).toBeInTheDocument();
  });
});
