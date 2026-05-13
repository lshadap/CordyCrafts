// Cordy's Crafts — About + Newsletter + Insta strip + Footer + Cart drawer + Booking modal
import React from 'react'
import { Icon, Logo, Button, Overline, CircleBadge, HeartMark } from './primitives.jsx'
import { useCartContext } from './CartContext.jsx'
import { useBreakpoint } from './hooks/useBreakpoint.js'
import { inr } from './products.jsx'
import { supabase } from './lib/supabase.js'
import { buildOrderMessage, buildBookingMessage, buildWaUrl } from './lib/whatsapp.js'

const About = ({ accent }) => {
  const bp = useBreakpoint()
  const isMobile = bp === 'mobile'
  return (
    <section id="about" style={{ background: '#3a2a2a', color: '#fce4e4', borderTop: '1px solid #5a3a3a' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.1fr', minHeight: isMobile ? 'auto' : 520 }}>
        <div style={{
          padding: isMobile ? '60px 24px' : '110px 72px 110px 80px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          borderRight: isMobile ? 'none' : '1px dashed #6a4a4a',
        }}>
          <Overline dark>Hi, I'm Cordeelia</Overline>
          <h2 style={{
            fontFamily: 'var(--cc-font-serif)', fontWeight: 500, fontSize: isMobile ? 36 : 44,
            lineHeight: 1.18, letterSpacing: '-0.4px', color: '#ffffff',
            margin: '18px 0 0', textWrap: 'pretty', maxWidth: 480,
          }}>
            Four crafts, <span style={{ fontFamily: 'var(--cc-font-script)', fontWeight: 400, color: '#f5a3a3', fontSize: isMobile ? 40 : 50 }}>one little studio.</span>
          </h2>
          <p style={{
            fontFamily: 'var(--cc-font-sans)', fontSize: 15.5, lineHeight: 1.7,
            color: '#f5c0c0', marginTop: 26, maxWidth: 460,
          }}>
            I started Cordy's Crafts at my kitchen table folding paper hearts.
            Then candles. Then polymer clay. Then I started teaching all of it.
            Now it's all under one roof — small-batch, hand-made, with love.
          </p>
          <div style={{ display: 'flex', gap: 40, marginTop: 40, flexWrap: 'wrap' }}>
            {[
              ['600+', 'pieces made by hand'],
              ['4', 'crafts under one roof'],
              ['7 yrs', 'making a happy mess'],
            ].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontFamily: 'var(--cc-font-script)', fontWeight: 400, fontSize: 38, color: '#ffffff', lineHeight: 1 }}>{v}</div>
                <div style={{ fontFamily: 'var(--cc-font-sans)', fontSize: 12.5, color: '#d5a3a3', marginTop: 8, maxWidth: 160, lineHeight: 1.4 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 44, flexWrap: 'wrap' }}>
            <Button as="a" href="/process" variant="brand">Meet the maker <Icon name="arrowRight" size={15} stroke={1.8}/></Button>
            <Button as="a" href="https://instagram.com/cordyscrafts" variant="ghostDark">See the studio</Button>
          </div>
        </div>
        {!isMobile && (
          <div style={{ position: 'relative', overflow: 'hidden', background: '#4a3232', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: 320, height: 320, borderRadius: '50%',
              background: '#fce4e4', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 8px rgba(252,228,228,0.15)',
            }}>
              <HeartMark size={200} color="#f08a8a"/>
            </div>
            <div style={{ position: 'absolute', right: '8%', top: '20%' }}>
              <CircleBadge color="ivory" size={92} style={{ flexDirection: 'column', lineHeight: 1, color: '#f08a8a' }}>
                <span style={{ fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', fontFamily: 'var(--cc-font-sans)', fontWeight: 600 }}>Made by</span>
                <span style={{ fontFamily: 'var(--cc-font-script)', fontSize: 24, marginTop: 4 }}>Cordeelia</span>
              </CircleBadge>
            </div>
          </div>
        )}
      </div>
    </section>
  )
};

const Newsletter = ({ accent }) => {
  const bp = useBreakpoint()
  const isMobile = bp === 'mobile'
  const [email, setEmail] = React.useState('');
  const [done, setDone] = React.useState(false);
  const submit = (e) => { e.preventDefault(); if (email) { setDone(true); setEmail(''); } };
  return (
    <section style={{ background: '#fce4e4', padding: isMobile ? '72px 24px' : '112px 40px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '6px 14px 6px 6px', borderRadius: 999,
          boxShadow: '0 0 0 1px #f5c0c0', marginBottom: 28, background: '#ffffff',
        }}>
          <CircleBadge color="coral" size={24} style={{ background: accent }}>
            <Icon name="mail" size={12} stroke={1.8}/>
          </CircleBadge>
          <span style={{ fontFamily: 'var(--cc-font-sans)', fontSize: 12, color: '#a85050', letterSpacing: 0.3 }}>
            Letters from the studio · monthly
          </span>
        </div>
        <h2 style={{
          fontFamily: 'var(--cc-font-serif)', fontWeight: 500, fontSize: isMobile ? 34 : 46,
          lineHeight: 1.15, letterSpacing: '-0.4px', color: '#3a2a2a',
          margin: 0, textWrap: 'balance',
        }}>
          New batches, class openings, and the occasional <span style={{ fontFamily: 'var(--cc-font-script)', fontWeight: 400, color: '#f08a8a' }}>love note.</span>
        </h2>
        <p style={{ fontFamily: 'var(--cc-font-sans)', fontSize: 15, lineHeight: 1.6, color: '#7a5a5a', marginTop: 18, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
          One letter a month. New drops first. Small discount codes. No filler.
        </p>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 8, marginTop: 36, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
          <input type="email" placeholder="your@email.com" value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              flex: 1, height: 52, padding: '0 18px', borderRadius: 999,
              border: 'none', background: '#ffffff', boxShadow: '0 0 0 1px #f5c0c0',
              fontFamily: 'var(--cc-font-sans)', fontSize: 15, color: '#3a2a2a', outline: 'none',
            }}/>
          <button type="submit" style={{
            height: 52, padding: '0 24px', borderRadius: 999, border: 'none',
            background: '#f08a8a', color: '#ffffff',
            fontFamily: 'var(--cc-font-sans)', fontSize: 15, fontWeight: 500, cursor: 'pointer',
          }}>{done ? 'Subscribed ♡' : 'Subscribe →'}</button>
        </form>
      </div>
    </section>
  );
};

const InstagramStrip = () => {
  const bp = useBreakpoint()
  const isMobile = bp === 'mobile'
  const cols = isMobile ? 2 : bp === 'tablet' ? 3 : 5
  const tiles = [
    { img: '/assets/ig-yarn-1.svg', cap: 'Today\'s pour · Rose & Pepper' },
    { img: '/assets/ig-yarn-2.svg', cap: 'Charms drying overnight' },
    { img: '/assets/ig-yarn-3.svg', cap: 'Card stack, ready to ship' },
    { img: '/assets/ig-yarn-4.svg', cap: 'Workshop · Saturday set-up' },
    { img: '/assets/ig-yarn-5.svg', cap: 'The whole kit · workbench' },
  ];
  return (
    <section style={{ background: '#3a2a2a', padding: isMobile ? '56px 0 64px' : '72px 0 80px', color: '#fce4e4' }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto 40px', padding: isMobile ? '0 20px' : '0 40px',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap',
      }}>
        <div>
          <Overline dark>@cordyscrafts</Overline>
          <h3 style={{ fontFamily: 'var(--cc-font-serif)', fontWeight: 500, fontSize: isMobile ? 26 : 32, margin: '12px 0 0', color: '#ffffff', letterSpacing: '-0.3px' }}>
            From the studio, <span style={{ fontFamily: 'var(--cc-font-script)', fontWeight: 400, color: '#f5a3a3', fontSize: isMobile ? 30 : 38 }}>this week.</span>
          </h3>
        </div>
        <a href="https://instagram.com/cordyscrafts" target="_blank" rel="noopener noreferrer" style={{
          fontFamily: 'var(--cc-font-sans)', fontSize: 14, color: '#f5c0c0',
          textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '10px 18px', borderRadius: 999, boxShadow: '0 0 0 1px #5a3a3a',
        }}>
          <Icon name="instagram" size={15} stroke={1.6}/> Follow along
        </a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 2 }}>
        {tiles.map((t, i) => (
          <a key={i} href="https://instagram.com/cordyscrafts" target="_blank" rel="noopener noreferrer" style={{ position: 'relative', display: 'block', aspectRatio: '1 / 1', overflow: 'hidden', background: '#4a3232' }}>
            <img src={t.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'sepia(0.15) saturate(1.1) hue-rotate(-10deg)' }}/>
            <div style={{ position: 'absolute', left: 14, bottom: 12, right: 14, fontFamily: 'var(--cc-font-sans)', fontSize: 11, letterSpacing: 0.3, color: '#fce4e4' }}>{t.cap}</div>
          </a>
        ))}
      </div>
    </section>
  );
};

