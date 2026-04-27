'use client';

import React from 'react';
import Link from 'next/link';

type CTAButtonSize = 'sm' | 'md' | 'lg';
type CTAButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface CTAButtonProps {
  /** Visual treatment: primary (gold), secondary (outlined), ghost (text-only) */
  variant?: CTAButtonVariant;
  /** Height tier: sm=36px, md=44px (default, WCAG minimum), lg=52px */
  size?: CTAButtonSize;
  /** When true: aria-disabled="true" + opacity:0.4 — button stays focusable */
  disabled?: boolean;
  /** When true: spinner replaces label; click events suppressed */
  loading?: boolean;
  /** If provided, renders as <a> via next/link instead of <button> */
  href?: string;
  /** Passed through to the underlying element */
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  children: React.ReactNode;
  /** Additional className — merged with generated classes */
  className?: string;
  /** Forwarded to the underlying element (e.g. type="submit") */
  type?: 'button' | 'submit' | 'reset';
  /** aria-label override for icon-only buttons */
  'aria-label'?: string;
}

const heightMap: Record<CTAButtonSize, string> = {
  sm: '36px',
  md: '44px',
  lg: '52px',
};

const paddingMap: Record<CTAButtonSize, string> = {
  sm: '0 0.875rem',
  md: '0 1.25rem',
  lg: '0 1.5rem',
};

const fontSizeMap: Record<CTAButtonSize, string> = {
  sm: '0.875rem',
  md: '0.9375rem',
  lg: '1rem',
};

function getVariantStyles(variant: CTAButtonVariant): React.CSSProperties {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: 'var(--od-gold)',
        color: 'var(--od-dark)',
        border: 'none',
        boxShadow: '0 0 40px rgba(245,194,0,0.35), 0 4px 16px rgba(0,0,0,0.4)',
      };
    case 'secondary':
      return {
        backgroundColor: 'transparent',
        color: 'var(--od-white)',
        border: '1.5px solid var(--od-white)',
        boxShadow: 'none',
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        color: 'var(--od-muted)',
        border: 'none',
        boxShadow: 'none',
      };
  }
}

/** Inline CSS spinner — no external library */
function Spinner({ size }: { size: CTAButtonSize }) {
  const dim = size === 'lg' ? '20px' : size === 'md' ? '18px' : '14px';
  return (
    <span
      role="status"
      aria-label="Loading"
      style={{
        display: 'inline-block',
        width: dim,
        height: dim,
        border: '2px solid currentColor',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  );
}

export default function CTAButton({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  href,
  onClick,
  children,
  className,
  type = 'button',
  'aria-label': ariaLabel,
}: CTAButtonProps) {
  const isInert = disabled || loading;

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    height: heightMap[size],
    padding: paddingMap[size],
    fontSize: fontSizeMap[size],
    fontWeight: 700,
    fontFamily: 'var(--font-poppins), ui-sans-serif, sans-serif',
    borderRadius: '8px',
    cursor: isInert ? 'not-allowed' : 'pointer',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    transition: 'transform 150ms ease-out, box-shadow 150ms ease-out, opacity 150ms ease-out',
    opacity: disabled ? 0.4 : 1,
    ...getVariantStyles(variant),
  };

  const handleClick: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> = (e) => {
    if (isInert) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const sharedProps = {
    style: baseStyles,
    onClick: handleClick,
    'aria-disabled': disabled || loading ? ('true' as const) : undefined,
    'aria-label': ariaLabel,
    'aria-busy': loading ? ('true' as const) : undefined,
    className,
    'data-ctabtn-variant': variant,
  };

  const content = loading ? <Spinner size={size} /> : children;

  if (href && !isInert) {
    return (
      <Link href={href} {...sharedProps}>
        {content}
      </Link>
    );
  }

  return (
    <button {...sharedProps} type={type}>
      {content}
    </button>
  );
}
