'use client';

import React, { useState } from 'react';
import { PLAN_DATA } from '@/types/quote';

/**
 * Side-by-side Signature vs Bespoke feature compare table. Renders inside
 * the QuoteBuilder result panel after the visitor unlocks pricing — gives
 * them the room to read across before they pick a tier.
 *
 * Layout decision: because Bespoke is "All Signature features included" plus
 * its own additions, showing both columns linearly is the cleanest read.
 * The 19 inherited features from PLAN_DATA.bespoke.inheritedFeatures live
 * behind a "Show what 'All Signature features' covers" toggle so they don't
 * dominate the wall of checks.
 */
export default function CompareSignatureBespoke() {
  const [open, setOpen] = useState(false);
  const [inheritedOpen, setInheritedOpen] = useState(false);

  const sig = PLAN_DATA.signature;
  const bes = PLAN_DATA.bespoke;
  const inherited = bes.inheritedFeatures ?? [];

  return (
    <div data-testid="compare-signature-bespoke" style={{ marginTop: '1.5rem' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="compare-signature-bespoke-panel"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'transparent',
          border: '1px solid var(--od-gold)',
          borderRadius: '999px',
          padding: '0.5rem 1.125rem',
          color: 'var(--od-gold)',
          fontSize: '0.9375rem',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {open ? '↑ Hide comparison' : '↓ Compare Signature vs. Bespoke'}
      </button>

      {open && (
        <div
          id="compare-signature-bespoke-panel"
          data-testid="compare-panel"
          style={{
            marginTop: '1.25rem',
            background: 'var(--od-card)',
            border: '1px solid var(--od-border)',
            borderRadius: '14px',
            overflow: 'hidden',
          }}
        >
          <header
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1px',
              background: 'var(--od-border)',
            }}
          >
            <ColumnHead name={sig.name} tagline={sig.tagline} accent="muted" />
            <ColumnHead name={bes.name} tagline={bes.tagline} accent="gold" />
          </header>

          <div
            role="list"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1px',
              background: 'var(--od-border)',
            }}
          >
            <FeatureColumn role="list" features={sig.features} />
            <FeatureColumn role="list" features={bes.features} highlight />
          </div>

          {inherited.length > 0 && (
            <div
              style={{
                padding: '1.25rem 1.5rem',
                background: 'var(--od-card)',
                borderTop: '1px solid var(--od-border)',
              }}
            >
              <button
                type="button"
                onClick={() => setInheritedOpen((v) => !v)}
                aria-expanded={inheritedOpen}
                aria-controls="inherited-features-panel"
                style={{
                  background: 'transparent',
                  border: 0,
                  color: 'var(--od-gold)',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: 'inherit',
                }}
              >
                {inheritedOpen
                  ? `↑ Hide the ${inherited.length} features inherited via "All Signature features included"`
                  : `↓ Show the ${inherited.length} features inherited via "All Signature features included"`}
              </button>
              {inheritedOpen && (
                <ul
                  id="inherited-features-panel"
                  data-testid="inherited-features-panel"
                  style={{
                    listStyle: 'none',
                    margin: '1rem 0 0',
                    padding: 0,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '0.5rem 1rem',
                  }}
                >
                  {inherited.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'flex-start',
                        color: 'var(--od-text)',
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          color: 'var(--od-muted)',
                          fontWeight: 700,
                          flexShrink: 0,
                          marginTop: '0.0625rem',
                        }}
                      >
                        ✓
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ColumnHead({
  name,
  tagline,
  accent,
}: {
  name: string;
  tagline: string;
  accent: 'muted' | 'gold';
}) {
  return (
    <div
      style={{
        background: 'var(--od-card)',
        padding: '1.25rem 1.25rem 1rem',
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
          fontWeight: 800,
          fontSize: '1.125rem',
          color:
            accent === 'gold' ? 'var(--od-gold)' : 'var(--od-white)',
          margin: '0 0 0.375rem',
          letterSpacing: '-0.01em',
        }}
      >
        {name}
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: '0.8125rem',
          lineHeight: 1.45,
          color: 'var(--od-muted)',
          fontStyle: 'italic',
        }}
      >
        {tagline}
      </p>
    </div>
  );
}

function FeatureColumn({
  features,
  highlight,
}: {
  features: readonly string[];
  highlight?: boolean;
  role?: string;
}) {
  return (
    <ul
      role="list"
      style={{
        listStyle: 'none',
        margin: 0,
        padding: '1rem 1.25rem 1.25rem',
        background: 'var(--od-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      {features.map((f) => (
        <li
          key={f}
          style={{
            display: 'flex',
            gap: '0.625rem',
            alignItems: 'flex-start',
            color: 'var(--od-text)',
            fontSize: '0.9375rem',
            lineHeight: 1.5,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              color: highlight ? 'var(--od-gold)' : 'var(--od-text)',
              fontWeight: 700,
              flexShrink: 0,
              marginTop: '0.0625rem',
            }}
          >
            ✓
          </span>
          <span>{f}</span>
        </li>
      ))}
    </ul>
  );
}
