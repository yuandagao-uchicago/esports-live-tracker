import { db, type Game, type MatchStatus } from "../db.js";
import {
  fetchRunning,
  fetchUpcoming,
  fetchRecent,
  fetchMatch,
  type PSMatch,
} from "../providers/pandascore.js";

function mapStatus(s: PSMatch["status"]): MatchStatus {
  switch (s) {
    case "running":
      return "live";
    case "finished":
      return "finished";
    case "canceled":
    case "postponed":
      return "canceled";
    default:
      return "scheduled";
  }
}

async function upsertTeam(game: Game, team: PSMatch["opponents"][number]["opponent"] | null) {
  if (!team) return null;
  const { data, error } = await db
    .from("teams")
    .upsert(
      {
        provider_id: String(team.id),
        game,
        name: team.name,
        acronym: team.acronym,
        logo_url: team.image_url,
      },
      { onConflict: "provider_id,game" },
    )
    .select("id")
    .single();
  if (error) throw error;
  return data.id as number;
}

async function upsertTournament(game: Game, m: PSMatch) {
  const { data, error } = await db
    .from("tournaments")
    .upsert(
      {
        provider_id: String(m.tournament.id),
        game,
        name: m.tournament.name,
        league_name: m.league.name,
        tier: m.tournament.tier,
      },
      { onConflict: "provider_id,game" },
    )
    .select("id")
    .single();
  if (error) throw error;
  return data.id as number;
}

async function upsertMatch(game: Game, m: PSMatch) {
  const [opA, opB] = m.opponents;
  const teamAId = await upsertTeam(game, opA?.opponent ?? null);
  const teamBId = await upsertTeam(game, opB?.opponent ?? null);
  const tournamentId = await upsertTournament(game, m);

  const resA = teamAId ? m.results.find((r) => String(r.team_id) === String(opA?.opponent.id)) : undefined;
  const resB = teamBId ? m.results.find((r) => String(r.team_id) === String(opB?.opponent.id)) : undefined;

  const currentMap = m.games.find((g) => g.status === "running");

  const { data: matchRow, error: matchErr } = await db
    .from("matches")
    .upsert(
      {
        provider_id: String(m.id),
        game,
        tournament_id: tournamentId,
        team_a_id: teamAId,
        team_b_id: teamBId,
        status: mapStatus(m.status),
        best_of: m.number_of_games,
        scheduled_at: m.scheduled_at,
        began_at: m.begin_at,
        score_a: resA?.score ?? 0,
        score_b: resB?.score ?? 0,
        current_map_number: currentMap?.position ?? null,
        winner_team_id: m.winner_id
          ? (await lookupTeamId(game, m.winner_id))
          : null,
        streams: (m.streams_list ?? []).map((s) => ({
          raw_url: s.raw_url,
          embed_url: s.embed_url,
          language: s.language,
          main: s.main,
          official: s.official,
        })),
      },
      { onConflict: "provider_id,game" },
    )
    .select("id")
    .single();
  if (matchErr) throw matchErr;

  for (const g of m.games) {
    const winnerId = g.winner?.id ? await lookupTeamId(game, g.winner.id) : null;
    const { error } = await db.from("match_maps").upsert(
      {
        match_id: matchRow.id,
        map_number: g.position,
        map_name: g.map?.name ?? null,
        status:
          g.status === "running" ? "live" : g.status === "finished" ? "finished" : "scheduled",
        winner_team_id: winnerId,
      },
      { onConflict: "match_id,map_number" },
    );
    if (error) throw error;
  }

  return matchRow.id as number;
}

async function lookupTeamId(game: Game, providerId: number): Promise<number | null> {
  const { data } = await db
    .from("teams")
    .select("id")
    .eq("game", game)
    .eq("provider_id", String(providerId))
    .maybeSingle();
  return data?.id ?? null;
}

export async function syncRunning(game: Game): Promise<number> {
  const matches = await fetchRunning(game);
  for (const m of matches) await upsertMatch(game, m);
  return matches.length;
}

export async function syncCatalog(game: Game): Promise<number> {
  const [upcoming, recent] = await Promise.all([fetchUpcoming(game), fetchRecent(game)]);
  for (const m of [...upcoming, ...recent]) await upsertMatch(game, m);
  return upcoming.length + recent.length;
}

export async function syncDetail(game: Game, providerId: number): Promise<void> {
  const m = await fetchMatch(game, providerId);
  await upsertMatch(game, m);
}

export async function listLiveProviderIds(game: Game): Promise<number[]> {
  const { data, error } = await db
    .from("matches")
    .select("provider_id")
    .eq("game", game)
    .eq("status", "live");
  if (error) throw error;
  return (data ?? []).map((r) => Number(r.provider_id));
}
