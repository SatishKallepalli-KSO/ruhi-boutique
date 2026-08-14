type Props = {
  className?: string
  title?: string
}

/** Refined gold-line elephant motif for brand accents. */
export function ElephantMotif({ className = '', title }: Props) {
  return (
    <svg
      className={`elephant-motif ${className}`.trim()}
      viewBox="0 0 120 100"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 62c2-18 14-30 34-32 16-2 30 6 36 18 4 8 4 18-1 26" />
        <path d="M42 34c-2-10 4-18 14-20 8-2 16 2 18 10" />
        <path d="M68 28c6-8 16-10 24-4 6 4 8 12 4 18" />
        <path d="M88 48c8 2 14 10 12 20-2 8-10 12-18 10" />
        <path d="M30 70c-8 4-14 14-10 22 8-4 16-8 22-16" />
        <path d="M52 78v14M68 80v12M82 74v14" />
        <circle cx="74" cy="46" r="1.8" fill="currentColor" stroke="none" />
        <path d="M18 58c8 2 12 8 10 16-6-2-12-6-14-14z" />
      </g>
    </svg>
  )
}
