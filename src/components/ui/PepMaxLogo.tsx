import Image from 'next/image';

interface PepMaxLogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export function PepMaxLogo({ className, style }: PepMaxLogoProps) {
  return (
    <Image
      src="/images/logo.svg"
      alt="PepMax"
      width={1907}
      height={560}
      sizes="(max-width: 768px) 320px, (max-width: 1200px) 40vw, 480px"
      priority
      className={className}
      style={style}
    />
  );
}
