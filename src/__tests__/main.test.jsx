// Env var validation stubs — implemented by Plan 06 (src/main.jsx)
// These tests verify the validation logic in isolation.
// Run: npx vitest run main.test.jsx

describe('env var validation logic', () => {
  const REQUIRED_VARS = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_WHATSAPP_NUMBER']

  function findMissing(env) {
    return REQUIRED_VARS.filter(k => !env[k])
  }

  it('returns empty array when all vars are present', () => {
    const env = {
      VITE_SUPABASE_URL: 'https://project.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'anon-key',
      VITE_WHATSAPP_NUMBER: '919876543210',
    }
    expect(findMissing(env)).toHaveLength(0)
  })

  it('reports missing VITE_SUPABASE_URL', () => {
    const env = {
      VITE_SUPABASE_ANON_KEY: 'anon-key',
      VITE_WHATSAPP_NUMBER: '919876543210',
    }
    const missing = findMissing(env)
    expect(missing).toContain('VITE_SUPABASE_URL')
    expect(missing).toHaveLength(1)
  })

  it('reports missing VITE_SUPABASE_ANON_KEY', () => {
    const env = {
      VITE_SUPABASE_URL: 'https://project.supabase.co',
      VITE_WHATSAPP_NUMBER: '919876543210',
    }
    const missing = findMissing(env)
    expect(missing).toContain('VITE_SUPABASE_ANON_KEY')
    expect(missing).toHaveLength(1)
  })

  it('reports missing VITE_WHATSAPP_NUMBER', () => {
    const env = {
      VITE_SUPABASE_URL: 'https://project.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'anon-key',
    }
    const missing = findMissing(env)
    expect(missing).toContain('VITE_WHATSAPP_NUMBER')
    expect(missing).toHaveLength(1)
  })

  it('reports all three vars when all are missing', () => {
    const env = {}
    const missing = findMissing(env)
    expect(missing).toHaveLength(3)
  })

  it('error output contains variable NAMES not values', () => {
    const env = { VITE_SUPABASE_URL: 'secret-value' }
    const missing = findMissing(env)
    const errorMessage = `Missing env vars:\n${missing.join('\n')}`
    expect(errorMessage).toContain('VITE_SUPABASE_ANON_KEY')
    expect(errorMessage).not.toContain('secret-value')
  })
})
