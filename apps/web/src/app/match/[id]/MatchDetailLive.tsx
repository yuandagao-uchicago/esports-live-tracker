"use client";

import { useLiveMatches } from "@/lib/realtime";
import type { MatchWithRelations } from "@/lib/types";
import { MAP_SCORE_UNIT } from "@/lib/types";

export function MatchDetailLive({ initial }: { initial: MatchWithRelations }) {
  const matches = useLiveMatches([initial]);
  const match = matches.find((m) => m.id === initial.id) ?? initial;
  const a = match.team_a;
  const b = match.team_b;
  const isLive = match.status === "live";
  const unit = MAP_SCORE_UNIT[match.game];

  return (
    <div className="rounded-lg border border-border bg-panel p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {a?.name ?? "TBD"} <span className="text-gray-500">vs</span> {b?.name ?? "TBD"}
        </h1>
        <span className={isLive ? "font-semibold text-red-500" : "text-gray-400"}>
          {isLive ? "● LIVE" : match.status.toUpperCase()}
        </span>
      </div>

      <div className="mb-6 flex items-baseline gap-4 text-4xl font-bold tabular-nums">
        <span className={match.score_a > match.score_b ? "text-white" : "text-gray-500"}>
          {match.score_a}
        </span>
        <span className="text-gray-600">—</span>
        <span className={match.score_b > match.score_a ? "text-white" : "text-gray-500"}>
          {match.score_b}
        </span>
      </div>

      <div>
        <h2 className="mb-2 text-sm uppercase tracking-wide text-gray-400">Maps</h2>
        {match.maps.length === 0 ? (
          <p className="text-gray-500">No map data yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded border border-border">
            {match.maps
              .slice()
              .sort((x, y) => x.map_number - y.map_number)
              .map((g) => {
                const isCurrent = g.map_number === match.current_map_number;
                return (
                  <li
                    key={g.id}
                    className={`flex items-center justify-between px-4 py-3 ${
                      isCurrent ? "bg-red-500/5" : ""
                    }`}
                  >
                    <span>
                      Map {g.map_number}
                      {g.map_name ? <span className="text-gray-500"> · {g.map_name}</span> : null}
                      {isCurrent ? <span className="ml-2 text-xs text-red-500">LIVE</span> : null}
                    </span>
                    <span className="tabular-nums">
                      {g.score_a}–{g.score_b}
                      <span className="ml-2 text-xs text-gray-500">{unit}</span>
                    </span>
                  </li>
                );
              })}
          </ul>
        )}
      </div>
    </div>
  );
}
