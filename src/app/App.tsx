import { useEffect, useRef } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router'
import { CartProvider, useCart } from '../features/cart/CartContext'
import { useCatalogChanges } from '../features/catalog/useCatalogChanges'
import { useProducts } from '../features/catalog/useProducts'
import { AdminPage } from '../pages/AdminPage'
import { CartPage } from '../pages/CartPage'
import { CatalogPage } from '../pages/CatalogPage'
import { HomePage } from '../pages/HomePage'
import { Icon } from './Icon'
import { useTheme } from './theme'


// Logo og header, navigasjon og handlekurs
function Brand() {
  return <Link className="brand" to="/" aria-label="Compis – forsiden"><img src="/compis.svg" width="36" height="36" alt="" />Compis</Link>
}

function Header() {
  const { count } = useCart()
  const { theme, toggle } = useTheme()

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <nav className="site-nav" aria-label="Hovedmeny">
          <NavLink to="/" end>Forside</NavLink>
          <NavLink to="/varer">Vareutvalg</NavLink>
          <NavLink to="/admin">Admin</NavLink>
        </nav>
        <div className="header-actions">
          <button className="icon-button theme-button" type="button" aria-label="Mørkt tema"
            aria-pressed={theme === 'dark'} title={theme === 'dark' ? 'Bruk lyst tema' : 'Bruk mørkt tema'} onClick={toggle}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
          </button>
          <NavLink className="cart-link" to="/handlekurv" aria-label={`Handlekurv, ${count} ${count === 1 ? 'vare' : 'varer'}`}>
            <Icon name="bag" size={19} />
            <span className="cart-label">Handlekurv</span>
            <span className="cart-badge" aria-hidden="true">{count}</span>
          </NavLink>
        </div>
      </div>
    </header>
  )
}

// Hovedkomponent for butikken, med ruting og sideinnhold
function Store() {
  const { state: source, retry } = useProducts()
  const { state, products, hidden, addProduct, setProductHidden } = useCatalogChanges(source)
  const { pathname } = useLocation()
  const previousPath = useRef(pathname)
  const main = useRef<HTMLElement>(null)

  // Tabfokus på hovedinnholdet
  useEffect(() => {
    if (previousPath.current !== pathname) {
      main.current?.focus({ preventScroll: true })
      window.scrollTo(0, 0)
    }
    previousPath.current = pathname
  }, [pathname])

  return (
    <>
    {/* Hopp til innholdet-lenke for skjermlesere og tastaturbrukere*/}
      <a className="skip-link" href="#hovedinnhold">Hopp til innholdet</a>
      <Header />
      <main id="hovedinnhold" ref={main} tabIndex={-1}>
        <Routes>
          <Route path="/" element={<HomePage state={state} retry={retry} />} />
          <Route path="/varer" element={<CatalogPage state={state} retry={retry} />} />
          <Route path="/handlekurv" element={<CartPage products={products} />} />
          <Route path="/admin" element={
            <AdminPage state={source} retry={retry} products={products} hidden={hidden}
              addProduct={addProduct} setProductHidden={setProductHidden} />
          } />
          <Route path="*" element={<div className="container inner-page"><h1>Siden finnes ikke</h1><Link className="text-link" to="/">Til forsiden</Link></div>} />
        </Routes>
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <Brand />
          <Link to="/varer" className="text-link">Vareutvalg</Link>
        </div>
      </footer>
    </>
  )
}

export function App() {
  return <CartProvider><Store /></CartProvider>
}
