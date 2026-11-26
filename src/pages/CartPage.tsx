import { Link } from 'react-router'
import { Icon } from '../app/Icon'
import { ProductImage } from '../features/catalog/ProductGrid'
import { getProductName } from '../features/catalog/productNames'
import { type Product } from '../features/catalog/products'
import { useCart } from '../features/cart/CartContext'

export function CartPage({ products }: { products: Product[] }) {
  const { lines, count, total, changeQuantity, removeProduct } = useCart()

  return (
    <div className="container inner-page">
      <header className="page-heading">
        <h1>Handlekurv</h1>
        <p role="status">{count} {count === 1 ? 'vare' : 'varer'} i handlekurven</p>
      </header>
      {lines.length ? (
        <div className="cart-layout">
          <ul className="cart-items" aria-label="Varer i handlekurven">
            {lines.map((line) => {
              const name = getProductName(line)
              const image = line.thumbnail === `/produkter/${line.id}.webp`
                ? products.find(({ id }) => id === line.id)?.thumbnail ?? ''
                : line.thumbnail
              return (
                <li className="cart-line" key={line.id}>
                  <div className="cart-photo"><ProductImage src={image} alt="" /></div>
                  <div className="cart-product">
                    <h2>{name}</h2>
                    <p>{line.price} USD per stk.</p>
                    <button className="text-link" type="button" aria-label={`Fjern ${name}`}
                      onClick={() => removeProduct(line.id)}>Fjern</button>
                  </div>
                  <div className="quantity" aria-label={`Antall for ${name}`} role="group">
                    <button className="icon-button" type="button" aria-label={`Reduser antall for ${name}`}
                      disabled={line.quantity === 1}
                      onClick={() => changeQuantity(line.id, -1)}><Icon name="minus" size={17} /></button>
                    <span>{line.quantity}</span>
                    <button className="icon-button" type="button" aria-label={`Øk antall for ${name}`}
                      onClick={() => changeQuantity(line.id, 1)}><Icon name="plus" size={17} /></button>
                  </div>
                </li>
              )
            })}
          </ul>
          <aside className="cart-summary">
            <h2>Oppsummering</h2>
            <dl><div><dt>Sum varer</dt><dd>{total} USD</dd></div></dl>
            <Link className="button secondary" to="/varer">Fortsett å handle</Link>
          </aside>
        </div>
      ) : (
        <div className="notice empty-state">
          <Icon name="bag" size={33} />
          <h2>Handlekurven er tom</h2>
          <Link className="button primary" to="/varer">Se vareutvalget</Link>
        </div>
      )}
    </div>
  )
}
