"use client";

import { GAME_LABELS, GAME_THEME, type Game } from "@/lib/types";

const ALL: (Game | "all")[] = ["all", "lol", "csgo", "valorant"];

export function GameFilterChips({
  value,
  onChange,
}: {
  value: Game | "all";
  onChange: (v: Game | "all") => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {ALL.map((g) => {
        const active = value === g;
        const theme = g === "all" ? null : GAME_THEME[g];
        return (
          <button
            key={g}
            onClick={() => onChange(g)}
            className={`rounded-full px-3.5 py-1.5 font-medium uppercase tracking-wider transition ${
              active
                ? theme
                  ? `${theme.bg} ${theme.text} ring-1 ${theme.ring}`
                  : "bg-white/10 text-ink ring-1 ring-white/20"
                : "bg-white/[0.03] text-muted ring-1 ring-white/5 hover:text-ink hover:bg-white/5"
            }`}
            style={
              active && theme ? { textShadow: `0 0 10px ${theme.accent}66` } : undefined
            }
          >
            {g === "all" ? "All games" : GAME_LABELS[g]}
          </button>
        );
      })}
    </div>
  );
}
