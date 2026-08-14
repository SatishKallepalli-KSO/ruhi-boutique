import type { FormEvent } from 'react'
import { business, type DictKey, type Lang } from '../content'
import { todayISO } from '../lib/format'
import { waHref } from '../lib/whatsapp'

export type BookFormState = {
  customer_name: string
  customer_phone: string
  service_type: string
  preferred_date: string
  preferred_time: string
  notes: string
}

type Props = {
  lang: Lang
  tx: (key: DictKey) => string
  form: BookFormState
  setForm: (next: BookFormState) => void
  busy: boolean
  onSubmit: (event: FormEvent) => void
}

export function BookPortal({ lang, tx, form, setForm, busy, onSubmit }: Props) {
  return (
    <section className="portal">
      <div className="section-head">
        <h2>{tx('bookTitle')}</h2>
        <p>{tx('bookIntro')}</p>
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
            {tx('serviceType')}
            <select
              value={form.service_type}
              onChange={(e) => setForm({ ...form, service_type: e.target.value })}
            >
              <option value="consultation">{tx('serviceConsultation')}</option>
              <option value="stitching">{tx('serviceStitching')}</option>
              <option value="bridal">{tx('serviceBridal')}</option>
              <option value="alteration">{tx('serviceAlteration')}</option>
              <option value="party_wear">{tx('serviceParty')}</option>
            </select>
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
          <label>
            {tx('preferredTime')}
            <select
              value={form.preferred_time}
              onChange={(e) => setForm({ ...form, preferred_time: e.target.value })}
            >
              <option value="">{tx('preferredTime')}</option>
              <option value="morning">{tx('timeMorning')}</option>
              <option value="afternoon">{tx('timeAfternoon')}</option>
              <option value="evening">{tx('timeEvening')}</option>
            </select>
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
              {busy ? tx('submitting') : tx('submitBook')}
            </button>
            <a className="btn btn-ghost" href={`tel:${business.phone}`}>
              {tx('callNow')}
            </a>
            <a className="btn btn-ghost" href={waHref(lang)} target="_blank" rel="noreferrer">
              {tx('whatsapp')}
            </a>
          </div>
        </form>
        <aside className="form-aside">
          <p className="form-aside-kicker">{tx('hours')}</p>
          <p>{tx('formOfficeNote')}</p>
        </aside>
      </div>
    </section>
  )
}
