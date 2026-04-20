import Link from "next/link";
import { GAME_LABELS, MAP_SCORE_UNIT, type MatchWithRelations } from "@/lib/types";

export function MatchCard({ match }: { match: MatchWithRelations }) {
  const a = match.team_a;
  const b = match.team_b;
  const isLive = match.status === "live";
  const currentMap = match.maps.find((m) => m.map_number === match.current_map_number);

  return (
    <Link
      href={`/match/${match.id}`}
      className="block rounded-lg border border-border bg-panel p-4 transition hover:border-white/20"
    >
      <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
        <span className="uppercase tracking-wide">{GAME_LABELS[match.game]}</span>
        <span>
          {isLive ? (
            <span className="inline-flex items-center gap-1 font-semibold text-red-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> LIVE
            </span>
          ) : (
            match.status.toUpperCase()
          )}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{a?.name ?? "TBD"}</div>
          <div className="truncate text-sm text-gray-400">{b?.name ?? "TBD"}</div>
        </div>
        <div className="ml-4 text-right text-2xl font-bold tabular-nums">
          <div className={match.score_a > match.score_b ? "text-white" : "text-gray-400"}>
            {match.score_a}
          </div>
          <div className={match.score_b > match.score_a ? "text-white" : "text-gray-400"}>
            {match.score_b}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span className="truncate">{match.tournament?.name ?? ""}</span>
        {match.best_of ? <span>BO{match.best_of}</span> : null}
      </div>

      {isLive && currentMap ? (
        <div className="mt-3 rounded bg-black/30 px-3 py-2 text-xs text-gray-300">
          Map {currentMap.map_number}: {currentMap.score_a}–{currentMap.score_b}{" "}
          <span className="text-gray-500">({MAP_SCORE_UNIT[match.game]})</span>
        </div>
      ) : null}
    </Link>
  );
}
