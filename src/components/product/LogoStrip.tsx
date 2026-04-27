import React from 'react';
import Image from 'next/image';

interface Logo {
  src: string;
  alt: string;
  width: number;
  height: number;
}

const LOGOS: Logo[] = [
  { src: '/logos/rackspace.svg',  alt: 'Rackspace',  width: 120, height: 32 },
  { src: '/logos/greenpeace.svg', alt: 'Greenpeace', width: 120, height: 40 },
  { src: '/logos/hulu.svg',       alt: 'Hulu',        width: 80,  height: 32 },
  { src: '/logos/j-crew.svg',     alt: 'J.Crew',      width: 80,  height: 32 },
  { src: '/logos/medium.svg',     alt: 'Medium',      width: 100, height: 32 },
  { src: '/logos/shopify.svg',    alt: 'Shopify',     width: 100, height: 32 },
];

const logoImgStyle: React.CSSProperties = {
  opacity: 0.55,
  filter: 'brightness(0) invert(1)',
};

export default function LogoStrip() {
  return (
    <div aria-label="Trusted by leading teams">
      {/* Desktop (md: ≥769px): static centered flex row */}
      <div
        data-testid="logo-grid"
        className="hidden md:flex"
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: '3rem',
          flexWrap: 'wrap',
        }}
      >
        {LOGOS.map((logo) => (
          <Image
            key={logo.alt}
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            style={logoImgStyle}
          />
        ))}
      </div>

      {/* Mobile (≤768px): CSS marquee */}
      <div
        className="md:hidden"
        style={{ overflow: 'hidden', width: '100%' }}
      >
        {/* Accessible logos — screen readers see this; outer div already carries the label */}
        <ul
          style={{ listStyle: 'none', padding: 0, margin: 0, height: 0, overflow: 'hidden' }}
        >
          {LOGOS.map((logo) => (
            <li key={logo.alt}>
              <Image src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} />
            </li>
          ))}
        </ul>
        {/* Visual marquee — duplicated for seamless loop, hidden from screen readers */}
        <div
          className="logo-marquee-track"
          aria-hidden="true"
          style={{ display: 'flex', width: 'max-content' }}
        >
          {[...LOGOS, ...LOGOS].map((logo, i) => (
            <div
              key={i}
              style={{ display: 'inline-flex', alignItems: 'center', padding: '0 2rem' }}
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                style={logoImgStyle}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
