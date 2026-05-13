# Phase 4: Vercel Deploy - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-13
**Phase:** 4-Vercel Deploy
**Areas discussed:** Production URL / domain, Vercel account setup, README scope

---

## Production URL / Domain

| Option | Description | Selected |
|--------|-------------|----------|
| .vercel.app subdomain | Free, instant — e.g. cordyscrafts.vercel.app. og:image placeholder already uses this name. | ✓ |
| Custom domain | e.g. cordyscrafts.in. Requires DNS configuration. Can always add later. | |

**User's choice:** .vercel.app subdomain

**Project name question:**

| Option | Description | Selected |
|--------|-------------|----------|
| cordyscrafts | Gives cordyscrafts.vercel.app — matches Phase 3 og:image placeholder exactly, no code change needed. | ✓ |
| cordys-crafts | Gives cordys-crafts.vercel.app — og:image URL would need updating. | |

**User's choice:** cordyscrafts
**Notes:** Production URL is `https://cordyscrafts.vercel.app`. The og:image URL already uses this exact value — no code change required.

---

## Vercel Account Setup

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — personal account | Already have a Vercel account. Will connect this GitHub repo. | ✓ |
| Yes — team/agency account | Deploying under a Vercel team. | |
| No — creating fresh | Need to sign up for Vercel first. | |

**User's choice:** Yes — personal account

**Connection status question:**

| Option | Description | Selected |
|--------|-------------|----------|
| Not connected yet — needs setup | Plan includes: import repo, set project name, set 3 env vars, deploy. | ✓ |
| Already connected | Just need to set env vars and verify. | |

**User's choice:** Not connected yet
**Notes:** Plan must include full Vercel project setup: import GitHub repo → name it `cordyscrafts` → set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_WHATSAPP_NUMBER` → trigger deploy.

---

## README Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Future devs / handoff | README covers local setup, env vars, and how the key pieces fit together. | ✓ |
| Cordeelia only | Minimal setup, focused on env vars and Vercel. | |

**User's choice:** Future devs / handoff

**Supabase depth question:**

| Option | Description | Selected |
|--------|-------------|----------|
| Env vars only | README says get these 3 values from Cordeelia. Assumes Supabase project already exists. | ✓ |
| Full Supabase setup | README covers create project, run migrations, run seed.sql. | |

**User's choice:** Env vars only

**Vercel steps question:**

| Option | Description | Selected |
|--------|-------------|----------|
| Local dev only | README covers clone → install → .env.local → npm run dev. | ✓ |
| Local dev + Vercel deploy steps | README also covers how to connect GitHub to Vercel. | |

**User's choice:** Local dev only
**Notes:** README audience is future developers inheriting the project. Supabase section assumes existing project. Vercel walkthrough is not in README.

---

## Claude's Discretion

- README sections and formatting — standard structure without user input
- Post-deploy verification checklist content — plan includes manual browser/device testing steps (DEPL-03 requirement)

## Deferred Ideas

None — discussion stayed within phase scope.
