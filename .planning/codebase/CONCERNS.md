# Codebase Concerns

**Analysis Date:** 2026-05-06

## Tech Debt

**Global window pollution:**
- Issue: Cart store and product data directly written to `window` object; components access via `window.openCart`, `window.cartCount`, `window.PRODUCTS`, `window.CLASSES`, etc.
- Files: `index.html:95`, `products.jsx:28-32`, `products.jsx:124-125`, `hero.jsx:33-38`
- Impact: Namespace pollution makes debugging difficult, increases risk of accidental overwrites, breaks modularity, makes refactoring to proper module system costly
- Fix approach: Wrap in a single global namespace (e.g., `window.__CORDY = { cart, openCart, PRODUCTS, CLASSES }`) or migrate to React Context API. Requires updating all component references.

**Hardcoded color accents:**
- Issue: Accent color object `ACCENTS` is duplicated inline in `index.html:71-77` without referencing central color system in `colors_and_type.css`
- Files: `index.html:71-77`
- Impact: If accent colors need to be updated, must be changed in two places; risk of drift between design tokens and runtime values
- Fix approach: Extract `ACCENTS` to external config, consume in both HTML and CSS

**Manual state syncing:**
- Issue: Cart notifications use imperative `.forEach()` on listener set in `products.jsx:29`; state updates require manual trigger
- Files: `products.jsx:4-40`, `products.jsx:34-40`
- Impact: Fragile subscriber pattern; easy to miss a state update path; no single source of truth for what triggers re-renders
- Fix approach: Replace with React Context API or event emitter library with built-in error handling

**Missing error boundary / no error recovery:**
- Issue: No try-catch blocks, no error boundary components, no handling for failed form submissions (cart checkout, booking)
- Files: `sections.jsx:200-206`, `sections.jsx:373-376`
- Impact: Form submission failures (e.g., WhatsApp redirect, phone validation edge cases) silently fail without user feedback
- Fix approach: Add error handling around async operations, display error toast/modal on failure

**Hardcoded environment variable dependency:**
- Issue: VITE_WHATSAPP_NUMBER is referenced as environment variable but no fallback, no validation, no usage shown
- Files: `.env.example:3`
- Impact: If env var missing, WhatsApp integration silently fails; no indication to developer
- Fix approach: Add startup check that validates required env vars; log clear error messages if missing

## Known Bugs

**Message port wildcard postMessage:**
- Symptoms: `window.parent.postMessage()` uses wildcard `'*'` as target origin
- Files: `index.html:96`, `index.html:103`
- Trigger: App broadcasts its availability and edit-mode updates to ANY parent window/iframe, not just trusted origins
- Workaround: Only works in development; production deployment should restrict to known origin
- Risk: XSS vectors if the app is embedded in untrusted contexts; data about product state/tweaks exposed to any parent

**Window height undefined for modal overflow:**
- Symptoms: `BookingModal` and `CartDrawer` set `maxHeight: 'calc(100vh - 32px)'` but on small viewports with tall content, no scroll indication
- Files: `sections.jsx:386`
- Trigger: Booking form on mobile with lots of optional fields; form extends beyond visible area but not obvious to user
- Workaround: Use keyboard arrow keys to scroll
- Risk: Users may not realize form extends beyond visible area, missing optional fields

**Cart persists across page reload only in memory:**
- Symptoms: Cart state stored in `cart.items` array in memory; no persistence to localStorage
- Files: `products.jsx:5`
- Trigger: User adds items to cart, page reloads → cart is cleared
- Workaround: None; user must re-add items
- Risk: High friction for users who accidentally reload page during shopping

## Security Considerations

**Untrusted parent frame communication:**
- Risk: `postMessage` to `window.parent` with wildcard target origin exposes app state to any iframe parent
- Files: `index.html:96`, `index.html:103`
- Current mitigation: Only edit-mode data is sent (tweaks); no sensitive user data
- Recommendations: (1) Restrict postMessage target to specific origin in production, (2) validate incoming messages with explicit origin check, (3) document that app should not be embedded in untrusted contexts

**No input sanitization in form fields:**
- Risk: Booking form name, note fields and cart form delivery address fields accept arbitrary text; if later sent to email/SMS, could carry injection payloads
- Files: `sections.jsx:290`, `sections.jsx:301`, `sections.jsx:437`
- Current mitigation: Data only sent via WhatsApp (external service handles sanitization)
- Recommendations: Add input validation/sanitization, document that user inputs are sent to external WhatsApp service

