# Codebase Structure

**Analysis Date:** 2026-05-06

## Directory Layout

```
CordyCrafts/
├── index.html              # Entry point: HTML with inline App + script tag loader
├── primitives.jsx          # Primitive components: Icon, Logo, Button, Badge
├── hero.jsx                # Top section: Nav, Hero, Categories (placeholder)
├── products.jsx            # Products, classes, cart store, filtering logic
├── sections.jsx            # About, Newsletter, Footer, Cart/Booking modals
├── colors_and_type.css     # Design tokens: colors, typography, spacing
├── CLAUDE.md               # Project rules and guidelines
├── .env.example            # Template for environment variables
├── .env.local              # Environment configuration (ignored)
│
├── assets/                 # SVG images for sections and products
│   ├── hero-fox.svg
│   ├── maker-portrait.svg
│   ├── category-*.svg      # Category icons
│   ├── cordys-logo.png
│   ├── ig-yarn-*.svg       # Instagram strip images (5 tiles)
│   └── products/           # Product images (placeholder SVGs)
│       ├── amigurumi-bear.svg
│       ├── scarf.svg
│       ├── tote.svg
│       └── ... (12 total)
│
├── uploads/                # User-generated content (currently empty)
├── .git/                   # Version control
├── .planning/
│   └── codebase/           # Codebase maps (this directory)
│       ├── ARCHITECTURE.md
│       ├── STRUCTURE.md
│       ├── STACK.md        # (future)
│       ├── CONVENTIONS.md  # (future)
│       └── ...
└── .claude/                # Claude-related tooling (hooks, skills)
    └── hooks/              # GSD hooks for workflow automation
```

## Directory Purposes

**Root:**
- Purpose: Source files for the website
- Contains: HTML entry point, JSX components, CSS design system, SVG assets
- Key files: `index.html`, `primitives.jsx`, `hero.jsx`, `products.jsx`, `sections.jsx`

**assets/:**
- Purpose: Static SVG images used in components
- Contains: Hero background, category icons, Instagram strip tiles, product thumbnails
- Key files: `assets/products/` (12 product SVGs), `assets/ig-yarn-*.svg` (5 tiles)
- Generated: No
- Committed: Yes

**uploads/:**
- Purpose: Reserved for future user-generated content (orders, uploads, etc.)
- Contains: Currently empty
- Generated: Potentially (if backend added)
- Committed: Likely not (should be in .gitignore)

**.planning/codebase/:**
- Purpose: Codebase analysis documents for future development
- Contains: ARCHITECTURE.md, STRUCTURE.md, etc.
- Generated: Yes (created by /gsd-map-codebase)
- Committed: Yes

**.claude/hooks/:**
- Purpose: GSD workflow integration hooks
- Contains: Pre-commit checks, context monitors, update watchers
- Generated: No
- Committed: Yes

## Key File Locations

**Entry Points:**
- `index.html:162`: ReactDOM.createRoot() call that renders the entire app

**Configuration:**
- `colors_and_type.css:17-100`: CSS custom properties for all design tokens
- `.env.example`: Template for VITE_WHATSAPP_NUMBER (if backend deployed)
- `CLAUDE.md`: Project rules about prices (₹ only), Supabase client, component sources

**Core Logic:**
- `products.jsx:4-41`: Cart store and useCart hook
- `products.jsx:47-62`: PRODUCTS catalog
- `products.jsx:65-122`: CLASSES catalog
- `products.jsx:196-240`: ProductGrid filtering and layout
- `sections.jsx:192-354`: CartDrawer with form stages
- `sections.jsx:357-482`: BookingModal with WhatsApp integration

**Styling & Design:**
- `colors_and_type.css`: All colors, fonts, spacing as CSS vars
- Inline styles: All component styles are written directly in JSX (no external CSS files beyond colors_and_type.css)

**Testing:**
- No test files present

## Naming Conventions

