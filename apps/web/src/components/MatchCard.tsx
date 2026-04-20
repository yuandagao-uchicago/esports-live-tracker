"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useNowTick } from "@/lib/useNowTick";
import { GAME_THEME, type MatchWithRelations } from "@/lib/types";
import { TeamLogo } from "./TeamLogo";
import { GameBadge } from "./GameBadge";
import { Countdown } from "./Countdown";
import { StreamButton } from "./StreamLinks";

const SOON_MS = 60 * 60 * 1000;

export function MatchCard({ match }: { match: MatchWithRelations }) {
  const theme = GAME_THEME[match.game];
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const a = match.team_a;
  const b = match.team_b;
  const aWin = match.score_a > match.score_b;
  const bWin = match.score_b > match.score_a;
  const currentMap = match.maps.find((m) => m.map_number === match.current_map_number);

  const startsAt = match.scheduled_at ? new Date(match.scheduled_at).getTime() : 0;
  // only subscribe to the shared tick when we actually need to re-evaluate "Soon"
  const needsTick = match.status === "scheduled" && startsAt > 0;
  const now = useNowTick(needsTick);
  const isSoon = needsTick && startsAt - now <= SOON_MS && startsAt - now > 0;

  const [flash, setFlash] = useState(false);
  const lastUpdated = useRef(match.updated_at);
  useEffect(() => {
    if (lastUpdated.current !== match.updated_at) {
      lastUpdated.current = match.updated_at;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 900);
      return () => clearTimeout(t);
    }
  }, [match.updated_at]);

  return (
    <article
      className={`group relative overflow-hidden rounded-xl border border-border bg-[rgba(17,18,32,0.72)] p-4 transition-[transform,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-white/20 ${
        isLive ? theme.glow : ""
      } ${isSoon ? "ring-1 ring-csgo/40" : ""} ${flash ? "animate-scoreFlash" : ""}`}
    >
      {/* full-card click target — sits behind content */}
      <Link
        href={`/match/${match.id}`}
        aria-label={`${a?.name ?? "TBD"} vs ${b?.name ?? "TBD"}`}
        className="absolute inset-0 z-0"
      />

      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r opacity-80 ${theme.gradient}`}
      />

      {/* "Soon" corner ribbon */}
      {isSoon ? (
        <span className="pointer-events-none absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-csgo to-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black shadow-glowCsgo">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-black" />
          Soon
        </span>
      ) : null}

      <div className="pointer-events-none relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GameBadge game={match.game} />
            {match.tournament?.name ? (
              <span className="truncate text-[11px] font-medium uppercase tracking-wider text-muted">
                {match.tournament.name}
              </span>
            ) : null}
          </div>
          {!isSoon ? <StatusPill match={match} /> : null}
        </div>

        <div className="space-y-2.5">
          <TeamRow team={a} score={match.score_a} winning={aWin && (isLive || isFinished)} />
          <TeamRow team={b} score={match.score_b} winning={bWin && (isLive || isFinished)} />
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 text-[11px] text-muted">
          <span>{match.best_of ? `BO${match.best_of}` : ""}</span>
          <div className="flex items-center gap-2">
            {isLive && currentMap ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-val" />
                Map {currentMap.map_number}
              </span>
            ) : match.status === "scheduled" ? (
              <Countdown iso={match.scheduled_at ?? match.began_at} />
            ) : match.status === "finished" ? (
              <span className="uppercase tracking-wider text-muted/70">
                Final · {match.maps.length} maps
              </span>
            ) : null}
            {isLive ? <StreamButton streams={match.streams} size="sm" /> : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function StatusPill({ match }: { match: MatchWithRelations }) {
  if (match.status === "live") {
    return (
      <span className="relative inline-flex items-center gap-1.5 rounded-full bg-val/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-val ring-1 ring-val/40">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-val opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-val" />
        </span>
        Live
      </span>
    );
  }
  if (match.status === "finished") {
    return (
      <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted">
        Final
      </span>
    );
  }
  return (
    <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted">
      Upcoming
    </span>
  );
}

function TeamRow({
  team,
  score,
  winning,
}: {
  team: MatchWithRelations["team_a"];
  score: number;
  winning: boolean;
}) {
  const inner = (
    <div className="flex flex-1 items-center gap-3 transition-colors duration-300">
      <TeamLogo team={team} size={36} />
      <span
        className={`flex-1 truncate font-medium transition-colors duration-300 ${
          winning ? "text-ink" : "text-muted"
        } group-hover:text-ink`}
      >
        {team?.name ?? "TBD"}
      </span>
    </div>
  );

  return (
    <div className="flex items-center gap-3">
      {team ? (
        <Link
          href={`/team/${team.id}`}
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto flex flex-1 rounded-md transition hover:bg-white/[0.04]"
        >
          {inner}
        </Link>
      ) : (
        inner
      )}
      <span
        className={`font-display text-xl font-bold tabular-nums transition-colors duration-300 ${
          winning ? "text-ink" : "text-muted"
        }`}
      >
        {score}
      </span>
    </div>
  );
}
