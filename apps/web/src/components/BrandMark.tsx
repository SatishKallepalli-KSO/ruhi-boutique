type Variant = 'mark' | 'lockup' | 'hero'

type Props = {
  className?: string
  title?: string
  variant?: Variant
  inverted?: boolean
}

/** Maison-style brand mark: gold elephant seal + Ruhi Trends wordmark. */
export function BrandMark({
  className = '',
  title = 'Ruhi Trends',
  variant = 'lockup',
  inverted = false,
}: Props) {
  const tone = inverted ? 'brand-lockup-inverted' : ''

  if (variant === 'mark') {
    return (
      <img
        className={`brand-seal ${className}`.trim()}
        src="/logo-monogram.png"
        alt={title}
        width={64}
        height={64}
        decoding="async"
      />
    )
  }

  return (
    <span className={`brand-lockup brand-lockup-${variant} ${tone} ${className}`.trim()}>
      <img
        className="brand-lockup-seal"
        src="/logo-monogram.png"
        alt=""
        width={variant === 'hero' ? 112 : 56}
        height={variant === 'hero' ? 112 : 56}
        decoding="async"
      />
      <span className="brand-lockup-text">
        <strong>{title}</strong>
        <small>Atelier · Kukatpally</small>
      </span>
    </span>
  )
}
