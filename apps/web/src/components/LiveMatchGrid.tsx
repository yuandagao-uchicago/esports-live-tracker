"use client";

import { useMemo, useState } from "react";
import { MatchCard } from "./MatchCard";
import { useLiveMatches } from "@/lib/realtime";
import { GAME_LABELS, type Game, type MatchWithRelations } from "@/lib/types";

const ALL_GAMES: Game[] = ["lol", "csgo", "valorant"];

export function LiveMatchGrid({
  initial,
  filter,
}: {
  initial: MatchWithRelations[];
  filter?: { teamIds: number[]; tournamentIds: number[] };
}) {
  const matches = useLiveMatches(initial);
  const [gameFilter, setGameFilter] = useState<Game | "all">("all");

  const visible = useMemo(() => {
    let list = matches;
    if (gameFilter !== "all") list = list.filter((m) => m.game === gameFilter);
    if (filter) {
      list = list.filter(
        (m) =>
          (m.team_a_id && filter.teamIds.includes(m.team_a_id)) ||
          (m.team_b_id && filter.teamIds.includes(m.team_b_id)) ||
          (m.tournament_id && filter.tournamentIds.includes(m.tournament_id)),
      );
    }
    return list;
  }, [matches, gameFilter, filter]);

  return (
    <div>
      <div className="mb-4 flex gap-2 text-sm">
        <button
          onClick={() => setGameFilter("all")}
          className={chip(gameFilter === "all")}
        >
          All
        </button>
        {ALL_GAMES.map((g) => (
          <button key={g} onClick={() => setGameFilter(g)} className={chip(gameFilter === g)}>
            {GAME_LABELS[g]}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-gray-500">No matches to show right now.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function chip(active: boolean) {
  return `rounded-full px-3 py-1 border ${
    active
      ? "border-white/40 bg-white/10 text-white"
      : "border-border text-gray-400 hover:text-white"
  }`;
}
