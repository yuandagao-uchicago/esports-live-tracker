"use client";

import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowser } from "./supabase/client";
import type { Match, MatchMap, MatchWithRelations } from "./types";

type MatchMapPartial = Partial<MatchMap> & { id: number; match_id: number; map_number: number };

export function useLiveMatches(initial: MatchWithRelations[]) {
  const [matches, setMatches] = useState<Map<number, MatchWithRelations>>(
    () => new Map(initial.map((m) => [m.id, m])),
  );
  const supabaseRef = useRef<ReturnType<typeof createSupabaseBrowser> | null>(null);

  useEffect(() => {
    const supabase = (supabaseRef.current ??= createSupabaseBrowser());

    const matchChannel = supabase
      .channel("matches-stream")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        (payload) => {
          setMatches((prev) => {
            const next = new Map(prev);
            if (payload.eventType === "DELETE") {
              next.delete((payload.old as Match).id);
            } else {
              const row = payload.new as Match;
              const existing = next.get(row.id);
              next.set(row.id, {
                ...(existing ?? { team_a: null, team_b: null, tournament: null, maps: [] }),
                ...row,
              });
            }
            return next;
          });
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
    return (b.began_at ?? b.scheduled_at ?? "").localeCompare(a.began_at ?? a.scheduled_at ?? "");
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
