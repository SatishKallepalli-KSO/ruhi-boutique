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
  const featured = collections.slice(0, 4)

  return (
    <>
      <section className="hero hero-scenic hero-premium" aria-label="Ruhi Trends">
        <div className="hero-scenic-bg" aria-hidden="true">
          <img src="/hero-boutique.jpg" alt="" fetchPriority="high" decoding="async" />
        </div>
        <div className="hero-scenic-shade" aria-hidden="true" />
        <div className="hero-copy hero-copy-on-media hero-copy-premium">
          <img className="hero-logo" src="/logo.png" alt="" width={88} height={88} />
          <h1 className="hero-name">{tx('heroBrand')}</h1>
          <p className="hero-tagline">{tx('heroTagline')}</p>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary" onClick={() => setPortal('book')}>
              {tx('ctaQuote')}
            </button>
            <a className="btn btn-light" href={`tel:${business.phone}`}>
              {tx('callNow')}
            </a>
          </div>
        </div>
      </section>

      <section className="atmosphere reveal" aria-label={tx('atmosphereLabel')}>
        <p className="atmosphere-kicker">{tx('atmosphereLabel')}</p>
        <p className="atmosphere-body">{tx('atmosphereBody')}</p>
        <div className="atmosphere-actions">
          <a className="text-link" href={waHref(lang)} target="_blank" rel="noreferrer">
            {tx('whatsapp')}
          </a>
          <button type="button" className="text-link" onClick={() => setPortal('about')}>
            {tx('ctaDirections')}
          </button>
        </div>
      </section>

      <section className="section gallery-section reveal">
        <div className="section-head section-head-premium">
          <h2>{tx('galleryTitle')}</h2>
          <p>{tx('galleryIntro')}</p>
        </div>
        <div className="gallery-mosaic">
          {gallery.map((shot, index) => (
            <figure
              key={shot.src}
              className={`gallery-tile gallery-tile-${index + 1}`}
            >
              <img src={shot.src} alt={shot[lang]} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />
              <figcaption>{shot[lang]}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="section lookbook-section reveal">
        <div className="section-head section-head-premium">
          <h2>{tx('lookbookTitle')}</h2>
          <p>{tx('lookbookIntro')}</p>
        </div>
        <div className="lookbook-rail">
          {featured.map((item) => (
            <article key={item.id} className="lookbook-item">
              <div className="lookbook-media">
                <img src={item.image} alt="" loading="lazy" decoding="async" />
              </div>
              <h3>{item[lang].title}</h3>
              <p>{item[lang].body}</p>
            </article>
          ))}
        </div>
        <div className="section-cta-row">
          <button type="button" className="btn btn-ghost" onClick={() => setPortal('collections')}>
            {tx('navCollections')}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setPortal('stitch')}>
            {tx('navStitch')}
          </button>
        </div>
      </section>

      <section className="section roles roles-premium reveal">
        <div className="section-head section-head-premium">
          <h2>{tx('roleTitle')}</h2>
        </div>
        <div className="role-grid role-grid-premium">
          <button type="button" className="role-row" onClick={() => setPortal('book')}>
            <strong>{tx('roleVisitTitle')}</strong>
            <span>{tx('roleVisitBody')}</span>
          </button>
          <button type="button" className="role-row" onClick={() => setPortal('stitch')}>
            <strong>{tx('roleStitchTitle')}</strong>
            <span>{tx('roleStitchBody')}</span>
          </button>
          <a className="role-row" href={`tel:${business.phone}`}>
            <strong>{tx('roleOfficeTitle')}</strong>
            <span>{tx('roleOfficeBody')}</span>
          </a>
        </div>
      </section>

      <section className="section why-premium reveal">
        <div className="section-head section-head-premium">
          <h2>{tx('whyTitle')}</h2>
          <p>{tx('whyIntro')}</p>
        </div>
        <div className="why-list">
          {whyItems.map((item, i) => (
            <article key={item.title} className="why-row">
              <span className="why-index">0{i + 1}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section quotes-section reveal">
        <div className="section-head section-head-premium">
          <h2>{tx('testimonialsTitle')}</h2>
          <p>{tx('testimonialsIntro')}</p>
        </div>
        <div className="quotes-rail">
          {quotes.map((item) => (
            <blockquote key={item.name} className="quote-block">
              <p>“{item.quote}”</p>
              <footer>
                {item.name} · {item.place}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {(stats?.open_appointments || stats?.open_orders || stats?.ready_orders) ? (
        <section className="desk-pulse reveal" aria-label={tx('trustLiveLabel')}>
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

      <section className="section final-cta final-cta-premium reveal">
        <div className="final-cta-panel">
          <h2>{tx('finalCtaTitle')}</h2>
          <p>{tx('finalCtaBody')}</p>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary" onClick={() => setPortal('book')}>
              {tx('bookNow')}
            </button>
            <a className="btn btn-ghost" href={waHref(lang)} target="_blank" rel="noreferrer">
              {tx('whatsapp')}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
