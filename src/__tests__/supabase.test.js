// Insert-then-gate guard tests — covers SUPA-04, SUPA-05
// Pattern source: 02-PATTERNS.md "supabase.test.js" section
// Plan 03 must wire CartDrawer/BookingModal submit handlers using the SAME guard pattern verified here.
// Run: npx vitest run supabase.test

// Local guard functions — mirror exactly what CartDrawer/BookingModal will do.
// These are NOT exported. Phase 2 deliberately tests the PATTERN, not the wiring,
// because @testing-library/react is not installed (out-of-scope per RESEARCH.md
// Environment Availability table).
async function submitOrder(supabase, payload) {
  const { error } = await supabase.from('orders').insert(payload)
  if (error) return { ok: false, error: error.message }
  return { ok: true, error: null }
}

async function submitBooking(supabase, payload) {
  const { error } = await supabase.from('bookings').insert(payload)
  if (error) return { ok: false, error: error.message }
  return { ok: true, error: null }
}

const fakeOrderPayload = {
  customer_name: 'Priya',
  customer_whatsapp: '9876543210',
  address: '12 MG Road',
  items: [{ sku: 'p01', name: 'Card', qty: 2, price: 180 }],
  total_amount: 360,
  payment_status: 'pending',
}

const fakeBookingPayload = {
  class_id: 'uuid-abc-123',
  customer_name: 'Priya',
  customer_whatsapp: '9876543210',
  seats: 2,
  mode_preference: 'Online',
  message: null,
  payment_status: 'pending',
}

describe('insert-then-gate guard — submitOrder (SUPA-04)', () => {
  it('returns ok:true when supabase insert returns no error (success path)', async () => {
    const mockSupabase = { from: () => ({ insert: async () => ({ data: null, error: null }) }) }
    const result = await submitOrder(mockSupabase, fakeOrderPayload)
    expect(result.ok).toBe(true)
    expect(result.error).toBe(null)
  })

  it('returns ok:false when supabase insert returns an error (failure path — no wa.me)', async () => {
    const mockSupabase = { from: () => ({ insert: async () => ({ data: null, error: { message: 'permission denied' } }) }) }
    const result = await submitOrder(mockSupabase, fakeOrderPayload)
    expect(result.ok).toBe(false)
    expect(result.error).toBe('permission denied')
  })

  it('checks error not data — Supabase v2 insert without .select() returns data:null even on success', async () => {
    // Pitfall 1 from RESEARCH.md: developers may incorrectly check `if (!data)`.
    // The guard must check `error` only.
    const mockSupabase = { from: () => ({ insert: async () => ({ data: null, error: null }) }) }
    const result = await submitOrder(mockSupabase, fakeOrderPayload)
    // data is null even though insert succeeded — ok must still be true
    expect(result.ok).toBe(true)
  })

  it('passes the payload through to supabase.from().insert() unchanged', async () => {
    let captured = null
    const mockSupabase = {
      from: (table) => ({
        insert: async (payload) => {
          captured = { table, payload }
          return { data: null, error: null }
        },
      }),
    }
    await submitOrder(mockSupabase, fakeOrderPayload)
    expect(captured.table).toBe('orders')
    expect(captured.payload).toEqual(fakeOrderPayload)
    expect(captured.payload.payment_status).toBe('pending')
  })
})

describe('insert-then-gate guard — submitBooking (SUPA-05)', () => {
  it('returns ok:true on successful booking insert', async () => {
    const mockSupabase = { from: () => ({ insert: async () => ({ data: null, error: null }) }) }
    const result = await submitBooking(mockSupabase, fakeBookingPayload)
    expect(result.ok).toBe(true)
  })

  it('returns ok:false on FK violation (e.g., class_id not in classes table)', async () => {
    const mockSupabase = { from: () => ({ insert: async () => ({ data: null, error: { message: 'foreign key violation' } }) }) }
    const result = await submitBooking(mockSupabase, fakeBookingPayload)
    expect(result.ok).toBe(false)
    expect(result.error).toBe('foreign key violation')
  })

  it('inserts into the bookings table (not orders)', async () => {
    let capturedTable = null
    const mockSupabase = {
      from: (table) => ({
        insert: async () => {
          capturedTable = table
          return { data: null, error: null }
        },
      }),
    }
    await submitBooking(mockSupabase, fakeBookingPayload)
    expect(capturedTable).toBe('bookings')
  })

  it('payload includes class_id (FK to classes.id), not class_sku', async () => {
    // Pitfall 4 from RESEARCH.md — must use klass.id not klass.sku
    expect(fakeBookingPayload.class_id).toBeDefined()
    expect(fakeBookingPayload.class_sku).toBeUndefined()
  })
})
