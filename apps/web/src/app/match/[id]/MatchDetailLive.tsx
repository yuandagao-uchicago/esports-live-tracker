"use client";

import { useLiveMatches } from "@/lib/realtime";
import { GAME_THEME, MAP_SCORE_UNIT, type MatchWithRelations } from "@/lib/types";
import { TeamLogo } from "@/components/TeamLogo";
import { GameBadge } from "@/components/GameBadge";
import { Countdown } from "@/components/Countdown";

export function MatchDetailLive({ initial }: { initial: MatchWithRelations }) {
  const matches = useLiveMatches([initial]);
  const match = matches.find((m) => m.id === initial.id) ?? initial;
  const theme = GAME_THEME[match.game];
  const a = match.team_a;
  const b = match.team_b;
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const unit = MAP_SCORE_UNIT[match.game];

  return (
    <div className={`relative overflow-hidden rounded-2xl glass p-6 md:p-10 ${isLive ? theme.glow : ""}`}>
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-[0.12] ${theme.gradient}`}
      />
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl opacity-25"
        style={{ background: theme.accent }}
      />

      <div className="relative">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <GameBadge game={match.game} />
          {match.tournament?.name ? (
            <span className="text-xs uppercase tracking-[0.22em] text-muted">
              {match.tournament.name}
            </span>
          ) : null}
          {match.best_of ? (
            <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted">
              BO{match.best_of}
            </span>
          ) : null}
          <div className="ml-auto">
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-val/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-val ring-1 ring-val/40">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-val opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-val" />
                </span>
                Live
              </span>
            ) : isFinished ? (
              <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted">
                Final
              </span>
            ) : (
              <Countdown iso={match.scheduled_at} />
            )}
          </div>
        </div>

        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
          <TeamSide team={a} align="left" />
          <div className="text-center">
            {isLive || isFinished ? (
              <div className="flex items-baseline justify-center gap-3 font-display text-7xl font-bold md:text-9xl">
                <span className={match.score_a > match.score_b ? "text-ink" : "text-muted"}>
                  {match.score_a}
                </span>
                <span className="text-muted/40">—</span>
                <span className={match.score_b > match.score_a ? "text-ink" : "text-muted"}>
                  {match.score_b}
                </span>
              </div>
            ) : (
              <div className="font-display text-6xl font-bold uppercase md:text-8xl">
                <span className="chromatic-shimmer">VS</span>
              </div>
            )}
          </div>
          <TeamSide team={b} align="right" />
        </div>

        <div className="mt-10">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
            Maps
          </h2>
          {match.maps.length === 0 ? (
            <p className="rounded-lg border border-border bg-white/5 px-4 py-3 text-sm text-muted">
              Map breakdown will appear here once the match starts.
            </p>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
              {match.maps
                .slice()
                .sort((x, y) => x.map_number - y.map_number)
                .map((g) => {
                  const isCurrent = g.map_number === match.current_map_number;
                  return (
                    <li
                      key={g.id}
                      className={`flex items-center justify-between px-4 py-3 ${
                        isCurrent ? "bg-val/5" : ""
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="font-display text-lg font-semibold text-muted">
                          {String(g.map_number).padStart(2, "0")}
                        </span>
                        <span>
                          {g.map_name ?? "—"}
                          {isCurrent ? (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-val/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-val ring-1 ring-val/40">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-val" />
                              Now
                            </span>
                          ) : null}
                        </span>
                      </span>
                      <span className="font-mono tabular-nums">
                        {g.score_a}–{g.score_b}
                        <span className="ml-2 text-xs text-muted">{unit}</span>
                      </span>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamSide({ team, align }: { team: MatchWithRelations["team_a"]; align: "left" | "right" }) {
  return (
    <div
      className={`flex items-center gap-4 ${
        align === "right" ? "md:flex-row-reverse md:text-right" : ""
      }`}
    >
      <TeamLogo team={team} size={96} className="shrink-0" />
      <div className="min-w-0">
        <div className="truncate font-display text-3xl font-bold md:text-4xl">
          {team?.name ?? "TBD"}
        </div>
        {team?.acronym ? (
          <div className="text-xs uppercase tracking-[0.2em] text-muted">{team.acronym}</div>
        ) : null}
      </div>
    </div>
  );
}
