import { useSearchParams } from 'react-router'
import { Icon } from '../app/Icon'
import { CatalogFeedback, ProductGrid } from '../features/catalog/ProductGrid'
import { categories, filterProducts, isCategory } from '../features/catalog/products'
import type { CatalogState } from '../features/catalog/useProducts'

export function CatalogPage({ state, retry }: { state: CatalogState; retry: () => void }) {
  const [params, setParams] = useSearchParams()
  const query = params.get('sok') ?? ''
  const rawCategory = params.get('kategori')
  const category = isCategory(rawCategory) ? rawCategory : null
  const products = state.status === 'loading' ? [] : filterProducts(state.products, query, category)
  const showResults = state.status === 'ready' || (state.status === 'error' && state.products.length > 0)

  // Oppdaterer søkefilter i URL-en, og trigger nytt kall til katalogen
  function updateFilter(key: string, value: string, replace = false) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace, preventScrollReset: true })
  }

  return (
    <div className="container inner-page">
      <header className="page-heading">
        <h1>Vareutvalg</h1>
        <p>Se alle plagg, eller finn noe bestemt med søk og kategori.</p>
      </header>
      <div className="fields filters">
        <div className="search-field">
          <label htmlFor="search-products">Søk etter klær</label>
          <div className="search-input">
            <Icon name="search" size={20} />
            <input id="search-products" type="search" placeholder="Søk etter et plagg"
              value={query} onChange={(event) => updateFilter('sok', event.target.value, true)} />
          </div>
        </div>
        <div>
          <label htmlFor="product-category">Kategori</label>
          <select id="product-category" value={category ?? ''} onChange={(event) => updateFilter('kategori', event.target.value)}>
            <option value="">Alle kategorier</option>
            {Object.entries(categories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
      </div>
      <CatalogFeedback state={state} retry={retry} />
      {showResults && (
        <section aria-labelledby="results-heading" className="results">
          <h2 className="sr-only" id="results-heading">Varer som matcher</h2>
          <p role="status" className="result-count">{products.length} {products.length === 1 ? 'vare' : 'varer'}</p>
          {products.length > 0 ? <ProductGrid products={products} /> : (
            <div className="notice empty-state">
              <h3>Ingen varer funnet</h3>
              {query || category ? (
                <button className="button secondary" type="button" onClick={() => setParams({})}>Nullstill filtre</button>
              ) : null}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
