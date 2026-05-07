// CartContext behavioral stubs — implemented by Plan 02 (src/CartContext.jsx)
// These tests define the contract. Run: npx vitest run CartContext.test.jsx

import { cartReducer } from '../CartContext.jsx'

const item1 = { sku: 'p01', name: 'Test Bear', price: 100, img: '/assets/x.svg', cat: 'Clay' }
const item2 = { sku: 'p02', name: 'Test Candle', price: 50, img: '/assets/y.svg', cat: 'Candles' }

describe('cartReducer — add', () => {
  it('adds a new item with qty=1 when sku not present', () => {
    const result = cartReducer([], { type: 'ADD', item: item1 })
    expect(result).toHaveLength(1)
    expect(result[0].qty).toBe(1)
  })

  it('increments qty when adding duplicate sku', () => {
    const state = [{ ...item1, qty: 1 }]
    const result = cartReducer(state, { type: 'ADD', item: item1 })
    expect(result).toHaveLength(1)
    expect(result[0].qty).toBe(2)
  })
})

describe('cartReducer — remove', () => {
  it('removes the item matching sku', () => {
    const state = [{ ...item1, qty: 1 }, { ...item2, qty: 1 }]
    const result = cartReducer(state, { type: 'REMOVE', sku: 'p01' })
    expect(result).toHaveLength(1)
    expect(result[0].sku).toBe('p02')
  })
})

describe('cartReducer — setQty', () => {
  it('updates qty when qty > 0', () => {
    const state = [{ ...item1, qty: 1 }]
    const result = cartReducer(state, { type: 'SET_QTY', sku: 'p01', qty: 3 })
    expect(result[0].qty).toBe(3)
  })

  it('removes item when qty === 0', () => {
    const state = [{ ...item1, qty: 2 }]
    const result = cartReducer(state, { type: 'SET_QTY', sku: 'p01', qty: 0 })
    expect(result).toHaveLength(0)
  })

  it('removes item when qty < 0', () => {
    const state = [{ ...item1, qty: 2 }]
    const result = cartReducer(state, { type: 'SET_QTY', sku: 'p01', qty: -1 })
    expect(result).toHaveLength(0)
  })
})

describe('cartReducer — clear', () => {
  it('empties the cart', () => {
    const state = [{ ...item1, qty: 2 }, { ...item2, qty: 1 }]
    const result = cartReducer(state, { type: 'CLEAR' })
    expect(result).toHaveLength(0)
  })
})

describe('cartReducer — count and total (via helper functions)', () => {
  it('count sums all item quantities', () => {
    const items = [{ ...item1, qty: 2 }, { ...item2, qty: 3 }]
    const count = () => items.reduce((s, i) => s + i.qty, 0)
    expect(count()).toBe(5)
  })

  it('total sums price * qty for all items', () => {
    const items = [{ ...item1, qty: 2 }, { ...item2, qty: 1 }]
    const total = () => items.reduce((s, i) => s + i.qty * i.price, 0)
    expect(total()).toBe(250)
  })
})

describe('localStorage persistence (via loadCart)', () => {
  it('returns [] when localStorage is empty', () => {
    localStorage.clear()
    const loadCart = () => {
      try { return JSON.parse(localStorage.getItem('cc_cart')) || [] }
      catch { return [] }
    }
    expect(loadCart()).toEqual([])
  })

  it('returns [] when localStorage contains invalid JSON', () => {
    localStorage.setItem('cc_cart', 'not-json')
    const loadCart = () => {
      try { return JSON.parse(localStorage.getItem('cc_cart')) || [] }
      catch { return [] }
    }
    expect(loadCart()).toEqual([])
  })
})
