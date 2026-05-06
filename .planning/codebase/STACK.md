# Technology Stack

**Analysis Date:** 2026-05-06

## Languages

**Primary:**
- HTML5 - Static markup and document structure
- JavaScript (ESNext) - Runtime logic and interactivity
- JSX - React component syntax, used in `.jsx` files and embedded in HTML

**Styling:**
- CSS3 - Custom properties, animations, responsive layouts in `colors_and_type.css` and inline styles

## Runtime

**Environment:**
- Browser (Client-side only)
- No backend runtime (static file delivery)

**Execution Model:**
- Client-side SPAssembly (Single Page Application) loaded via CDN and inline scripts
- UMD modules for dependencies

## Frameworks

**Core:**
- React 18.3.1 - UI rendering and state management
  - Loaded from CDN: `https://unpkg.com/react@18.3.1/umd/react.development.js`
  - DOM rendering via `https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js`

**Transpilation:**
- Babel Standalone 7.29.0 - JSX-to-JavaScript transpilation
  - Loaded from CDN: `https://unpkg.com/@babel/standalone@7.29.0/babel.min.js`
  - Type: `application/babel` - real-time transpilation of JSX in `<script>` tags

**Testing:**
- Not detected

**Build/Dev:**
- Not detected (static HTML with embedded scripts, no build pipeline)

## Key Dependencies

**UI Framework:**
- React 18.3.1 - Component rendering and hooks (`useState`, `useEffect`, `useReducer`)

**Transpiler:**
- Babel Standalone 7.29.0 - Enables JSX syntax and ES6+ features in browser

## Configuration

**Environment:**
- Environment variables injected via `.env.local`
- Required env vars (per `.env.example`):
  - `VITE_SUPABASE_URL` - Supabase database URL
  - `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
  - `VITE_WHATSAPP_NUMBER` - WhatsApp contact number (read-only, never hardcoded per CLAUDE.md)

**Client Configuration:**
- Tweakable defaults stored in `window.TWEAKS` object (lines 59-62 in `index.html`)
  - `accent` - Color palette (coral, blush, rose, cream, sage)
  - `headline` - Hero copy variant (warm, heirloom, playful, quiet)
- Edit-mode protocol via `window.postMessage` for live design adjustments

**CSS Variables:**
- Defined in `colors_and_type.css` - centralized color palette and typography
- Pattern: `--cc-{category}-{name}` (e.g., `--cc-font-serif`, `--cc-parchment`)
- DO NOT rename per CLAUDE.md constraints

## Platform Requirements

**Development:**
- Static file server (no build tooling required)
- Browser with ES6 + JSX support
- `.env.local` file for environment variables

**Production:**
- Static hosting (GitHub Pages, Netlify, Vercel, or similar)
- CORS-enabled for Supabase requests (if backend integration added)
- Supports modern browsers with ES6 and React 18+ compatibility

## HTML Entry Point

- `index.html` - Single-page document that bundles all dependencies and code
- Structure:
  1. React 18.3.1 library loaded from CDN
  2. React-DOM 18.3.1 library loaded from CDN
  3. Babel Standalone 7.29.0 for JSX transpilation
  4. Component modules: `primitives.jsx`, `hero.jsx`, `products.jsx`, `sections.jsx`
  5. Root `<div id="root">` mounted with React app via `ReactDOM.createRoot()`

## Bundle Strategy

**Current:**
- Monolithic HTML file with inline scripts
- No module bundler (Webpack, Vite, Parcel not used)
- CDN dependencies for React and Babel

**Assets:**
- SVG files in `assets/` and `assets/products/` (per CLAUDE.md, these are never moved or renamed)
- Local asset loading: `<img src="assets/...">`

---

*Stack analysis: 2026-05-06*
