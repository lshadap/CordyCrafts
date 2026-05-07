import React from 'react'
// Cordy's Crafts — primitives (Icon, Logo, Button, Badge)

const Icon = ({ name, size = 20, stroke = 1.75, ...rest }) => {
  const paths = {
    arrowRight: <path d="M5 12h14M13 5l7 7-7 7" />,
    arrowUp:    <path d="M7 17 17 7M8 7h9v9" />,
    menu:       <path d="M4 7h16M4 12h16M4 17h16" />,
    search:     <g><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></g>,
    cart:       <g><path d="M3 4h2l2.5 12h11L21 7H6"/><circle cx="9" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/></g>,
    heart:      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>,
    user:       <g><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/></g>,
    plus:       <path d="M12 5v14M5 12h14"/>,
    check:      <path d="M20 6 9 17l-5-5"/>,
    instagram:  <g><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/></g>,
    flame:      <path d="M12 2c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>,
    sparkle:    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M7 7l3 3M14 14l3 3M7 17l3-3M14 10l3-3"/>,
    scissors:   <g><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.5 15.5M20 20 8.5 8.5"/></g>,
    leaf:       <path d="M4 20C4 12 10 4 20 4c0 10-8 16-16 16zM4 20l8-8"/>,
    mail:       <g><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></g>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" {...rest}>
      {paths[name]}
    </svg>
  );
};

// Heart-with-swirls mark inspired by the Cordy's Crafts logo
const HeartMark = ({ size = 36, color = '#f08a8a' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* dashed outer stitching */}
    <path d="M32 56 C 8 40, 4 22, 16 14 C 24 9, 30 14, 32 20 C 34 14, 40 9, 48 14 C 60 22, 56 40, 32 56 Z"
      fill={color} stroke="#ffffff" strokeWidth="1.4" strokeDasharray="2 2"/>
    {/* swirls */}
    <g stroke="#ffffff" strokeWidth="2.2" fill="none" strokeLinecap="round">
      <path d="M24 28 a4 4 0 1 1 -2 -3.6 a6 6 0 1 1 2 7"/>
      <path d="M40 28 a4 4 0 1 0 2 -3.6 a6 6 0 1 0 -2 7"/>
      <path d="M32 38 a3.5 3.5 0 1 1 -2 -3 a5.5 5.5 0 1 1 2 6.5"/>
    </g>
    {/* tiny scissors on top right */}
    <g stroke={color} strokeWidth="1.4" fill="#ffffff" transform="translate(46 6)">
      <circle cx="2" cy="2" r="1.6"/>
      <circle cx="6" cy="2" r="1.6"/>
      <path d="M3.4 3.4 L8 8 M4.6 3.4 L 0 8" stroke={color} strokeWidth="1"/>
    </g>
  </svg>
);

const Logo = ({ dark = false, size = 22 }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: dark ? '#faf9f5' : '#3a2a2a' }}>
    <HeartMark size={size + 14} color="#f08a8a"/>
    <span style={{
      fontFamily: "var(--cc-font-script)", fontWeight: 400,
      fontSize: size + 4, color: '#f08a8a', lineHeight: 1, letterSpacing: '0.2px',
      paddingTop: 4,
    }}>
      Cordy's Crafts
    </span>
  </span>
);

const Button = ({ variant = 'brand', children, onClick, full = false, size = 'md', as = 'button', href }) => {
  const dims = size === 'lg'
    ? { height: 52, padding: '0 24px', fontSize: 15 }
    : size === 'sm'
    ? { height: 36, padding: '0 14px', fontSize: 14 }
    : { height: 44, padding: '0 20px', fontSize: 15 };
  const base = {
    fontFamily: 'var(--cc-font-sans)', fontWeight: 500, ...dims,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    border: 'none', cursor: 'pointer', textDecoration: 'none',
    width: full ? '100%' : 'auto',
    transition: 'box-shadow 200ms var(--cc-ease-out), background 200ms, color 200ms, transform 200ms',
  };
  const styles = {
    brand:   { ...base, background: '#f08a8a', color: '#ffffff', borderRadius: 999, boxShadow: '#f08a8a 0 0 0 1px' },
    dark:    { ...base, background: '#3a2a2a', color: '#fce4e4', borderRadius: 999, boxShadow: '#3a2a2a 0 0 0 1px' },
    white:   { ...base, background: '#ffffff', color: '#3a2a2a', borderRadius: 999, boxShadow: '0 0 0 1px #f5d3d3' },
    sand:    { ...base, background: '#fce4e4', color: '#a85050', borderRadius: 999, boxShadow: '#f5c0c0 0 0 0 1px' },
    ghost:   { ...base, background: 'transparent', color: '#3a2a2a', borderRadius: 999 },
    ghostDark:{ ...base, background: 'transparent', color: '#faf9f5', borderRadius: 999, boxShadow: '0 0 0 1px #5a3a3a' },
  };
  const Tag = as;
  return <Tag style={styles[variant]} onClick={onClick} href={href}>{children}</Tag>;
};

const CircleBadge = ({ children, color = 'coral', size = 54, style }) => {
  const palette = {
    coral:      { bg: '#f08a8a', fg: '#ffffff' },
    sage:       { bg: '#9aad96', fg: '#141413' },
    cream:      { bg: '#fce4e4', fg: '#a85050' },
    dark:       { bg: '#3a2a2a', fg: '#fce4e4' },
    ivory:      { bg: '#faf9f5', fg: '#3a2a2a' },
  }[color] || { bg: color, fg: '#ffffff' };
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: palette.bg, color: palette.fg,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--cc-font-sans)', fontWeight: 500, fontSize: size * 0.24,
      letterSpacing: 0.3, ...style,
    }}>{children}</div>
  );
};

const Overline = ({ children, dark = false, style }) => (
  <div style={{
    fontFamily: 'var(--cc-font-sans)', fontSize: 11, fontWeight: 500,
    letterSpacing: 1.4, textTransform: 'uppercase',
    color: dark ? '#f5c0c0' : '#a85050', ...style,
  }}>{children}</div>
);

// Dashed stitching divider, picks up the dashed outline from the logo
const StitchDivider = ({ color = '#f5c0c0', style }) => (
  <div style={{
    height: 1, width: '100%',
    backgroundImage: `repeating-linear-gradient(90deg, ${color} 0 6px, transparent 6px 12px)`,
    ...style,
  }}/>
);

export { Icon, Logo, HeartMark, Button, CircleBadge, Overline, StitchDivider }
