import Link from "next/link";
import { GAME_LABELS, GAME_THEME, MAP_SCORE_UNIT, type MatchWithRelations } from "@/lib/types";
import { TeamLogo } from "./TeamLogo";
import { GameBadge } from "./GameBadge";
import { Countdown } from "./Countdown";

export function FeaturedMatch({ match }: { match: MatchWithRelations }) {
  const theme = GAME_THEME[match.game];
  const isLive = match.status === "live";
  const a = match.team_a;
  const b = match.team_b;
  const currentMap = match.maps.find((m) => m.map_number === match.current_map_number);

  return (
    <Link
      href={`/match/${match.id}`}
      className={`group relative block overflow-hidden rounded-2xl glass p-8 md:p-10 transition hover:-translate-y-0.5 ${
        isLive ? theme.glow : ""
      }`}
    >
      {/* diagonal gradient backdrop */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-[0.14] ${theme.gradient}`}
      />
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl opacity-30"
        style={{ background: theme.accent }}
      />

      <div className="relative">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GameBadge game={match.game} />
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
              {isLive ? "Featured · Live" : "Up Next"}
            </span>
          </div>
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-val/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-val ring-1 ring-val/40">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-val opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-val" />
              </span>
              Live
            </span>
          ) : (
            <Countdown iso={match.scheduled_at} />
          )}
        </div>

        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted">
          {match.tournament?.name ?? GAME_LABELS[match.game]}
        </p>

        <div className="mt-6 grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
          <TeamCell team={a} score={match.score_a} align="left" />

          <div className="text-center">
            {isLive || match.status === "finished" ? (
              <div className="flex items-baseline justify-center gap-3 font-display text-6xl font-bold md:text-8xl">
                <span className={match.score_a > match.score_b ? "text-ink" : "text-muted"}>
                  {match.score_a}
                </span>
                <span className="text-muted/40">—</span>
                <span className={match.score_b > match.score_a ? "text-ink" : "text-muted"}>
                  {match.score_b}
                </span>
              </div>
            ) : (
              <div className="font-display text-5xl font-bold uppercase tracking-tight md:text-7xl">
                <span className="chromatic-shimmer">vs</span>
              </div>
            )}
            {match.best_of ? (
              <div className="mt-2 text-[10px] uppercase tracking-[0.3em] text-muted">
                Best of {match.best_of}
              </div>
            ) : null}
          </div>

          <TeamCell team={b} score={match.score_b} align="right" />
        </div>

        {isLive && currentMap ? (
          <div className="mt-8 rounded-xl border border-border bg-black/30 px-5 py-3 text-sm text-muted">
            Map {currentMap.map_number}
            {currentMap.map_name ? ` · ${currentMap.map_name}` : ""} —{" "}
            <span className="font-mono text-ink">
              {currentMap.score_a}–{currentMap.score_b}
            </span>{" "}
            <span className="text-muted/70">{MAP_SCORE_UNIT[match.game]}</span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}

function TeamCell({
  team,
  align,
}: {
  team: MatchWithRelations["team_a"];
  score: number;
  align: "left" | "right";
}) {
  return (
    <div
      className={`flex items-center gap-4 ${
        align === "right" ? "md:flex-row-reverse md:text-right" : ""
      }`}
    >
      <TeamLogo team={team} size={72} className="shrink-0" />
      <div className="min-w-0">
        <div className="truncate font-display text-2xl font-semibold md:text-3xl">
          {team?.name ?? "TBD"}
        </div>
        {team?.acronym ? (
          <div className="text-xs uppercase tracking-wider text-muted">{team.acronym}</div>
        ) : null}
      </div>
    </div>
  );
}
