// WhatsApp message builder tests — covers WA-01, WA-02, WA-03
// RED until Plan 02 ships src/lib/whatsapp.js
// Run: npx vitest run whatsapp.test

import { buildOrderMessage, buildBookingMessage, buildWaUrl } from '../lib/whatsapp.js'

const orderForm = { name: 'Priya', phone: '9876543210', addr: '12 MG Road, Bengaluru' }
const orderItems = [
  { sku: 'p01', name: 'Stamped Birthday Card', qty: 2, price: 180 },
  { sku: 'k01', name: 'Rose Garden Soy Candle', qty: 1, price: 650 },
]
const orderTotal = 1010

describe('buildOrderMessage — WA-01', () => {
  it('starts with "New Order" header', () => {
    expect(buildOrderMessage(orderForm, orderItems, orderTotal).startsWith('New Order')).toBe(true)
  })
  it('contains customer name line', () => {
    expect(buildOrderMessage(orderForm, orderItems, orderTotal)).toContain('Name: Priya')
  })
  it('contains phone line', () => {
    expect(buildOrderMessage(orderForm, orderItems, orderTotal)).toContain('Phone: 9876543210')
  })
  it('contains address line when address present', () => {
    expect(buildOrderMessage(orderForm, orderItems, orderTotal)).toContain('Address: 12 MG Road, Bengaluru')
  })
  it('renders address fallback when address empty', () => {
    const formNoAddr = { ...orderForm, addr: '' }
    expect(buildOrderMessage(formNoAddr, orderItems, orderTotal)).toContain('Address: Not provided')
  })
  it('contains item lines with qty and line total in rupees', () => {
    const msg = buildOrderMessage(orderForm, orderItems, orderTotal)
    expect(msg).toContain('- Stamped Birthday Card x2 ₹360')
    expect(msg).toContain('- Rose Garden Soy Candle x1 ₹650')
  })
  it('contains grand total line in rupees', () => {
    expect(buildOrderMessage(orderForm, orderItems, orderTotal)).toContain('Total: ₹1010')
  })
})

const bookingKlass = { id: 'uuid-abc-123', name: 'Card Making with Stamps' }
const bookingFormBase = { name: 'Priya', phone: '9876543210', seats: 2, pref: 'Online', note: '' }

describe('buildBookingMessage — WA-02', () => {
  it('starts with "New Booking" header', () => {
    expect(buildBookingMessage(bookingFormBase, bookingKlass).startsWith('New Booking')).toBe(true)
  })
  it('contains class name line', () => {
    expect(buildBookingMessage(bookingFormBase, bookingKlass)).toContain('Class: Card Making with Stamps')
  })
  it('contains customer name line', () => {
    expect(buildBookingMessage(bookingFormBase, bookingKlass)).toContain('Name: Priya')
  })
  it('contains seats line', () => {
    expect(buildBookingMessage(bookingFormBase, bookingKlass)).toContain('Seats: 2')
  })
  it('contains mode line', () => {
    expect(buildBookingMessage(bookingFormBase, bookingKlass)).toContain('Mode: Online')
  })
  it('omits Notes line when note is empty string', () => {
    expect(buildBookingMessage(bookingFormBase, bookingKlass)).not.toContain('Notes:')
  })
  it('includes Notes line when note has content', () => {
    const formWithNote = { ...bookingFormBase, note: 'Veg food only' }
    expect(buildBookingMessage(formWithNote, bookingKlass)).toContain('Notes: Veg food only')
  })
})

describe('buildWaUrl — WA-03', () => {
  it('uses VITE_WHATSAPP_NUMBER from import.meta.env (not hardcoded)', () => {
    // import.meta.env.VITE_WHATSAPP_NUMBER is injected by Vite at test time from .env / vitest config
    // The function must read it dynamically, not embed a literal number
    const url = buildWaUrl('hello world')
    expect(url.startsWith('https://wa.me/')).toBe(true)
    // Number must come from env — assert the URL contains whatever the env provides
    expect(url).toContain(import.meta.env.VITE_WHATSAPP_NUMBER || '')
  })
  it('encodes the message via encodeURIComponent (spaces become %20 or +)', () => {
    const url = buildWaUrl('hello world ₹100')
    // encodeURIComponent encodes space as %20 and ₹ as %E2%82%B9
    expect(url).toContain('text=hello%20world')
    expect(url).toContain('%E2%82%B9100')
  })
  it('preserves newlines in encoded form (%0A)', () => {
    const url = buildWaUrl('line1\nline2')
    expect(url).toContain('line1%0Aline2')
  })
})
