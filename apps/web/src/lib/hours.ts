/** Boutique hours helper — Asia/Kolkata wall clock. */
export const BOUTIQUE_OPEN_MINUTES = 10 * 60 // 10:00
export const BOUTIQUE_CLOSE_MINUTES = 20 * 60 + 30 // 20:30

export function kolkataParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'short',
  }).formatToParts(now)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const hour = Number(get('hour'))
  const minute = Number(get('minute'))
  return {
    weekday: get('weekday'),
    minutes: hour * 60 + minute,
    label: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
  }
}

export function isBoutiqueOpen(now = new Date()): boolean {
  const { minutes } = kolkataParts(now)
  return minutes >= BOUTIQUE_OPEN_MINUTES && minutes < BOUTIQUE_CLOSE_MINUTES
}

export function boutiqueOpenStatus(now = new Date()): {
  open: boolean
  localTime: string
} {
  const { label, minutes } = kolkataParts(now)
  return {
    open: minutes >= BOUTIQUE_OPEN_MINUTES && minutes < BOUTIQUE_CLOSE_MINUTES,
    localTime: label,
  }
}
