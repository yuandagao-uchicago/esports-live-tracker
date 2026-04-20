import type { Game } from "../db.js";

const BASE = process.env.PANDASCORE_BASE_URL ?? "https://api.pandascore.co";
const KEY = process.env.PANDASCORE_API_KEY;

if (!KEY) throw new Error("PANDASCORE_API_KEY must be set");

export const rateLimit = {
  remaining: Number.POSITIVE_INFINITY,
  limit: Number.POSITIVE_INFINITY,
  updatedAt: 0,
};

export type PSTeam = { id: number; name: string; acronym: string | null; image_url: string | null };
export type PSLeague = { id: number; name: string };
export type PSSerie = { id: number; name: string | null; full_name: string | null };
export type PSTournament = { id: number; name: string; tier: string | null };
export type PSGameMap = {
  id: number;
  position: number;
  status: "not_started" | "running" | "finished";
  winner?: { id: number | null } | null;
  map?: { id: number; name: string | null } | null;
};
export type PSStream = {
  raw_url: string | null;
  embed_url: string | null;
  language: string | null;
  main: boolean | null;
  official: boolean | null;
};
export type PSMatch = {
  id: number;
  status: "not_started" | "running" | "finished" | "canceled" | "postponed";
  begin_at: string | null;
  scheduled_at: string | null;
  end_at: string | null;
  number_of_games: number;
  results: { team_id: number; score: number }[];
  opponents: { opponent: PSTeam }[];
  league: PSLeague;
  serie: PSSerie;
  tournament: PSTournament;
  winner_id: number | null;
  games: PSGameMap[];
  streams_list?: PSStream[];
  live?: { supported: boolean; url: string | null } | null;
};

async function request<T>(path: string): Promise<T> {
  const url = `${BASE}${path}${path.includes("?") ? "&" : "?"}token=${encodeURIComponent(KEY!)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });

  const remaining = res.headers.get("x-ratelimit-remaining");
  const limit = res.headers.get("x-ratelimit-limit");
  if (remaining) rateLimit.remaining = Number(remaining);
  if (limit) rateLimit.limit = Number(limit);
  rateLimit.updatedAt = Date.now();

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`PandaScore ${res.status} on ${path}: ${body.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

const PER_PAGE = 50;

export async function fetchRunning(game: Game): Promise<PSMatch[]> {
  return request<PSMatch[]>(`/${game}/matches/running?per_page=${PER_PAGE}`);
}

export async function fetchUpcoming(game: Game): Promise<PSMatch[]> {
  return request<PSMatch[]>(`/${game}/matches/upcoming?per_page=${PER_PAGE}&sort=begin_at`);
}

export async function fetchRecent(game: Game): Promise<PSMatch[]> {
  return request<PSMatch[]>(`/${game}/matches/past?per_page=${PER_PAGE}&sort=-end_at`);
}

export async function fetchMatch(game: Game, id: number): Promise<PSMatch> {
  return request<PSMatch>(`/${game}/matches/${id}`);
}
