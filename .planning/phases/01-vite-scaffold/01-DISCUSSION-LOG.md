# Phase 1: Vite Scaffold - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-07
**Phase:** 1-Vite Scaffold
**Areas discussed:** Src directory layout, Tweaks panel fate, React Router route scope

---

## Src Directory Layout

### Component file location
| Option | Description | Selected |
|--------|-------------|----------|
| Flat in src/ | src/primitives.jsx, src/hero.jsx, etc. alongside App.jsx and main.jsx. Mirrors current root layout — minimal migration churn. | ✓ |
| src/components/ subfolder | Adds a path prefix to every import — small but real change. | |
| You decide | Claude picks the layout that best fits Vite conventions. | |

**User's choice:** Flat in src/ (Recommended)
**Notes:** Mirrors the existing root layout, keeps migration friction low.

---

### CartContext location
| Option | Description | Selected |
|--------|-------------|----------|
| src/CartContext.jsx | Same level as component files. Consistent with flat layout. | ✓ |
| src/context/CartContext.jsx | Adds a context/ subfolder — one organized folder in an otherwise flat src/. | |

**User's choice:** src/CartContext.jsx (Recommended)

---

### Assets directory
| Option | Description | Selected |
|--------|-------------|----------|
| public/assets/ | Vite's public/ folder served at root — src="/assets/..." works. | ✓ |
| Keep at repo root | Assets stay at /assets/. Vite can serve via publicDir config. Non-standard. | |

**User's choice:** public/assets/ (Recommended)
**Notes:** Image src attributes will be updated from `"assets/..."` to `"/assets/..."` (absolute path). This is necessary for client-side routing correctness. SVG files are not renamed or moved within the folder — CLAUDE.md constraint satisfied.

---

## Tweaks Panel Fate

### Panel disposition
| Option | Description | Selected |
|--------|-------------|----------|
| Drop it | Remove ACCENTS, HEADLINES, panel CSS, postMessage listeners. App.jsx uses hardcoded accent and headline. | ✓ |
| Keep it as-is in App.jsx | Move all tweaks logic into src/App.jsx. Preserves live-design workflow but adds complexity. | |
| Keep logic, drop panel UI | Keep ACCENTS/HEADLINES constants, drop the on-screen panel and postMessage protocol. | |

**User's choice:** Drop it (Recommended)
**Notes:** The tweaks panel is Claude Design tooling, not a customer-facing feature. Dropping reduces scope and removes design-tool coupling from production code.

---

### Accent & headline location
| Option | Description | Selected |
|--------|-------------|----------|
| Hardcoded inline in App.jsx | const accent = '#f08a8a' and headline copy as literal strings. Simple, no extra file. | ✓ |
| src/constants.js | Move values to a constants file. Slightly more organized but no immediate need. | |

**User's choice:** Hardcoded inline in App.jsx (Recommended)

---

## React Router Route Scope

### Route structure
| Option | Description | Selected |
|--------|-------------|----------|
| Single '/' route only | BrowserRouter with one <Route path="/" element={<App />}>. All sections on one page. | ✓ |
| Scaffold future routes now | Add placeholder /products, /classes, /about routes with empty components. | |

**User's choice:** Single '/' route only (Recommended)
**Notes:** Routes can be added in a future phase if the design evolves to multi-page.

---

### BrowserRouter location
| Option | Description | Selected |
|--------|-------------|----------|
| In main.jsx | main.jsx wraps <App /> with <BrowserRouter>. Standard Vite+React pattern. | ✓ |
| Inside App.jsx | Less standard, couples routing to the app component. | |

**User's choice:** In main.jsx (Recommended)

---

## Claude's Discretion

None — user made all decisions directly.

## Deferred Ideas

None — discussion stayed within phase scope.
