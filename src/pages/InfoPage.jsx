import React from 'react'
import { Logo } from '../primitives.jsx'

const PAGES = {
  shipping: {
    title: 'Shipping',
    sections: [
      {
        heading: 'Delivery',
        items: [
          'India only — we currently ship to all Indian states and union territories.',
          'Orders are dispatched within 2–3 business days of WhatsApp confirmation.',
          'Standard delivery takes 5–7 business days after dispatch.',
          "You'll receive a WhatsApp update when your order is on its way.",
        ],
      },
      {
        heading: 'Shipping cost',
        items: [
          '₹80 flat shipping on orders under ₹1,000.',
          'Free shipping on orders ₹1,000 and above.',
        ],
      },
      {
        heading: 'Packaging',
        items: [
          'Candles and clay pieces are double-packed to survive the journey.',
          'Every order is wrapped in tissue paper and includes a handwritten note.',
        ],
      },
    ],
  },
  returns: {
    title: 'Returns',
    sections: [
      {
        heading: 'Return window',
        items: [
          'You have 7 days from the date of delivery to request a return.',
          "WhatsApp a photo of the issue within 7 days — we'll sort it from there.",
        ],
      },
      {
        heading: 'Eligible for return',
        items: [
          'Items that arrive damaged or defective.',
          'Items significantly different from what was described.',
        ],
      },
      {
        heading: 'Not eligible for return',
        items: [
          'Change of mind after dispatch.',
          'Minor colour or texture variation — this is natural in handmade work.',
          'Custom and commission orders (non-returnable by nature).',
        ],
      },
      {
        heading: 'Refunds & replacements',
        items: [
          'Once approved, a refund or replacement is arranged within 5 business days.',
          'Refunds are processed via the same payment method used.',
        ],
      },
    ],
  },
  'care-guide': {
    title: 'Care Guide',
    sections: [
      {
        heading: 'Paper crafts',
        items: [
          'Keep dry — paper crafts should never get wet.',
          'Store away from direct sunlight to prevent fading.',
          'Avoid folding, creasing, or stacking heavy items on top.',
          'Display in a frame or box for longer life.',
        ],
      },
      {
        heading: 'Clay charms',
        items: [
          'Handle gently — charms are hand-formed and can chip if dropped.',
          'Wipe clean with a soft dry cloth.',
          'Keep away from water and prolonged moisture.',
          'Store in a small pouch or box when not in use.',
        ],
      },
      {
        heading: 'Candles',
        items: [
          'Trim the wick to 6 mm before every burn — this prevents smoking and uneven melting.',
          'The first burn matters: let the wax melt all the way to the edges (at least 2 hours) to prevent tunnelling.',
          'Keep away from drafts, fans, and direct sunlight while burning.',
          'Never leave a burning candle unattended.',
          'Stop burning when 1 cm of wax remains.',
        ],
      },
    ],
  },
  faq: {
    title: 'FAQ',
    sections: [
      {
        heading: 'Ordering',
        items: [
          'How do I place an order? — Browse the shop, add items to your cart, and tap checkout. WhatsApp will open with your order pre-filled. Cordeelia will confirm and share payment details.',
          "Can I cancel or change my order? — WhatsApp within 24 hours of placing the order and we'll do our best to help.",
          'Do you take custom orders? — Yes! Head to the Commissions page for details.',
        ],
      },
      {
        heading: 'Payment',
        items: [
          'What payment methods do you accept? — UPI and bank transfer. Payment details are shared via WhatsApp after order confirmation.',
          'Is it safe to pay? — Yes. Payment is made directly via UPI — no card details are ever shared with us.',
        ],
      },
      {
        heading: 'Delivery',
        items: [
          'How long does delivery take? — 5–7 business days within India after dispatch.',
          'Do you ship outside India? — India only for now. International shipping coming soon.',
          "How will I know when my order ships? — You'll get a WhatsApp message with tracking details when your order is dispatched.",
        ],
      },
      {
        heading: 'Issues',
        items: [
          "My item arrived damaged — WhatsApp a photo within 7 days and we'll arrange a refund or replacement.",
          "I haven't received my order — If it's been more than 10 business days, WhatsApp us and we'll look into it.",
        ],
      },
    ],
  },
  process: {
    title: 'The Process',
    sections: [
      {
        heading: 'Materials',
        items: [
          'Sourced from trusted local craft suppliers across India.',
          'Soy wax and beeswax for candles — no paraffin.',
          'Air-dry and polymer clay for charms.',
          'Handmade paper, quilling strips, and iris folding kits for paper crafts.',
        ],
      },
      {
        heading: 'Making',
        items: [
          'Every piece is made by hand in the home studio — no machines, no mass production.',
          'Small batches only: typically 10–20 pieces per run.',
          'No two pieces are identical — slight variation is part of what makes them handmade.',
        ],
      },
      {
        heading: 'Quality check',
        items: [
          'Each item is inspected before packing.',
          'Pieces with visible defects don\'t ship — they go into the "studio seconds" pile for rework.',
        ],
      },
      {
        heading: 'Packing & dispatch',
        items: [
          'Wrapped in tissue paper with a handwritten note for every order.',
          'Fragile items get extra padding and double-boxing.',
          'Dispatched within 2–3 business days of order confirmation.',
        ],
      },
    ],
  },
  commissions: {
    title: 'Commissions',
    sections: [
      {
        heading: 'What we make',
        items: [
          'Paper crafts — custom greeting cards, quilling portraits, iris folding panels.',
          'Clay charms — names, initials, logos, characters, miniature food.',
          'Candles — custom scents, labels, colours, and gift sets.',
        ],
      },
      {
        heading: 'How to start',
        items: [
          'WhatsApp your idea with reference images and any specific requirements.',
          'Cordeelia will review and respond within 48 hours with a quote and timeline.',
          'Once you approve, a 50% deposit is collected via UPI to confirm the slot.',
        ],
      },
      {
        heading: 'Timeline & payment',
        items: [
          'Most commissions take 2–3 weeks from deposit payment.',
          'Complex or large orders may take longer — discussed upfront.',
          'The remaining 50% is paid before dispatch.',
        ],
      },
      {
        heading: 'Availability',
        items: [
          'Commission slots are limited — typically 4–5 open per month.',
          'WhatsApp early to check availability before the month fills up.',
          'Commission orders are non-returnable (made to your specifications).',
        ],
      },
    ],
  },
}

