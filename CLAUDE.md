# Esports Live-Match Tracker — Architecture

Multi-service system tracking live CSGO, Valorant, and League of Legends matches from PandaScore. Part of MPCS 51238 Design, Build, Ship (Assignment 4).

## Data flow

```
PandaScore API (free tier, ~1000 req/hr)
        │  HTTPS GET /{lol|csgo|valorant}/matches/{running|upcoming|past|:id}
        ▼
apps/worker  (Node.js + TypeScript, long-running, Railway)
  ├─ staggered pollers per game
  ├─ upserts teams / tournaments / matches / match_maps via service role
  └─ heartbeats worker_health every 30s
        │  postgres
        ▼
Supabase Postgres
  ├─ RLS: public read on match data, owner-only on favorites
  └─ Realtime publication: matches, match_maps, worker_health
        │  postgres_changes over WebSocket
        ▼
apps/web  (Next.js 15 App Router + Tailwind, Vercel)
  ├─ SSR initial page load via anon client
  ├─ useLiveMatches() — one Realtime subscription per page, client-side filter
  └─ Supabase Auth (email/password), middleware refreshes session cookie
```

## Worker (`apps/worker/src/`)

- `index.ts` — entry point. Loads `.env` via dotenv, starts schedulers, handles SIGTERM.
- `scheduler.ts` — three staggered loops per game:
  - `running` every 45s — list of currently-live matches.
  - `detail` every 30s — per-match fetch, only for matches currently `live` in the DB. Capped at 8 concurrent.
  - `catalog` every 10 min — upcoming + finished lists (teams/tournaments seed).
- `providers/pandascore.ts` — thin fetch wrapper, reads `X-RateLimit-Remaining` / `X-RateLimit-Limit` headers into a shared `rateLimit` object. Detail polling skips if `remaining < 50`.
- `sync/matches.ts` — idempotent upserts. Teams and tournaments are upserted by `(provider_id, game)`; matches upsert adds `match_maps` rows by `(match_id, map_number)`.
- `sync/health.ts` — in-memory counters, heartbeat writes singleton `worker_health` row every 30s.

Rate budget (3 games, peak 6 concurrent live matches):
| Loop              | Cadence | Req / hr |
|-------------------|---------|----------|
| running × 3 games | 45s     | 240      |
| detail (~6 live)  | 30s     | ~720     |
| catalog × 3 games | 600s    | 36       |
| **Total peak**    |         | **~996** — under 1000 req/hr budget |

## Database

Single migration at `supabase/migrations/0001_init.sql`. Key design choices:

- **Unified `matches` table** with `game` enum column. Keeps "all live matches" queries trivial; per-game UI labels come from `match_maps.score_a/b` interpreted against the `game` enum (rounds for CSGO/Valorant, kills/towers for LoL).
- **Separate `match_maps` table** so per-map updates push granular Realtime events (not re-renders of the whole match card).
- **Upsert keys** are `(provider_id, game)` on teams/tournaments/matches — no FK churn if PandaScore reassigns ids within a game.
- **Two FKs from matches → teams** (`team_a_id`, `team_b_id`) named explicitly so the Supabase client can disambiguate joins: see `apps/web/src/lib/queries.ts` (`teams!matches_team_a_id_fkey`).
- **`worker_health` singleton** (PK check `id = 1`) — one row, upserted on heartbeat.
- **RLS**: public `select` on match data; owner-only on `user_favorite_*`; writes go through the service role (bypasses RLS) so no insert/update policies needed.
- **Realtime** enabled on `matches`, `match_maps`, `worker_health` only (teams/tournaments near-static).

## Frontend (`apps/web/src/`)

