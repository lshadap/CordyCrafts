// Cordy's Crafts — products + classes
import React from 'react'
import { useCartContext } from './CartContext.jsx'
import { Icon, CircleBadge, Overline, Button } from './primitives.jsx'
import { useProducts } from './hooks/useProducts.js'
import { useClasses } from './hooks/useClasses.js'

// ======== Currency =========
const inr = (n) => '₹' + n.toLocaleString('en-IN');

// ======== Product card =========
const ProductCard = ({ p, accent }) => {
  const c = useCartContext();
  const [hover, setHover] = React.useState(false);
  const [added, setAdded] = React.useState(false);
  const onAdd = () => {
    c.add({ sku: p.sku, name: p.name, price: p.price, img: p.img, cat: p.category, qty: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', background: '#ffffff', borderRadius: 12, overflow: 'hidden',
        boxShadow: hover ? '0 0 0 1px #f5a3a3, 0 14px 32px rgba(240,138,138,0.18)' : '0 0 0 1px #f5d3d3',
        transition: 'box-shadow 240ms var(--cc-ease-out)',
      }}>
      <div style={{ position: 'relative', aspectRatio: '1 / 1', background: '#fce4e4' }}>
        <img src={p.img} alt={p.name} style={{
          width: '100%', height: '100%', objectFit: 'cover',
          transition: 'transform 420ms var(--cc-ease-out)',
          transform: hover ? 'scale(1.04)' : 'scale(1)',
        }}/>
        {p.tag && (
          <span style={{
            position: 'absolute', top: 14, left: 14,
            fontFamily: 'var(--cc-font-sans)', fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase',
            background: '#ffffff', color: '#a85050', padding: '5px 10px',
            borderRadius: 999, fontWeight: 500, boxShadow: '0 0 0 1px #f5d3d3',
          }}>{p.tag}</span>
        )}
        {p.accent && (
          <CircleBadge color="coral" size={48} style={{
            position: 'absolute', top: 14, right: 14, background: accent,
            fontFamily: 'var(--cc-font-script)', fontSize: 16,
          }}>New</CircleBadge>
        )}
      </div>
      <div style={{ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Overline>{p.category}</Overline>
        <h4 style={{
          fontFamily: 'var(--cc-font-serif)', fontWeight: 500, fontSize: 18,
          margin: 0, color: '#3a2a2a', lineHeight: 1.25,
        }}>{p.name}</h4>
        {p.blurb && (
          <div style={{ fontFamily: 'var(--cc-font-sans)', fontSize: 12.5, color: '#7a5a5a', lineHeight: 1.45 }}>{p.blurb}</div>
        )}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 10, paddingTop: 12, borderTop: '1px dashed #f5c0c0',
        }}>
          <span style={{ fontFamily: 'var(--cc-font-serif)', fontSize: 17, color: '#3a2a2a' }}>{inr(p.price)}</span>
          <button onClick={onAdd} style={{
            fontFamily: 'var(--cc-font-sans)', fontSize: 13, fontWeight: 500,
            background: added ? '#9aad96' : '#f08a8a', color: '#ffffff',
            height: 32, padding: '0 14px', borderRadius: 999, border: 'none',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
            transition: 'background 200ms',
          }}>
            {added ? <><Icon name="check" size={13} stroke={2}/> Added</> : <>Add <Icon name="plus" size={13} stroke={2}/></>}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductGrid = ({ accent }) => {
  const { products, loading } = useProducts();
  const [filter, setFilter] = React.useState('All');
  if (loading) return null;
  const cats = ['All', 'Paper Crafts', 'Clay', 'Candles'];
  const items = filter === 'All' ? products : products.filter(p => p.category === filter);
  return (
    <section id="shop" style={{ background: '#fffafa', padding: '120px 40px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          marginBottom: 56, gap: 40, flexWrap: 'wrap',
        }}>
          <div>
            <Overline>The little shop</Overline>
            <h2 style={{
              fontFamily: 'var(--cc-font-serif)', fontWeight: 500, fontSize: 52,
              lineHeight: 1.08, letterSpacing: '-0.6px', margin: '14px 0 0',
              color: '#3a2a2a', maxWidth: 720, textWrap: 'pretty',
            }}>
              Folded, shaped, and poured — <span style={{ fontFamily: 'var(--cc-font-script)', fontWeight: 400, color: '#f08a8a' }}>made with love.</span>
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {cats.map(c => (
              <button key={c} onClick={() => setFilter(c)} style={{
                fontFamily: 'var(--cc-font-sans)', fontSize: 13.5,
                padding: '8px 16px', borderRadius: 999, cursor: 'pointer',
                border: 'none',
                background: filter === c ? '#f08a8a' : 'transparent',
                color: filter === c ? '#ffffff' : '#7a5a5a',
                boxShadow: filter === c ? 'none' : '0 0 0 1px #f5c0c0',
                transition: 'all 180ms',
              }}>{c}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {items.map(p => <ProductCard key={p.sku} p={p} accent={accent}/>)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 56 }}>
          <Button variant="white" size="lg">View all {products.length} pieces <Icon name="arrowRight" size={16} stroke={1.7}/></Button>
        </div>
      </div>
    </section>
  );
};

// ======== Classes & Events =========
const ClassCard = ({ k, accent, onBook }) => {
  const [hover, setHover] = React.useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', background: '#ffffff', borderRadius: 12, overflow: 'hidden',
        boxShadow: hover ? '0 0 0 1px #f5a3a3, 0 14px 32px rgba(240,138,138,0.18)' : '0 0 0 1px #f5d3d3',
        transition: 'box-shadow 240ms var(--cc-ease-out)',
        display: 'grid', gridTemplateColumns: '180px 1fr',
      }}>
      <div style={{ position: 'relative', background: '#fce4e4', minHeight: 200 }}>
        <img src={k.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}/>
        <span style={{
          position: 'absolute', top: 12, left: 12,
          fontFamily: 'var(--cc-font-sans)', fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase',
          background: k.mode === 'Online' ? '#3a2a2a' : '#f08a8a',
          color: '#ffffff', padding: '5px 10px', borderRadius: 999, fontWeight: 500,
        }}>{k.mode === 'Both' ? 'Online + Offline' : k.mode}</span>
      </div>
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Overline>{k.category} · Workshop</Overline>
        <h4 style={{
          fontFamily: 'var(--cc-font-serif)', fontWeight: 500, fontSize: 20,
          margin: 0, color: '#3a2a2a', lineHeight: 1.25,
        }}>{k.name}</h4>
        <div style={{ fontFamily: 'var(--cc-font-sans)', fontSize: 13, color: '#7a5a5a', lineHeight: 1.5 }}>{k.subtitle}</div>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px',
          marginTop: 6, fontFamily: 'var(--cc-font-sans)', fontSize: 12.5, color: '#5a3a3a',
        }}>
          <div><span style={{ color: '#a85050' }}>When · </span>{k.date_label}</div>
          <div><span style={{ color: '#a85050' }}>Duration · </span>{k.duration}</div>
          <div><span style={{ color: '#a85050' }}>Where · </span>{k.mode === 'Online' ? 'Live on Zoom' : 'Studio'}</div>
          <div><span style={{ color: '#a85050' }}>Seats · </span>{k.seats_left} max</div>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 'auto', paddingTop: 14, borderTop: '1px dashed #f5c0c0',
        }}>
          <span style={{ fontFamily: 'var(--cc-font-serif)', fontSize: 17, color: '#3a2a2a' }}>
            {inr(k.price)} <span style={{ fontFamily: 'var(--cc-font-sans)', fontSize: 11, color: '#a85050' }}>/ person</span>
          </span>
          <button onClick={() => onBook(k)} style={{
            fontFamily: 'var(--cc-font-sans)', fontSize: 13, fontWeight: 500,
            background: '#f08a8a', color: '#ffffff',
            height: 36, padding: '0 18px', borderRadius: 999, border: 'none',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            Book Now <Icon name="arrowRight" size={13} stroke={2}/>
          </button>
        </div>
      </div>
    </div>
  );
};

