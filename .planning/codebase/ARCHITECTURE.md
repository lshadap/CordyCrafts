<!-- refreshed: 2026-05-06 -->
# Architecture

**Analysis Date:** 2026-05-06

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                      App Root (index.html)                   │
│                     `index.html:162`                          │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────┬──────────────────────┬────────────────┐
│  Sections Layer      │  Products Layer      │ Components     │
│  (sections.jsx)      │  (products.jsx)      │  (primitives.  │
│                      │                      │   jsx, hero.   │
│                      │                      │   jsx)         │
├──────────────────────┼──────────────────────┼────────────────┤
│ - About              │ - ProductGrid        │ - Icon         │
│ - Newsletter         │ - ProductCard        │ - Logo         │
│ - InstagramStrip     │ - ClassesGrid        │ - Button       │
│ - Footer             │ - ClassCard          │ - CircleBadge  │
│ - CartDrawer         │ - useCart hook       │ - Overline     │
│ - BookingModal       │                      │ - StitchDivider│
│ - WhatsAppIcon       │ - Cart store (pub-   │                │
│                      │   sub pattern)       │                │
└────────┬─────────────┴──────────┬───────────┴─────┬──────────┘
         │                        │                 │
         ▼                        ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Data Layer (Primitives + Constants)             │
│  - PRODUCTS array (products.jsx:47-62)                       │
│  - CLASSES array (products.jsx:65-122)                       │
│  - Design tokens (colors_and_type.css)                       │
│  - Cart store (products.jsx:4-41)                            │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              Global Window Exports                           │
│  - window.cart, window.cartCount                             │
│  - window.PRODUCTS, window.CLASSES                           │
│  - All components available to any script                    │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| App | Root app logic, tweaks panel, edit mode protocol | `index.html:85-162` |
| Nav | Sticky navigation, cart count badge, icons | `hero.jsx:3-51` |
| Hero | Large headline, tagline, layout | `hero.jsx:53-end` |
| Categories | Section content (not implemented yet) | `hero.jsx` |
| ProductGrid | Filter products by category, display grid | `products.jsx:196-240` |
| ProductCard | Individual product with image, price, add button | `products.jsx:128-194` |
| ClassesGrid | Filter classes, display 2-column grid | `products.jsx:299-349` |
| ClassCard | Class details, booking button | `products.jsx:243-297` |
| CartDrawer | Slide-in cart, forms, WhatsApp integration | `sections.jsx:192-354` |
| BookingModal | Modal for class booking via WhatsApp | `sections.jsx:357-482` |
| About | Dark section with maker bio, stats | `sections.jsx:3-60` |
| Newsletter | Email signup form | `sections.jsx:62-108` |
| InstagramStrip | 5-column image grid with captions | `sections.jsx:110-148` |
| Footer | Multi-column footer with links | `sections.jsx:150-182` |
| Primitives | Icon, Logo, Button, CircleBadge, Overline, StitchDivider | `primitives.jsx:1-124` |

## Pattern Overview

**Overall:** Client-side React rendered directly in HTML with script tags. No build step, no bundling. All state is either component-local (React.useState) or global (window.cart via pub-sub).

**Key Characteristics:**
- Single HTML file entry point that loads 4 JSX scripts via Babel standalone
- No module system — all components exported to window object
- Cart store is a plain JS object with publish-subscribe pattern for reactivity
- Tweaks panel allows edit-mode to configure accent color and headline copy
- All prices in INR (₹), formatted via `inr()` utility function
- WhatsApp integration for orders and class bookings (no real payment processing yet)
- Design system via CSS custom properties in `colors_and_type.css`

## Layers

**Presentation Layer:**
- Purpose: Render UI, handle user interactions, manage component-local state
- Location: `index.html`, `primitives.jsx`, `hero.jsx`, `sections.jsx`
- Contains: React components with inline styles, form inputs, buttons
- Depends on: Design tokens (CSS vars), global cart store
- Used by: Everything — this is the rendered output

**State & Data Layer:**
- Purpose: Hold product/class catalogs, manage cart, provide reactive updates
- Location: `products.jsx:4-41` (cart store), `products.jsx:47-122` (catalogs)
- Contains: PRODUCTS array, CLASSES array, cart object with add/remove/setQty methods
- Depends on: Nothing
- Used by: ProductGrid, ProductCard, ClassesGrid, ClassCard, CartDrawer

