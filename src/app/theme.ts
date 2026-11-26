import { useEffect, useState } from 'react'
import { readStorage, writeStorage } from './storage'

type Theme = 'light' | 'dark'
const storageKey = 'compis-theme'

function initialTheme(): Theme {
  return readStorage(storageKey) === 'dark' ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState(initialTheme)
  
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function toggle() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    writeStorage(storageKey, next)
  }

  return { theme, toggle }
}