const ClassesGrid = ({ accent, onBook }) => {
  const { classes, loading } = useClasses();
  const [filter, setFilter] = React.useState('All');
  if (loading) return null;
  const filters = ['All', 'Paper Crafts', 'Clay', 'Candles', 'Online', 'Offline'];
  const items = classes.filter(k =>
    filter === 'All' ? true :
    (filter === 'Online' || filter === 'Offline') ? (k.mode === filter || k.mode === 'Both') :
    k.category === filter
  );
  return (
    <section id="classes" style={{ background: '#fce4e4', padding: '120px 40px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          marginBottom: 48, gap: 40, flexWrap: 'wrap',
        }}>
          <div>
            <Overline>Classes & events</Overline>
            <h2 style={{
              fontFamily: 'var(--cc-font-serif)', fontWeight: 500, fontSize: 48,
              lineHeight: 1.08, letterSpacing: '-0.5px', margin: '14px 0 0',
              color: '#3a2a2a', maxWidth: 720, textWrap: 'pretty',
            }}>
              Come make something with me, <span style={{ fontFamily: 'var(--cc-font-script)', fontWeight: 400, color: '#f08a8a' }}>online or in studio.</span>
            </h2>
            <p style={{
              fontFamily: 'var(--cc-font-sans)', fontSize: 15, color: '#7a5a5a',
              marginTop: 14, maxWidth: 540, lineHeight: 1.6,
            }}>
              All workshops are small-group and beginner-friendly. Pick a slot, request a custom date for groups of 3+, or join a live online class from anywhere.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {filters.map(c => (
              <button key={c} onClick={() => setFilter(c)} style={{
                fontFamily: 'var(--cc-font-sans)', fontSize: 13,
                padding: '8px 14px', borderRadius: 999, cursor: 'pointer', border: 'none',
                background: filter === c ? '#3a2a2a' : '#ffffff',
                color: filter === c ? '#ffffff' : '#7a5a5a',
                boxShadow: filter === c ? 'none' : '0 0 0 1px #f5c0c0',
                transition: 'all 180ms',
              }}>{c}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {items.map(k => <ClassCard key={k.id} k={k} accent={accent} onBook={onBook}/>)}
        </div>
      </div>
    </section>
  );
};

export { ProductGrid, ProductCard, ClassesGrid, ClassCard, inr }