**Component Library:**
- Purpose: Reusable UI atoms (buttons, badges, icons)
- Location: `primitives.jsx`
- Contains: Icon, Logo, Button, CircleBadge, Overline, StitchDivider, HeartMark
- Depends on: CSS vars for colors and spacing
- Used by: All section components

## Data Flow

### Primary Request Path (Browse → Add to Cart → Checkout)

1. **Page Load** (`index.html:162`) — ReactDOM renders App component
2. **Browse Products** (`ProductGrid:196-240`) — User filters by category, sees ProductCard instances
3. **Add to Cart** (`ProductCard:132-135`) — User clicks "Add" button, calls `cart.add({sku, name, price, img, qty, cat})`
4. **Cart Notification** (`products.jsx:27-30`) — `cart._notify()` updates `window.cartCount` and fires listeners (subscribed via `useCart()`)
5. **Render Cart Badge** (`hero.jsx:38-46`) — Nav component re-renders, shows item count
6. **Open Cart Drawer** (`hero.jsx:33` or any button calling `window.openCart()`) — CartDrawer slides in
7. **Review & Submit** (`CartDrawer:232-280`) — User adjusts quantities, clicks "Place Order via WhatsApp"
8. **Form Stage** (`CartDrawer:283-324`) — Collects name, phone, address
9. **Confirmation** (`CartDrawer:326-354`) — Shows success screen with WhatsApp badge

**State Management:**
- Cart state: Plain JS object, notifications via Set of listeners
- Component state: React.useState for form fields, loading states, drawer visibility
- Tweaks: JSON stored in `window.TWEAKS`, synced to parent via postMessage

### Secondary Flow: Browse Classes → Book Class

1. **View Classes** (`ClassesGrid:299-349`) — Filter by craft type, online/offline mode
2. **Open Booking Modal** (`ClassCard:285-292`) — User clicks "Book Now"
3. **BookingModal Opens** (`sections.jsx:357-482`) — Modal shows with class details
4. **Collect Details** (`BookingModal:400-450`) — Name, phone, seat count, preference (Online/Offline)
5. **Send to Cordeelia** (`BookingModal:373-377`) — Submits via WhatsApp (no backend call, just form state)
6. **Confirmation** (`BookingModal:453-478`) — Shows success with booking summary

### Tweaks Panel (Edit Mode)

1. **Page Detected** (`index.html:90-98`) — App listens for `__activate_edit_mode` message
2. **Panel Opens** (`index.html:131-157`) — Shows accent color swatches and headline copy options
3. **User Changes** (`index.html:100-106`) — Calls `setKey(key, val)`, posts to parent via postMessage
4. **Re-render** (`index.html:108-109`) — Accent and copy update reactively

## Key Abstractions

**Cart Store (Singleton):**
- Purpose: Central state for shopping cart, decoupled from React
- Examples: `products.jsx:4-32`
- Pattern: Plain object with methods (add, remove, setQty, clear, count, total), internal Set of listener functions, `_notify()` method to trigger updates
- Why: Allows any component to subscribe without prop drilling

**useCart Hook:**
- Purpose: Subscribe a component to cart updates
- Examples: `products.jsx:34-41`, `ProductCard:129`, `CartDrawer:193`
- Pattern: useReducer to force re-render on cart change, useEffect to manage listener lifecycle
- Why: Makes React components reactive to non-React state

**Component Exports to Window:**
- Purpose: Make all components globally accessible without import statements
- Examples: `primitives.jsx:124`, `products.jsx:351`, `sections.jsx:507`
- Pattern: `Object.assign(window, { Component1, Component2, ... })`
- Why: Enables script-tag-based architecture where each .jsx file doesn't know about the others

**Design Tokens:**
- Purpose: Centralized color, typography, spacing system
- Examples: `colors_and_type.css:17-100`
- Pattern: CSS custom properties (--cc-*), referenced inline in React components
- Why: Tweaks panel can change accent color by updating a single var; consistent spacing

## Entry Points

**HTML Entry:**
- Location: `index.html`
- Triggers: Page load
- Responsibilities: Load React + Babel, define inline App component, render to DOM

