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
  winner?: Team | null;
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

export const GAME_SHORT: Record<Game, string> = {
  lol: "LoL",
  csgo: "CS",
  valorant: "VAL",
};

export const MAP_SCORE_UNIT: Record<Game, string> = {
  lol: "kills",
  csgo: "rounds",
  valorant: "rounds",
};

export const GAME_THEME: Record<
  Game,
  { accent: string; text: string; ring: string; bg: string; glow: string; gradient: string }
> = {
  lol: {
    accent: "#00d4ff",
    text: "text-lol",
    ring: "ring-lol/40",
    bg: "bg-lol/10",
    glow: "shadow-glowLol",
    gradient: "from-[#00d4ff] via-[#3b82f6] to-[#0ea5e9]",
  },
  csgo: {
    accent: "#ffb800",
    text: "text-csgo",
    ring: "ring-csgo/40",
    bg: "bg-csgo/10",
    glow: "shadow-glowCsgo",
    gradient: "from-[#ffb800] via-[#f59e0b] to-[#fb923c]",
  },
  valorant: {
    accent: "#ff4655",
    text: "text-val",
    ring: "ring-val/40",
    bg: "bg-val/10",
    glow: "shadow-glowVal",
    gradient: "from-[#ff4655] via-[#e11d48] to-[#be123c]",
  },
};
