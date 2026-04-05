import { BlurText } from '@/components/effects/BlurText'

interface SectionHeadingProps {
  heading: string
  eyebrow?: string
  dotAccent?: boolean
  align?: 'left' | 'center'
  as?: 'h1' | 'h2' | 'h3'
  className?: string
}

export function SectionHeading({
  heading,
  eyebrow,
  dotAccent = false,
  align = 'left',
  as: Tag = 'h2',
  className,
}: SectionHeadingProps) {
  return (
    <div
      style={{
        textAlign: align,
        marginBottom: 'var(--space-6)',
      }}
      className={className}
    >
      {eyebrow && (
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--color-accent-primary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          <BlurText text={eyebrow} />
        </p>
      )}
      <Tag
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.75rem, 4vw, 3rem)',
          fontWeight: 'var(--font-bold)',
          lineHeight: 'var(--leading-tight)',
          color: 'var(--color-text-primary)',
          margin: 0,
          whiteSpace: 'nowrap',
        }}
      >
        <BlurText text={heading} />
        {dotAccent && (
          <span
            aria-hidden="true"
            className="section-heading-dot"
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent-primary)',
              marginLeft: 'var(--space-2)',
              verticalAlign: 'middle',
              animation: 'dotPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
            }}
          />
        )}
      </Tag>
    </div>
  )
}

export default SectionHeading
