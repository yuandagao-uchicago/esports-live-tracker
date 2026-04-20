import type { SupabaseClient } from "@supabase/supabase-js";
import type { MatchWithRelations } from "./types";

export async function fetchMatches(
  supabase: SupabaseClient,
  opts: { teamIds?: number[]; tournamentIds?: number[] } = {},
): Promise<MatchWithRelations[]> {
  let q = supabase
    .from("matches")
    .select(
      `*,
       team_a:teams!matches_team_a_id_fkey(*),
       team_b:teams!matches_team_b_id_fkey(*),
       tournament:tournaments(*),
       maps:match_maps(*)`,
    )
    .neq("status", "canceled")
    .not("team_a_id", "is", null)
    .not("team_b_id", "is", null)
    .order("status", { ascending: true })
    .order("scheduled_at", { ascending: true })
    .limit(60);

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

export async function fetchMatchById(
  supabase: SupabaseClient,
  id: number,
): Promise<MatchWithRelations | null> {
  const { data, error } = await supabase
    .from("matches")
    .select(
      `*,
       team_a:teams!matches_team_a_id_fkey(*),
       team_b:teams!matches_team_b_id_fkey(*),
       tournament:tournaments(*),
       maps:match_maps(*)`,
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as MatchWithRelations) ?? null;
}
