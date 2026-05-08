import { useState, useEffect } from 'react'

export function useBreakpoint() {
  const getBreakpoint = () => {
    const w = window.innerWidth
    if (w <= 640) return 'mobile'
    if (w <= 1024) return 'tablet'
    return 'desktop'
  }

  const [bp, setBp] = useState(getBreakpoint)

  useEffect(() => {
    const onResize = () => setBp(getBreakpoint())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return bp
}
