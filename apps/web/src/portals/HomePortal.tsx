import type { Stats } from '../api'
import {
  business,
  collections,
  gallery,
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
  const quotes = testimonials[lang].slice(0, 3)

  return (
    <>
      <section className="hero hero-scenic hero-luxe" aria-label="Ruhi Trends">
        <div className="hero-scenic-bg" aria-hidden="true">
          <img src="/hero-boutique.jpg" alt="" fetchPriority="high" decoding="async" />
        </div>
        <div className="hero-scenic-shade hero-luxe-shade" aria-hidden="true" />
        <div className="hero-copy hero-copy-on-media hero-luxe-copy">
          <img className="hero-logo" src="/logo.png" alt="" width={96} height={96} />
          <p className="hero-eyebrow">{tx('heroKicker')}</p>
          <h1 className="hero-name">{tx('heroBrand')}</h1>
          <p className="hero-tagline">{tx('heroTagline')}</p>
          <div className="hero-actions">
            <button type="button" className="btn btn-gold" onClick={() => setPortal('book')}>
              {tx('ctaQuote')}
            </button>
            <a className="btn btn-ghost-light" href={`tel:${business.phone}`}>
              {tx('callNow')}
            </a>
          </div>
        </div>
      </section>

      <section className="luxe-bar" aria-label={tx('atmosphereLabel')}>
        <div className="luxe-bar-inner">
          <p className="luxe-bar-kicker">{tx('atmosphereLabel')}</p>
          <p className="luxe-bar-body">{tx('atmosphereBody')}</p>
          <div className="luxe-bar-actions">
            <a href={waHref(lang)} target="_blank" rel="noreferrer">
              {tx('whatsapp')}
            </a>
            <button type="button" onClick={() => setPortal('about')}>
              {tx('ctaDirections')}
            </button>
          </div>
        </div>
      </section>

      <section className="section offer-luxe">
        <div className="section-head section-luxe-head">
          <p className="section-eyebrow">{tx('lookbookTitle')}</p>
          <h2>{tx('collectionsTitle')}</h2>
          <p>{tx('collectionsIntro')}</p>
        </div>
        <div className="offer-grid">
          {collections.map((item, index) => (
            <article
              key={item.id}
              className={`offer-tile offer-tile-${(index % 3) + 1}`}
            >
              <div className="offer-tile-media">
                <img src={item.image} alt="" loading={index < 2 ? 'eager' : 'lazy'} decoding="async" />
                <div className="offer-tile-veil" aria-hidden="true" />
              </div>
              <div className="offer-tile-copy">
                <h3>{item[lang].title}</h3>
                <p>{item[lang].body}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="section-cta-row section-cta-center">
          <button type="button" className="btn btn-gold" onClick={() => setPortal('collections')}>
            {tx('navCollections')}
          </button>
          <button type="button" className="btn btn-ink" onClick={() => setPortal('stitch')}>
            {tx('navStitch')}
          </button>
        </div>
      </section>

      <section className="section begin-luxe">
        <div className="begin-luxe-layout">
          <div className="begin-luxe-copy">
            <p className="section-eyebrow">{tx('roleTitle')}</p>
            <h2>{tx('roleTitle')}</h2>
            <p>{tx('lookbookIntro')}</p>
          </div>
          <div className="begin-panels">
            <button type="button" className="begin-panel" onClick={() => setPortal('book')}>
              <span className="begin-panel-media">
                <img src="/gallery-fitting.jpg" alt="" loading="lazy" />
              </span>
              <span className="begin-panel-body">
                <strong>{tx('roleVisitTitle')}</strong>
                <em>{tx('roleVisitBody')}</em>
                <span className="begin-panel-cta">{tx('roleVisitCta')} →</span>
              </span>
            </button>
            <button type="button" className="begin-panel" onClick={() => setPortal('stitch')}>
              <span className="begin-panel-media">
                <img src="/col-alter.jpg" alt="" loading="lazy" />
              </span>
              <span className="begin-panel-body">
                <strong>{tx('roleStitchTitle')}</strong>
                <em>{tx('roleStitchBody')}</em>
                <span className="begin-panel-cta">{tx('roleStitchCta')} →</span>
              </span>
            </button>
            <a className="begin-panel" href={`tel:${business.phone}`}>
              <span className="begin-panel-media begin-panel-media-dark">
                <img src="/logo.png" alt="" loading="lazy" />
              </span>
              <span className="begin-panel-body">
                <strong>{tx('roleOfficeTitle')}</strong>
                <em>{tx('roleOfficeBody')}</em>
                <span className="begin-panel-cta">{tx('roleCallCta')} →</span>
              </span>
            </a>
          </div>
        </div>
      </section>

      <section className="section atelier-strip">
        <div className="atelier-strip-grid">
          {gallery.slice(0, 3).map((shot) => (
            <figure key={shot.src} className="atelier-shot">
              <img src={shot.src} alt={shot[lang]} loading="lazy" decoding="async" />
              <figcaption>{shot[lang]}</figcaption>
            </figure>
          ))}
        </div>
        <div className="atelier-strip-copy">
          <p className="section-eyebrow">{tx('galleryTitle')}</p>
          <h2>{tx('galleryTitle')}</h2>
          <p>{tx('galleryIntro')}</p>
        </div>
      </section>

      <section className="section why-luxe">
        <div className="section-head section-luxe-head">
          <p className="section-eyebrow">04</p>
          <h2>{tx('whyTitle')}</h2>
          <p>{tx('whyIntro')}</p>
        </div>
        <div className="why-luxe-grid">
          {whyItems.map((item, i) => (
            <article key={item.title} className="why-luxe-item">
              <span>0{i + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section quotes-luxe">
        <div className="section-head section-luxe-head">
          <h2>{tx('testimonialsTitle')}</h2>
          <p>{tx('testimonialsIntro')}</p>
        </div>
        <div className="quotes-luxe-rail">
          {quotes.map((item) => (
            <blockquote key={item.name} className="quote-luxe">
              <p>“{item.quote}”</p>
              <footer>
                <strong>{item.name}</strong>
                <span>
                  {item.place} · {item.role}
                </span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {stats && (stats.open_appointments > 0 || stats.open_orders > 0 || stats.ready_orders > 0) ? (
        <section className="desk-pulse" aria-label={tx('trustLiveLabel')}>
          <p className="desk-pulse-label">
            <span className="pulse-dot" aria-hidden="true" />
            {tx('trustLiveLabel')}
          </p>
          <div className="desk-pulse-grid">
            <div>
              <strong>{stats.open_appointments}</strong>
              <span>{tx('snapAppointments')}</span>
            </div>
            <div>
              <strong>{stats.open_orders}</strong>
              <span>{tx('snapOrders')}</span>
            </div>
            <div>
              <strong>{stats.ready_orders}</strong>
              <span>{tx('snapReady')}</span>
            </div>
          </div>
        </section>
      ) : null}

      <section className="section final-cta final-luxe">
        <div className="final-luxe-panel">
          <div className="final-luxe-bg" aria-hidden="true">
            <img src="/col-lehenga.jpg" alt="" loading="lazy" />
          </div>
          <div className="final-luxe-copy">
            <h2>{tx('finalCtaTitle')}</h2>
            <p>{tx('finalCtaBody')}</p>
            <div className="hero-actions">
              <button type="button" className="btn btn-gold" onClick={() => setPortal('book')}>
                {tx('bookNow')}
              </button>
              <a className="btn btn-ghost-light" href={waHref(lang)} target="_blank" rel="noreferrer">
                {tx('whatsapp')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
