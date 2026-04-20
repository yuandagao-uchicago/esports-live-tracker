import Link from "next/link";
import { GAME_THEME, MAP_SCORE_UNIT, type MatchWithRelations } from "@/lib/types";
import { TeamLogo } from "./TeamLogo";
import { GameBadge } from "./GameBadge";
import { Countdown } from "./Countdown";

export function MatchCard({ match }: { match: MatchWithRelations }) {
  const theme = GAME_THEME[match.game];
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const a = match.team_a;
  const b = match.team_b;
  const aWin = match.score_a > match.score_b;
  const bWin = match.score_b > match.score_a;
  const currentMap = match.maps.find((m) => m.map_number === match.current_map_number);

  return (
    <Link
      href={`/match/${match.id}`}
      className={`group relative block overflow-hidden rounded-xl glass p-4 transition duration-300 hover:-translate-y-0.5 hover:border-white/20 ${
        isLive ? theme.glow : ""
      }`}
    >
      {/* top gradient accent bar */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r opacity-80 ${theme.gradient}`}
      />

      {/* header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GameBadge game={match.game} />
          {match.tournament?.name ? (
            <span className="truncate text-[11px] font-medium uppercase tracking-wider text-muted">
              {match.tournament.name}
            </span>
          ) : null}
        </div>
        <StatusPill match={match} />
      </div>

      {/* teams */}
      <div className="space-y-2.5">
        <TeamRow team={a} score={match.score_a} winning={aWin && (isLive || isFinished)} />
        <TeamRow team={b} score={match.score_b} winning={bWin && (isLive || isFinished)} />
      </div>

      {/* footer */}
      <div className="mt-4 flex items-center justify-between text-[11px] text-muted">
        <span>{match.best_of ? `BO${match.best_of}` : ""}</span>
        {isLive && currentMap ? (
          <span>
            Map {currentMap.map_number}:{" "}
            <span className="font-mono text-ink">
              {currentMap.score_a}–{currentMap.score_b}
            </span>{" "}
            <span className="text-muted/70">{MAP_SCORE_UNIT[match.game]}</span>
          </span>
        ) : match.status === "scheduled" ? (
          <Countdown iso={match.scheduled_at ?? match.began_at} />
        ) : match.status === "finished" ? (
          <span className="uppercase tracking-wider text-muted/70">Final</span>
        ) : null}
      </div>
    </Link>
  );
}

function StatusPill({ match }: { match: MatchWithRelations }) {
  if (match.status === "live") {
    return (
      <span className="relative inline-flex items-center gap-1.5 rounded-full bg-val/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-val ring-1 ring-val/40">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-val opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-val" />
        </span>
        Live
      </span>
    );
  }
  if (match.status === "finished") {
    return (
      <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted">
        Final
      </span>
    );
  }
  return (
    <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted">
      Upcoming
    </span>
  );
}

function TeamRow({
  team,
  score,
  winning,
}: {
  team: MatchWithRelations["team_a"];
  score: number;
  winning: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <TeamLogo team={team} size={36} />
      <span
        className={`flex-1 truncate font-medium ${winning ? "text-ink" : "text-muted"}`}
      >
        {team?.name ?? "TBD"}
      </span>
      <span
        className={`font-display text-xl font-bold tabular-nums ${winning ? "text-ink" : "text-muted"}`}
      >
        {score}
      </span>
    </div>
  );
}
