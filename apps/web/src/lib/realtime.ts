"use client";

import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowser } from "./supabase/client";
import { fetchMatchById } from "./queries";
import type { Match, MatchMap, MatchWithRelations } from "./types";

type MatchMapPartial = Partial<MatchMap> & { id: number; match_id: number; map_number: number };

export function useLiveMatches(initial: MatchWithRelations[]) {
  const [matches, setMatches] = useState<Map<number, MatchWithRelations>>(
    () => new Map(initial.map((m) => [m.id, m])),
  );
  const supabaseRef = useRef<ReturnType<typeof createSupabaseBrowser> | null>(null);

  useEffect(() => {
    const supabase = (supabaseRef.current ??= createSupabaseBrowser());

    const hydrate = async (id: number) => {
      const full = await fetchMatchById(supabase, id);
      if (!full) return;
      setMatches((prev) => {
        const next = new Map(prev);
        next.set(full.id, full);
        return next;
      });
    };

    const matchChannel = supabase
      .channel("matches-stream")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setMatches((prev) => {
              const next = new Map(prev);
              next.delete((payload.old as Match).id);
              return next;
            });
            return;
          }
          const row = payload.new as Match;
          // Skip bracket placeholders ("Winner of X vs Winner of Y") — PandaScore
          // publishes these with null team FKs before the prior match resolves.
          if (row.team_a_id == null || row.team_b_id == null) return;

          let needsHydrate = false;
          setMatches((prev) => {
            const existing = prev.get(row.id);
            if (!existing) {
              // New match via Realtime — hydrate joined team/tournament data
              // out-of-band so we don't render "TBD".
              needsHydrate = true;
              return prev;
            }
            const next = new Map(prev);
            next.set(row.id, { ...existing, ...row });
            return next;
          });
          if (needsHydrate) void hydrate(row.id);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "match_maps" },
        (payload) => {
          const row = (payload.new ?? payload.old) as MatchMapPartial;
          setMatches((prev) => {
            const existing = prev.get(row.match_id);
            if (!existing) return prev;
            const next = new Map(prev);
            const maps = existing.maps.filter((m) => m.map_number !== row.map_number);
            if (payload.eventType !== "DELETE") {
              maps.push(payload.new as MatchMap);
            }
            maps.sort((a, b) => a.map_number - b.map_number);
            next.set(row.match_id, { ...existing, maps });
            return next;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchChannel);
    };
  }, []);

  return Array.from(matches.values()).sort((a, b) => {
    const sa = statusWeight(a.status) - statusWeight(b.status);
    if (sa !== 0) return sa;
    // scheduled: soonest-first (ASC); live/finished: most recent first (DESC)
    const keyA = a.began_at ?? a.scheduled_at ?? "";
    const keyB = b.began_at ?? b.scheduled_at ?? "";
    return a.status === "scheduled" ? keyA.localeCompare(keyB) : keyB.localeCompare(keyA);
  });
}

function statusWeight(s: Match["status"]) {
  switch (s) {
    case "live":
      return 0;
    case "scheduled":
      return 1;
    case "finished":
      return 2;
    default:
      return 3;
  }
}
