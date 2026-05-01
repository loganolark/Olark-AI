import React from 'react';
import Reveal from '@/components/ui/Reveal';

/**
 * "We enhance the human moment" centerpiece — the philosophical close
 * before the conversion section. Modelled on the brief mockup
 * (PDF p. 4 / HTML's "What we built instead" callout).
 *
 * Single hero quote, gold-framed, navy box. Carries the brand's most
 * load-bearing line: AI does not replace the human, it sets up the moment
 * that closes the deal.
 */
export default function EnhanceTheHumanMomentBlock() {
  return (
    <section
      style={{
        backgroundColor: 'var(--od-dark)',
        padding: '5rem 1.5rem',
      }}
    >
      <Reveal
        data-testid="enhance-human-moment"
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          background: 'var(--od-navy)',
          border: '1px solid var(--od-border)',
          borderRadius: '20px',
          padding: '3.5rem 2.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative gold + green orbs from the brief mockup */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-32px',
            left: '-32px',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(111, 194, 132, 0.45), transparent 70%)',
          }}
        />
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '-24px',
            right: '-24px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(250, 201, 23, 0.5), transparent 70%)',
          }}
        />

        <p
          style={{
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: 'var(--od-gold)',
            margin: '0 0 1.25rem',
          }}
        >
          — What we built instead
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
            fontWeight: 900,
            fontSize: 'clamp(1.5rem, 3.5vw, 2.125rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
            color: 'var(--od-white)',
            margin: '0 0 1.5rem',
          }}
        >
          We Enhance the Human Moment.
          <br />
          We Don&rsquo;t Replace It.
        </h2>
        <p
          style={{
            fontSize: '1rem',
            lineHeight: 1.7,
            color: 'var(--od-text)',
            margin: 0,
            maxWidth: '560px',
            marginInline: 'auto',
          }}
        >
          17 years building live chat taught us one thing: human conversation
          still closes the deal. AI just makes it sharper. Aiden scans your
          site continuously — products, specs, services, the works —
          answering the repetitive questions instantly, then routing the
          buyer to your team the moment it&rsquo;s worth a human&rsquo;s
          time. Your reps get warmer leads. Your buyers get answers
          immediately. Everyone wins.
        </p>
      </Reveal>
    </section>
  );
}
