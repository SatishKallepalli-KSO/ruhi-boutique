import { business, type Lang } from '../content'

export type WaIntent = 'general' | 'visit' | 'stitch' | 'bridal'

const messages: Record<WaIntent, Record<Lang, string>> = {
  general: {
    en: `Namaste, I want to reserve a visit / stitching at ${business.shortName} (Kukatpally).`,
    te: `నమస్కారం, ${business.shortName} (కూకట్‌పల్లి) నుండి విజిట్ / స్టిచింగ్ గురించి మాట్లాడాలనుకుంటున్నాను.`,
  },
  visit: {
    en: `Namaste, I would like to reserve a boutique visit at ${business.shortName}, Kukatpally.`,
    te: `నమస్కారం, ${business.shortName} కూకట్‌పల్లి బూటిక్ విజిట్ రిజర్వ్ చేయాలనుకుంటున్నాను.`,
  },
  stitch: {
    en: `Namaste, I need custom stitching / alteration at ${business.shortName}, Kukatpally.`,
    te: `నమస్కారం, ${business.shortName} కూకట్‌పల్లిలో కస్టమ్ స్టిచింగ్ / ఆల్టరేషన్ కావాలి.`,
  },
  bridal: {
    en: `Namaste, I would like a bridal / occasion consultation at ${business.shortName}, Kukatpally.`,
    te: `నమస్కారం, ${business.shortName} కూకట్‌పల్లిలో బ్రైడల్ / సందర్భ కన్సల్టేషన్ కావాలి.`,
  },
}

export function waHref(lang: Lang, intent: WaIntent = 'general') {
  const text = messages[intent][lang]
  return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(text)}`
}
