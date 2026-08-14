type Props = {
  className?: string
  title?: string
}

/** Original Ruhi boutique seal. */
export function BrandMark({ className, title = 'Ruhi Atelier' }: Props) {
  return (
    <img
      className={className}
      src="/logo.png"
      alt={title}
      width={80}
      height={80}
      decoding="async"
    />
  )
}
