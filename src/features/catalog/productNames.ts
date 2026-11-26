const productNames: Partial<Record<number, string>> = {
  83: 'Backup-skjorta',
  84: 'Kul t-skjorte',
  85: 'Telttur-skjorte',
  86: 'Granca ølmage',
  87: 'Rutete skjorte',
  162: 'Blåmanet',
  163: 'Ananas',
  164: 'Mormor',
  165: 'Brudepike',
  166: 'NewYork 2003',
  177: 'Kjole 1',
  178: 'Galla',
  179: 'Heks',
  180: 'Klatretrøya',
  181: 'Det dyre lappeteppet',
}

export function getProductName(product: { id: number; title: string }) {
  return productNames[product.id]?.trim() || product.title
}
