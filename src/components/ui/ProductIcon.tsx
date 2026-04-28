import React from 'react';

export type ProductIconName =
  // Commercial set
  | 'clock'
  | 'shuffle'
  | 'inbox-x'
  | 'map'
  | 'trophy'
  | 'gear'
  // Essentials set
  | 'bot'
  | 'bolt'
  | 'document'
  | 'brain'
  | 'chat'
  | 'globe'
  | 'unlock'
  | 'chart';

export interface ProductIconProps {
  name: ProductIconName;
  size?: number;
  color?: string;
  className?: string;
  'aria-label'?: string;
}

const PATHS: Record<ProductIconName, React.ReactNode> = {
  clock: (
    <>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 5.5V10l3 2" />
    </>
  ),
  shuffle: (
    <>
      <path d="M14 4.5l2.5 2.5L14 9.5" />
      <path d="M14 15.5l2.5-2.5L14 10.5" />
      <path d="M3.5 7h2.7c1 0 1.9.5 2.5 1.4l2.6 3.7c.6.9 1.5 1.4 2.5 1.4h2.7" />
      <path d="M3.5 13h2.7c1 0 1.9-.5 2.5-1.4l.4-.6" />
      <path d="M11.4 8l.4-.6c.6-.9 1.5-1.4 2.5-1.4h2.7" />
    </>
  ),
  'inbox-x': (
    <>
      <path d="M2.5 13.5V14a2 2 0 002 2h11a2 2 0 002-2v-.5" />
      <path d="M2.5 13.5l1.6-7.2A2 2 0 016 4.7h8a2 2 0 011.9 1.6l1.6 7.2" />
      <path d="M2.5 13.5h4l1 2h5l1-2h4" />
      <path d="M8 8.5l4 4M12 8.5l-4 4" />
    </>
  ),
  map: (
    <>
      <path d="M2.5 5.5L7 4l6 2 4.5-1.5v10L13 16l-6-2L2.5 15.5z" />
      <path d="M7 4v10" />
      <path d="M13 6v10" />
    </>
  ),
  trophy: (
    <>
      <path d="M5 3.5h10v3.5a5 5 0 01-10 0z" />
      <path d="M5 5H3v1.5a3 3 0 003 3" />
      <path d="M15 5h2v1.5a3 3 0 01-3 3" />
      <path d="M10 12.5v3" />
      <path d="M7 16.5h6" />
    </>
  ),
  gear: (
    <>
      <circle cx="10" cy="10" r="2.5" />
      <path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4" />
    </>
  ),
  bot: (
    <>
      <rect x="4.5" y="6.5" width="11" height="9" rx="2" />
      <path d="M10 3.5v3" />
      <circle cx="10" cy="3" r="0.5" />
      <path d="M8 10.5v1.5M12 10.5v1.5" />
      <path d="M8 13.5h4" />
    </>
  ),
  bolt: (
    <>
      <path d="M11 2.5L4 11h5l-1 6.5 7-9h-5z" />
    </>
  ),
  document: (
    <>
      <path d="M5 2.5h6l4 4V17a1 1 0 01-1 1H5a1 1 0 01-1-1V3.5a1 1 0 011-1z" />
      <path d="M11 2.5v4h4" />
      <path d="M7 10.5h6M7 13.5h4" />
    </>
  ),
  brain: (
    <>
      <path d="M10 4.5C7 4.5 5 6.5 5 9s2 4.5 5 4.5" />
      <path d="M10 4.5c3 0 5 2 5 4.5s-2 4.5-5 4.5" />
      <path d="M7 7.5h2M7 10.5h2M11 7.5h2M11 10.5h2" />
      <path d="M10 13.5v3M8 16.5h4" />
    </>
  ),
  chat: (
    <>
      <path d="M3.5 5.5h13a1 1 0 011 1v7a1 1 0 01-1 1h-7l-4 3v-3h-2a1 1 0 01-1-1v-7a1 1 0 011-1z" />
    </>
  ),
  globe: (
    <>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M2.5 10h15" />
      <path d="M10 2.5c2 2 2 13 0 15" />
      <path d="M10 2.5c-2 2-2 13 0 15" />
    </>
  ),
  unlock: (
    <>
      <rect x="4.5" y="9" width="11" height="7.5" rx="1.5" />
      <path d="M7.5 9V5.5a3 3 0 015.5-1.5" />
    </>
  ),
  chart: (
    <>
      <path d="M3 17h14" />
      <path d="M5.5 17V11M10 17V7M14.5 17V13" />
    </>
  ),
};

export default function ProductIcon({
  name,
  size = 20,
  color = 'currentColor',
  className,
  'aria-label': ariaLabel,
}: ProductIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={ariaLabel ? 'img' : 'presentation'}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      {PATHS[name]}
    </svg>
  );
}
