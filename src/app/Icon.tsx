const shapes = {
  bag: <><path d="M5 8h14l1 13H4L5 8Z" /><path d="M9 10V6a3 3 0 0 1 6 0v4" /></>,
  search: <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></>,
  moon: <path d="M20.4 15.1A8.5 8.5 0 0 1 8.9 3.6 8.7 8.7 0 1 0 20.4 15.1Z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  check: <path d="m5 12 4 4L19 6" />,
  image: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="m3 17 5-5 5 5 3-3 5 5" /><circle cx="15" cy="9" r="1" /></>,
}

export function Icon({ name, size = 22 }: { name: keyof typeof shapes; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {shapes[name]}
    </svg>
  )
}
