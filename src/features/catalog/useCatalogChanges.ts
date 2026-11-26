import { useEffect, useState } from 'react'
import { readStorage, writeStorage } from '../../app/storage'
import { isCategory, sortNewestFirst, type Product } from './products'
import type { CatalogState } from './useProducts'

export type NewProduct = Omit<Product, 'id' | 'meta'>

// Post eller delete
interface CatalogChanges {
  added: Product[]
  hidden: number[]
}

const storageKey = 'compis-catalog-changes'

// Laster inn endringer fra localStorage, og filtrerer ut ugyldige
function loadChanges(): CatalogChanges {
  const saved = readStorage(storageKey) as Partial<CatalogChanges> | null
  const added = Array.isArray(saved?.added) ? saved.added : []

  return {
    added: added
      // Negativ id er produkt lagt til lokalt, og ikke finnes i API-et
      .filter((product) => product && product.id < 0 && isCategory(product.category))
      .map((product) => ({ ...product, price: Math.round(product.price) })),
    hidden: Array.isArray(saved?.hidden) ? saved.hidden.filter(Number.isSafeInteger) : [],
  }
}

// Håndterer endringer i katalogen, som er lagret i localStorage, og kombinerer dem med produkter fra API-et
export function useCatalogChanges(source: CatalogState) {
  const [changes, setChanges] = useState(loadChanges)
  useEffect(() => writeStorage(storageKey, changes), [changes])

  const apiProducts = source.status === 'ready' ? source.products : []
  const products = sortNewestFirst([...changes.added, ...apiProducts])

  const state: CatalogState = source.status !== 'loading'
    ? { ...source, products: products.filter(({ id }) => !changes.hidden.includes(id)) }
    : source

  function addProduct(product: NewProduct) {
    const createdAt = new Date().toISOString()
    setChanges((current) => {
      const id = Math.min(0, ...current.added.map((item) => item.id)) - 1
      const added = { ...product, id, meta: { createdAt } }
      return { ...current, added: [...current.added, added] }
    })
  }

  function setProductHidden(id: number, hidden: boolean) {
    setChanges((current) => ({
      ...current,
      hidden: hidden
        ? [...new Set([...current.hidden, id])]
        : current.hidden.filter((productId) => productId !== id),
    }))
  }

  return { state, products, hidden: changes.hidden, addProduct, setProductHidden }
}
