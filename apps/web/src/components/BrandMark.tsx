import { useId } from 'react'

type Props = {
  className?: string
  title?: string
}

export function BrandMark({ className, title = "Ruhi's Boutique" }: Props) {
  const raw = useId().replace(/:/g, '')
  const bg = `rb-bg-${raw}`
  const gold = `rb-gold-${raw}`

  return (
    <svg className={className} viewBox="0 0 64 64" role="img" aria-label={title}>
      <defs>
        <linearGradient id={bg} x1="10" y1="6" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7a2d4d" />
          <stop offset="100%" stopColor="#5c1f3a" />
        </linearGradient>
        <linearGradient id={gold} x1="16" y1="14" x2="48" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f7d9c2" />
          <stop offset="55%" stopColor="#d4a574" />
          <stop offset="100%" stopColor="#b8844f" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill={`url(#${bg})`} />
      <path
        d="M20 46 V18 h9.2 c6.8 0 11.2 3.4 11.2 9.1 0 4.2-2.2 7.2-6.1 8.4 L42.5 46 h-8.1 l-7.2-9.8 H27.4 V46 H20z M27.4 29.4 h1.6 c2.8 0 4.5-1.4 4.5-3.6 0-2.1-1.6-3.4-4.4-3.4 h-1.7 v7z"
        fill={`url(#${gold})`}
      />
      <path d="M14 51.5h36" stroke="#d4a574" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}
