import { useEffect } from 'react'

/** Calls handler when Escape is pressed while active (modals, drawers). */
export default function useEscapeKey(active, handler) {
  useEffect(() => {
    if (!active) return undefined
    const onKey = (e) => e.key === 'Escape' && handler()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, handler])
}
