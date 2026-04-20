"use client";

import { useMemo, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { GAME_LABELS, type Game, type Team, type Tournament } from "@/lib/types";

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
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 text-sm">
        <button className={chip(gameFilter === "all")} onClick={() => setGameFilter("all")}>
          All games
        </button>
        {(["lol", "csgo", "valorant"] as Game[]).map((g) => (
          <button key={g} className={chip(gameFilter === g)} onClick={() => setGameFilter(g)}>
            {GAME_LABELS[g]}
          </button>
        ))}
      </div>

      <Section
        title={`Favorite teams (${teamIds.size})`}
        search={teamSearch}
        onSearch={setTeamSearch}
        items={filteredTeams.map((t) => ({
          id: t.id,
          label: t.name,
          sub: GAME_LABELS[t.game],
        }))}
        selected={teamIds}
        onToggle={(id) => {
          const next = new Set(teamIds);
          next.has(id) ? next.delete(id) : next.add(id);
          setTeamIds(next);
        }}
      />

      <Section
        title={`Favorite tournaments (${tournIds.size})`}
        search={tournSearch}
        onSearch={setTournSearch}
        items={filteredTourns.map((t) => ({
          id: t.id,
          label: t.name,
          sub: `${GAME_LABELS[t.game]}${t.league_name ? ` · ${t.league_name}` : ""}`,
        }))}
        selected={tournIds}
        onToggle={(id) => {
          const next = new Set(tournIds);
          next.has(id) ? next.delete(id) : next.add(id);
          setTournIds(next);
        }}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          className="rounded bg-white/10 px-4 py-2 font-medium hover:bg-white/20"
        >
          Save
        </button>
        {status ? <span className="text-sm text-gray-400">{status}</span> : null}
      </div>
    </div>
  );
}

function Section({
  title,
  search,
  onSearch,
  items,
  selected,
  onToggle,
}: {
  title: string;
  search: string;
  onSearch: (v: string) => void;
  items: { id: number; label: string; sub: string }[];
  selected: Set<number>;
  onToggle: (id: number) => void;
}) {
  return (
    <div>
      <h2 className="mb-2 text-sm uppercase tracking-wide text-gray-400">{title}</h2>
      <input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search..."
        className="mb-2 w-full rounded border border-border bg-panel px-3 py-2 text-sm"
      />
      <div className="max-h-72 overflow-y-auto rounded border border-border">
        {items.length === 0 ? (
          <p className="p-3 text-sm text-gray-500">No results</p>
        ) : (
          items.map((it) => {
            const on = selected.has(it.id);
            return (
              <button
                key={it.id}
                onClick={() => onToggle(it.id)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-white/5 ${
                  on ? "bg-white/5" : ""
                }`}
              >
                <span>
                  <span className="font-medium">{it.label}</span>
                  <span className="ml-2 text-xs text-gray-500">{it.sub}</span>
                </span>
                <span className={on ? "text-green-400" : "text-gray-600"}>{on ? "✓" : "+"}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function chip(active: boolean) {
  return `rounded-full px-3 py-1 border ${
    active
      ? "border-white/40 bg-white/10 text-white"
      : "border-border text-gray-400 hover:text-white"
  }`;
}
