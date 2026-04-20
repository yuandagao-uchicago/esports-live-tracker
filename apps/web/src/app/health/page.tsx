import { createSupabaseServer } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/SectionHeader";

export const revalidate = 0;

type WorkerHealth = {
  last_poll_at: string | null;
  last_success_at: string | null;
  last_error: string | null;
  error_count_24h: number;
  matches_tracked: number;
  poll_count_24h: number;
  rate_limit_remaining: number | null;
};

export default async function HealthPage() {
  const supabase = await createSupabaseServer();
  const { data } = await supabase.from("worker_health").select("*").eq("id", 1).maybeSingle();
  const h = (data ?? null) as WorkerHealth | null;

  const lastPoll = h?.last_poll_at ? new Date(h.last_poll_at) : null;
  const ageSeconds = lastPoll ? Math.round((Date.now() - lastPoll.getTime()) / 1000) : null;
  const healthy = ageSeconds !== null && ageSeconds < 120;

  return (
    <div className="mx-auto max-w-2xl">
      <SectionHeader eyebrow="Ops" title="Worker health" />

      <div className="relative overflow-hidden rounded-2xl glass p-8">
        <div
          className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl opacity-30`}
          style={{ background: healthy ? "#22c55e" : "#ef4444" }}
        />
        <div className="relative">
          {!h ? (
            <p className="text-muted">No heartbeat recorded yet.</p>
          ) : (
            <>
              <div className="mb-6 flex items-center gap-3">
                <span className={`relative flex h-3 w-3`}>
                  <span
                    className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                      healthy ? "bg-green-500" : "bg-val"
                    }`}
                  />
                  <span
                    className={`relative inline-flex h-3 w-3 rounded-full ${
                      healthy ? "bg-green-500" : "bg-val"
                    }`}
                  />
                </span>
                <span className="font-display text-2xl font-semibold uppercase">
                  {healthy ? "Healthy" : "Stale"}
                </span>
                <span className="text-muted">· polled {formatAgo(h.last_poll_at)}</span>
              </div>

              <dl className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <Stat label="Matches tracked" value={h.matches_tracked} />
                <Stat label="Polls (session)" value={h.poll_count_24h} />
                <Stat label="Errors (session)" value={h.error_count_24h} accent={h.error_count_24h > 0 ? "val" : undefined} />
                <Stat label="Last success" value={formatAgo(h.last_success_at)} />
                <Stat label="Rate limit left" value={h.rate_limit_remaining ?? "—"} />
              </dl>

              {h.last_error ? (
                <div className="mt-6 rounded-lg border border-val/30 bg-val/5 p-4 text-sm text-val">
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest">
                    Last error
                  </div>
                  <code className="break-words font-mono text-[12px]">{h.last_error}</code>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "val";
}) {
  return (
    <div className="rounded-lg border border-border bg-white/[0.02] p-4">
      <dt className="text-[10px] font-semibold uppercase tracking-widest text-muted">{label}</dt>
      <dd
        className={`mt-1 font-display text-2xl font-semibold ${
          accent === "val" ? "text-val" : "text-ink"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function formatAgo(ts: string | null) {
  if (!ts) return "—";
  const s = Math.round((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  return `${Math.round(s / 3600)}h ago`;
}
