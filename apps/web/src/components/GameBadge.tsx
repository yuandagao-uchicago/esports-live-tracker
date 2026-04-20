import { GAME_SHORT, GAME_THEME, type Game } from "@/lib/types";

export function GameBadge({ game, size = "md" }: { game: Game; size?: "sm" | "md" }) {
  const t = GAME_THEME[game];
  const cls =
    size === "sm"
      ? "h-5 px-2 text-[10px] tracking-[0.15em]"
      : "h-6 px-2.5 text-[11px] tracking-[0.18em]";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-sm font-display font-semibold uppercase ${cls} ${t.bg} ${t.text} ring-1 ${t.ring}`}
      style={{ textShadow: `0 0 12px ${t.accent}55` }}
    >
      {GAME_SHORT[game]}
    </span>
  );
}
