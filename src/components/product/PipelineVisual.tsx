'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useInView } from '@/lib/hooks/use-in-view';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

type StageDot = 'green' | 'gold' | 'pink' | 'muted';

interface PipelineStage {
  name: string;
  count: number;
  bar: number;
  dot: StageDot;
  active?: boolean;
}

const STAGES: PipelineStage[] = [
  { name: 'Aiden Qualified', count: 88, bar: 88, dot: 'green' },
  { name: 'Passed to Sales', count: 61, bar: 61, dot: 'gold', active: true },
  { name: 'Active Conversations', count: 34, bar: 34, dot: 'pink' },
  { name: 'Closed / Won', count: 19, bar: 19, dot: 'muted' },
];

const DOT_COLORS: Record<StageDot, string> = {
  green: '#6FC284',
  gold: 'var(--od-gold)',
  pink: 'var(--od-pink)',
  muted: 'var(--od-muted)',
};

const COUNT_DURATION_MS = 1100;

export default function PipelineVisual() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref);
  const reducedMotion = useReducedMotion();
  const [animatedCounts, setAnimatedCounts] = useState<number[]>(() => STAGES.map(() => 0));
  const [animatedCalloutVisible, setAnimatedCalloutVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!inView || reducedMotion) return undefined;

    const startedAt = performance.now();
    let raf = 0;
    function tick(now: number) {
      const elapsed = now - startedAt;
      const ratio = Math.min(1, elapsed / COUNT_DURATION_MS);
      setAnimatedCounts(STAGES.map((s) => Math.round(s.count * ratio)));
      if (ratio < 1) {
        raf = requestAnimationFrame(tick);
      }
    }
    raf = requestAnimationFrame(tick);

    const calloutTimer = window.setTimeout(
      () => setAnimatedCalloutVisible(true),
      COUNT_DURATION_MS + 350,
    );

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(calloutTimer);
    };
  }, [inView, reducedMotion]);

  const counts = reducedMotion ? STAGES.map((s) => s.count) : animatedCounts;
  const showCallout = reducedMotion || animatedCalloutVisible;

  return (
    <div
      ref={ref}
      data-testid="pipeline-visual"
      data-in-view={inView ? 'true' : 'false'}
      style={{
        background: 'rgba(39, 45, 63,0.4)',
        border: '1px solid var(--od-border)',
        borderRadius: '14px',
        padding: '1.5rem',
        minHeight: '320px',
      }}
    >
      <div
        style={{
          fontSize: '0.6875rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontWeight: 600,
          color: 'var(--od-pink)',
          marginBottom: '1rem',
        }}
      >
        Live Pipeline — Today
      </div>
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.875rem',
        }}
      >
        {STAGES.map((stage, i) => {
          const targetWidth = inView || reducedMotion ? `${stage.bar}%` : '0%';
          return (
            <li
              key={stage.name}
              data-stage-name={stage.name}
              data-active={stage.active ? 'true' : undefined}
              style={{
                position: 'relative',
                background: stage.active
                  ? 'rgba(250, 201, 23,0.08)'
                  : 'transparent',
                border: stage.active
                  ? '1px solid rgba(250, 201, 23,0.35)'
                  : '1px solid transparent',
                borderRadius: '10px',
                padding: '0.625rem 0.75rem',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 0,
                  bottom: 0,
                  height: '4px',
                  width: targetWidth,
                  background: DOT_COLORS[stage.dot],
                  borderRadius: '0 0 10px 10px',
                  opacity: 0.55,
                  transition: reducedMotion
                    ? 'none'
                    : `width 1.1s cubic-bezier(0.16,1,0.3,1) ${i * 130}ms`,
                }}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: '10px',
                    height: '10px',
                    flex: '0 0 10px',
                    borderRadius: '50%',
                    background: DOT_COLORS[stage.dot],
                    boxShadow: stage.active
                      ? '0 0 12px rgba(250, 201, 23,0.6)'
                      : undefined,
                  }}
                />
                <span
                  style={{
                    flex: 1,
                    color: 'var(--od-text)',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                  }}
                >
                  {stage.name}
                </span>
                <span
                  data-testid={`pipeline-count-${i}`}
                  style={{
                    color: 'var(--od-white)',
                    fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {counts[i] ?? 0} leads
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      <div
        data-testid="pipeline-callout"
        aria-hidden={showCallout ? undefined : 'true'}
        style={{
          marginTop: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--od-pink)',
          fontSize: '0.875rem',
          fontWeight: 500,
          opacity: showCallout ? 1 : 0,
          transition: reducedMotion ? 'none' : 'opacity 400ms ease',
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 13 13"
          fill="none"
          aria-hidden="true"
          style={{ stroke: 'var(--od-pink)', strokeWidth: 2, flexShrink: 0 }}
        >
          <path d="M2 6.5h9M7.5 2.5l4 4-4 4" />
        </svg>
        3 hot prospects waiting for rep assignment
      </div>
    </div>
  );
}
