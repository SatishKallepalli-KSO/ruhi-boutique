import { useEffect, useState } from 'react'
import { boutiqueOpenStatus } from '../lib/hours'
import type { DictKey } from '../content'

type Props = {
  tx: (key: DictKey) => string
  className?: string
}

export function OpenBadge({ tx, className = '' }: Props) {
  const [status, setStatus] = useState(() => boutiqueOpenStatus())

  useEffect(() => {
    const tick = () => setStatus(boutiqueOpenStatus())
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <span className={`open-badge ${status.open ? 'is-open' : 'is-closed'} ${className}`.trim()}>
      <i aria-hidden="true" />
      <strong>{status.open ? tx('openNow') : tx('closedNow')}</strong>
      <em>
        {tx('hoursShort')} · {status.localTime} IST
      </em>
    </span>
  )
}
