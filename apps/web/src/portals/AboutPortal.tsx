import { PhoneLinks } from '../components/PhoneLinks'
import { waHref } from '../lib/whatsapp'
import { address, business, type DictKey, type Lang } from '../content'

type Props = {
  lang: Lang
  tx: (key: DictKey) => string
}

export function AboutPortal({ lang, tx }: Props) {
  return (
    <section className="portal about-page">
      <div className="section-head about-head">
        <img className="about-seal" src="/logo.png" alt="Ruhi Trends" />
        <div>
          <h2>{tx('aboutTitle')}</h2>
          <p>{tx('aboutIntro')}</p>
        </div>
      </div>
      <div className="about-layout">
        <div className="about-copy">
          <dl className="about-facts">
            <div>
              <dt>{tx('aboutOwnerLabel')}</dt>
              <dd>{business.name}</dd>
            </div>
            <div>
              <dt>Store</dt>
              <dd>{business.boutiqueName}</dd>
            </div>
            <div>
              <dt>{tx('aboutPhoneLabel')}</dt>
              <dd>
                <PhoneLinks />
              </dd>
            </div>
            <div>
              <dt>{tx('aboutAddressLabel')}</dt>
              <dd>{address.line}</dd>
            </div>
            <div>
              <dt>{tx('aboutHoursLabel')}</dt>
              <dd>{tx('aboutHoursValue')}</dd>
            </div>
            <div>
              <dt>Justdial</dt>
              <dd>
                <a href={business.justdialUrl} target="_blank" rel="noreferrer">
                  {tx('justdial')}
                </a>
              </dd>
            </div>
          </dl>
          <p className="about-body">{tx('aboutBody')}</p>
          <div className="location-actions">
            <a className="btn btn-primary" href={`tel:${business.phone}`}>
              {tx('callNow')}
            </a>
            <a className="btn btn-ghost" href={waHref(lang)} target="_blank" rel="noreferrer">
              {tx('whatsapp')}
            </a>
            <a className="btn btn-ghost" href={business.mapsShareUrl} target="_blank" rel="noreferrer">
              {tx('ctaDirections')}
            </a>
          </div>
        </div>
        <div className="about-visuals">
          <img className="about-photo" src="/gallery-saree.jpg" alt="" loading="lazy" />
          <div className="about-map">
            <p className="about-map-label">{tx('aboutMapTitle')}</p>
            <iframe
              title={tx('aboutMapTitle')}
              src={business.mapsEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  )
}
