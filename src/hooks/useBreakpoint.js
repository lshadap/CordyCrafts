import { useState, useLayoutEffect } from 'react'

function getBreakpoint() {
  const w = window.innerWidth
  if (w <= 640) return 'mobile'
  if (w <= 1024) return 'tablet'
  return 'desktop'
}

export function useBreakpoint() {
  const [bp, setBp] = useState(getBreakpoint)
  useLayoutEffect(() => {
    setBp(getBreakpoint())
    const onResize = () => setBp(getBreakpoint())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return bp
}
