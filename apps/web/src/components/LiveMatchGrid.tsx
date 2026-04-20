"use client";

import { useMemo, useState } from "react";
import { MatchCard } from "./MatchCard";
import { FeaturedMatch } from "./FeaturedMatch";
import { GameFilterChips } from "./GameFilterChips";
import { Reveal } from "./Reveal";
import { useLiveMatches } from "@/lib/realtime";
import type { Game, MatchWithRelations } from "@/lib/types";

export function LiveMatchGrid({
  initial,
  filter,
  showFeatured = true,
}: {
  initial: MatchWithRelations[];
  filter?: { teamIds: number[]; tournamentIds: number[] };
  showFeatured?: boolean;
}) {
  const matches = useLiveMatches(initial);
  const [game, setGame] = useState<Game | "all">("all");

  const visible = useMemo(() => {
    let list = matches;
    if (game !== "all") list = list.filter((m) => m.game === game);
    if (filter) {
      list = list.filter(
        (m) =>
          (m.team_a_id && filter.teamIds.includes(m.team_a_id)) ||
          (m.team_b_id && filter.teamIds.includes(m.team_b_id)) ||
          (m.tournament_id && filter.tournamentIds.includes(m.tournament_id)),
      );
    }
    return list;
  }, [matches, game, filter]);

  const [featured, ...rest] = visible;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <GameFilterChips value={game} onChange={setGame} />
        <div className="text-xs text-muted">{visible.length} tracked</div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-border glass p-10 text-center text-muted">
          Nothing here yet.
        </div>
      ) : (
        <>
          {showFeatured && featured ? (
            <div className="mb-8 animate-fadeUp">
              <FeaturedMatch match={featured} />
            </div>
          ) : null}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {(showFeatured ? rest : visible).map((m, i) => (
              <Reveal key={m.id} delay={Math.min(i * 40, 600)}>
                <MatchCard match={m} />
              </Reveal>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
