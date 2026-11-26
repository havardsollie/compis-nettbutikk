import { Link } from 'react-router'
import { CatalogFeedback, ProductGrid } from '../features/catalog/ProductGrid'
import type { CatalogState } from '../features/catalog/useProducts'

export function HomePage({ state, retry }: { state: CatalogState; retry: () => void }) {
  const featured = state.status === 'loading' ? [] : state.products.slice(0, 4)

  return (
    <div className="container home">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title"><span lang="en">Black Friday</span><br /><span className="hero-accent">pop-up</span></h1>
          <p>Finn dine favoritter blant skjorter og kjoler.</p>
          <Link to="/varer" className="button primary">Se vareutvalget</Link>
        </div>
        <div className="hero-media">
          <img className="hero-image" src="/garderobe.jpg" alt="Lyse jakker og kåper på et klesstativ" fetchPriority="high" />
        </div>
      </section>
      <section className="new-arrivals" aria-labelledby="new-arrivals">
        <div className="section-heading">
          <div>
            <h2 id="new-arrivals">Nyheter</h2>
            <p>De siste tilskuddene til vareutvalget.</p>
          </div>
          <Link className="text-link" to="/varer">Se alle varer</Link>
        </div>
        <CatalogFeedback state={state} retry={retry} />
        {featured.length > 0 && <ProductGrid products={featured} isNew />}
      </section>
    </div>
  )
}
