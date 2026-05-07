// Cordy's Crafts — WhatsApp message builders + URL constructor
// Pure functions — covered by src/__tests__/whatsapp.test.js (WA-01, WA-02, WA-03)
//
// CRITICAL: Never log form values from these functions — orders/bookings contain PII
// (customer name, phone, address). Per CLAUDE.md and 02-RESEARCH.md Security Domain.

export function buildOrderMessage(form, items, total) {
  const lines = [
    'New Order',
    `Name: ${form.name}`,
    `Phone: ${form.phone}`,
    `Address: ${form.addr || 'Not provided'}`,
    '',
    'Items:',
    ...items.map(i => `- ${i.name} x${i.qty} ₹${i.qty * i.price}`),
    '',
    `Total: ₹${total}`,
  ]
  return lines.join('\n')
}

export function buildBookingMessage(form, klass) {
  const lines = [
    'New Booking',
    `Class: ${klass.name}`,
    ...(klass.date_label ? [`Date: ${klass.date_label}`] : []),
    `Name: ${form.name}`,
    `Phone: ${form.phone}`,
    `Seats: ${form.seats}`,
    `Mode: ${form.pref}`,
  ]
  if (form.note) lines.push(`Notes: ${form.note}`)
  return lines.join('\n')
}

export function buildWaUrl(message) {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
