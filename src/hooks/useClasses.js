// Cordy's Crafts — useClasses hook
// Fetches classes from Supabase on mount; returns { classes, loading }.
// Identical pattern to useProducts (different table name only).

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

export function useClasses() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('classes').select('*')
      .then(({ data, error }) => {
        if (!error && data) setClasses(data)
        setLoading(false)
      })
  }, [])

  return { classes, loading }
}
