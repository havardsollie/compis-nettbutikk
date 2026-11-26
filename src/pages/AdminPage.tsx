import { useRef, useState, type FormEvent } from 'react'
import { CatalogFeedback, ProductImage } from '../features/catalog/ProductGrid'
import { getProductName } from '../features/catalog/productNames'
import { categories, isCategory, type Product } from '../features/catalog/products'
import type { NewProduct } from '../features/catalog/useCatalogChanges'
import type { CatalogState } from '../features/catalog/useProducts'

interface AdminPageProps {
  state: CatalogState
  retry: () => void
  products: Product[]
  hidden: number[]
  addProduct: (product: NewProduct) => void
  setProductHidden: (id: number, hidden: boolean) => void
}

const sessionKey = 'compis-admin-session'

function hasAdminSession() {
  try {
    return sessionStorage.getItem(sessionKey) === 'true'
  } catch {
    return false
  }
}

export function AdminPage(props: AdminPageProps) {
  const [signedIn, setSignedIn] = useState(hasAdminSession)
  const heading = useRef<HTMLHeadingElement>(null)

  function updateSession(active: boolean) {
    setSignedIn(active)
    try {
      if (active) sessionStorage.setItem(sessionKey, 'true')
      else sessionStorage.removeItem(sessionKey)
    } catch {
      // Innloggingen gjelder for den åpne siden
    }
    heading.current?.focus()
  }

  return (
    <div className="container inner-page admin-page">
      <header className="page-heading section-heading">
        <div>
          <h1 ref={heading} tabIndex={-1}>Administrasjon</h1>
          <p>{signedIn ? '' : 'Logg inn for å administrere varer.'}</p>
        </div>
        {signedIn && <button className="button secondary" type="button" onClick={() => updateSession(false)}>Logg ut</button>}
      </header>

      {signedIn ? <AdminProducts {...props} /> : <AdminLogin onLogin={() => updateSession(true)} />}
    </div>
  )
}

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [error, setError] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    // Lar oss gå videre ller vise feilmelding uten å laste inn siden på nytt
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    if (data.get('username') === 'admin' && data.get('password') === 'admin') {
      onLogin()
    } else {
      setError('Feil brukernavn eller passord!')
    }
  }

  return (
    <form className="notice fields admin-form admin-login" aria-labelledby="admin-login-heading" onSubmit={submit}>
      <h2 id="admin-login-heading">Logg inn</h2>
      <div>
        <label htmlFor="admin-username">Brukernavn</label>
        <input id="admin-username" name="username" autoComplete="username" required />
      </div>
      <div>
        <label htmlFor="admin-password">Passord</label>
        <input id="admin-password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {error && <p role="alert" className='login-error'>{error}</p>}
      <button className="button primary" type="submit">Logg inn</button>
    </form>
  )
}

function AdminProducts({ state, retry, products, hidden, addProduct, setProductHidden }: AdminPageProps) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    // Lar oss gå videre eller vise feilmelding uten å laste inn siden på nytt
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const title = String(data.get('title') ?? '').trim()
    const category = String(data.get('category') ?? '')
    const price = Number(data.get('price') || NaN)
    const thumbnail = String(data.get('thumbnail') ?? '').trim()
    const description = String(data.get('description') ?? '').trim()
    setMessage('')
    setError('')

    if (!title || !isCategory(category) || !Number.isSafeInteger(price) || price < 0) {
      setError('Fyll inn produktnavn, kategori og en pris i hele dollar.')
      return
    }

    if (thumbnail && !/^https?:\/\//i.test(thumbnail)) {
      setError('Bildeadressen må starte med https:// eller http://.')
      return
    }

    addProduct({ title, category, price, thumbnail, description })
    form.reset()
    setMessage(`${title} ble lagt til i vareutvalget.`)
  }

  return (
    <>
      <form className="notice fields admin-form" aria-labelledby="new-product-heading" onSubmit={submit}>
        <h2 id="new-product-heading" className="admin-wide">Legg til vare</h2>
        <div>
          <label htmlFor="admin-title">Produktnavn</label>
          <input id="admin-title" name="title" required maxLength={100} />
        </div>
        <div>
          <label htmlFor="admin-price">Pris</label>
          <input id="admin-price" name="price" type="number" min="0" step="1" required />
        </div>
        <div>
          <label htmlFor="admin-category">Kategori</label>
          <select id="admin-category" name="category" required defaultValue="">
            <option value="" disabled>Velg kategori</option>
            {Object.entries(categories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="admin-thumbnail">Bildeadresse (valgfritt)</label>
          <input id="admin-thumbnail" name="thumbnail" type="url" placeholder="https://" />
        </div>
        <div className="admin-wide">
          <label htmlFor="admin-description">Beskrivelse (valgfritt)</label>
          <textarea id="admin-description" name="description" rows={3} maxLength={500} />
        </div>
        {error && <p className="admin-wide" role="alert">{error}</p>}
        <button className="button primary" type="submit">Legg til vare</button>
      </form>

      <p role="status" className={message ? 'notice' : 'sr-only'}>{message}</p>

      <section aria-labelledby="manage-products-heading">
        <div className="section-heading">
          <h2 id="manage-products-heading">Administrer varer</h2>
        </div>
        <CatalogFeedback state={state} retry={retry} />
        {products.length > 0 && (
          <ul className="cart-items" aria-label="Varer du kan administrere">
            {products.map((product) => {
              const name = getProductName(product)
              const isHidden = hidden.includes(product.id)
              const action = isHidden ? 'Gjenopprett' : 'Fjern'
              return (
                <li className="cart-line" key={product.id}>
                  <div className="cart-photo"><ProductImage src={product.thumbnail} alt="" /></div>
                  <div className="cart-product">
                    <h3 lang={product.id > 0 && name === product.title ? 'en' : undefined}>{name}</h3>
                    <p>{categories[product.category]} · {product.price} USD</p>
                    {isHidden && <p>Fjernet fra butikken</p>}
                  </div>
                  <button className="button secondary admin-action" type="button" aria-label={`${action} ${name}`}
                    onClick={() => {
                      setProductHidden(product.id, !isHidden)
                      setMessage(isHidden ? `${name} ble gjenopprettet.` : `${name} ble fjernet fra vareutvalget.`)
                    }}>
                    {action}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        {state.status === 'ready' && products.length === 0 && <p className="notice">Ingen varer å administrere.</p>}
      </section>
    </>
  )
}
