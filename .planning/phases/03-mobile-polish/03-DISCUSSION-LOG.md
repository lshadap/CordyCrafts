# Phase 3: Mobile Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-07
**Phase:** 3-mobile-polish
**Areas discussed:** Responsive grid technique, Skeleton card design, Meta & OG tags

---

## Responsive Grid Technique

| Option | Description | Selected |
|--------|-------------|----------|
| useBreakpoint hook | Shared React hook reads window.innerWidth on resize; components get column count as integer; stays in inline-styles pattern | ✓ |
| CSS media queries block | @media rules in colors_and_type.css or a <style> block; components use CSS class names; zero JS re-renders | |
| CSS Grid auto-fill minmax | Pure inline CSS; no JS; column count adapts naturally; approximate breakpoints only (won't match PLSH-01 exactly) | |

**User's choice:** useBreakpoint hook
**Notes:** None — recommendation accepted directly.

---

## Skeleton Card Design

### Animation Style

| Option | Description | Selected |
|--------|-------------|----------|
| Shimmer sweep | Gradient highlight sweeps left-to-right; needs @keyframes in index.html; most polished | ✓ |
| Pulse fade | Opacity oscillates; same @keyframes requirement but simpler | |
| Static placeholder | Parchment-colored rectangle; no animation; zero CSS needed | |

**User's choice:** Shimmer sweep

### Skeleton Count

| Option | Description | Selected |
|--------|-------------|----------|
| Match real count | 12 for products, 8 for classes; no layout shift when real cards load | ✓ |
| Fixed 4 cards | Always 4 skeletons; simpler; causes layout jump | |
| Viewport fill | cols × 2 rows; dynamic; more complex | |

**User's choice:** Match real count
**Notes:** None — recommendations accepted directly.

---

## Meta & OG Tags

### Implementation Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Static in index.html | Hardcode all meta tags directly in HTML; zero deps; correct for single-route SPA | ✓ |
| react-helmet-async | Manages <head> from React components; adds dependency; enables per-route overrides; overkill for v1 | |

**User's choice:** Static in index.html

### og:image Source

| Option | Description | Selected |
|--------|-------------|----------|
| cordys-logo.png | Existing logo PNG in public/assets; works as square social preview; update domain in Phase 4 | ✓ |
| hero-fox.svg | Hero illustration; SVG may not render correctly in all social crawlers | |
| Skip og:image for now | Defer to Phase 4 when real Vercel URL is known | |

**User's choice:** cordys-logo.png
**Notes:** Placeholder Vercel URL to be updated in Phase 4.

---

## Claude's Discretion

- Debounce strategy on resize listener (none needed at this scale)
- Exact shimmer gradient colors (parchment base + slightly lighter sweep)
- Skeleton card height matching real cards (~280px products, ~320px classes)

## Deferred Ideas

None — discussion stayed within phase scope.
