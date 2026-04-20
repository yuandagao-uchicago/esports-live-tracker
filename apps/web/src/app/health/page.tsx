import { createSupabaseServer } from "@/lib/supabase/server";

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
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-2xl font-semibold">Worker health</h1>
      {!h ? (
        <p className="text-gray-500">No heartbeat recorded yet.</p>
      ) : (
        <dl className="divide-y divide-border rounded border border-border">
          <Row label="Status">
            <span className={healthy ? "text-green-400" : "text-red-400"}>
              {healthy ? "● healthy" : "● stale"}
            </span>
          </Row>
          <Row label="Last poll">{formatAgo(h.last_poll_at)}</Row>
          <Row label="Last success">{formatAgo(h.last_success_at)}</Row>
          <Row label="Matches tracked">{h.matches_tracked}</Row>
          <Row label="Polls (session)">{h.poll_count_24h}</Row>
          <Row label="Errors (session)">{h.error_count_24h}</Row>
          <Row label="Rate limit remaining">{h.rate_limit_remaining ?? "—"}</Row>
          {h.last_error ? <Row label="Last error">{h.last_error}</Row> : null}
        </dl>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <dt className="text-gray-400">{label}</dt>
      <dd className="font-mono">{children}</dd>
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
