# Esports Live Tracker

Live match tracker for **League of Legends, Counter-Strike, and Valorant**. Background worker polls PandaScore, writes to Supabase, and the Next.js frontend updates in real time via Supabase Realtime. MPCS 51238 · Design, Build, Ship · Assignment 4.

- **Frontend (Vercel):** _pending deploy_
- **Worker (Railway):** _pending deploy_
- **Architecture:** see [`CLAUDE.md`](./CLAUDE.md)

## Features

- Live match grid with per-map scores; updates without refresh.
- Per-match detail page showing current map and history.
- Supabase Auth (email + password).
- Personal favorites — star teams and tournaments, then filter the feed.
- `/health` page shows worker liveness and rate-limit headroom.

## Local dev

```bash
cp .env.local.example .env.local   # fill in values
npm install
npm run dev:worker                 # starts the background poller
npm run dev:web                    # starts Next.js on :3000
```

Both apps read from `.env.local` at the repo root (worker via `dotenv`, web via Next.js).

## Applying the schema

Via Supabase MCP in Claude Code, or paste `supabase/migrations/0001_init.sql` into the Supabase SQL editor.

## Deployment

See `CLAUDE.md` → **Deployment**. Short version: Railway for the worker (root `apps/worker`), Vercel for the web app (root `apps/web`). Do not put `SUPABASE_SERVICE_ROLE_KEY` in Vercel.

## For classmates trying it out

1. Visit the Vercel URL above.
2. Click **Sign in → Sign up**, use any email (email confirmation is disabled).
3. Go to **Settings**, pick a few teams and tournaments, save.
4. Visit **Favorites** to see only your picks, updating live.