**Price manipulation possible in browser:**
- Risk: `PRODUCTS` and `CLASSES` arrays are mutable window globals; JavaScript console can modify prices before checkout
- Files: `products.jsx:47-122`, `products.jsx:124-125`
- Current mitigation: Prices are sent to external WhatsApp service for final validation; no backend order processing yet
- Recommendations: When implementing backend checkout, always re-validate prices server-side; never trust client-submitted prices

**Environment variables exposed in bundle:**
- Risk: If using a bundler (Vite implied by VITE_ prefix), VITE_SUPABASE_ANON_KEY is meant to be public but `.env.local` file exists
- Files: `.env.example:2`, `.env.local` (not readable per security policy)
- Current mitigation: ANON_KEY is intentionally public for Supabase; local env file not committed
- Recommendations: Document that only VITE_* variables are bundled; keep `.env.local` in .gitignore

## Performance Bottlenecks

**No image optimization:**
- Problem: SVG files in assets (product images, category tiles) are referenced directly without lazy loading or responsive srcset
- Files: `hero.jsx:129`, `products.jsx:48-62`, `sections.jsx:110-147`, `sections.jsx:254`, `hero.jsx:209-212`
- Cause: Direct `<img src>` tags without next/image or lazy loading attributes; category tiles loaded simultaneously on page load
- Improvement path: (1) Add `loading="lazy"` to offscreen images, (2) Consider sprite sheet for small icons, (3) Use responsive images for category tiles

**Large product/class datasets rendered without virtualization:**
- Problem: All 12 products and 8 classes rendered simultaneously; if datasets grow, DOM becomes expensive
- Files: `products.jsx:196-239`, `products.jsx:299-349`
- Cause: `items.map()` renders full list even if not visible; no pagination or infinite scroll
- Improvement path: (1) Add pagination with page buttons, (2) Implement infinite scroll with Intersection Observer, (3) For large lists, use react-window or similar virtualization

**No memoization on product cards:**
- Problem: `ProductCard` re-renders whenever parent re-renders (e.g., on filter change), even if card data unchanged
- Files: `products.jsx:128-194`
- Cause: Component not wrapped with `React.memo()`, no key optimization
- Improvement path: Wrap `ProductCard` in `React.memo((props) => {...})`, ensure stable key (already using SKU)

**No bundle splitting or code splitting:**
- Problem: All code (hero, products, sections, primitives) loaded upfront as single blocking script in HTML
- Files: `index.html:65-68`
- Cause: Script tags with no async/defer, no dynamic imports
- Improvement path: (1) Add `async` or `defer` to script tags, (2) Use dynamic imports for sections below the fold, (3) Consider bundler setup (Vite implied but not shown)

## Fragile Areas

**Cart store implementation:**
- Files: `products.jsx:3-41`, `sections.jsx:192-354`
- Why fragile: Pure JavaScript Set-based pub-sub with no guarantees; if a listener throws, stops notifying rest of subscribers; no typed API
- Safe modification: Add error handling in `_notify()` loop with try-catch, add JSDoc comments documenting API, add unit tests for add/remove/setQty edge cases
- Test coverage: None visible; cart logic untested

**ProductCard and ClassCard inline styles:**
- Files: `products.jsx:128-194`, `products.jsx:243-297`
- Why fragile: Hover state relies on component-level React.useState; if parent changes render frequency, state may not sync; layout logic hardcoded in sx object
- Safe modification: Extract inline styles to CSS module or styled-component, avoid state mutations in hover, consider using CSS :hover instead
- Test coverage: Interactive behavior not tested

**Form submission without validation:**
- Files: `sections.jsx:200-206`, `sections.jsx:373-376`
- Why fragile: Simple null checks on form.name and form.phone; no format validation for phone (pattern attribute exists on input but not enforced in JS), no email validation
- Safe modification: Add explicit validation function that checks phone format before submit, add error messages for invalid inputs
- Test coverage: Form validation not tested

**Hardcoded grid layouts:**
- Files: `products.jsx:231` (4-column grid), `products.jsx:343` (2-column grid), `hero.jsx:56` (1fr 1.15fr), `sections.jsx:152` (1.5fr 1fr 1fr 1fr)
- Why fragile: Responsive breakpoints not defined; on mobile, 4-column product grid crushes; modal width hardcoded to 520px
- Safe modification: Add CSS media queries for tablet/mobile, use CSS Grid auto-fit or flex for responsive columns, define breakpoint variables
- Test coverage: Responsive behavior not tested

**Edit mode protocol:**
- Files: `index.html:89-98`
- Why fragile: Assumes parent frame will send correct message types; no validation that parent is trusted; if parent doesn't send activation, edit panel never opens
- Safe modification: Add explicit origin check, validate message.type before use, add console warning if parent doesn't respond
- Test coverage: Edit mode integration not tested

