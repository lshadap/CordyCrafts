// Cordy's Crafts — top of page: Nav, Hero, Categories
import React from 'react'
import { Icon, Logo, Button, Overline, CircleBadge } from './primitives.jsx'
import { useBreakpoint } from './hooks/useBreakpoint.js'

const Nav = ({ accent, cartCount, onOpenCart }) => {
  const bp = useBreakpoint()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const isMobile = bp === 'mobile'
  const links = [
    { label: 'Shop',         href: '#shop' },
    { label: 'Paper Crafts', href: '#shop' },
    { label: 'Clay',         href: '#shop' },
    { label: 'Candles',      href: '#shop' },
    { label: 'Classes',      href: '#classes' },
    { label: 'About',        href: '#about' },
  ]
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: 'rgba(255,250,250,0.92)', backdropFilter: 'blur(10px)',
      borderBottom: '1px solid #f5d3d3',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: isMobile ? '12px 20px' : '14px 40px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr auto' : '1fr auto 1fr',
        alignItems: 'center', gap: isMobile ? 12 : 32,
      }}>
        <Logo size={20} />
        {!isMobile && (
          <div style={{ display: 'flex', gap: 28, alignItems: 'center', fontFamily: 'var(--cc-font-sans)', fontSize: 14.5, justifySelf: 'center' }}>
            {links.map((x, i) => (
              <a key={x.label} href={x.href} style={{
                color: i === 0 ? '#3a2a2a' : '#7a5a5a', textDecoration: 'none',
                fontWeight: i === 0 ? 500 : 400,
              }}>{x.label}</a>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: isMobile ? 12 : 18, alignItems: 'center', color: '#3a2a2a', justifySelf: 'end' }}>
          {!isMobile && (
            <>
              <Icon name="search" size={19} stroke={1.6} />
              <Icon name="heart" size={19} stroke={1.6} />
              <Icon name="user" size={19} stroke={1.6} />
            </>
          )}
          <button onClick={() => onOpenCart && onOpenCart()} style={{
            position: 'relative', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: '#3a2a2a',
            display: 'inline-flex', alignItems: 'center',
          }} aria-label="Open cart">
            <Icon name="cart" size={19} stroke={1.6} />
            {(cartCount || 0) > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -8,
                background: accent, color: '#ffffff',
                fontSize: 10, fontWeight: 600, fontFamily: 'var(--cc-font-sans)',
                width: 16, height: 16, borderRadius: 999,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>{cartCount}</span>
            )}
          </button>
          {isMobile && (
            <button onClick={() => setMenuOpen(o => !o)} style={{
              background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: '#3a2a2a',
              display: 'inline-flex', alignItems: 'center',
            }} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
              <Icon name={menuOpen ? 'plus' : 'menu'} size={22} stroke={1.6}
                style={menuOpen ? { transform: 'rotate(45deg)', transition: 'transform 180ms' } : { transition: 'transform 180ms' }} />
            </button>
          )}
        </div>
      </div>
      {isMobile && menuOpen && (
        <div style={{ background: 'rgba(255,250,250,0.98)', borderTop: '1px solid #f5d3d3', padding: '8px 20px 16px' }}>
          {links.map(x => (
            <a key={x.label} href={x.href} onClick={() => setMenuOpen(false)} style={{
              display: 'block', padding: '13px 0',
              fontFamily: 'var(--cc-font-sans)', fontSize: 15.5, color: '#3a2a2a',
              textDecoration: 'none', borderBottom: '1px solid #f5e8e8',
            }}>{x.label}</a>
          ))}
        </div>
      )}
    </nav>
  )
}

