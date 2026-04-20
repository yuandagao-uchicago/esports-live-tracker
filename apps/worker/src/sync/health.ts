import { db } from "../db.js";
import { rateLimit } from "../providers/pandascore.js";

let pollCount = 0;
let errorCount = 0;
let lastError: string | null = null;
let lastSuccessAt: Date | null = null;
let matchesTracked = 0;

export function recordPoll() {
  pollCount += 1;
}

export function recordSuccess(matchCount: number) {
  lastSuccessAt = new Date();
  matchesTracked = matchCount;
}

export function recordError(err: unknown) {
  errorCount += 1;
  lastError = err instanceof Error ? err.message : String(err);
}

export async function writeHeartbeat() {
  const { error } = await db.from("worker_health").upsert(
    {
      id: 1,
      last_poll_at: new Date().toISOString(),
      last_success_at: lastSuccessAt?.toISOString() ?? null,
      last_error: lastError,
      error_count_24h: errorCount,
      matches_tracked: matchesTracked,
      poll_count_24h: pollCount,
      rate_limit_remaining: Number.isFinite(rateLimit.remaining) ? rateLimit.remaining : null,
    },
    { onConflict: "id" },
  );
  if (error) console.error("[health] heartbeat failed:", error.message);
}

export async function refreshMatchesTracked() {
  const { count } = await db
    .from("matches")
    .select("id", { count: "exact", head: true })
    .in("status", ["live", "scheduled"]);
  if (count !== null) matchesTracked = count;
}
