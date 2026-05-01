'use client';

import React from 'react';
import Reveal from '@/components/ui/Reveal';

interface StackLogo {
  name: string;
  /** Path under /public/. */
  src: string;
  /** Final rendered max width — slightly per-logo so each one reads at
   *  optical equivalence rather than mathematical equivalence (the
   *  Salesforce cloud and the Microsoft Dynamics wordmark have very
   *  different aspect ratios). */
  maxHeight?: number;
}

const STACK_LOGOS: StackLogo[] = [
  { name: 'Salesforce', src: '/stack-logos/salesforce.png', maxHeight: 56 },
  { name: 'HubSpot', src: '/stack-logos/hubspot.png', maxHeight: 36 },
  { name: 'Microsoft Dynamics 365', src: '/stack-logos/microsoft-dynamics.png', maxHeight: 44 },
  { name: 'Zendesk', src: '/stack-logos/zendesk.png', maxHeight: 56 },
  { name: 'NetSuite', src: '/stack-logos/netsuite.png', maxHeight: 52 },
];

/**
 * "Plays with your stack" reassurance band — five integration logos
 * (HubSpot, Salesforce, Microsoft Dynamics, NetSuite, Zendesk) on
 * white tiles so the dark-text wordmarks read cleanly against the
 * dark navy section background. Below the logos, a single italic
 * caption keeps the original "even that custom thing IT built in
 * 2014" in-joke that earns the trust point this section is here to
 * make. Industrial buyers' loudest objection is "we are not ripping
 * out our CRM" — this answers it visually.
 */
export default function PlaysWithYourStackStrip() {
  return (
    <section
      className="product-section"
      style={{ backgroundColor: 'var(--od-dark)' }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
        <Reveal>
          <p
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: 'var(--od-gold)',
              margin: '0 0 1rem',
            }}
          >
            Plays With Your Stack
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
              fontWeight: 900,
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: 'var(--od-white)',
              margin: '0 0 1rem',
            }}
          >
            No Rip and Replace. No New Tool for Your Team to Learn.
          </h2>
          <p
            style={{
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'var(--od-text)',
              maxWidth: '640px',
              margin: '0 auto 2.5rem',
            }}
          >
            We work with your existing CRM, ERP, ticketing, and inventory
            systems — and where a clean integration doesn&rsquo;t exist, we
            build the bridge. Industrial supply runs on systems that were never
            meant to talk to each other; Aiden makes them.
          </p>
        </Reveal>

        <ul
          role="list"
          aria-label="Integrations"
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '0.875rem',
          }}
        >
          {STACK_LOGOS.map((logo) => (
            <li
              key={logo.name}
              data-testid="stack-item"
              data-stack-name={logo.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ffffff',
                border: '1px solid var(--od-border)',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                minHeight: '96px',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo.src}
                alt={`${logo.name} logo`}
                loading="lazy"
                decoding="async"
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: `${logo.maxHeight ?? 48}px`,
                  height: 'auto',
                  width: 'auto',
                  objectFit: 'contain',
                }}
              />
            </li>
          ))}
        </ul>

        <p
          data-testid="stack-custom-fallback"
          style={{
            margin: '1.5rem auto 0',
            color: 'var(--od-muted)',
            fontSize: '0.9375rem',
            fontStyle: 'italic',
            lineHeight: 1.55,
            maxWidth: '560px',
          }}
        >
          …plus that custom thing your IT lead built in 2014.{' '}
          <span style={{ color: 'var(--od-gold)', fontStyle: 'normal', fontWeight: 600 }}>
            Yes, even that.
          </span>
        </p>
      </div>
    </section>
  );
}
