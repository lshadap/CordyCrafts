# Phase 3: Mobile Polish - Context

**Gathered:** 2026-05-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the site genuinely usable on a phone — responsive grids that adapt to screen width, visible skeleton loading states while Supabase data fetches, and static SEO/OG meta tags in `index.html` for search and social sharing.

This phase does NOT add new routes, new sections, or new user flows. All changes are inside existing components (`ProductGrid`, `ClassesGrid`) and `index.html`.

</domain>

<decisions>
## Implementation Decisions

### Responsive Grid

- **D-01:** A shared `useBreakpoint` hook lives at `src/hooks/useBreakpoint.js`. It reads `window.innerWidth` on mount and on resize (via `useEffect` with cleanup), and returns `'mobile' | 'tablet' | 'desktop'`. Both `ProductGrid` and `ClassesGrid` call it to compute column count as an integer, then set `gridTemplateColumns: \`repeat(\${cols}, 1fr)\`` inline. Stays entirely in the existing inline-styles pattern — no new CSS files, no class names.
- **D-02:** Breakpoints match REQUIREMENTS.md exactly:
  - `≤640px` → mobile: 2 cols (products), 1 col (classes)
  - `641–1024px` → tablet: 3 cols (products), 2 cols (classes)
  - `>1024px` → desktop: 4 cols (products), 2 cols (classes)

### Skeleton Cards

- **D-03:** Shimmer sweep animation — a gradient highlight sweeps left-to-right across each placeholder card while loading. One `@keyframes shimmer` block is added to the `<style>` section in `index.html` (the only place that supports keyframes without a new CSS file).
- **D-04:** 12 skeleton product cards shown while products load; 8 skeleton class cards shown while classes load. Counts match expected real data counts to prevent layout shift when real cards arrive.
- **D-05:** Skeleton cards use the `--cc-parchment` warm cream tone (`#f5e8dc`) as base background, with a slightly lighter shimmer highlight sweep.

### SEO & OG Meta Tags

- **D-06:** Static tags hardcoded directly in `index.html` `<head>`. Zero new dependencies. Correct for a single-route SPA — the same head content applies to all visits.
- **D-07:** `og:image` points to `cordys-logo.png` at `/assets/cordys-logo.png`. The og:image URL uses a placeholder domain (e.g., `https://cordyscrafts.vercel.app/assets/cordys-logo.png`) — the exact domain will be confirmed and updated in Phase 4 once Vercel deployment is live. SVG files were rejected for og:image due to inconsistent social crawler support.

### Claude's Discretion

- Debounce strategy for resize listener in `useBreakpoint` — a simple listener without debounce is fine at this scale; resize events are infrequent and column re-renders are cheap.
- Shimmer gradient exact colors — use `#f5e8dc` (parchment) and `#fff` (or a slightly lighter cream) as the sweep highlight.
- Card height for skeletons — match approximate real card heights (ProductCard ~280px, ClassCard ~320px) to minimize layout shift.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Scope
- `.planning/ROADMAP.md` — Phase 3 goal, success criteria, requirements PLSH-01 through PLSH-06
- `.planning/REQUIREMENTS.md` — Full PLSH-01 to PLSH-06 with acceptance criteria (column counts, breakpoint values)

### Project Rules (hard constraints)
- `CLAUDE.md` — No component rewrites, no CSS variable renames, no SVG moves/renames, inline styles dominant pattern, no new CSS files (except extending `colors_and_type.css`)

### Existing Hooks (extend, don't rewrite)
- `src/hooks/useProducts.js` — already returns `{ products, loading }` — `loading` drives skeleton render
- `src/hooks/useClasses.js` — same pattern as useProducts

### Components to Modify
- `src/products.jsx` — `ProductGrid` and `ClassesGrid` receive responsive column logic and skeleton rendering

### Entry Point (meta tags + keyframes go here)
- `index.html` — static `<head>` tags and `@keyframes shimmer` style block

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/hooks/useProducts.js` and `src/hooks/useClasses.js`: expose `{ products, loading }` — `loading` is `true` on initial fetch, `false` after. Phase 3 reads `loading` to switch between skeleton and real grid.
- `src/hooks/` directory: already exists with 2 hooks — `useBreakpoint.js` follows the same file pattern.

### Established Patterns
- **Inline styles dominant**: all component layout uses `style={{...}}` objects — `gridTemplateColumns` is already set inline in `ProductGrid` and `ClassesGrid`; Phase 3 makes it dynamic.
- **No media queries anywhere**: the codebase has zero CSS `@media` rules — `useBreakpoint` is the first and only breakpoint mechanism.
- **CSS keyframes exception**: `index.html` already has a `<style>` block for the tweaks panel CSS — the `@keyframes shimmer` rule is added to the same block (not a new file).

### Integration Points
- `src/products.jsx → ProductGrid`: reads `useProducts()` → renders skeleton array when `loading`, real grid when not
- `src/products.jsx → ClassesGrid`: same pattern with `useClasses()`
- `src/hooks/useBreakpoint.js`: new file, imported by `ProductGrid` and `ClassesGrid`
- `index.html <head>`: receives static SEO/OG meta tags
- `index.html <style>`: receives `@keyframes shimmer` block

</code_context>

<specifics>
## Specific Ideas

- `useBreakpoint` returns a string (`'mobile' | 'tablet' | 'desktop'`) — components map to column ints: products `{ mobile: 2, tablet: 3, desktop: 4 }`, classes `{ mobile: 1, tablet: 2, desktop: 2 }`
- Shimmer animation: `background: 'linear-gradient(90deg, #f5e8dc 25%, #fff8f3 50%, #f5e8dc 75%)'`, `backgroundSize: '800px 100%'`, `animation: 'shimmer 1.4s infinite linear'`
- `og:image` placeholder URL: `https://cordyscrafts.vercel.app/assets/cordys-logo.png` — update domain in Phase 4

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 3-Mobile Polish*
*Context gathered: 2026-05-07*
