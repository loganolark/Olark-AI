import React from 'react';

type PillBadgeVariant = 'gold' | 'pink' | 'muted';

export interface PillBadgeProps {
  variant?: PillBadgeVariant;
  /** When true, renders a small pulsing dot before children */
  pulse?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<PillBadgeVariant, React.CSSProperties> = {
  gold: {
    backgroundColor: 'rgba(250, 201, 23,0.15)',
    border: '1px solid rgba(250, 201, 23,0.3)',
    color: 'var(--od-gold)',
  },
  pink: {
    backgroundColor: 'rgba(239, 78, 115,0.15)',
    border: '1px solid rgba(239, 78, 115,0.3)',
    color: 'var(--od-pink)',
  },
  muted: {
    backgroundColor: 'rgba(160,157,216,0.12)',
    border: '1px solid rgba(160,157,216,0.25)',
    color: 'var(--od-muted)',
  },
};

const dotColors: Record<PillBadgeVariant, string> = {
  gold: 'var(--od-gold)',
  pink: 'var(--od-pink)',
  muted: 'var(--od-muted)',
};

export default function PillBadge({
  variant = 'gold',
  pulse = false,
  children,
  className,
}: PillBadgeProps) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        borderRadius: '100px',
        padding: '0.25rem 0.75rem',
        fontSize: '0.8125rem',
        fontWeight: 500,
        lineHeight: 1.4,
        letterSpacing: '0.01em',
        ...variantStyles[variant],
      }}
    >
      {pulse && (
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: dotColors[variant],
            flexShrink: 0,
            animation: 'pulse-dot 2s ease-in-out infinite',
          }}
        />
      )}
      {children}
    </span>
  );
}
