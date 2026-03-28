interface BadgeProps {
  variant: 'new' | 'bestseller' | 'hot' | 'limited' | 'sale' | 'exclusive' | 'collectible' | 'category'
  label: string
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ variant, label, size = 'sm', className }: BadgeProps) {
  const variantClass = variant === 'category' ? '' : `badge-${variant}`
  const sizeClass = size === 'md' ? 'badge-md' : ''
  const classes = ['badge', variantClass, sizeClass, className].filter(Boolean).join(' ')

  return <span className={classes}>{label}</span>
}

export default Badge
