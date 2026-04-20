import Link from "next/link";
import { notFound } from "next/navigation";
import { MatchCard } from "@/components/MatchCard";
import { GameBadge } from "@/components/GameBadge";
import { TeamLogo } from "@/components/TeamLogo";
import { SectionHeader } from "@/components/SectionHeader";
import { createSupabaseServer } from "@/lib/supabase/server";
import { GAME_LABELS, GAME_THEME, type MatchWithRelations, type Team } from "@/lib/types";

export const revalidate = 0;

const SELECT = `*,
       team_a:teams!matches_team_a_id_fkey(*),
       team_b:teams!matches_team_b_id_fkey(*),
       tournament:tournaments(*),
       maps:match_maps(*, winner:teams!match_maps_winner_team_id_fkey(*))`;

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const teamId = Number(id);
  if (!Number.isFinite(teamId)) notFound();

  const supabase = await createSupabaseServer();

  const [{ data: team }, { data: matches }] = await Promise.all([
    supabase.from("teams").select("*").eq("id", teamId).maybeSingle(),
    supabase
      .from("matches")
      .select(SELECT)
      .or(`team_a_id.eq.${teamId},team_b_id.eq.${teamId}`)
      .order("scheduled_at", { ascending: false })
      .limit(200),
  ]);

  if (!team) notFound();
  const t = team as Team;
  const all = (matches ?? []) as unknown as MatchWithRelations[];

  const finished = all.filter((m) => m.status === "finished");
  const wins = finished.filter((m) => m.winner_team_id === teamId).length;
  const losses = finished.filter(
    (m) => m.winner_team_id != null && m.winner_team_id !== teamId,
  ).length;
  const winRate = finished.length > 0 ? Math.round((wins / finished.length) * 100) : null;

  const upcoming = all
    .filter((m) => m.status === "scheduled" || m.status === "live")
    .sort((a, b) =>
      (a.scheduled_at ?? "").localeCompare(b.scheduled_at ?? ""),
    );
  const recent = finished
    .slice()
    .sort((a, b) => (b.began_at ?? "").localeCompare(a.began_at ?? ""))
    .slice(0, 12);

  const theme = GAME_THEME[t.game];

  return (
    <div className="pt-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-ink"
      >
        ← Back to feed
      </Link>

      <section
        className={`relative overflow-hidden rounded-2xl glass p-8 md:p-10 ${theme.glow}`}
      >
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-[0.14] ${theme.gradient}`}
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl opacity-25"
          style={{ background: theme.accent }}
        />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <TeamLogo team={t} size={96} className="shrink-0" />
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <GameBadge game={t.game} />
                <span className="text-xs uppercase tracking-[0.22em] text-muted">
                  {GAME_LABELS[t.game]}
                </span>
              </div>
              <h1 className="display truncate text-3xl font-bold md:text-5xl">
                {t.name}
              </h1>
              {t.acronym ? (
                <div className="mt-1 text-sm uppercase tracking-[0.22em] text-muted">
                  {t.acronym}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-6 md:gap-10">
            <Stat label="Wins" value={wins} accent="text-green-400" />
            <Stat label="Losses" value={losses} accent="text-val" />
            <Stat
              label="Win rate"
              value={winRate == null ? "—" : `${winRate}%`}
              accent="text-ink"
            />
          </div>
        </div>
      </section>

      <SectionHeader
        eyebrow="On the schedule"
        title="Upcoming"
        right={
          <span className="text-xs text-muted">
            {upcoming.length} match{upcoming.length === 1 ? "" : "es"}
          </span>
        }
      />
      {upcoming.length === 0 ? (
        <Empty label="No upcoming matches scheduled." />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {upcoming.slice(0, 12).map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}

      <SectionHeader eyebrow="Recap" title="Recent results" />
      {recent.length === 0 ? (
        <Empty label="No results yet for this team." />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {recent.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="text-center">
      <div className={`font-display text-3xl font-bold md:text-4xl ${accent}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted">{label}</div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-border glass p-8 text-center text-muted">
      {label}
    </div>
  );
}
