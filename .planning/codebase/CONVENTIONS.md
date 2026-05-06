# Coding Conventions

**Analysis Date:** 2026-05-06

## Overview

This is a React-based e-commerce site for handmade crafts. All code is written in JSX without a build system, using HTML inline `<script type="text/babel">` tags with Babel standalone for transpilation. The codebase emphasizes inline styles, functional components, and direct DOM manipulation.

## Naming Patterns

**Files:**
- Component files: `PascalCase.jsx` — `primitives.jsx`, `hero.jsx`, `products.jsx`, `sections.jsx`
- Data constants: UPPERCASE — `PRODUCTS`, `CLASSES`, `ACCENTS`, `HEADLINES`
- Utility functions: camelCase — `inr()`, `useCart()`

**Functions & Components:**
- React components: PascalCase — `Nav`, `Hero`, `ProductCard`, `CartDrawer`, `BookingModal`
- React hooks: camelCase with `use` prefix — `useCart()`
- Event handlers: camelCase with `on` prefix — `onClick`, `onSubmit`, `onClose`, `onBook`
- State setters: camelCase — `setEmail`, `setStage`, `setTweaks`, `setForm`
- Utilities: camelCase — `inr()`, `submit()`, `_notify()` (private prefix)

**Variables & Props:**
- React state: camelCase — `email`, `stage`, `form`, `hover`, `added`, `panel`
- CSS variables: kebab-case prefixed with `--cc-` — `--cc-font-serif`, `--cc-terracotta`, `--cc-parchment`
- Object keys: camelCase — `{ name, phone, addr }`, `{ sku, name, price, img, qty, cat }`
- Loop variables: single letter lowercase — `i`, `k`, `p`, `x`, `t`, `l`, `v` (for brevity)

**Types:**
- No TypeScript; types are implicit in usage
- Data objects follow structure: `{ sku, name, price, img, ... }`
- Color variables use hex codes: `'#f08a8a'`, `'#3a2a2a'`

## Code Style

**Formatting:**
- No linter or formatter configured; code is hand-formatted
- Inline styles preferred over CSS classes (except in `index.html` for tweaks panel)
- Maximum line length: ~100 characters (not enforced)
- Indentation: 2 spaces per level

**Linting:**
- No ESLint or Prettier configured
- No type checking

**Spacing:**
```javascript
// Components separated by blank line
const Nav = ({ accent }) => (
  // JSX
);

const Hero = ({ headline, sub, accent }) => (
  // JSX
);

// Objects and arrays use consistent spacing
const PRODUCTS = [
  { sku: 'p01', name: 'Item', price: 100 },
  { sku: 'p02', name: 'Item', price: 200 },
];
```

## Import Organization

**Pattern:**
1. No `import` statements used (all scripts loaded via `<script>` tags in `index.html`)
2. Global scope — all components and utilities assigned to `window` object
3. Load order in `index.html`:
   ```html
   <script src="primitives.jsx"></script>      <!-- Icons, Logo, Button, Badge, Overline, StitchDivider -->
   <script src="hero.jsx"></script>            <!-- Nav, Hero, Categories, CategoryTile -->
   <script src="products.jsx"></script>        <!-- Cart store, Products grid, Classes grid -->
   <script src="sections.jsx"></script>        <!-- About, Newsletter, Footer, Cart/Booking modals -->
   ```

**Exports:**
- At end of each file, use `Object.assign(window, { Component1, Component2, ... })`
- Example from `primitives.jsx`:
  ```javascript
  Object.assign(window, { Icon, Logo, HeartMark, Button, CircleBadge, Overline, StitchDivider });
  ```
- Example from `products.jsx`:
  ```javascript
  Object.assign(window, { Cart, useCart, inr, PRODUCTS, CLASSES, ... });
  ```

**Dependencies:**
- React: via CDN `unpkg.com/react@18.3.1`
- ReactDOM: via CDN `unpkg.com/react-dom@18.3.1`
- Babel: via CDN `unpkg.com/@babel/standalone@7.29.0`

## Error Handling

**Pattern:** Minimal/defensive

- No try/catch blocks used
- Form validation: conditional checks on submit
  ```javascript
  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;  // Guard clause
    // Process form
  };
  ```

