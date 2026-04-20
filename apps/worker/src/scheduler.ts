import { GAMES, type Game } from "./db.js";
import { syncCatalog, syncRunning } from "./sync/matches.js";
import {
  recordError,
  recordPoll,
  recordSuccess,
  refreshMatchesTracked,
  writeHeartbeat,
} from "./sync/health.js";

const POLL_RUNNING = Number(process.env.WORKER_POLL_MS_RUNNING ?? 30_000);
const POLL_CATALOG = Number(process.env.WORKER_POLL_MS_CATALOG ?? 600_000);

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

function stagger(fn: () => unknown, offsetMs: number, intervalMs: number) {
  setTimeout(() => {
    fn();
    setInterval(fn, intervalMs);
  }, offsetMs);
}

export function start() {
  // PandaScore free tier denies `/{game}/matches/:id` (per-match detail).
  // The list endpoints (running/upcoming/past) already embed `games[]` and
  // `streams_list` for every match returned, so list polling is sufficient
  // for "live" updates — we just poll running matches more frequently.
  GAMES.forEach((game, i) => {
    stagger(() => tickRunning(game), i * 5_000, POLL_RUNNING);
    stagger(() => tickCatalog(game), i * 10_000, POLL_CATALOG);
  });

  const heartbeat = async () => {
    await refreshMatchesTracked();
    await writeHeartbeat();
  };
  heartbeat();
  setInterval(heartbeat, 30_000);
}
