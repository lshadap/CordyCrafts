# Cordy's Crafts — Project Rules

> These guidelines apply to the entire Cordy's Crafts project.
> Read this file completely before writing any code.

## Project-Specific Rules (take priority over general guidelines below)

- Do NOT rewrite or restructure any component that came from Claude Design
- Do NOT rename any CSS variables in colors_and_type.css
- Do NOT rename or move any SVG files in assets/ or assets/products/
- All prices must be in Indian Rupees (₹) — never $ or €
- VITE_WHATSAPP_NUMBER is always read from env vars — never hardcoded
- Supabase client lives only in src/lib/supabase.js — never initialised elsewhere
- If uncertain about any existing component's behaviour, read it first, ask second

---

<!-- Karpathy guidelines follow below — do not edit -->

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

<!-- GSD:project-start source:PROJECT.md -->
## Project

**Cordy's Crafts**

A static single-page e-commerce website for Cordy's Crafts, a handmade crafts brand run by Cordeelia in India. The site lets customers browse and purchase handmade goods (paper crafts, clay, candles) and book small-group workshops — all orders and bookings routed to Cordeelia via WhatsApp, with no payment gateway in v1.

**Core Value:** A customer on a phone can browse the full catalogue, add items to cart, and place an order that lands in Cordeelia's WhatsApp — all in under a minute.

### Constraints

