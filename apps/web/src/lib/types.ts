export type Game = "lol" | "csgo" | "valorant";
export type MatchStatus = "scheduled" | "live" | "finished" | "canceled";

export type Team = {
  id: number;
  provider_id: string;
  game: Game;
  name: string;
  acronym: string | null;
  logo_url: string | null;
};

export type Tournament = {
  id: number;
  provider_id: string;
  game: Game;
  name: string;
  league_name: string | null;
  tier: string | null;
};

export type MatchMap = {
  id: number;
  match_id: number;
  map_number: number;
  map_name: string | null;
  score_a: number;
  score_b: number;
  status: MatchStatus;
  winner_team_id: number | null;
  updated_at: string;
};

export type Match = {
  id: number;
  provider_id: string;
  game: Game;
  tournament_id: number | null;
  team_a_id: number | null;
  team_b_id: number | null;
  status: MatchStatus;
  best_of: number | null;
  scheduled_at: string | null;
  began_at: string | null;
  score_a: number;
  score_b: number;
  current_map_number: number | null;
  winner_team_id: number | null;
  updated_at: string;
};

export type MatchWithRelations = Match & {
  team_a: Team | null;
  team_b: Team | null;
  tournament: Tournament | null;
  maps: MatchMap[];
};

export const GAME_LABELS: Record<Game, string> = {
  lol: "League of Legends",
  csgo: "CS:GO",
  valorant: "Valorant",
};

export const MAP_SCORE_UNIT: Record<Game, string> = {
  lol: "kills",
  csgo: "rounds",
  valorant: "rounds",
};
