import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { readStorage, writeStorage } from '../../app/storage'
import type { Product } from '../catalog/products'

type CartProduct = Pick<Product, 'id' | 'title' | 'price' | 'thumbnail'>
interface CartLine extends CartProduct { quantity: number }
interface Cart {
  lines: CartLine[]
  count: number
  total: number
  addProduct: (product: CartProduct) => void
  changeQuantity: (id: number, change: 1 | -1) => void
  removeProduct: (id: number) => void
}

const storageKey = 'compis-cart'
const CartContext = createContext<Cart | null>(null)

// Er en lagret oppføring gyldig?
function isCartItem(cartItem: unknown): cartItem is CartLine {
  if (cartItem === null || typeof cartItem !== 'object') return false

  const { id, title, thumbnail, price, quantity } = cartItem as Record<string, unknown>
  return (
    Number.isSafeInteger(id)
    && typeof title === 'string'
    && typeof thumbnail === 'string'
    && typeof price === 'number' && Number.isFinite(price) && price >= 0
    && typeof quantity === 'number' && Number.isSafeInteger(quantity) && quantity > 0
  )
}

function loadCart(): CartLine[] {
  const saved = readStorage(storageKey)
  if (!Array.isArray(saved)) return []

  return saved.filter(isCartItem).map((cartItem) => ({ ...cartItem, price: Math.round(cartItem.price) }))
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState(loadCart)

  useEffect(() => writeStorage(storageKey, lines), [lines])

  function addProduct({ id, title, price, thumbnail }: CartProduct) {
    const product = { id, title, price, thumbnail }
    setLines((current) => {
      const existing = current.find((cartItem) => cartItem.id === id)
      if (!existing) return [...current, { ...product, quantity: 1 }]
      return current.map((cartItem) => cartItem.id === id
        ? { ...product, quantity: cartItem.quantity + 1 }
        : cartItem)
    })
  }

  function changeQuantity(id: number, change: 1 | -1) {
    setLines((current) => current.map((cartItem) => cartItem.id === id
      ? { ...cartItem, quantity: Math.max(1, cartItem.quantity + change) }
      : cartItem))
  }

  function removeProduct(id: number) {
    setLines((current) => current.filter((cartItem) => cartItem.id !== id))
  }

  const count = lines.reduce((sum, cartItem) => sum + cartItem.quantity, 0)
  const total = lines.reduce((sum, cartItem) => sum + cartItem.price * cartItem.quantity, 0)
  const cart = { lines, count, total, addProduct, changeQuantity, removeProduct }

  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>
}

export function useCart() {
  const cart = useContext(CartContext)
  if (!cart) throw new Error('Handlekurven krever CartProvider')
  return cart
}
