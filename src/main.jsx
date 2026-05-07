import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import '../colors_and_type.css'
import { CartProvider } from './CartContext.jsx'
import App from './App.jsx'

const REQUIRED_VARS = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_WHATSAPP_NUMBER']
const missing = REQUIRED_VARS.filter(k => !import.meta.env[k])
if (missing.length > 0) {
  document.getElementById('root').innerHTML =
    `<pre style="color:red;padding:2rem">Missing env vars:\n${missing.join('\n')}</pre>`
  throw new Error(`Missing env vars: ${missing.join(', ')}`)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <CartProvider>
      <Routes>
        <Route path="/" element={<App />} />
      </Routes>
    </CartProvider>
  </BrowserRouter>
)
