# Phase 4: Vercel Deploy - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Connect the GitHub repo to Vercel, set env vars, get the site live at `cordyscrafts.vercel.app` with auto-deploy on push to `main`, and write a README that lets any future developer run the site locally without asking Cordeelia for anything beyond the 3 env var values.

This phase does NOT add new features, routes, or UI changes. The only code change is if the og:image URL needs correction (already confirmed: no change needed — `cordyscrafts.vercel.app` was the placeholder and is the final URL).

</domain>

<decisions>
## Implementation Decisions

### Production Domain

- **D-01:** `.vercel.app` subdomain for v1 — no custom domain. Production URL: `https://cordyscrafts.vercel.app`. No DNS setup required.
- **D-02:** Vercel project name: `cordyscrafts`. This matches the Phase 3 `og:image` placeholder URL exactly — no code changes needed in `index.html`.

### Vercel Account & Setup

- **D-03:** Personal Vercel account (already exists). The GitHub repo is NOT yet connected to Vercel — the plan must include: import repo → set project name → configure env vars → trigger first deploy.
- **D-04:** Three env vars to set in Vercel project settings: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_WHATSAPP_NUMBER`. Values come from Cordeelia (not stored in the plan).

### README

- **D-05:** Audience: future developers inheriting the project (handoff scenario). Not just Cordeelia.
- **D-06:** Supabase section: env vars only — README says "get these 3 values from Cordeelia, paste into `.env.local`." Does NOT cover creating a Supabase project or running migrations (assumes the Supabase project already exists and is seeded).
- **D-07:** Vercel deployment steps are NOT in the README. README covers local dev only: clone → `npm install` → create `.env.local` with the 3 vars → `npm run dev`. A future dev shouldn't need more than that.

### Claude's Discretion

- README sections and formatting — standard structure (What it is, Prerequisites, Local setup, Env var reference, Tech stack) is fine without user input.
- Post-deploy verification steps — DEPL-03 requires manual browser/device testing; plan should include a checklist of what to verify (routes, cart persistence, WhatsApp links on Android + iOS). Testing is done by the user, not automated.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Scope
- `.planning/ROADMAP.md` — Phase 4 goal, success criteria, requirements DEPL-01 through DEPL-04
- `.planning/REQUIREMENTS.md` — Full DEPL-01 to DEPL-04 with acceptance criteria

### Project Rules (hard constraints)
- `CLAUDE.md` — No component rewrites, env vars read from `import.meta.env`, Supabase client only in `src/lib/supabase.js`, `VITE_WHATSAPP_NUMBER` never hardcoded

### Existing Deployment Config
- `vercel.json` — SPA rewrite rule already committed (`"source":"/(.*)", "destination":"/index.html"`). Do NOT modify.
- `.env.example` — Reference for env var names; values must NOT be committed

### Phase 3 Context (og:image decision)
- `.planning/phases/03-mobile-polish/03-CONTEXT.md` — D-07: og:image URL placeholder `https://cordyscrafts.vercel.app/assets/cordys-logo.png`. Final URL confirmed in Phase 4 — no change needed (project name matches placeholder).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `vercel.json` — already committed with correct SPA rewrite rule; no modification needed
- `.env.example` — env var template for README reference

### Established Patterns
- All env vars read via `import.meta.env.VITE_*` (Vite convention) — README must document `.env.local` file (not `.env`)
- `src/lib/supabase.js` — single Supabase client using `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`

### Integration Points
- GitHub → Vercel: new connection (not yet set up)
- Production env vars: set in Vercel dashboard, not in any committed file
- `og:image` URL in `index.html`: already `https://cordyscrafts.vercel.app/assets/cordys-logo.png` — no change

</code_context>

<specifics>
## Specific Ideas

- Production URL: `https://cordyscrafts.vercel.app`
- Vercel project name: `cordyscrafts`
- README covers: local dev only (clone → install → .env.local → dev server)
- Post-deploy verification checklist should cover: SPA routing (direct URL access), cart persistence across refresh, WhatsApp order link on Android and iOS

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 4-Vercel Deploy*
*Context gathered: 2026-05-13*
