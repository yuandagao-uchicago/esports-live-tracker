import type { SupabaseClient } from "@supabase/supabase-js";
import type { MatchStatus, MatchWithRelations } from "./types";

const SELECT = `*,
       team_a:teams!matches_team_a_id_fkey(*),
       team_b:teams!matches_team_b_id_fkey(*),
       tournament:tournaments(*),
       maps:match_maps(*, winner:teams!match_maps_winner_team_id_fkey(*))`;

type FetchOpts = {
  teamIds?: number[];
  tournamentIds?: number[];
  statuses?: MatchStatus[];
  limit?: number;
  orderAsc?: boolean;
};

export async function fetchMatches(
  supabase: SupabaseClient,
  opts: FetchOpts = {},
): Promise<MatchWithRelations[]> {
  const statuses = opts.statuses ?? (["live", "scheduled"] as MatchStatus[]);
  const limit = opts.limit ?? 60;
  const asc = opts.orderAsc ?? true;

  let q = supabase
    .from("matches")
    .select(SELECT)
    .in("status", statuses)
    .not("team_a_id", "is", null)
    .not("team_b_id", "is", null)
    .order("status", { ascending: true })
    .order("scheduled_at", { ascending: asc })
    .limit(limit);

  if (opts.teamIds?.length) {
    const ids = opts.teamIds.join(",");
    q = q.or(`team_a_id.in.(${ids}),team_b_id.in.(${ids})`);
  }
  if (opts.tournamentIds?.length) {
    q = q.in("tournament_id", opts.tournamentIds);
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as MatchWithRelations[];
}

export async function fetchRecent(
  supabase: SupabaseClient,
  limit = 12,
): Promise<MatchWithRelations[]> {
  const { data, error } = await supabase
    .from("matches")
    .select(SELECT)
    .eq("status", "finished")
    .not("team_a_id", "is", null)
    .not("team_b_id", "is", null)
    .order("began_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as MatchWithRelations[];
}

export async function fetchMatchById(
  supabase: SupabaseClient,
  id: number,
): Promise<MatchWithRelations | null> {
  const { data, error } = await supabase
    .from("matches")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as MatchWithRelations) ?? null;
}