## Scaling Limits

**Product/class catalog hardcoded:**
- Current capacity: 12 products + 8 classes hardcoded in JavaScript
- Limit: Adding more items requires code change + redeploy; no admin UI for catalog management
- Scaling path: Migrate to JSON file or database (Supabase), load dynamically, add admin panel for updating products/prices/availability

**Global cart store not isolated:**
- Current capacity: Single shared cart instance; works for one user, breaks with multiple sessions (if app used in iframe/multiple tabs)
- Limit: Cart state shared across all instances of app on page
- Scaling path: Isolate cart per session using sessionStorage key, or use URL params to prevent collisions

**Form data sent only to WhatsApp:**
- Current capacity: No order persistence, no history, no analytics
- Limit: Once user submits order/booking, data only exists in WhatsApp conversation; no database record
- Scaling path: Integrate Supabase to store orders/bookings, add email confirmation, add admin dashboard for order management

**No image hosting strategy:**
- Current capacity: All SVGs served from `assets/` directory
- Limit: If assets directory grows large, page load degrades; no CDN, no compression
- Scaling path: Move assets to CDN (Cloudinary, S3, Vercel), implement image optimization pipeline

## Dependencies at Risk

**React & React-DOM from CDN via unpkg:**
- Risk: Unpkg CDN availability; if unpkg goes down, app breaks; no version pinning in production, always loads latest
- Files: `index.html:50-52`
- Impact: App breaks without warning if unpkg is unavailable or if React 18 has breaking changes
- Migration plan: (1) Use npm/Vite to bundle React, (2) Pin explicit version numbers, (3) Add fallback CDN or local bundle

**Babel standalone from unpkg:**
- Risk: Same as React; JSX compilation happens in browser (slow cold load)
- Files: `index.html:52`
- Impact: Every page load re-compiles JSX; high startup latency; if Babel version changes, syntax compatibility issues
- Migration plan: Pre-compile JSX with Vite or similar; use proper build step instead of browser compilation

**No lockfile or version management:**
- Risk: No package.json/requirements.txt visible; impossible to reproduce exact dependency state
- Files: None (no manifest detected)
- Impact: If embedded in larger project, unclear what exact versions are needed
- Migration plan: Add package.json with explicit versions, use npm/pnpm lockfile

## Missing Critical Features

**No cart persistence:**
- Problem: Cart lost on page reload
- Blocks: Users cannot save items for later, cannot continue shopping after accidental reload

**No backend order storage:**
- Problem: All orders exist only in WhatsApp conversation; no order database, no tracking, no fulfillment workflow
- Blocks: Cannot implement order history, refunds, reordering, analytics, inventory management

**No image upload or admin panel:**
- Problem: Products and categories are hardcoded; no way to add new items, update prices, or change images without editing code
- Blocks: Self-service catalog management; scaling to larger product catalog

**No email/SMS notifications:**
- Problem: Order confirmations only via WhatsApp manual response
- Blocks: Customer has no order receipt, no tracking number, no shipping updates

**No inventory management:**
- Problem: No stock tracking; can sell out-of-stock items
- Blocks: Cannot reflect true availability; risk of overselling

## Test Coverage Gaps

**Cart store logic untested:**
- What's not tested: `cart.add()`, `cart.setQty()`, `cart.remove()`, `cart.clear()`, `cart.total()` calculations
- Files: `products.jsx:3-41`
- Risk: Cart bugs (negative qty, duplicate items, incorrect totals) slip to production
- Priority: High — cart is business-critical

**Form validation untested:**
- What's not tested: Phone number format validation, name field sanitization, address field length limits
- Files: `sections.jsx:289-302`, `sections.jsx:402-420`
- Risk: Invalid forms submitted, malformed data sent to WhatsApp
- Priority: High — form data is user-facing

**Responsive design untested:**
- What's not tested: Mobile layout, tablet breakpoints, modal/drawer overflow, touch interactions
- Files: All component files (grid layouts, modals, forms)
- Risk: App broken on mobile; navigation unusable on small screens
- Priority: High — site must work on mobile

**Price calculation in checkout untested:**
- What's not tested: Quantity × price calculation, multi-item totals, currency formatting
- Files: `products.jsx:26`, `sections.jsx:305`, `sections.jsx:439-441`
- Risk: Incorrect totals sent to user; financial loss
- Priority: Critical — touches money

**Browser compatibility untested:**
- What's not tested: Safari, Firefox, older Chrome versions; CSS Grid, Backdrop Filter support
- Files: All
- Risk: App broken in older browsers; users cannot purchase
- Priority: Medium — impacts user base

---

*Concerns audit: 2026-05-06*
