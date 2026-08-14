import { collections, type DictKey, type Lang } from '../content'

type Props = {
  lang: Lang
  tx: (key: DictKey) => string
  onBook: () => void
  onStitch: () => void
}

export function CollectionsPortal({ lang, tx, onBook, onStitch }: Props) {
  return (
    <section className="portal collections-luxe">
      <div className="collections-luxe-hero">
        <p className="section-eyebrow">{tx('lookbookTitle')}</p>
        <h2>{tx('collectionsTitle')}</h2>
        <p>{tx('collectionsIntro')}</p>
      </div>

      <div className="collections-luxe-grid">
        {collections.map((item, index) => (
          <article key={item.id} className={`collections-luxe-card span-${(index % 3) + 1}`}>
            <div className="collections-luxe-media">
              <img src={item.image} alt="" loading={index < 2 ? 'eager' : 'lazy'} decoding="async" />
            </div>
            <div className="collections-luxe-copy">
              <h3>{item[lang].title}</h3>
              <p>{item[lang].body}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="section-cta-row section-cta-center">
        <button type="button" className="btn btn-gold" onClick={onBook}>
          {tx('bookNow')}
        </button>
        <button type="button" className="btn btn-ink" onClick={onStitch}>
          {tx('navStitch')}
        </button>
      </div>
    </section>
  )
}
