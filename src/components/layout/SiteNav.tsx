'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { smoothScrollToHash } from '@/lib/scroll-to-hash';

const NAV_LINKS = [
  { href: '/commercial', label: 'Product' },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // ─── Sliding underline state ──────────────────────────────────────────────
  const navListRef = useRef<HTMLDivElement>(null);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [underline, setUnderline] = useState<{
    left: number;
    width: number;
    visible: boolean;
  }>({ left: 0, width: 0, visible: false });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY >= 64);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      closeButtonRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        hamburgerRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab') return;
      const overlay = overlayRef.current;
      if (!overlay) return;
      const focusable = Array.from(
        overlay.querySelectorAll<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])'),
      ).filter((el) => !el.hasAttribute('disabled'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  // Sliding underline target: hovered link wins, fall back to active page.
  const targetHref =
    hoveredHref ??
    NAV_LINKS.find((l) => isActive(l.href))?.href ??
    null;

  // Reposition the underline when target / pathname / viewport changes.
  useEffect(() => {
    function reposition() {
      const list = navListRef.current;
      if (!list) return;
      if (!targetHref) {
        setUnderline((u) => ({ ...u, visible: false }));
        return;
      }
      const link = list.querySelector<HTMLElement>(
        `a[data-nav-href="${targetHref}"]`,
      );
      if (!link) {
        setUnderline((u) => ({ ...u, visible: false }));
        return;
      }
      setUnderline({
        left: link.offsetLeft,
        width: link.offsetWidth,
        visible: true,
      });
    }
    reposition();
    window.addEventListener('resize', reposition);
    return () => window.removeEventListener('resize', reposition);
  }, [targetHref, pathname]);

  // Story 8.2: product-page-only "Get a Quote" CTA — scrolls to #quote-section
  // (the QuoteSection wrapper sets that anchor on the product page).
  const isProductPage = pathname === '/commercial';

  return (
    <header>
      <nav
        aria-label="Main navigation"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          transition: 'background-color 300ms, backdrop-filter 300ms',
          backgroundColor: scrolled ? 'rgba(39, 45, 63,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 1.5rem',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            href="/"
            aria-label="Aiden by Olark — home"
            className="site-nav-brand"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              textDecoration: 'none',
              lineHeight: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/aiden-logo-360.png"
              alt="Aiden by Olark"
              width={140}
              height={71}
              style={{ display: 'block', height: 36, width: 'auto' }}
            />
          </Link>

          <div
            ref={navListRef}
            className="hidden md:flex site-nav-list"
            onMouseLeave={() => setHoveredHref(null)}
            style={{
              alignItems: 'center',
              gap: '2rem',
              position: 'relative',
              padding: '0.625rem 0',
            }}
          >
            {NAV_LINKS.map(({ href, label }) => {
              const active = isActive(href);
              const hovered = hoveredHref === href;
              return (
                <Link
                  key={href}
                  href={href}
                  data-nav-href={href}
                  aria-current={active ? 'page' : undefined}
                  onMouseEnter={() => setHoveredHref(href)}
                  onFocus={() => setHoveredHref(href)}
                  onBlur={() => setHoveredHref(null)}
                  className="site-nav-link"
                  style={{
                    color: active || hovered ? 'var(--od-gold)' : 'var(--od-text)',
                    textDecoration: 'none',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    padding: '0.25rem 0',
                    transition: 'color 200ms ease',
                  }}
                >
                  {label}
                </Link>
              );
            })}
            <span
              aria-hidden="true"
              data-testid="site-nav-underline"
              style={{
                position: 'absolute',
                bottom: 0,
                left: underline.left,
                width: underline.width,
                height: '2px',
                backgroundColor: 'var(--od-gold)',
                borderRadius: '2px',
                opacity: underline.visible ? 1 : 0,
                transition:
                  'left 280ms cubic-bezier(0.4, 0, 0.2, 1), width 280ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease',
                pointerEvents: 'none',
                boxShadow: '0 0 12px rgba(250, 201, 23,0.55)',
              }}
            />
          </div>

          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '0.875rem' }}>
            {isProductPage && (
              <a
                href="#quote-section"
                data-testid="nav-get-a-quote"
                onClick={(e) => {
                  // Re-clicks of the same hash are a no-op in the browser
                  // when the URL hash already matches — explicit scroll
                  // makes the second click work the same as the first.
                  if (smoothScrollToHash('#quote-section')) {
                    e.preventDefault();
                  }
                }}
                className="site-nav-cta-secondary"
                style={{
                  color: 'var(--od-gold)',
                  fontWeight: 600,
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.9375rem',
                  textDecoration: 'none',
                  border: '1px solid var(--od-gold)',
                  background: 'transparent',
                }}
              >
                Get a Quote
              </a>
            )}
            <Link
              href="/get-started"
              className="site-nav-cta-primary"
              style={{
                backgroundColor: 'var(--od-gold)',
                color: 'var(--od-dark)',
                fontWeight: 700,
                padding: '0.5rem 1.25rem',
                borderRadius: '6px',
                fontSize: '0.9375rem',
                textDecoration: 'none',
                boxShadow: '0 0 20px rgba(250, 201, 23,0.35)',
              }}
            >
              Talk to Us →
            </Link>
          </div>

          <button
            ref={hamburgerRef}
            className="md:hidden site-nav-hamburger"
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--od-text)',
              cursor: 'pointer',
              padding: '0.5rem',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
              <rect y="5" width="24" height="2" rx="1" fill="currentColor" />
              <rect y="11" width="24" height="2" rx="1" fill="currentColor" />
              <rect y="17" width="24" height="2" rx="1" fill="currentColor" />
            </svg>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div
          ref={overlayRef}
          id="mobile-nav"
          role="dialog"
          aria-label="Navigation menu"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--od-dark)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem 1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              height: '64px',
            }}
          >
            <span
              style={{
                color: 'var(--od-white)',
                fontFamily: 'var(--font-poppins)',
                fontWeight: 700,
                fontSize: '1.25rem',
              }}
            >
              Aiden
            </span>
            <button
              ref={closeButtonRef}
              aria-label="Close navigation"
              className="site-nav-mobile-close"
              onClick={() => {
                setMobileOpen(false);
                hamburgerRef.current?.focus();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--od-text)',
                cursor: 'pointer',
                fontSize: '1.5rem',
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>
          </div>

          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? 'page' : undefined}
              onClick={() => setMobileOpen(false)}
              className="site-nav-mobile-link"
              style={{
                color: isActive(href) ? 'var(--od-gold)' : 'var(--od-white)',
                textDecoration: 'none',
                fontSize: '1.5rem',
                fontWeight: 600,
                minHeight: '64px',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '1rem',
                borderLeft: isActive(href)
                  ? '3px solid var(--od-gold)'
                  : '3px solid transparent',
              }}
            >
              {label}
            </Link>
          ))}

          <Link
            href="/get-started"
            onClick={() => setMobileOpen(false)}
            className="site-nav-cta-primary"
            style={{
              backgroundColor: 'var(--od-gold)',
              color: 'var(--od-dark)',
              textDecoration: 'none',
              fontSize: '1.125rem',
              fontWeight: 700,
              padding: '1rem 1.5rem',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '2rem',
              minHeight: '64px',
            }}
          >
            Talk to Us →
          </Link>
        </div>
      )}
    </header>
  );
}
