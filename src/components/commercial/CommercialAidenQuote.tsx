import React from 'react';
import Reveal from '@/components/ui/Reveal';

export default function CommercialAidenQuote() {
  return (
    <section
      className="product-section"
      style={{ backgroundColor: 'var(--od-navy)' }}
    >
      <Reveal
        data-testid="commercial-aiden-quote"
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <blockquote
          style={{
            margin: '0 0 1rem',
            padding: 0,
            fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
            fontWeight: 700,
            fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
            lineHeight: 1.5,
            color: 'var(--od-white)',
            letterSpacing: '-0.01em',
          }}
        >
          &ldquo;Aiden does not replace the human moment.{' '}
          <span style={{ color: 'var(--od-gold)', fontWeight: 700 }}>
            It sets it up for success.
          </span>{' '}
          When the rep takes over, they are arriving at a conversation that is
          already warmed up, stepping into a deal that&rsquo;s ready to close
          rather than struggling to understand the problem.&rdquo;
        </blockquote>
        <cite
          style={{
            display: 'block',
            fontStyle: 'italic',
            fontSize: '1rem',
            color: 'var(--od-muted)',
          }}
        >
          &mdash; From the Commercial Presales Desk at Olark
        </cite>
      </Reveal>
    </section>
  );
}