**Component Scripts:**
- `primitives.jsx` — Must load first (used by all others)
- `hero.jsx` — Depends on primitives
- `products.jsx` — Depends on primitives
- `sections.jsx` — Depends on primitives, products

**Edit Mode Protocol:**
- Entry: postMessage from parent with type `__activate_edit_mode`
- Response: App posts `__edit_mode_available` on mount
- Flow: Parent can turn panel on/off, App posts edits back via `__edit_mode_set_keys`

## Architectural Constraints

- **Threading:** Single-threaded event loop (browser JavaScript)
- **Global state:** cart object is the only true global. window.TWEAKS holds UI state. window.PRODUCTS and window.CLASSES are read-only catalogs.
- **Circular imports:** None (no module imports, all via script tags)
- **Cart listeners:** Set of forceUpdate functions. If a listener is not properly cleaned up, cart updates will call dead functions. useCart hook handles cleanup.
- **Edit mode:** Assumes trusted parent window (no validation of postMessage source). Edit changes are optimistic (no backend sync).
- **No backend:** All data (products, classes) is hardcoded. Cart/booking only collects form data, doesn't persist. WhatsApp integration is manual (user's phone opens WhatsApp with pre-filled message).
- **Styling:** Inline styles only. No CSS-in-JS library. Responsive design limited (no media queries observed in inline styles — mobile responsiveness unclear).

## Anti-Patterns

### Hardcoded Colors Instead of CSS Vars

**What happens:** Many components hardcode hex colors directly in inline styles (e.g., `color: '#f08a8a'`, `background: '#ffffff'`), ignoring the design tokens in `colors_and_type.css`.

**Why it's wrong:** Changes to brand colors must be made in multiple places. The tweaks panel can only change `--cc-terracotta` but many hardcoded values don't respect that.

**Do this instead:** Use CSS vars consistently. Reference `--cc-*` tokens instead of hex. Example in `CartDrawer:272`: should use `var(--cc-*) for the green WhatsApp color.

### Form Submission Without Backend

**What happens:** CartDrawer and BookingModal collect names, phones, addresses but only display a success screen. No actual data is sent anywhere — user must manually open WhatsApp.

**Why it's wrong:** Cart/bookings are lost on page refresh. No record keeping. No notification to Cordeelia unless she's actively watching WhatsApp.

**Do this instead:** Add a backend endpoint to save orders/bookings. Send a notification to Cordeelia's WhatsApp (via Twilio or similar API) when a form is submitted. Return a confirmation number.

### Cart in Window Object Without Strict Cleanup

**What happens:** Listeners in a Set, useCart hook adds/removes, but if a component unmounts without calling the cleanup function (or if cleanup is skipped), dead functions stay in the Set.

**Why it's wrong:** Memory leak. Cart notifications will try to call forceUpdate on unmounted components, causing React warnings.

**Do this instead:** Already handled correctly in `useCart` hook (`React.useEffect` cleanup). But make sure all components using cart call `useCart()` not raw `window.cart`.

### Categories Section Placeholder

**What happens:** Hero section mentions "Categories" but the component doesn't exist in sections.jsx or hero.jsx. It's referenced in index.html:122 but not implemented.

**Why it's wrong:** Page structure is incomplete. Categories section will render as undefined/nothing.

**Do this instead:** Implement `Categories` component in hero.jsx or create a new section. Show category cards (Paper Crafts, Clay, Candles, etc.) with images and link to product filter.

## Error Handling

**Strategy:** Minimal. No try-catch blocks observed. Assumes valid input and no runtime errors.

**Patterns:**
- Form validation via HTML5 `required` and `pattern` attributes
- Cart operations check existence before operating (e.g., `const it = this.items.find(...)`)
- Class booking checks `klass` existence before rendering (`if (!klass) return null`)

**Missing:** No error messages for failed WhatsApp sends, no validation feedback for email signup, no handling for missing images.

## Cross-Cutting Concerns

**Logging:** None. No console statements observed.

**Validation:** 
- HTML5 built-in (required fields, email type, tel pattern)
- JS-side: cart methods check for item existence before removing

**Authentication:** None. No user accounts. Edit mode uses postMessage with no origin validation.

---

*Architecture analysis: 2026-05-06*