const Footer = () => {
  const bp = useBreakpoint()
  const isMobile = bp === 'mobile'
  const gridCols = isMobile ? '1fr' : bp === 'tablet' ? '1fr 1fr' : '1.5fr 1fr 1fr 1fr'
  return (
    <footer style={{ background: '#fffafa', padding: isMobile ? '48px 24px 28px' : '80px 40px 36px', borderTop: '1px dashed #f5c0c0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: gridCols, gap: isMobile ? 36 : 48 }}>
        <div>
          <Logo size={20}/>
          <p style={{ fontFamily: 'var(--cc-font-serif)', fontSize: 16, lineHeight: 1.6, color: '#7a5a5a', marginTop: 18, maxWidth: 320 }}>
            Hand-made paper, clay, candles, and small-group classes — shipped with a handwritten note.
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 22, color: '#a85050' }}>
            <a href="https://instagram.com/cordyscrafts" target="_blank" rel="noopener noreferrer" style={{ color: '#a85050' }}><Icon name="instagram" size={18}/></a>
            <Icon name="mail" size={18}/>
            <Icon name="heart" size={18}/>
          </div>
        </div>
        {[
          ['Shop', [
            { label: 'Paper Crafts', href: '#shop' },
            { label: 'Clay',         href: '#shop' },
            { label: 'Candles',      href: '#shop' },
          ]],
          ['Studio', [
            { label: 'About Cordeelia',  href: '#about' },
            { label: 'Classes & Events', href: '#classes' },
            { label: 'The process',      href: '/process' },
            { label: 'Commissions',      href: '/commissions' },
          ]],
          ['Help', [
            { label: 'Order via WhatsApp', href: `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}` },
            { label: 'Shipping',   href: '/shipping' },
            { label: 'Returns',    href: '/returns' },
            { label: 'Care guide', href: '/care-guide' },
            { label: 'FAQ',        href: '/faq' },
          ]],
        ].map(([heading, items]) => (
          <div key={heading}>
            <div style={{ fontFamily: 'var(--cc-font-sans)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: '#a85050', marginBottom: 16 }}>{heading}</div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map(x => <li key={x.label}><a href={x.href} style={{ fontFamily: 'var(--cc-font-sans)', fontSize: 14.5, color: '#7a5a5a', textDecoration: 'none' }}>{x.label}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 1280, margin: isMobile ? '36px auto 0' : '56px auto 0', paddingTop: 24, borderTop: '1px dashed #f5c0c0', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--cc-font-sans)', fontSize: 13, color: '#a85050', flexWrap: 'wrap', gap: 12 }}>
        <span>© 2026 Cordy's Crafts · Made with love</span>
        <span style={{ fontFamily: 'var(--cc-font-script)', fontSize: 18, color: '#f08a8a' }}>since 2019 ♡</span>
      </div>
    </footer>
  )
};

// ============== WhatsApp Icon ==============
const WhatsAppIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.595 5.391L4.4 18.91l3.254-.717zm9.885-5.077c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.711.306 1.265.489 1.697.626.713.226 1.362.194 1.875.118.572-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
  </svg>
);

// ===== shared form atoms =====
const inp = {
  width: '100%', height: 46, padding: '0 14px', borderRadius: 10,
  border: 'none', background: '#ffffff', boxShadow: '0 0 0 1px #f5c0c0',
  fontFamily: 'var(--cc-font-sans)', fontSize: 14.5, color: '#3a2a2a', outline: 'none',
  boxSizing: 'border-box',
};
const qtyBtn = {
  width: 32, height: 32, borderRadius: 999, border: 'none', cursor: 'pointer',
  background: '#ffffff', color: '#3a2a2a',
  boxShadow: '0 0 0 1px #f5c0c0',
  fontFamily: 'var(--cc-font-sans)', fontSize: 16, fontWeight: 500,
};
const Field = ({ label, required, children }) => (
  <label style={{ display: 'block', marginBottom: 16 }}>
    <div style={{
      fontFamily: 'var(--cc-font-sans)', fontSize: 11, fontWeight: 500,
      letterSpacing: 1.2, textTransform: 'uppercase', color: '#a85050', marginBottom: 8,
    }}>{label}{required && <span style={{ color: '#f08a8a' }}> *</span>}</div>
    {children}
  </label>
);

// ============== Cart Drawer ==============
const CartDrawer = ({ open, onClose, accent }) => {
  const c = useCartContext();
  const [stage, setStage] = React.useState('cart'); // cart | form | done
  const [form, setForm] = React.useState({ name: '', phone: '', addr: '' });
  const [confirmation, setConfirmation] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState(null);

  React.useEffect(() => {
    if (!open) {
      setStage('cart');
      setConfirmation(null);
      setSubmitError(null);
      setSubmitting(false);
    }
  }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setSubmitting(true);
    setSubmitError(null);

    // Strip img and cat — orders.items JSONB schema requires only { sku, name, qty, price }
    const itemsForInsert = c.items.map(i => ({
      sku: i.sku, name: i.name, qty: i.qty, price: i.price,
    }));
    const totalForInsert = c.total();
    const itemsSnapshot = [...c.items]; // capture before c.clear() for the confirmation panel

    const { error } = await supabase.from('orders').insert({
      customer_name: form.name,
      customer_whatsapp: form.phone,
      address: form.addr || '',
      items: itemsForInsert,
      total_amount: totalForInsert,
      payment_status: 'pending',
    });

    if (error) {
      setSubmitError('Something went wrong — please try again.');
      setSubmitting(false);
      return; // wa.me link NEVER opens on insert failure (Phase 2 success criterion #2)
    }

    // INSERT succeeded → build WhatsApp message and open it
    const msg = buildOrderMessage(form, itemsSnapshot, totalForInsert);
    const waUrl = buildWaUrl(msg);
    window.location.href = waUrl;

    setConfirmation({ ...form, total: totalForInsert, items: itemsSnapshot });
    setStage('done');
    c.clear();
    setSubmitting(false);
  };

  return (
    <React.Fragment>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(58,42,42,0.45)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 220ms', zIndex: 90,
      }}/>
      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 460, maxWidth: '100vw',
        background: '#fffafa', zIndex: 91, boxShadow: '-12px 0 40px rgba(58,42,42,0.18)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 280ms cubic-bezier(.2,.7,.2,1)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px dashed #f5c0c0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Overline>{stage === 'done' ? 'Order sent' : stage === 'form' ? 'Your details' : 'Your cart'}</Overline>
            <div style={{ fontFamily: 'var(--cc-font-serif)', fontSize: 22, color: '#3a2a2a', marginTop: 4 }}>
              {stage === 'done' ? 'Thank you!' : stage === 'form' ? 'Almost there' : `${c.count()} ${c.count() === 1 ? 'item' : 'items'}`}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#7a5a5a', fontSize: 22 }}>×</button>
        </div>

        {stage === 'cart' && (
          <React.Fragment>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {c.items.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7a5a5a', fontFamily: 'var(--cc-font-sans)', fontSize: 14 }}>
                  Your cart is empty.<br/>
                  <span style={{ fontFamily: 'var(--cc-font-script)', fontSize: 22, color: '#f08a8a' }}>Go pick something pretty.</span>
                </div>
              )}
              {c.items.map(it => (
                <div key={it.sku} style={{ display: 'grid', gridTemplateColumns: '72px 1fr auto', gap: 14, padding: '14px 0', borderBottom: '1px dashed #f5c0c0', alignItems: 'center' }}>
                  <div style={{ width: 72, height: 72, borderRadius: 8, background: '#fce4e4', overflow: 'hidden' }}>
                    <img src={it.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  </div>
                  <div>
                    <Overline>{it.cat}</Overline>
                    <div style={{ fontFamily: 'var(--cc-font-serif)', fontSize: 15, color: '#3a2a2a', marginTop: 2 }}>{it.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <button onClick={() => c.setQty(it.sku, it.qty - 1)} style={qtyBtn}>−</button>
                      <span style={{ fontFamily: 'var(--cc-font-sans)', fontSize: 13, color: '#3a2a2a', minWidth: 18, textAlign: 'center' }}>{it.qty}</span>
                      <button onClick={() => c.setQty(it.sku, it.qty + 1)} style={qtyBtn}>+</button>
                      <button onClick={() => c.remove(it.sku)} style={{ marginLeft: 8, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--cc-font-sans)', fontSize: 12, color: '#a85050', textDecoration: 'underline' }}>Remove</button>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--cc-font-serif)', fontSize: 15, color: '#3a2a2a' }}>{inr(it.price * it.qty)}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '20px 24px', borderTop: '1px dashed #f5c0c0', background: '#fce4e4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--cc-font-sans)', fontSize: 14, color: '#7a5a5a' }}>
                <span>Subtotal</span><span>{inr(c.total())}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--cc-font-serif)', fontSize: 18, color: '#3a2a2a', marginTop: 6 }}>
                <span>Total</span><span>{inr(c.total())}</span>
              </div>
              <div style={{ fontFamily: 'var(--cc-font-sans)', fontSize: 11.5, color: '#7a5a5a', marginTop: 6 }}>
                Shipping + payment confirmed on WhatsApp.
              </div>
              <button disabled={c.items.length === 0} onClick={() => setStage('form')} style={{
                width: '100%', height: 52, marginTop: 16, borderRadius: 999, border: 'none',
                background: c.items.length === 0 ? '#d5b3b3' : '#25D366',
                color: '#ffffff', fontFamily: 'var(--cc-font-sans)', fontSize: 15, fontWeight: 600,
                cursor: c.items.length === 0 ? 'not-allowed' : 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}>
                <WhatsAppIcon size={20}/> Place Order via WhatsApp
              </button>
            </div>
          </React.Fragment>
        )}

        {stage === 'form' && (
          <form onSubmit={submit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              <p style={{ fontFamily: 'var(--cc-font-sans)', fontSize: 14, color: '#7a5a5a', lineHeight: 1.6, margin: '0 0 20px' }}>
                Cordeelia will contact you on WhatsApp to confirm your order and share a payment link.
              </p>
              <Field label="Your name" required>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={inp}/>
              </Field>
              <Field label="WhatsApp number" required>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ ...inp, flex: '0 0 60px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#fce4e4', color: '#a85050' }}>+91</span>
                  <input type="tel" placeholder="9876543210" value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    required pattern="[0-9]{10}" style={{ ...inp, flex: 1 }}/>
                </div>
              </Field>
              <Field label="Delivery address or note (optional)">
                <textarea rows={4} value={form.addr} onChange={e => setForm({ ...form, addr: e.target.value })} style={{ ...inp, height: 'auto', padding: 12, resize: 'vertical' }}/>
              </Field>
              <div style={{ marginTop: 18, padding: 14, borderRadius: 10, background: '#fce4e4', fontFamily: 'var(--cc-font-sans)', fontSize: 13, color: '#5a3a3a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span>{c.count()} items</span><span>{inr(c.total())}</span>
                </div>
                <div style={{ fontSize: 11.5, color: '#7a5a5a' }}>Final price (incl. shipping) confirmed on WhatsApp.</div>
              </div>
            </div>
            <div style={{ padding: '20px 24px', borderTop: '1px dashed #f5c0c0' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => setStage('cart')} style={{
                  height: 52, padding: '0 20px', borderRadius: 999, border: 'none',
                  background: 'transparent', color: '#7a5a5a', fontFamily: 'var(--cc-font-sans)', fontSize: 14, cursor: 'pointer', boxShadow: '0 0 0 1px #f5c0c0',
                }}>Back</button>
                <button type="submit" disabled={submitting} style={{
                  flex: 1, height: 52, borderRadius: 999, border: 'none',
                  background: submitting ? '#a0d8b3' : '#25D366', color: '#ffffff',
                  fontFamily: 'var(--cc-font-sans)', fontSize: 15, fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                }}>
                  <WhatsAppIcon size={18}/> {submitting ? 'Sending...' : 'Send order to Cordeelia'}
                </button>
              </div>
              {submitError && (
                <div style={{
                  marginTop: 10, fontFamily: 'var(--cc-font-sans)', fontSize: 13,
                  color: '#c0392b', textAlign: 'center',
                }}>
                  {submitError}
                </div>
              )}
            </div>
          </form>
        )}

        {stage === 'done' && confirmation && (
          <div style={{ flex: 1, padding: '40px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <CircleBadge color="coral" size={84} style={{ background: '#25D366', marginBottom: 20 }}>
              <WhatsAppIcon size={36}/>
            </CircleBadge>
            <h3 style={{ fontFamily: 'var(--cc-font-serif)', fontWeight: 500, fontSize: 26, color: '#3a2a2a', margin: 0 }}>
              Your order has been sent to <span style={{ fontFamily: 'var(--cc-font-script)', color: '#f08a8a' }}>Cordeelia!</span>
            </h3>
            <p style={{ fontFamily: 'var(--cc-font-sans)', fontSize: 14.5, color: '#7a5a5a', lineHeight: 1.65, marginTop: 16, maxWidth: 360 }}>
              She'll contact you on WhatsApp shortly to confirm and share a payment link.
            </p>
            <div style={{ width: '100%', marginTop: 28, padding: 18, borderRadius: 12, background: '#fce4e4', textAlign: 'left' }}>
              <Overline>Sent to</Overline>
              <div style={{ fontFamily: 'var(--cc-font-serif)', fontSize: 16, color: '#3a2a2a', marginTop: 4 }}>{confirmation.name}</div>
              <div style={{ fontFamily: 'var(--cc-font-sans)', fontSize: 13, color: '#7a5a5a', marginTop: 2 }}>+91 {confirmation.phone}</div>
              <div style={{ fontFamily: 'var(--cc-font-sans)', fontSize: 13, color: '#7a5a5a', marginTop: 10 }}>
                {confirmation.items.length} items · <strong>{inr(confirmation.total)}</strong>
              </div>
            </div>
            <button onClick={onClose} style={{
              marginTop: 24, height: 48, padding: '0 28px', borderRadius: 999, border: 'none',
              background: '#f08a8a', color: '#ffffff', fontFamily: 'var(--cc-font-sans)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}>Keep browsing</button>
          </div>
        )}
      </aside>
    </React.Fragment>
  );
};

// ============== Booking Modal ==============
const BookingModal = ({ klass, onClose, accent }) => {
  const [stage, setStage] = React.useState('form');
  const [form, setForm] = React.useState({
    name: '', phone: '', seats: 1,
    pref: klass?.mode === 'Both' ? 'Online' : klass?.mode || 'Online',
    note: '',
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState(null);

  React.useEffect(() => {
    if (klass) setForm(f => ({
      ...f, seats: 1,
      pref: klass.mode === 'Both' ? 'Online' : klass.mode,
    }));
    setStage('form');
    setSubmitError(null);
    setSubmitting(false);
  }, [klass]);

  if (!klass) return null;
  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setSubmitting(true);
    setSubmitError(null);

    const { error } = await supabase.from('bookings').insert({
      class_id: klass.id, // uuid FK to classes.id — NEVER klass.sku (Pitfall 4 in 02-RESEARCH.md)
      customer_name: form.name,
      customer_whatsapp: form.phone,
      seats: form.seats,
      mode_preference: form.pref,
      message: form.note || null,
      payment_status: 'pending',
    });

    if (error) {
      setSubmitError('Something went wrong — please try again.');
      setSubmitting(false);
      return; // wa.me link NEVER opens on insert failure
    }

    const msg = buildBookingMessage(form, klass);
    const waUrl = buildWaUrl(msg);
    window.location.href = waUrl;

    setStage('done');
    setSubmitting(false);
  };
  const total = form.seats * klass.price;

  return (
    <React.Fragment>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(58,42,42,0.5)', zIndex: 95 }}/>
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        background: '#fffafa', borderRadius: 16, width: 520, maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100vh - 32px)', overflowY: 'auto', zIndex: 96,
        boxShadow: '0 40px 80px rgba(58,42,42,0.3)',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px dashed #f5c0c0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Overline>Book a class</Overline>
            <div style={{ fontFamily: 'var(--cc-font-serif)', fontSize: 22, color: '#3a2a2a', marginTop: 4, lineHeight: 1.2 }}>{klass.name}</div>
            <div style={{ fontFamily: 'var(--cc-font-sans)', fontSize: 12.5, color: '#7a5a5a', marginTop: 6 }}>
              {klass.date_label} · {klass.duration} · {inr(klass.price)}/person
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#7a5a5a', fontSize: 22 }}>×</button>
        </div>

        {stage === 'form' && (
          <form onSubmit={submit} style={{ padding: '20px 24px' }}>
            <Field label="Your name" required>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={inp}/>
            </Field>
            <Field label="WhatsApp number" required>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ ...inp, flex: '0 0 60px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#fce4e4', color: '#a85050' }}>+91</span>
                <input type="tel" placeholder="9876543210" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  required pattern="[0-9]{10}" style={{ ...inp, flex: 1 }}/>
              </div>
            </Field>
            <Field label="Number of seats" required>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <button type="button" onClick={() => setForm({ ...form, seats: Math.max(1, form.seats - 1) })} style={qtyBtn}>−</button>
                <span style={{ minWidth: 40, textAlign: 'center', fontFamily: 'var(--cc-font-serif)', fontSize: 20, color: '#3a2a2a' }}>{form.seats}</span>
                <button type="button" onClick={() => setForm({ ...form, seats: Math.min(klass.seats_left ?? 99, form.seats + 1) })} style={qtyBtn}>+</button>
                <span style={{ marginLeft: 12, fontFamily: 'var(--cc-font-sans)', fontSize: 12, color: '#7a5a5a' }}>{klass.seats_left ?? '—'} max</span>
              </div>
            </Field>
            {klass.mode === 'Both' && (
              <Field label="Online or Offline?">
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Online', 'Offline'].map(o => (
                    <button key={o} type="button" onClick={() => setForm({ ...form, pref: o })} style={{
                      flex: 1, height: 44, borderRadius: 999, border: 'none', cursor: 'pointer',
                      background: form.pref === o ? '#3a2a2a' : '#ffffff',
                      color: form.pref === o ? '#ffffff' : '#7a5a5a',
                      boxShadow: form.pref === o ? 'none' : '0 0 0 1px #f5c0c0',
                      fontFamily: 'var(--cc-font-sans)', fontSize: 14,
                    }}>{o}{o === 'Offline' && klass.location ? ` · ${klass.location.split(',')[0]}` : ''}</button>
                  ))}
                </div>
              </Field>
            )}
            <Field label="Message or question for Cordeelia (optional)">
              <textarea rows={3} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} style={{ ...inp, height: 'auto', padding: 12, resize: 'vertical' }}/>
            </Field>
            <div style={{ marginTop: 8, padding: 14, borderRadius: 10, background: '#fce4e4', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--cc-font-sans)', fontSize: 14, color: '#3a2a2a' }}>
              <span>{form.seats} × {inr(klass.price)}</span>
              <strong style={{ fontFamily: 'var(--cc-font-serif)', fontSize: 17 }}>{inr(total)}</strong>
            </div>
            <button type="submit" disabled={submitting} style={{
              width: '100%', height: 52, marginTop: 16, borderRadius: 999, border: 'none',
              background: submitting ? '#a0d8b3' : '#25D366', color: '#ffffff',
              fontFamily: 'var(--cc-font-sans)', fontSize: 15, fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              <WhatsAppIcon size={18}/> {submitting ? 'Sending...' : 'Send booking request'}
            </button>
            {submitError && (
              <div style={{
                marginTop: 10, fontFamily: 'var(--cc-font-sans)', fontSize: 13,
                color: '#c0392b', textAlign: 'center',
              }}>
                {submitError}
              </div>
            )}
          </form>
        )}

        {stage === 'done' && (
          <div style={{ padding: '40px 28px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircleBadge color="coral" size={80} style={{ background: '#25D366', marginBottom: 18 }}>
              <WhatsAppIcon size={34}/>
            </CircleBadge>
            <h3 style={{ fontFamily: 'var(--cc-font-serif)', fontWeight: 500, fontSize: 24, color: '#3a2a2a', margin: 0, lineHeight: 1.3 }}>
              Your booking request has been sent to <span style={{ fontFamily: 'var(--cc-font-script)', color: '#f08a8a' }}>Cordeelia!</span>
            </h3>
            <p style={{ fontFamily: 'var(--cc-font-sans)', fontSize: 14, color: '#7a5a5a', lineHeight: 1.65, marginTop: 14, maxWidth: 360 }}>
              She'll confirm your spot and share payment details on WhatsApp.
            </p>
            <div style={{ width: '100%', marginTop: 22, padding: 16, borderRadius: 12, background: '#fce4e4', textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--cc-font-serif)', fontSize: 15, color: '#3a2a2a' }}>{klass.name}</div>
              <div style={{ fontFamily: 'var(--cc-font-sans)', fontSize: 12.5, color: '#7a5a5a', marginTop: 4 }}>
                {form.seats} seat{form.seats > 1 ? 's' : ''} · {form.pref} · {inr(total)}
              </div>
              <div style={{ fontFamily: 'var(--cc-font-sans)', fontSize: 12.5, color: '#7a5a5a', marginTop: 2 }}>
                {form.name} · +91 {form.phone}
              </div>
            </div>
            <button onClick={onClose} style={{
              marginTop: 22, height: 46, padding: '0 28px', borderRadius: 999, border: 'none',
              background: '#f08a8a', color: '#ffffff', fontFamily: 'var(--cc-font-sans)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}>Done</button>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export { About, Newsletter, InstagramStrip, Footer, CartDrawer, BookingModal }
