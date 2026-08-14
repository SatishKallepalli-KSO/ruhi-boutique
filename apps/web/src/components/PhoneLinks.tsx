import { business } from '../content'

export function PhoneLinks({ className }: { className?: string }) {
  return (
    <span className={className ? `phone-links ${className}` : 'phone-links'}>
      <a href={`tel:${business.phone}`}>{business.phoneDisplay}</a>
    </span>
  )
}
