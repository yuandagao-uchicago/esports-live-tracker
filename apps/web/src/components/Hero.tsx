import Link from "next/link";

export function Hero({ liveCount, upcomingCount }: { liveCount: number; upcomingCount: number }) {
  return (
    <section className="relative mt-6 overflow-hidden rounded-2xl border border-border glass px-8 py-14 md:px-14 md:py-20">
      {/* corner glow */}
      <div
        className="pointer-events-none absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full blur-3xl opacity-40"
        style={{
          background:
            "conic-gradient(from 180deg, #a855f7, #ec4899, #22d3ee, #a855f7)",
        }}
      />
      <div
        className="pointer-events-none absolute -left-28 -bottom-28 h-[320px] w-[320px] rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, #ff4655, transparent 60%)" }}
      />

      <div className="relative max-w-3xl">
        <div className="mb-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-val opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-val" />
          </span>
          {liveCount > 0 ? `${liveCount} live now` : "tracking matches globally"}
          <span className="mx-2 opacity-40">·</span>
          {upcomingCount} upcoming
        </div>

        <h1 className="display text-5xl font-bold uppercase text-ink md:text-7xl">
          The match
          <br />
          never <span className="chromatic-shimmer">sleeps.</span>
        </h1>

        <p className="mt-5 max-w-xl text-muted md:text-lg">
          Real-time tracking for League of Legends, Counter-Strike, and Valorant.
          Scores update the instant the map ticks over — no refresh, no waiting.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/settings"
            className="rounded-lg bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan px-5 py-2.5 font-semibold text-white shadow-glow transition hover:brightness-110"
          >
            Pick your teams →
          </Link>
          <Link
            href="/favorites"
            className="rounded-lg border border-border bg-white/5 px-5 py-2.5 font-medium text-ink transition hover:bg-white/10"
          >
            My feed
          </Link>
        </div>
      </div>
    </section>
  );
}
