---
plan: 04-02
status: complete
duration: ~15 min
---

## What Was Done

Connected GitHub repo (`lshadap/CordyCrafts`) to Vercel, configured project as `cordyscrafts`, set all three env vars, and triggered first deployment.

## Verification

- Vercel project name: `cordyscrafts`
- Connected repo: `lshadap/CordyCrafts`, Production Branch: `main`
- Env vars set: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_WHATSAPP_NUMBER`
- First build: green
- Site live at `https://cordyscrafts.vercel.app`
- Auto-deploy confirmed: subsequent push triggered automatic deployment

## Notes

- GitHub auth issue: machine authenticated as `lambertmindbit`; repo owned by `lshadap`. Resolved by authenticating as `lshadap` for the push.
- GitHub redirected the repo URL from `cordycrafts` to `CordyCrafts` (case change) — push succeeded regardless.
