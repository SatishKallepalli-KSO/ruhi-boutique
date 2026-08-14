import type { FormEvent } from 'react'
import { OpenBadge } from '../components/OpenBadge'
import { business, type DictKey, type Lang } from '../content'
import { todayISO } from '../lib/format'
import { waHref } from '../lib/whatsapp'

export type StitchFormState = {
  customer_name: string
  customer_phone: string
  garment_type: string
  fabric_notes: string
  occasion: string
  preferred_date: string
  notes: string
}

type Props = {
  lang: Lang
  tx: (key: DictKey) => string
  form: StitchFormState
  setForm: (next: StitchFormState) => void
  busy: boolean
  onSubmit: (event: FormEvent) => void
}

export function StitchPortal({ lang, tx, form, setForm, busy, onSubmit }: Props) {
  return (
    <section className="portal form-portal-luxe">
      <div className="form-portal-hero">
        <img src="/gallery-stitch.jpg" alt="" loading="eager" />
        <div>
          <p className="section-eyebrow">{tx('navStitch')}</p>
          <h2>{tx('stitchTitle')}</h2>
          <p>{tx('stitchIntro')}</p>
          <OpenBadge tx={tx} />
        </div>
      </div>
      <div className="form-shell">
        <form className="panel-form" onSubmit={onSubmit}>
          <label>
            {tx('name')}
            <input
              required
              autoComplete="name"
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
            />
          </label>
          <label>
            {tx('phone')}
            <input
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={form.customer_phone}
              onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
            />
          </label>
          <label>
            {tx('garmentType')}
            <select
              value={form.garment_type}
              onChange={(e) => setForm({ ...form, garment_type: e.target.value })}
            >
              <option value="blouse">{tx('garmentBlouse')}</option>
              <option value="saree">{tx('garmentSaree')}</option>
              <option value="lehenga">{tx('garmentLehenga')}</option>
              <option value="kurti">{tx('garmentKurti')}</option>
              <option value="kids">{tx('garmentKids')}</option>
              <option value="alteration">{tx('garmentAlteration')}</option>
              <option value="other">{tx('garmentOther')}</option>
            </select>
          </label>
          <label>
            {tx('occasion')}
            <input
              value={form.occasion}
              onChange={(e) => setForm({ ...form, occasion: e.target.value })}
              placeholder={lang === 'te' ? 'పెళ్లి / పండుగ / పార్టీ' : 'Wedding / festive / party'}
            />
          </label>
          <label className="span-2">
            {tx('fabricNotes')}
            <input
              value={form.fabric_notes}
              onChange={(e) => setForm({ ...form, fabric_notes: e.target.value })}
            />
          </label>
          <label>
            {tx('preferredDate')}
            <input
              type="date"
              min={todayISO()}
              value={form.preferred_date}
              onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
            />
          </label>
          <label className="span-2">
            {tx('notes')}
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </label>
          <div className="form-actions span-2">
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? tx('submitting') : tx('submitStitch')}
            </button>
            <a className="btn btn-ghost" href={`tel:${business.phone}`}>
              {tx('callNow')}
            </a>
            <a className="btn btn-ghost" href={waHref(lang, 'stitch')} target="_blank" rel="noreferrer">
              {tx('whatsapp')}
            </a>
          </div>
        </form>
        <aside className="form-aside form-aside-luxe">
          <p className="form-aside-kicker">{tx('stitchTipTitle')}</p>
          <p>{tx('stitchTipBody')}</p>
          <p className="form-aside-extra">{tx('formAsideStitch')}</p>
          <a className="btn btn-ghost" href={waHref(lang, 'stitch')} target="_blank" rel="noreferrer">
            {tx('waStitch')}
          </a>
        </aside>
      </div>
    </section>
  )
}
