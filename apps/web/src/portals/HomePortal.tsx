import { useEffect, useState } from 'react'
import type { Stats } from '../api'
import { ElephantMotif } from '../components/ElephantMotif'
import { Reveal } from '../components/Reveal'
import {
  atelierServices,
  bridalTimeline,
  business,
  collections,
  faqs,
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
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [faqOpen, setFaqOpen] = useState<string | null>(faqs[0]?.id ?? null)

  useEffect(() => {
    if (lightbox == null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight') setLightbox((i) => (i == null ? i : (i + 1) % gallery.length))
      if (e.key === 'ArrowLeft')
        setLightbox((i) => (i == null ? i : (i - 1 + gallery.length) % gallery.length))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  return (
    <>
      <section className="hero hero-scenic hero-luxe" aria-label="Ruhi Trends">
        <div className="hero-scenic-bg hero-kenburns" aria-hidden="true">
          <img src="/motif-elephant-saree.jpg" alt="" fetchPriority="high" decoding="async" />
        </div>
        <div className="hero-scenic-shade hero-luxe-shade" aria-hidden="true" />
        <div className="hero-film" aria-hidden="true" />
        <div className="hero-copy hero-copy-on-media hero-luxe-copy">
          <p className="hero-eyebrow">{tx('heroKicker')}</p>
          <h1 className="hero-name">{tx('heroBrand')}</h1>
          <p className="hero-store">{business.boutiqueName}</p>
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

      <Reveal as="section" className="section motif-signature">
        <div className="motif-signature-layout">
          <div className="motif-signature-media">
            <img src="/hero-atelier-light.jpg" alt="" loading="lazy" decoding="async" />
          </div>
          <div className="motif-signature-copy">
            <p className="section-eyebrow">{tx('motifEyebrow')}</p>
            <h2>{tx('motifTitle')}</h2>
            <p>{tx('motifBody')}</p>
            <div className="motif-saree-rail" aria-hidden="true">
              <span />
              <ElephantMotif className="motif-rail-icon" />
              <span />
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section offer-luxe">
        <div className="section-head section-luxe-head">
          <p className="section-eyebrow">{tx('lookbookTitle')}</p>
          <h2>{tx('collectionsTitle')}</h2>
          <p>{tx('collectionsIntro')}</p>
        </div>
        <div className="offer-grid">
          {collections.map((item, index) => (
            <article key={item.id} className={`offer-tile offer-tile-${(index % 3) + 1}`}>
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
      </Reveal>

      <Reveal as="section" className="section services-atelier">
        <div className="section-head section-luxe-head">
          <p className="section-eyebrow">02</p>
          <h2>{tx('servicesTitle')}</h2>
          <p>{tx('servicesIntro')}</p>
        </div>
        <div className="services-atelier-grid">
          {atelierServices.map((item) => (
            <article key={item.id} className="service-atelier-card">
              <p className="service-atelier-eta">{item[lang].eta}</p>
              <h3>{item[lang].title}</h3>
              <p>{item[lang].body}</p>
            </article>
          ))}
        </div>
        <div className="wa-intent-row" aria-label="WhatsApp shortcuts">
          <a className="wa-chip" href={waHref(lang, 'visit')} target="_blank" rel="noreferrer">
            {tx('waVisit')}
          </a>
          <a className="wa-chip" href={waHref(lang, 'stitch')} target="_blank" rel="noreferrer">
            {tx('waStitch')}
          </a>
          <a className="wa-chip" href={waHref(lang, 'bridal')} target="_blank" rel="noreferrer">
            {tx('waBridal')}
          </a>
        </div>
      </Reveal>

      <Reveal as="section" className="section begin-luxe">
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
      </Reveal>

      <Reveal as="section" className="section bridal-timeline">
        <div className="bridal-timeline-layout">
          <div className="bridal-timeline-copy">
            <p className="section-eyebrow">Bridal</p>
            <h2>{tx('bridalTitle')}</h2>
            <p>{tx('bridalIntro')}</p>
            <button type="button" className="btn btn-gold" onClick={() => setPortal('book')}>
              {tx('serviceBridal')}
            </button>
          </div>
          <ol className="bridal-steps">
            {bridalTimeline.map((step, index) => (
              <li key={step.id}>
                <span className="bridal-step-num">0{index + 1}</span>
                <div>
                  <em>{step[lang].when}</em>
                  <strong>{step[lang].title}</strong>
                  <p>{step[lang].body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>

      <Reveal as="section" className="section atelier-strip">
        <div className="atelier-strip-grid">
          {gallery.slice(0, 4).map((shot, index) => (
            <button
              key={shot.src}
              type="button"
              className="atelier-shot atelier-shot-btn"
              onClick={() => setLightbox(index)}
            >
              <img src={shot.src} alt={shot[lang]} loading="lazy" decoding="async" />
              <span className="atelier-shot-cap">{shot[lang]}</span>
            </button>
          ))}
        </div>
        <div className="atelier-strip-copy">
          <p className="section-eyebrow">{tx('galleryTitle')}</p>
          <h2>{tx('galleryTitle')}</h2>
          <p>{tx('galleryIntro')}</p>
        </div>
      </Reveal>

      <Reveal as="section" className="section why-luxe">
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
      </Reveal>

      <Reveal as="section" className="section care-strip">
        <div className="care-strip-inner">
          <p className="section-eyebrow">{tx('careTitle')}</p>
          <h2>{tx('careTitle')}</h2>
          <p>{tx('careBody')}</p>
        </div>
      </Reveal>

      <Reveal as="section" className="section faq-atelier">
        <div className="section-head section-luxe-head">
          <h2>{tx('faqTitle')}</h2>
          <p>{tx('faqIntro')}</p>
        </div>
        <div className="faq-list">
          {faqs.map((item) => {
            const open = faqOpen === item.id
            return (
              <div key={item.id} className={`faq-item${open ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="faq-q"
                  aria-expanded={open}
                  onClick={() => setFaqOpen(open ? null : item.id)}
                >
                  <span>{item[lang].q}</span>
                  <em aria-hidden="true">{open ? '−' : '+'}</em>
                </button>
                {open ? <p className="faq-a">{item[lang].a}</p> : null}
              </div>
            )
          })}
        </div>
      </Reveal>

      <Reveal as="section" className="section quotes-luxe">
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
      </Reveal>

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

      {lightbox != null && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={gallery[lightbox][lang]}
          onClick={() => setLightbox(null)}
        >
          <button type="button" className="lightbox-close" onClick={() => setLightbox(null)}>
            {tx('lightboxClose')}
          </button>
          <img
            src={gallery[lightbox].src}
            alt={gallery[lightbox][lang]}
            onClick={(e) => e.stopPropagation()}
          />
          <p className="lightbox-caption">{gallery[lightbox][lang]}</p>
        </div>
      )}
    </>
  )
}