- **Tech stack**: React + Vite 5, Supabase, React Router v6, Vercel — non-negotiable
- **Design**: Must preserve all Claude Design components, tokens, and SVG assets exactly — no rewrites
- **Mobile-first**: Most visitors on phones; mobile layout is the primary target
- **Currency**: All prices in ₹ (INR) — no $ or €
- **Payments**: No payment processing in v1 — WhatsApp → UPI flow only
- **Supabase**: Single client in `src/lib/supabase.js`; env vars for URL and anon key
- **Env vars**: `VITE_WHATSAPP_NUMBER` never hardcoded
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- HTML5 - Static markup and document structure
- JavaScript (ESNext) - Runtime logic and interactivity
- JSX - React component syntax, used in `.jsx` files and embedded in HTML
- CSS3 - Custom properties, animations, responsive layouts in `colors_and_type.css` and inline styles
## Runtime
- Browser (Client-side only)
- No backend runtime (static file delivery)
- Client-side SPAssembly (Single Page Application) loaded via CDN and inline scripts
- UMD modules for dependencies
## Frameworks
- React 18.3.1 - UI rendering and state management
- Babel Standalone 7.29.0 - JSX-to-JavaScript transpilation
- Not detected
- Not detected (static HTML with embedded scripts, no build pipeline)
## Key Dependencies
- React 18.3.1 - Component rendering and hooks (`useState`, `useEffect`, `useReducer`)
- Babel Standalone 7.29.0 - Enables JSX syntax and ES6+ features in browser
## Configuration
- Environment variables injected via `.env.local`
- Required env vars (per `.env.example`):
- Tweakable defaults stored in `window.TWEAKS` object (lines 59-62 in `index.html`)
- Edit-mode protocol via `window.postMessage` for live design adjustments
- Defined in `colors_and_type.css` - centralized color palette and typography
- Pattern: `--cc-{category}-{name}` (e.g., `--cc-font-serif`, `--cc-parchment`)
- DO NOT rename per CLAUDE.md constraints
## Platform Requirements
- Static file server (no build tooling required)
- Browser with ES6 + JSX support
- `.env.local` file for environment variables
- Static hosting (GitHub Pages, Netlify, Vercel, or similar)
- CORS-enabled for Supabase requests (if backend integration added)
- Supports modern browsers with ES6 and React 18+ compatibility
## HTML Entry Point
- `index.html` - Single-page document that bundles all dependencies and code
- Structure:
## Bundle Strategy
- Monolithic HTML file with inline scripts
- No module bundler (Webpack, Vite, Parcel not used)
- CDN dependencies for React and Babel
- SVG files in `assets/` and `assets/products/` (per CLAUDE.md, these are never moved or renamed)
- Local asset loading: `<img src="assets/...">`
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Overview
## Naming Patterns
- Component files: `PascalCase.jsx` — `primitives.jsx`, `hero.jsx`, `products.jsx`, `sections.jsx`
- Data constants: UPPERCASE — `PRODUCTS`, `CLASSES`, `ACCENTS`, `HEADLINES`
- Utility functions: camelCase — `inr()`, `useCart()`
- React components: PascalCase — `Nav`, `Hero`, `ProductCard`, `CartDrawer`, `BookingModal`
- React hooks: camelCase with `use` prefix — `useCart()`
- Event handlers: camelCase with `on` prefix — `onClick`, `onSubmit`, `onClose`, `onBook`
- State setters: camelCase — `setEmail`, `setStage`, `setTweaks`, `setForm`
- Utilities: camelCase — `inr()`, `submit()`, `_notify()` (private prefix)
- React state: camelCase — `email`, `stage`, `form`, `hover`, `added`, `panel`
- CSS variables: kebab-case prefixed with `--cc-` — `--cc-font-serif`, `--cc-terracotta`, `--cc-parchment`
- Object keys: camelCase — `{ name, phone, addr }`, `{ sku, name, price, img, qty, cat }`
- Loop variables: single letter lowercase — `i`, `k`, `p`, `x`, `t`, `l`, `v` (for brevity)
- No TypeScript; types are implicit in usage
- Data objects follow structure: `{ sku, name, price, img, ... }`
- Color variables use hex codes: `'#f08a8a'`, `'#3a2a2a'`
## Code Style
- No linter or formatter configured; code is hand-formatted
- Inline styles preferred over CSS classes (except in `index.html` for tweaks panel)
- Maximum line length: ~100 characters (not enforced)
- Indentation: 2 spaces per level
- No ESLint or Prettier configured
- No type checking
## Import Organization
- At end of each file, use `Object.assign(window, { Component1, Component2, ... })`
- Example from `primitives.jsx`:
- Example from `products.jsx`:
- React: via CDN `unpkg.com/react@18.3.1`
- ReactDOM: via CDN `unpkg.com/react-dom@18.3.1`
- Babel: via CDN `unpkg.com/@babel/standalone@7.29.0`
## Error Handling
- No try/catch blocks used
- Form validation: conditional checks on submit
- State guards: check existence before rendering
- Quantity bounds enforcement: use `Math.max()` / `Math.min()`
- Phone sanitization: strip non-digits, enforce length
## Logging
- No console.log or console.warn statements
- All state changes managed through React state
- Cart notifications handled via custom pub-sub: `cartListeners` Set and `_notify()` method
## Comments
- Rarely used — most code is self-documenting via clear naming
- Section dividers for major features:
- Inline comments for non-obvious logic:
## Function Design
- Destructured props in component function signatures:
- Event handlers receive `e` for form submission:
- React components return JSX wrapped in `()` parentheses
- Non-React functions return values directly
- No explicit return statements in inline arrow functions with single expression
## Module Design
- Component-level state: React.useState
- Global state: `window` object and custom pub-sub (`cart`, `cartListeners`)
- No module-level mutable state except `cart` and `cartListeners`
## Inline Styles
- Layout: `display: 'flex'`, `gridTemplateColumns`, `position: 'absolute'`
- Typography: `fontFamily: 'var(--cc-font-*)'`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`
- Colors: hex codes or CSS variables
- Transitions: `transition: 'property duration ease'`
## React Patterns
- `React.useState()` for component state
- `React.useEffect()` for side effects (cleanup listeners, message handlers)
- `React.useReducer()` for force-update in `useCart()` hook
- Inline event handlers with arrow functions
- `onClick`, `onChange`, `onSubmit` with preventDefault for forms
- Window event listeners for edit-mode protocol
- Ternary operators: `{stage === 'done' ? 'Thank you!' : 'Almost there'}`
- Logical AND: `{c.items.length === 0 && <div>...</div>}`
- Early return from components: `if (!klass) return null;`
- Immutable updates via spread operator: `setForm({ ...form, name: e.target.value })`
- Array filtering: `this.items = this.items.filter(i => i.sku !== sku)`
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## System Overview
```text
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
- Single HTML file entry point that loads 4 JSX scripts via Babel standalone
- No module system — all components exported to window object
- Cart store is a plain JS object with publish-subscribe pattern for reactivity
- Tweaks panel allows edit-mode to configure accent color and headline copy
- All prices in INR (₹), formatted via `inr()` utility function
- WhatsApp integration for orders and class bookings (no real payment processing yet)
- Design system via CSS custom properties in `colors_and_type.css`
## Layers
- Purpose: Render UI, handle user interactions, manage component-local state
- Location: `index.html`, `primitives.jsx`, `hero.jsx`, `sections.jsx`
- Contains: React components with inline styles, form inputs, buttons
- Depends on: Design tokens (CSS vars), global cart store
- Used by: Everything — this is the rendered output
- Purpose: Hold product/class catalogs, manage cart, provide reactive updates
- Location: `products.jsx:4-41` (cart store), `products.jsx:47-122` (catalogs)
- Contains: PRODUCTS array, CLASSES array, cart object with add/remove/setQty methods
- Depends on: Nothing
- Used by: ProductGrid, ProductCard, ClassesGrid, ClassCard, CartDrawer
- Purpose: Reusable UI atoms (buttons, badges, icons)
- Location: `primitives.jsx`
- Contains: Icon, Logo, Button, CircleBadge, Overline, StitchDivider, HeartMark
- Depends on: CSS vars for colors and spacing
- Used by: All section components
## Data Flow
### Primary Request Path (Browse → Add to Cart → Checkout)
- Cart state: Plain JS object, notifications via Set of listeners
- Component state: React.useState for form fields, loading states, drawer visibility
- Tweaks: JSON stored in `window.TWEAKS`, synced to parent via postMessage
### Secondary Flow: Browse Classes → Book Class
### Tweaks Panel (Edit Mode)
## Key Abstractions
- Purpose: Central state for shopping cart, decoupled from React
- Examples: `products.jsx:4-32`
- Pattern: Plain object with methods (add, remove, setQty, clear, count, total), internal Set of listener functions, `_notify()` method to trigger updates
- Why: Allows any component to subscribe without prop drilling
- Purpose: Subscribe a component to cart updates
- Examples: `products.jsx:34-41`, `ProductCard:129`, `CartDrawer:193`
- Pattern: useReducer to force re-render on cart change, useEffect to manage listener lifecycle
- Why: Makes React components reactive to non-React state
- Purpose: Make all components globally accessible without import statements
- Examples: `primitives.jsx:124`, `products.jsx:351`, `sections.jsx:507`
- Pattern: `Object.assign(window, { Component1, Component2, ... })`
- Why: Enables script-tag-based architecture where each .jsx file doesn't know about the others
- Purpose: Centralized color, typography, spacing system
- Examples: `colors_and_type.css:17-100`
- Pattern: CSS custom properties (--cc-*), referenced inline in React components
- Why: Tweaks panel can change accent color by updating a single var; consistent spacing
## Entry Points
- Location: `index.html`
- Triggers: Page load
- Responsibilities: Load React + Babel, define inline App component, render to DOM
- `primitives.jsx` — Must load first (used by all others)
- `hero.jsx` — Depends on primitives
- `products.jsx` — Depends on primitives
- `sections.jsx` — Depends on primitives, products
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
### Form Submission Without Backend
### Cart in Window Object Without Strict Cleanup
### Categories Section Placeholder
## Error Handling
- Form validation via HTML5 `required` and `pattern` attributes
- Cart operations check existence before operating (e.g., `const it = this.items.find(...)`)
- Class booking checks `klass` existence before rendering (`if (!klass) return null`)
## Cross-Cutting Concerns
- HTML5 built-in (required fields, email type, tel pattern)
- JS-side: cart methods check for item existence before removing
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
