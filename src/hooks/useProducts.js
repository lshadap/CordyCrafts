// Cordy's Crafts — useProducts hook
// Fetches products from Supabase on mount; returns { products, loading }.
// On error: silent — products stays as [], loading goes false (per 02-CONTEXT.md Area 2).
// Phase 2 has no skeleton/error UI; ProductGrid returns null while loading.

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('products').select('*')
      .then(({ data, error }) => {
        if (!error && data) setProducts(data)
        setLoading(false)
      })
  }, [])

  return { products, loading }
}