- State guards: check existence before rendering
  ```javascript
  if (!klass) return null;  // Exit if required prop missing
  ```

- Quantity bounds enforcement: use `Math.max()` / `Math.min()`
  ```javascript
  onClick={() => setForm({ ...form, seats: Math.max(1, form.seats - 1) })}
  onClick={() => setForm({ ...form, seats: Math.min(klass.seats, form.seats + 1) })}
  ```

- Phone sanitization: strip non-digits, enforce length
  ```javascript
  onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
  ```

## Logging

**Pattern:** None currently used

- No console.log or console.warn statements
- All state changes managed through React state
- Cart notifications handled via custom pub-sub: `cartListeners` Set and `_notify()` method

## Comments

**When to Comment:**
- Rarely used — most code is self-documenting via clear naming
- Section dividers for major features:
  ```javascript
  // ======== Cart store (global, plain pub-sub) =========
  // ===== shared form atoms =====
  // ============== WhatsApp Icon ==============
  ```

- Inline comments for non-obvious logic:
  ```javascript
  // dashed stitch border ring
  // Tweakable defaults (persisted to disk via edit mode)
  ```

**JSDoc/TSDoc:** Not used

## Function Design

**Size:** Functions are compact (1–50 lines typical)

**Parameters:**
- Destructured props in component function signatures:
  ```javascript
  const Nav = ({ accent }) => (...)
  const ProductCard = ({ p, accent }) => (...)
  const CartDrawer = ({ open, onClose, accent }) => (...)
  ```

- Event handlers receive `e` for form submission:
  ```javascript
  const submit = (e) => { e.preventDefault(); ... }
  ```

**Return Values:**
- React components return JSX wrapped in `()` parentheses
- Non-React functions return values directly
- No explicit return statements in inline arrow functions with single expression

**Example patterns:**

```javascript
// Simple utility
const inr = (n) => '₹' + n.toLocaleString('en-IN');

// React component with state
const Newsletter = ({ accent }) => {
  const [email, setEmail] = React.useState('');
  const [done, setDone] = React.useState(false);
  const submit = (e) => { e.preventDefault(); if (email) { setDone(true); setEmail(''); } };
  return (
    <section>...</section>
  );
};

// Hook for subscription to pub-sub
const useCart = () => {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    cartListeners.add(force);
    return () => cartListeners.delete(force);
  }, []);
  return cart;
};
```

## Module Design

**Exports:** All via `Object.assign(window, {...})`

**Barrel Files:** Not used (only root-level export pattern)

**Scope:**
- Component-level state: React.useState
- Global state: `window` object and custom pub-sub (`cart`, `cartListeners`)
- No module-level mutable state except `cart` and `cartListeners`

## Inline Styles

**Pattern:** Dominant pattern in this codebase

All styling is done via inline `style` objects. CSS custom properties (variables) reference Cordy's Crafts design tokens from `colors_and_type.css`:

```javascript
<div style={{
  fontFamily: 'var(--cc-font-serif)',
  fontSize: 68,
  color: '#3a2a2a',
  lineHeight: 1.02,
}}>
  {headline}
</div>
```

**Common inline style patterns:**

- Layout: `display: 'flex'`, `gridTemplateColumns`, `position: 'absolute'`
- Typography: `fontFamily: 'var(--cc-font-*)'`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`
- Colors: hex codes or CSS variables
- Transitions: `transition: 'property duration ease'`

**Style objects reused:**

```javascript
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
```

## React Patterns

**Hooks:**
- `React.useState()` for component state
- `React.useEffect()` for side effects (cleanup listeners, message handlers)
- `React.useReducer()` for force-update in `useCart()` hook

**Event Handling:**
- Inline event handlers with arrow functions
- `onClick`, `onChange`, `onSubmit` with preventDefault for forms
- Window event listeners for edit-mode protocol

**Conditional Rendering:**
- Ternary operators: `{stage === 'done' ? 'Thank you!' : 'Almost there'}`
- Logical AND: `{c.items.length === 0 && <div>...</div>}`
- Early return from components: `if (!klass) return null;`

**State Updates:**
- Immutable updates via spread operator: `setForm({ ...form, name: e.target.value })`
- Array filtering: `this.items = this.items.filter(i => i.sku !== sku)`

---

*Convention analysis: 2026-05-06*
