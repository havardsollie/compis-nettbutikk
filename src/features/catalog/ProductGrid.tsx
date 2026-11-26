import { useState } from 'react'
import { Icon } from '../../app/Icon'
import { useCart } from '../cart/CartContext'
import { categories, type Product } from './products'
import { getProductName } from './productNames'
import type { CatalogState } from './useProducts'

export function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [failedSrc, setFailedSrc] = useState<string>()

  // returnerer et bilde-ikon hvis bildet ikke kan lastes inn, eller hvis src er tom
  if (src && src !== failedSrc) {
    return <img src={src} alt={alt} loading="lazy" onError={() => setFailedSrc(src)} />
  }

  return (
    <span className="image-placeholder" aria-hidden="true">
      <Icon name="image" size={29} />
    </span>
  )
}

export function ProductGrid({ products, isNew = false }: { products: Product[]; isNew?: boolean }) {
  const { lines, addProduct } = useCart()
  const [announcement, setAnnouncement] = useState('')

  return (
    <>
      <ul className="product-grid" aria-label={isNew ? 'Nye varer' : 'Varer'}>
        {products.map((product) => {
          const name = getProductName(product)
          const quantity = lines.find((line) => line.id === product.id)?.quantity ?? 0
          return (
            <li className="product-card" key={product.id}>
              <div className="product-photo">
                <ProductImage src={product.thumbnail} alt={name} />
                {isNew && <span className="new-label">Nyhet</span>}
              </div>
              <div className="product-info">
                <p className="product-category">{categories[product.category]}</p>
                <h3 lang={product.id > 0 && name === product.title ? 'en' : undefined}>{name}</h3>
                <div className="product-actions">
                  <div>
                    <span className="price">{product.price} USD</span>
                    {quantity > 0 && <p className="product-quantity">{quantity} i kurven</p>}
                  </div>
                  <button
                    className="icon-button add-to-cart"
                    type="button"
                    title={quantity ? `${quantity} i handlekurven. Legg til én til` : 'Legg i handlekurven'}
                    aria-label={`Legg ${name} i handlekurven`}
                    onClick={() => {
                      addProduct(product)
                      setAnnouncement(`${name} lagt i handlekurven. Antall: ${quantity + 1}.`)
                    }}
                  >
                    <Icon name={quantity ? 'check' : 'plus'} size={19} />
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      {  // Skjermlesere får beskjed når et produkt legges i handlekurven
}
      <span className="sr-only" role="status">{announcement}</span>
    </>
  )
}

// Status mtp server som komponenter kan lese of vise til brukeren
export function CatalogFeedback({ state, retry }: { state: CatalogState; retry: () => void }) {
  if (state.status === 'loading') {
    return <p className="notice" role="status">Henter varer …</p>
  }
  if (state.status === 'error') {
    return (
      <div className="notice notice-retry">
        <p role="status">Vi fikk ikke hentet varene fra APIet.</p>
        <button className="button secondary" type="button" onClick={retry}>Prøv igjen</button>
      </div>
    )
  }
  return null
}
