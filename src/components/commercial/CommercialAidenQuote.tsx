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
          &ldquo;17 years building live chat taught us one thing: the human
          conversation still closes the deal.{' '}
          <span style={{ color: 'var(--od-gold)', fontWeight: 700 }}>
            AI just makes it sharper.
          </span>{' '}
          Aiden scans your catalog continuously — products, specs, services,
          the works — answering the repetitive questions instantly, then
          routing the buyer the moment it&rsquo;s worth a human&rsquo;s
          time. Your reps get warmer leads. Your buyers get answers
          immediately. Everyone wins.&rdquo;
        </blockquote>
        <cite
          style={{
            display: 'block',
            fontStyle: 'italic',
            fontSize: '1rem',
            color: 'var(--od-muted)',
          }}
        >
          &mdash; The Aiden by Olark team
        </cite>
      </Reveal>
    </section>
  );
}
