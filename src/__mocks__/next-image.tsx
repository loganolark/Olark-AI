import React from 'react';

interface NextImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  style?: React.CSSProperties;
  className?: string;
  priority?: boolean;
}

export default function MockNextImage({ src, alt, width, height, style, className }: NextImageProps) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} width={width} height={height} style={style} className={className} />;
}
