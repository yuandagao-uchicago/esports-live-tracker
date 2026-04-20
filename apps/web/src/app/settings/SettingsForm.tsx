"use client";

import { useMemo, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { GAME_LABELS, GAME_THEME, type Game, type Team, type Tournament } from "@/lib/types";
import { GameFilterChips } from "@/components/GameFilterChips";
import { TeamLogo } from "@/components/TeamLogo";

export function SettingsForm({
  teams,
  tournaments,
  initialTeamIds,
  initialTournamentIds,
}: {
  teams: Team[];
  tournaments: Tournament[];
  initialTeamIds: number[];
  initialTournamentIds: number[];
}) {
  const [teamIds, setTeamIds] = useState(new Set(initialTeamIds));
  const [tournIds, setTournIds] = useState(new Set(initialTournamentIds));
  const [teamSearch, setTeamSearch] = useState("");
  const [tournSearch, setTournSearch] = useState("");
  const [gameFilter, setGameFilter] = useState<Game | "all">("all");
  const [status, setStatus] = useState<string | null>(null);
  const supabase = useMemo(() => createSupabaseBrowser(), []);

  const filteredTeams = teams.filter(
    (t) =>
      (gameFilter === "all" || t.game === gameFilter) &&
      t.name.toLowerCase().includes(teamSearch.toLowerCase()),
  );
  const filteredTourns = tournaments.filter(
    (t) =>
      (gameFilter === "all" || t.game === gameFilter) &&
      t.name.toLowerCase().includes(tournSearch.toLowerCase()),
  );

  async function save() {
    setStatus("Saving...");
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) {
      setStatus("Not signed in");
      return;
    }

    const [delTeams, delTourns] = await Promise.all([
      supabase.from("user_favorite_teams").delete().eq("user_id", uid),
      supabase.from("user_favorite_tournaments").delete().eq("user_id", uid),
    ]);
    if (delTeams.error || delTourns.error) {
      setStatus("Save failed");
      return;
    }

    const teamRows = Array.from(teamIds).map((team_id) => ({ user_id: uid, team_id }));
    const tournRows = Array.from(tournIds).map((tournament_id) => ({ user_id: uid, tournament_id }));

    const [insTeams, insTourns] = await Promise.all([
      teamRows.length
        ? supabase.from("user_favorite_teams").insert(teamRows)
        : Promise.resolve({ error: null }),
      tournRows.length
        ? supabase.from("user_favorite_tournaments").insert(tournRows)
        : Promise.resolve({ error: null }),
    ]);

    setStatus(insTeams.error || insTourns.error ? "Save failed" : "Saved ✓");
    setTimeout(() => setStatus(null), 2500);
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
          Filter by game
        </div>
        <GameFilterChips value={gameFilter} onChange={setGameFilter} />
      </div>

      <Section
        title="Favorite teams"
        count={teamIds.size}
        search={teamSearch}
        onSearch={setTeamSearch}
        items={filteredTeams.map((t) => ({
          id: t.id,
          label: t.name,
          sub: GAME_LABELS[t.game],
          game: t.game,
          logo: t.logo_url,
          acronym: t.acronym,
        }))}
        selected={teamIds}
        onToggle={(id) => {
          const next = new Set(teamIds);
          next.has(id) ? next.delete(id) : next.add(id);
          setTeamIds(next);
        }}
      />

      <Section
        title="Favorite tournaments"
        count={tournIds.size}
        search={tournSearch}
        onSearch={setTournSearch}
        items={filteredTourns.map((t) => ({
          id: t.id,
          label: t.name,
          sub: `${GAME_LABELS[t.game]}${t.league_name ? ` · ${t.league_name}` : ""}`,
          game: t.game,
        }))}
        selected={tournIds}
        onToggle={(id) => {
          const next = new Set(tournIds);
          next.has(id) ? next.delete(id) : next.add(id);
          setTournIds(next);
        }}
      />

      <div className="sticky bottom-4 z-10 flex items-center justify-between rounded-xl glass px-4 py-3">
        <div className="text-sm text-muted">
          {teamIds.size} teams · {tournIds.size} tournaments
        </div>
        <div className="flex items-center gap-3">
          {status ? <span className="text-sm text-muted">{status}</span> : null}
          <button
            onClick={save}
            className="rounded-lg bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan px-5 py-2 font-semibold text-white shadow-glow transition hover:brightness-110"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

type Item = {
  id: number;
  label: string;
  sub: string;
  game: Game;
  logo?: string | null;
  acronym?: string | null;
};

function Section({
  title,
  count,
  search,
  onSearch,
  items,
  selected,
  onToggle,
}: {
  title: string;
  count: number;
  search: string;
  onSearch: (v: string) => void;
  items: Item[];
  selected: Set<number>;
  onToggle: (id: number) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="display text-2xl font-bold uppercase">
          {title}
          <span className="ml-3 text-sm text-muted">{count} selected</span>
        </h2>
      </div>
      <input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search..."
        className="mb-3 w-full rounded-lg border border-border bg-black/30 px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-white/20 focus:outline-none"
      />
      <div className="max-h-[420px] overflow-y-auto overflow-x-hidden rounded-xl border border-border glass">
        {items.length === 0 ? (
          <p className="p-5 text-sm text-muted">No results</p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((it) => {
              const on = selected.has(it.id);
              const theme = GAME_THEME[it.game];
              return (
                <li key={it.id}>
                  <button
                    onClick={() => onToggle(it.id)}
                    className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm transition ${
                      on ? "bg-white/[0.04]" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    {"logo" in it ? (
                      <TeamLogo
                        team={{
                          id: it.id,
                          logo_url: it.logo ?? null,
                          acronym: it.acronym ?? null,
                          name: it.label,
                          game: it.game,
                          provider_id: "",
                        }}
                        size={28}
                      />
                    ) : (
                      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${theme.bg} ${theme.text} font-display text-[10px] font-semibold`}>
                        {it.game.slice(0, 3).toUpperCase()}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{it.label}</span>
                      <span className="block truncate text-[11px] uppercase tracking-wider text-muted">
                        {it.sub}
                      </span>
                    </span>
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-md border text-xs ${
                        on
                          ? "border-transparent bg-gradient-to-r from-neon-purple to-neon-pink text-white"
                          : "border-border text-muted"
                      }`}
                    >
                      {on ? "✓" : "+"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
