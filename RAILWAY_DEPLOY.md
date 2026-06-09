# Deploying to Railway

This app is a standard Next.js 14 server. Railway builds it with Nixpacks
(`npm run build`) and serves it with `npm run start`, which listens on the
`PORT` Railway injects.

## 1. One-time database setup (Supabase)

In the Supabase SQL Editor, run (in order):

1. `supabase/schema.sql` — only if the project is brand new.
2. `supabase/rls-policies.sql` — row-level security + storage policy notes.
3. `supabase/launch-migration.sql` — **always run this**. Adds invoice
   currency, the business `logo_url`, and creates the public `logos` storage
   bucket with its policies.

## 2. Create the Railway service

1. Railway → **New Project → Deploy from GitHub repo** → pick this repo.
2. Railway auto-detects Next.js (config also pinned in `railway.json`).
3. Add the environment variables below.
4. Deploy. Once live, open **Settings → Networking → Generate Domain** to get
   your public URL.

## 3. Environment variables (Railway → Variables)

| Variable | Required | Value |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | From Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | From Supabase → Settings → API |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your Railway domain, e.g. `https://boarded.up.railway.app` |
| `GEMINI_API_KEY` | optional | For AI contract generation |
| `NEXT_PUBLIC_RAZORPAY_KEY` / `NEXT_PUBLIC_STRIPE_KEY` | optional | Payments |

> After the first deploy you'll know your domain — set `NEXT_PUBLIC_APP_URL`
> to it and redeploy so password-reset and share links point at production.

## 4. Supabase auth redirect URLs

In Supabase → **Authentication → URL Configuration**, add your Railway domain
to **Site URL** and **Redirect URLs** (e.g. `https://boarded.up.railway.app/**`)
so email confirmation and password reset redirect correctly.

## 5. Verify

- Sign up / log in
- Settings → Business Profile → upload a logo (confirms the `logos` bucket)
- Create an invoice in ₹ (or any currency) → open it → **Download / Print**
