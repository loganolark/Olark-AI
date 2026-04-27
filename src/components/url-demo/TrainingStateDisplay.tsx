'use client';

import React, { useEffect, useState } from 'react';

const INTERVAL_MS = 12_000;

function getTrainingLines(url: string): string[] {
  return [
    `Scanning ${url}...`,
    'Found your pricing page, 3 product features, and 2 customer stories',
    'Building product knowledge tree...',
    'Preparing responses for common sales objections...',
    '✓ Aiden is ready.',
  ];
}

export default function TrainingStateDisplay({
  url,
  onComplete,
}: {
  url: string;
  onComplete: () => void;
}) {
  const lines = getTrainingLines(url);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [visibleCount, setVisibleCount] = useState(prefersReduced ? lines.length : 1);
  const [activeIndex, setActiveIndex] = useState(prefersReduced ? -1 : 0);

  useEffect(() => {
    if (prefersReduced) {
      onComplete();
      return;
    }

    let current = 1;

    const timer = setInterval(() => {
      current += 1;
      setVisibleCount(current);
      setActiveIndex(current - 1);
      if (current >= lines.length) {
        clearInterval(timer);
        onComplete();
      }
    }, INTERVAL_MS);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .training-shimmer {
          background: linear-gradient(90deg, var(--od-muted) 25%, var(--od-white) 50%, var(--od-muted) 75%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 1.5s linear infinite;
        }
      `}</style>
      <div
        role="log"
        aria-live="polite"
        aria-label="Aiden training progress"
        style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}
      >
        {lines.map((line, i) => (
          <p
            key={i}
            className={i === activeIndex && !prefersReduced ? 'training-shimmer' : undefined}
            style={{
              margin: 0,
              color: 'var(--od-text)',
              fontSize: '0.9375rem',
              lineHeight: 1.6,
              opacity: i < visibleCount ? 1 : 0,
              transition: prefersReduced ? 'none' : 'opacity 300ms ease-in',
            }}
          >
            {line}
          </p>
        ))}
      </div>
    </>
  );
}
