'use client';

import Image from 'next/image';
import './holographic.css';

interface HolographicLogoProps {
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

export function HolographicLogo({
  width = 120,
  height = 40,
  sizes = '120px',
  priority,
  className = '',
}: HolographicLogoProps) {
  return (
    <span
      className={`holo-logo-wrap ${className}`.trim()}
      style={{ isolation: 'isolate' }}
    >
      <Image
        src="/images/fidget-wrld-logo.png"
        alt="Fidget WRLD"
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
      />
      <span className="holo-logo-gradient" aria-hidden="true" />
    </span>
  );
}
