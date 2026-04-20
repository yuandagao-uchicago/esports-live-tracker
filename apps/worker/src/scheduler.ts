import { GAMES, type Game } from "./db.js";
import { rateLimit } from "./providers/pandascore.js";
import { listLiveProviderIds, syncCatalog, syncDetail, syncRunning } from "./sync/matches.js";
import {
  recordError,
  recordPoll,
  recordSuccess,
  refreshMatchesTracked,
  writeHeartbeat,
} from "./sync/health.js";

const POLL_RUNNING = Number(process.env.WORKER_POLL_MS_RUNNING ?? 45_000);
const POLL_DETAIL = Number(process.env.WORKER_POLL_MS_DETAIL ?? 30_000);
const POLL_CATALOG = Number(process.env.WORKER_POLL_MS_CATALOG ?? 600_000);
const DETAIL_CONCURRENCY = 8;

async function withReport<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  recordPoll();
  try {
    const r = await fn();
    console.log(`[ok] ${label}`);
    return r;
  } catch (err) {
    recordError(err);
    console.error(`[err] ${label}:`, err instanceof Error ? err.message : err);
    return null;
  }
}

function tickRunning(game: Game) {
  return withReport(`running:${game}`, async () => {
    const n = await syncRunning(game);
    recordSuccess(n);
  });
}

function tickCatalog(game: Game) {
  return withReport(`catalog:${game}`, () => syncCatalog(game));
}

async function tickDetail(game: Game) {
  if (rateLimit.remaining < 50) {
    console.warn(`[skip] detail:${game} — rate limit low (${rateLimit.remaining})`);
    return;
  }
  const ids = await listLiveProviderIds(game);
  for (let i = 0; i < ids.length; i += DETAIL_CONCURRENCY) {
    const batch = ids.slice(i, i + DETAIL_CONCURRENCY);
    await Promise.all(
      batch.map((id) =>
        withReport(`detail:${game}:${id}`, () => syncDetail(game, id)),
      ),
    );
  }
}

function stagger(fn: () => unknown, offsetMs: number, intervalMs: number) {
  setTimeout(() => {
    fn();
    setInterval(fn, intervalMs);
  }, offsetMs);
}

export function start() {
  GAMES.forEach((game, i) => {
    stagger(() => tickRunning(game), i * 5_000, POLL_RUNNING);
    stagger(() => tickDetail(game), i * 5_000 + 15_000, POLL_DETAIL);
    stagger(() => tickCatalog(game), i * 10_000, POLL_CATALOG);
  });

  const heartbeat = async () => {
    await refreshMatchesTracked();
    await writeHeartbeat();
  };
  heartbeat();
  setInterval(heartbeat, 30_000);
}