const Hero = ({ headline, sub, accent }) => {
  const bp = useBreakpoint()
  const isMobile = bp === 'mobile'
  return (
    <section style={{ background: '#fffafa', borderBottom: '1px solid #f5d3d3' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1.15fr',
        minHeight: isMobile ? 'auto' : 620,
      }}>
        {/* LEFT — copy */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: isMobile ? '52px 24px 52px' : '80px 64px 80px 80px',
          position: 'relative',
          borderRight: isMobile ? 'none' : '1px dashed #f5c0c0',
        }}>
          {!isMobile && (
            <div style={{
              position: 'absolute', left: 28, top: '50%', transform: 'translateY(-50%) rotate(-90deg)',
              transformOrigin: 'left center',
              fontFamily: 'var(--cc-font-sans)', fontSize: 10.5, letterSpacing: 2.2,
              textTransform: 'uppercase', color: '#a85050', whiteSpace: 'nowrap',
            }}>
              Est. 2019 · Made by Cordeelia
            </div>
          )}
          <Overline>A little studio of four crafts</Overline>
          <h1 style={{
            fontFamily: 'var(--cc-font-serif)', fontWeight: 500,
            fontSize: isMobile ? 50 : 68,
            lineHeight: 1.02, letterSpacing: '-1px', color: '#3a2a2a',
            marginTop: 24, marginBottom: 0, textWrap: 'pretty',
          }}>
            {headline.split('\n').map((l, i) => (
              <div key={i}>
                {i === 1
                  ? <span style={{ fontFamily: 'var(--cc-font-script)', fontWeight: 400, color: '#f08a8a', fontSize: isMobile ? 52 : 70 }}>{l}</span>
                  : l}
              </div>
            ))}
          </h1>
          <p style={{
            fontFamily: 'var(--cc-font-sans)', fontSize: isMobile ? 15 : 16.5, lineHeight: 1.65,
            color: '#7a5a5a', marginTop: 28, maxWidth: 420,
          }}>{sub}</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 36, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button variant="brand" size="lg">Shop the collection <Icon name="arrowRight" size={16} stroke={1.8}/></Button>
            <a href="#" style={{
              fontFamily: 'var(--cc-font-sans)', fontSize: 14.5, color: '#3a2a2a',
              textDecoration: 'underline', textUnderlineOffset: 4, textDecorationColor: '#f5c0c0',
            }}>Read our story →</a>
          </div>
          {!isMobile && (
            <div style={{
              position: 'absolute', left: 80, bottom: 40,
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: '#ffffff', borderRadius: 999, padding: '6px 16px 6px 6px',
              boxShadow: '0 0 0 1px #f5d3d3',
            }}>
              <CircleBadge color="coral" size={30} style={{ background: accent, fontSize: 11 }}>
                <Icon name="sparkle" size={14} stroke={1.7}/>
              </CircleBadge>
              <span style={{ fontFamily: 'var(--cc-font-sans)', fontSize: 13, color: '#7a5a5a' }}>
                New batch · Spring candle pour
              </span>
            </div>
          )}
        </div>
        {/* RIGHT — hero image (desktop only) */}
        {!isMobile && (
          <div style={{ position: 'relative', background: '#fce4e4', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', inset: 24, border: '1.5px dashed #f5a3a3',
              borderRadius: 24, pointerEvents: 'none',
            }}/>
            <div style={{
              position: 'absolute', top: '38%', right: '12%', zIndex: 2,
              transform: 'translateY(-50%)',
            }}>
              <CircleBadge color="coral" size={86} style={{
                background: accent, flexDirection: 'column', gap: 0, lineHeight: 1,
                fontFamily: 'var(--cc-font-script)', boxShadow: '0 8px 22px rgba(240,138,138,0.35)',
              }}>
                <span style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'var(--cc-font-sans)', fontWeight: 600 }}>Save</span>
                <span style={{ fontSize: 30, marginTop: 2 }}>20%</span>
              </CircleBadge>
            </div>
            <img src="/assets/hero-fox.svg" alt="Cordy's Crafts featured piece"
              style={{ width: '78%', height: '100%', objectFit: 'contain', margin: '0 auto', display: 'block', position: 'relative', zIndex: 1 }}/>
            <div style={{
              position: 'absolute', right: 0, top: 0, bottom: 0, width: 54,
              background: '#f08a8a', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'space-between', padding: '28px 0',
            }}>
              <div style={{
                fontFamily: 'var(--cc-font-sans)', fontSize: 10.5, letterSpacing: 1.8,
                textTransform: 'uppercase', color: '#fce4e4',
                writingMode: 'vertical-rl', transform: 'rotate(180deg)',
              }}>
                Featured · The Heart Trio
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, color: '#fce4e4' }}>
                <Icon name="instagram" size={16} stroke={1.5}/>
                <div style={{ width: 1, height: 18, background: '#fce4e4', opacity: 0.5, margin: '0 auto' }}/>
                <span style={{
                  fontFamily: 'var(--cc-font-script)', fontSize: 16, color: '#ffffff',
                  writingMode: 'vertical-rl', transform: 'rotate(180deg)',
                }}>01 / 03</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

const CategoryTile = ({ label, sub, img, accent, badge, script }) => (
  <a href="#" style={{
    position: 'relative', display: 'block', textDecoration: 'none',
    background: '#fce4e4', overflow: 'hidden', minHeight: 320,
    borderRight: '1px dashed #f5a3a3',
  }}>
    <img src={img} alt="" style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      objectFit: 'cover', opacity: 0.95,
    }}/>
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, rgba(252,228,228,0) 30%, rgba(58,42,42,0.7) 100%)',
    }}/>
    <div style={{
      position: 'relative', height: '100%', padding: '28px 28px 32px',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      minHeight: 320, color: '#ffffff',
    }}>
      <div>
        <div style={{
          fontFamily: 'var(--cc-font-sans)', fontSize: 10.5, letterSpacing: 1.6,
          textTransform: 'uppercase', color: '#fce4e4',
        }}>{sub}</div>
        <h3 style={{
          fontFamily: 'var(--cc-font-script)', fontWeight: 400, fontSize: 42,
          lineHeight: 1, margin: '14px 0 0', color: '#ffffff', letterSpacing: '0.5px',
        }}>{label}</h3>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <span style={{
          fontFamily: 'var(--cc-font-sans)', fontSize: 13, color: '#ffffff',
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
          Shop all <Icon name="arrowRight" size={14} stroke={1.7}/>
        </span>
        {badge && (
          <CircleBadge color="ivory" size={48} style={{
            fontFamily: 'var(--cc-font-script)', fontSize: 16, color: '#f08a8a',
          }}>{badge}</CircleBadge>
        )}
      </div>
    </div>
  </a>
)

const Categories = ({ accent }) => {
  const bp = useBreakpoint()
  const cols = bp === 'mobile' ? 2 : 4
  return (
    <section id="categories" style={{
      display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`,
      background: '#fffafa', borderTop: '1px solid #f5d3d3',
    }}>
      <CategoryTile label="Paper Crafts" sub="Cards · Quilling · Iris folding" img="/assets/category-amigurumi.svg" accent={accent} badge="24" />
      <CategoryTile label="Clay" sub="Air-dry · Polymer charms" img="/assets/category-bags.svg" accent={accent} />
      <CategoryTile label="Candles" sub="Soy · Beeswax · Hand poured" img="/assets/category-wearables.svg" accent={accent} badge="New" />
      <CategoryTile label="Classes & Events" sub="Online · Offline · Workshops" img="/assets/category-classes.svg" accent={accent} badge="Book" />
    </section>
  )
}

export { Nav, Hero, Categories, CategoryTile }
