import type { Stats } from '../api'
import {
  business,
  collections,
  testimonials,
  type DictKey,
  type Lang,
} from '../content'
import { waHref } from '../lib/whatsapp'

type Portal = 'home' | 'book' | 'stitch' | 'admin' | 'about' | 'collections'

type Props = {
  lang: Lang
  tx: (key: DictKey) => string
  stats: Stats | null
  setPortal: (portal: Portal) => void
}

export function HomePortal({ lang, tx, stats, setPortal }: Props) {
  const whyItems = [
    { title: tx('why1Title'), body: tx('why1Body') },
    { title: tx('why2Title'), body: tx('why2Body') },
    { title: tx('why3Title'), body: tx('why3Body') },
    { title: tx('why4Title'), body: tx('why4Body') },
  ]
  const quotes = testimonials[lang]

  return (
    <>
      <section className="hero hero-scenic" aria-label="Ruhi Trends">
        <div className="hero-scenic-bg" aria-hidden="true">
          <img src="/hero-boutique.jpg" alt="" fetchPriority="high" decoding="async" />
        </div>
        <div className="hero-scenic-shade" aria-hidden="true" />
        <div className="hero-copy hero-copy-on-media">
          <p className="hero-kicker">{tx('heroKicker')}</p>
          <h1 className="hero-name">{tx('heroBrand')}</h1>
          <p className="hero-sub">{tx('heroSub')}</p>
          <p className="hero-tagline">{tx('heroTagline')}</p>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary" onClick={() => setPortal('book')}>
              {tx('ctaQuote')}
            </button>
            <a className="btn btn-light" href={`tel:${business.phone}`}>
              {tx('callNow')}
            </a>
            <a className="btn btn-ghost-light" href={waHref(lang)} target="_blank" rel="noreferrer">
              {tx('whatsapp')}
            </a>
          </div>
        </div>
      </section>

      <section className="trust-live" aria-label={tx('trustStripTitle')}>
        <div className="trust-live-trust">
          <p className="trust-strip-label">{tx('trustStripTitle')}</p>
          <div className="trust-strip-grid trust-live-grid">
            <div>
              <strong>{tx('trustLandmark')}</strong>
              <span>{tx('trustLandmarkDetail')}</span>
            </div>
            <div>
              <strong>{tx('trustHours')}</strong>
              <span>{tx('trustHub')}</span>
            </div>
            <div>
              <strong>{tx('trustStitch')}</strong>
              <span>{tx('trustStitchDetail')}</span>
            </div>
          </div>
        </div>
        <div className="trust-live-pulse">
          <p className="market-pulse-label">
            <span className="pulse-dot" aria-hidden="true" />
            {tx('trustLiveLabel')}
          </p>
          <div className="market-pulse-grid trust-live-pulse-grid">
            <div>
              <strong>{stats?.open_appointments ?? 0}</strong>
              <span>{tx('snapAppointments')}</span>
            </div>
            <div>
              <strong>{stats?.open_orders ?? 0}</strong>
              <span>{tx('snapOrders')}</span>
            </div>
            <div>
              <strong>{stats?.ready_orders ?? 0}</strong>
              <span>{tx('snapReady')}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section roles">
        <div className="section-head">
          <h2>{tx('roleTitle')}</h2>
        </div>
        <div className="role-grid">
          <button type="button" className="role-card" onClick={() => setPortal('book')}>
            <strong>{tx('roleVisitTitle')}</strong>
            <span>{tx('roleVisitBody')}</span>
          </button>
          <button type="button" className="role-card" onClick={() => setPortal('stitch')}>
            <strong>{tx('roleStitchTitle')}</strong>
            <span>{tx('roleStitchBody')}</span>
          </button>
          <a className="role-card" href={`tel:${business.phone}`}>
            <strong>{tx('roleOfficeTitle')}</strong>
            <span>{tx('roleOfficeBody')}</span>
          </a>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>{tx('collectionsTitle')}</h2>
          <p>{tx('collectionsIntro')}</p>
        </div>
        <div className="why-grid">
          {collections.map((item) => (
            <article key={item.id} className="why-card">
              <h3>{item[lang].title}</h3>
              <p>{item[lang].body}</p>
            </article>
          ))}
        </div>
        <div className="hero-actions" style={{ marginTop: '1.25rem' }}>
          <button type="button" className="btn btn-ghost" onClick={() => setPortal('collections')}>
            {tx('navCollections')}
          </button>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>{tx('whyTitle')}</h2>
          <p>{tx('whyIntro')}</p>
        </div>
        <div className="why-grid">
          {whyItems.map((item) => (
            <article key={item.title} className="why-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>{tx('testimonialsTitle')}</h2>
          <p>{tx('testimonialsIntro')}</p>
        </div>
        <div className="why-grid">
          {quotes.map((item) => (
            <article key={item.name} className="why-card">
              <p>“{item.quote}”</p>
              <h3>
                {item.name} · {item.place}
              </h3>
              <p>{item.role}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section final-cta">
        <div className="section-head">
          <h2>{tx('finalCtaTitle')}</h2>
          <p>{tx('finalCtaBody')}</p>
        </div>
        <div className="hero-actions">
          <button type="button" className="btn btn-primary" onClick={() => setPortal('book')}>
            {tx('bookNow')}
          </button>
          <a className="btn btn-ghost" href={waHref(lang)} target="_blank" rel="noreferrer">
            {tx('whatsapp')}
          </a>
          <button type="button" className="btn btn-ghost" onClick={() => setPortal('about')}>
            {tx('navAbout')}
          </button>
        </div>
      </section>
    </>
  )
}
