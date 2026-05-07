// Cordy's Crafts — Cart state (replaces window.cart pub-sub store)
import React from 'react'

const CartContext = React.createContext(null)

export function cartReducer(items, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = items.find(i => i.sku === action.item.sku)
      if (existing) return items.map(i =>
        i.sku === action.item.sku ? { ...i, qty: i.qty + (action.item.qty || 1) } : i
      )
      return [...items, { ...action.item, qty: action.item.qty || 1 }]
    }
    case 'REMOVE':
      return items.filter(i => i.sku !== action.sku)
    case 'SET_QTY':
      if (action.qty <= 0) return items.filter(i => i.sku !== action.sku)
      return items.map(i => i.sku === action.sku ? { ...i, qty: action.qty } : i)
    case 'CLEAR':
      return []
    default:
      return items
  }
}

const STORAGE_KEY = 'cc_cart'

function loadCart() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }
  catch { return [] }
}

export function CartProvider({ children }) {
  const [items, dispatch] = React.useReducer(cartReducer, null, loadCart)

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const count = () => items.reduce((s, i) => s + i.qty, 0)
  const total = () => items.reduce((s, i) => s + i.qty * i.price, 0)

  const value = {
    items,
    add: (item) => dispatch({ type: 'ADD', item }),
    remove: (sku) => dispatch({ type: 'REMOVE', sku }),
    setQty: (sku, qty) => dispatch({ type: 'SET_QTY', sku, qty }),
    clear: () => dispatch({ type: 'CLEAR' }),
    count,
    total,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCartContext() {
  return React.useContext(CartContext)
}