- `app/page.tsx` — SSR live match list.
- `app/match/[id]/page.tsx` — SSR match detail; `MatchDetailLive.tsx` subscribes for live map score updates.
- `app/favorites/page.tsx` — auth-gated, pre-filters by `user_favorite_*`.
- `app/settings/page.tsx` — multi-select team + tournament pickers; writes to favorites tables.
- `app/health/page.tsx` — reads `worker_health`, shows healthy/stale indicator.
- `app/login/page.tsx` — email+password sign in / sign up.
- `middleware.ts` — refreshes Supabase session cookie on every request.
- `lib/realtime.ts` — `useLiveMatches()` hook, the only Realtime subscription in the app. One broad subscription; filtering done client-side in `LiveMatchGrid`.
- `lib/supabase/{server,client}.ts` — `@supabase/ssr` clients (SSR vs browser).

## Environment variables

| Var | Local `.env.local` | Vercel | Railway |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | ✓ | — |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ | ✓ | — |
| `SUPABASE_URL` | ✓ (worker) | — | ✓ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ (worker) | **never** | ✓ |
| `PANDASCORE_API_KEY` | ✓ (worker) | — | ✓ |
| `PANDASCORE_BASE_URL` | optional | — | optional |
| `WORKER_POLL_MS_RUNNING` | optional | — | optional |
| `WORKER_POLL_MS_DETAIL` | optional | — | optional |
| `WORKER_POLL_MS_CATALOG` | optional | — | optional |

The service role key must never be deployed to Vercel — the web app uses the anon key only.

## Supabase MCP

```
claude mcp add --transport http supabase https://mcp.supabase.com/mcp
```

Used to apply migrations, seed data, and inspect RLS from Claude Code.

## Day-0 PandaScore gate

Before writing worker code against real endpoints, confirm the free tier returns live-match data for each game:

```bash
curl -H "Accept: application/json" \
  "https://api.pandascore.co/lol/matches/running?token=$PANDASCORE_API_KEY"
curl -H "Accept: application/json" \
  "https://api.pandascore.co/csgo/matches/running?token=$PANDASCORE_API_KEY"
curl -H "Accept: application/json" \
  "https://api.pandascore.co/valorant/matches/running?token=$PANDASCORE_API_KEY"
```

Recorded 2026-04-19 (free tier):

| Game     | `/running` | `/upcoming` | `/past`   | Notes |
|----------|-----------|-------------|-----------|-------|
| LoL      | 200 `[]`  | 200 9.6 KB  | 200 12 KB | full access |
| CSGO     | 200 `[]`  | 200 10.4 KB | 200 10.2 KB | full access |
| Valorant | 200 `[]`  | 200 10.6 KB | 200 11.1 KB | full access |

`running` was empty because no matches were live at the moment of testing — the endpoint itself is not gated. All three games pass the scope gate.

Response-shape notes for the worker:
- `tier` lives on `tournament`, not `serie`. `m.tournament.tier` is a single letter: `"s" | "a" | "b" | "c" | "d"`.
- `serie` has `full_name` (e.g. `"2026"`) and no `tier`.
- `games[]` has `{ id, position, status, winner: { id, type } }` and per-map score fields are not present on `/matches/running` or `/matches/upcoming` — we'll need to decide later if we call `/lol/games/:id` etc. for round-level scores. For MVP, per-match `results[].score` (maps won) is sufficient.

## Fallback plan (last resort)

If PandaScore free tier blocks all three: LoL via Riot API (`/lol/spectator/v5`), Valorant via VLR.gg HTML scrape, CSGO via HLTV unofficial. Each is its own provider module under `apps/worker/src/providers/`. Not recommended — eats the schedule.

## Deployment

- **Worker → Railway**: connect the GitHub repo, set root dir `apps/worker`, build command `npm install && npm run build -w worker` (from repo root), start command `node apps/worker/dist/index.js`. Add env vars listed above.
- **Web → Vercel**: set root dir `apps/web`. Vercel auto-detects Next.js. Add the two `NEXT_PUBLIC_*` env vars.

Railway keeps the worker as a long-running process; do not configure as cron.
