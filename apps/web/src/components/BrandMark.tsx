type Props = {
  className?: string
  title?: string
}

export function BrandMark({ className, title = 'Ruhi Trends' }: Props) {
  return (
    <img
      className={className}
      src="/logo.png"
      alt={title}
      width={64}
      height={64}
      decoding="async"
    />
  )
}
