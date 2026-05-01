'use client';

import React from 'react';
import Reveal from '@/components/ui/Reveal';

const STACK_ITEMS: { label: string; sub?: string }[] = [
  { label: 'Salesforce' },
  { label: 'HubSpot' },
  { label: 'Microsoft Dynamics' },
  { label: 'Zendesk' },
  { label: 'NetSuite' },
  { label: 'That custom thing your IT lead built in 2014', sub: 'yes, even that' },
];

/**
 * "Plays with your stack" reassurance band — no logos yet (we'll swap in real
 * SVGs when the design partner sends them); the wordmarks read fine on their
 * own and the in-joke last item ("the custom thing IT built in 2014") earns
 * the trust point this section is here to make. Industrial buyers' single
 * loudest objection is "we are not ripping out our CRM."
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {STACK_ITEMS.map((item) => (
            <li
              key={item.label}
              data-testid="stack-item"
              style={{
                background: 'var(--od-card)',
                border: '1px solid var(--od-border)',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                color: 'var(--od-white)',
                fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
                fontWeight: 700,
                fontSize: '1rem',
                letterSpacing: '-0.01em',
                lineHeight: 1.3,
              }}
            >
              {item.label}
              {item.sub && (
                <span
                  style={{
                    display: 'block',
                    color: 'var(--od-muted)',
                    fontFamily: 'var(--font-dm-sans), ui-sans-serif, sans-serif',
                    fontWeight: 400,
                    fontStyle: 'italic',
                    fontSize: '0.8125rem',
                    marginTop: '0.25rem',
                  }}
                >
                  {item.sub}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
