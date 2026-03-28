import Image from 'next/image';

interface FidgetWrldLogoProps {
  className?: string;
  style?: React.CSSProperties;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { width: 120, height: 80 },
  md: { width: 200, height: 133 },
  lg: { width: 320, height: 213 },
};

export function FidgetWrldLogo({ className, style, size = 'md' }: FidgetWrldLogoProps) {
  const { width, height } = sizes[size];
  return (
    <Image
      src="/images/fidget-wrld-logo.png"
      alt="Fidget WRLD"
      width={width}
      height={height}
      sizes="(max-width: 768px) 200px, (max-width: 1200px) 280px, 320px"
      priority
      className={className}
      style={style}
    />
  );
}
