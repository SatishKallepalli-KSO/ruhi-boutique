import { collections, type DictKey, type Lang } from '../content'

type Props = {
  lang: Lang
  tx: (key: DictKey) => string
  onBook: () => void
  onStitch: () => void
}

export function CollectionsPortal({ lang, tx, onBook, onStitch }: Props) {
  return (
    <section className="portal collections-portal">
      <div className="section-head section-head-premium">
        <h2>{tx('collectionsTitle')}</h2>
        <p>{tx('collectionsIntro')}</p>
      </div>
      <div className="collections-stack">
        {collections.map((item) => (
          <article key={item.id} className="collection-band">
            <div className="collection-band-media">
              <img src={item.image} alt="" loading="lazy" decoding="async" />
            </div>
            <div className="collection-band-copy">
              <h3>{item[lang].title}</h3>
              <p>{item[lang].body}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="section-cta-row">
        <button type="button" className="btn btn-primary" onClick={onBook}>
          {tx('bookNow')}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onStitch}>
          {tx('navStitch')}
        </button>
      </div>
    </section>
  )
}
