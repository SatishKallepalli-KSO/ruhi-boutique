import { collections, type DictKey, type Lang } from '../content'

type Props = {
  lang: Lang
  tx: (key: DictKey) => string
  onBook: () => void
  onStitch: () => void
}

export function CollectionsPortal({ lang, tx, onBook, onStitch }: Props) {
  return (
    <section className="portal">
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
      <div className="hero-actions" style={{ marginTop: '1.5rem' }}>
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