export default function InfoPage({ slug }) {
  const page = PAGES[slug]
  if (!page) return null

  return (
    <div style={{ minHeight: '100vh', background: '#fffafa', fontFamily: 'var(--cc-font-sans)' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(255,250,250,0.92)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #f5d3d3',
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <a href="/" style={{ textDecoration: 'none', display: 'inline-flex' }}>
          <Logo size={20} />
        </a>
        <a href="/" style={{
          fontFamily: 'var(--cc-font-sans)', fontSize: 14, color: '#7a5a5a',
          textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>← Back to shop</a>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '56px 24px 80px' }}>
        <h1 style={{
          fontFamily: 'var(--cc-font-serif)', fontWeight: 500, fontSize: 42,
          color: '#3a2a2a', letterSpacing: '-0.5px', margin: '0 0 48px',
        }}>{page.title}</h1>

        {page.sections.map(section => (
          <div key={section.heading} style={{ marginBottom: 40 }}>
            <div style={{
              fontFamily: 'var(--cc-font-sans)', fontSize: 11, fontWeight: 500,
              letterSpacing: 1.4, textTransform: 'uppercase', color: '#a85050', marginBottom: 14,
            }}>{section.heading}</div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {section.items.map((item, i) => (
                <li key={i} style={{
                  fontFamily: 'var(--cc-font-sans)', fontSize: 15.5, lineHeight: 1.65,
                  color: '#5a3a3a', paddingLeft: 16, borderLeft: '2px solid #f5d3d3',
                }}>{item}</li>
              ))}
            </ul>
          </div>
        ))}

        <div style={{ marginTop: 56, paddingTop: 24, borderTop: '1px dashed #f5c0c0' }}>
          <p style={{ fontFamily: 'var(--cc-font-sans)', fontSize: 14, color: '#a85050', margin: 0 }}>
            Questions? <a
              href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`}
              style={{ color: '#f08a8a', textDecoration: 'underline', textUnderlineOffset: 3 }}
            >WhatsApp Cordeelia</a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px dashed #f5c0c0', padding: '20px 24px',
        fontFamily: 'var(--cc-font-sans)', fontSize: 13, color: '#a85050',
        display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
      }}>
        <span>© 2026 Cordy's Crafts · Made with love</span>
        <span style={{ fontFamily: 'var(--cc-font-script)', fontSize: 18, color: '#f08a8a' }}>since 2019 ♡</span>
      </div>
    </div>
  )
}
