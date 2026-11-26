import { useEffect, useState } from 'react'
import { fetchProducts, type Product } from './products'

export type CatalogState =
  | { status: 'loading' }
  | { status: 'ready' | 'error'; products: Product[] }

  // Henter produkter fra API-et, og håndterer lastestatus og feil
export function useProducts() {
  const [state, setState] = useState<CatalogState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    // StrictMode mårydde opp før vi sender kallane
    queueMicrotask(() => {
      if (signal.aborted) return

      void fetchProducts(signal)
        .then((products) => {
          if (!signal.aborted) setState({ status: 'ready', products })
        })
        .catch(() => {
          if (signal.aborted) return
          controller.abort()
          setState({ status: 'error', products: [] })
        })
    })

    return () => controller.abort()
  }, [attempt])

  function retry() {
    setState({ status: 'loading' })
    setAttempt((previous) => previous + 1)
  }

  return { state, retry }
}
