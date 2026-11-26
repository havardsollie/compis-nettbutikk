import { getProductName } from './productNames'

// Definerer kategorier fra kategori-nøklene
export const categories = {
  'mens-shirts': 'Menn',
  'womens-dresses': 'Kvinner',
} as const

export type Category = keyof typeof categories

export interface Product {
  id: number
  title: string
  description: string
  category: Category
  price: number
  thumbnail: string
  meta: { createdAt: string }
}

// Sjekker om en verdi er en gyldig kategori
export function isCategory(value: string | null): value is Category {
  return value !== null && Object.hasOwn(categories, value)
}

// Henter produkter for hver kategori i parallelt
export async function fetchProducts(signal: AbortSignal): Promise<Product[]> {
  const pages = await Promise.all(
    Object.keys(categories).map(async (category) => {
      const response = await fetch(
        `https://dummyjson.com/products/category/${category}?limit=0&select=id,title,description,category,price,thumbnail,meta`,
        { signal },
      )
      if (!response.ok) throw new Error(`Produkt-API svarte med ${response.status}`)
      const body: { products: Product[] } = await response.json()
      return body.products
    }),
  )
  const products = pages.flat().map((product) => ({ ...product, price: Math.round(product.price) }))
  return sortNewestFirst(products)
}

export function filterProducts(products: Product[], query: string, category: Category | null) {
  const words = query.toLowerCase().match(/\S+/g) ?? []

  return products.filter((product) => {
    if (category && product.category !== category) return false

    const searchText = [
      getProductName(product),
      product.description,
      categories[product.category],
    ].join(' ').toLowerCase()

    return words.every((word) => searchText.includes(word))
  })
}

export function sortNewestFirst(products: Product[]) {
  return products.sort((a, b) =>
    Date.parse(b.meta.createdAt) - Date.parse(a.meta.createdAt) || b.id - a.id,
  )
}
