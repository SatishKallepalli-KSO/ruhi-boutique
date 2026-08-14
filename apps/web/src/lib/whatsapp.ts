import { business, type Lang } from '../content'

export function waHref(lang: Lang) {
  const text =
    lang === 'te'
      ? `నమస్కారం, ${business.shortName} (కూకట్‌పల్లి) నుండి విజిట్ / స్టిచింగ్ గురించి మాట్లాడాలనుకుంటున్నాను.`
      : `Namaste, I want to book a visit / stitching at ${business.shortName} (Kukatpally).`
  return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(text)}`
}