**Files:**
- HTML: `index.html` (lowercase)
- JSX: `*.jsx` (lowercase, kebab-case if multi-word, e.g., `products.jsx`)
- CSS: `colors_and_type.css` (lowercase, kebab-case, descriptive)
- SVG: `category-name.svg` or `product-name.svg` (kebab-case)
- Directories: `assets/`, `products/`, `.planning/`, `.claude/` (lowercase, plural where appropriate)

**Functions & Components:**
- React components: PascalCase (e.g., `ProductCard`, `CartDrawer`, `BookingModal`)
- Utility functions: camelCase (e.g., `inr()`, `useCart()`)
- Variables: camelCase (e.g., `cartListeners`, `PRODUCTS`, `CLASSES`)
- Constants (arrays, objects): UPPER_CASE or PascalCase depending on if they're collections (PRODUCTS) or singletons

**CSS Custom Properties:**
- Pattern: `--cc-[category]-[purpose]` (e.g., `--cc-font-serif`, `--cc-terracotta`, `--cc-border-warm`)
- Categories: `font-*`, `size-*`, `weight-*`, `track-*`, `space-*`, `lh-*` (line height), semantic names like `terracotta`, `coral`, `parchment`, `fg-*` (foreground), `bg-*` (not used, inlined), `error`, `focus`

## Where to Add New Code

**New Feature (e.g., Product Reviews, User Wishlists):**
- Primary code: Create a new JSX file (e.g., `reviews.jsx`) in the root
- Components: Add to this file, export to window
- Data store: If state needed, add to `products.jsx` following the cart store pattern
- Tests: Create `reviews.test.js` (Note: no test runner currently set up)
- Styling: Add inline to components or extend `colors_and_type.css` with new vars

**New Component/Module:**
- Implementation: If reusable atom, add to `primitives.jsx`. If section, create `section-name.jsx` in root.
- Initialization: Make sure to `Object.assign(window, { YourComponent })` at the end of the file
- Dependencies: Only depend on `primitives.jsx` (safe to require from any other file)

**Utilities:**
- Shared helpers (date formatting, price formatting, etc.): Add to `products.jsx` above the components (after PRODUCTS and CLASSES definitions)
- Make them window-accessible: `Object.assign(window, { yourUtil })`

**New Images/Assets:**
- Product images: `assets/products/product-name.svg` (match product SKU)
- Section images: `assets/section-name.svg` (e.g., `assets/about-background.svg`)
- Icons: Do NOT add to assets — use the Icon component library in `primitives.jsx` (add SVG paths to the `paths` object)

**Styles:**
- Do NOT create new CSS files (except for feature-specific critical CSS if inline styles become unwieldy)
- DO extend `colors_and_type.css` with new custom properties if adding new colors or scales
- DO keep inline styles within JSX components (this maintains colocation and is consistent with existing pattern)

## Special Directories

**assets/products/:**
- Purpose: Product preview/thumbnail images
- Contains: 12 SVG files, one per product SKU (p01-p04, c01-c04, k01-k04)
- Generated: No
- Committed: Yes
- Rule: DO NOT rename or move (CLAUDE.md constraint)

**assets/:**
- Rule: DO NOT rename or move SVG files (CLAUDE.md constraint)

**.env.local:**
- Purpose: Local overrides for environment variables (never committed)
- Rule: DO NOT add secrets to .env.example — only add documented placeholders
- Rule: VITE_WHATSAPP_NUMBER is always read from env, never hardcoded (CLAUDE.md constraint)

**colors_and_type.css:**
- Purpose: Single source of truth for design tokens
- Rule: DO NOT rename CSS variables (CLAUDE.md constraint)
- Rule: Safe to ADD new variables, not safe to RENAME existing ones

**.planning/codebase/:**
- Purpose: Generated documentation for GSD workflow (do not edit manually)
- Rule: Can be regenerated by `/gsd-map-codebase`

---

*Structure analysis: 2026-05-06*
