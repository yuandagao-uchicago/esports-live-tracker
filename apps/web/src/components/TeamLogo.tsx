"use client";

import { useState } from "react";
import type { Team } from "@/lib/types";

export function TeamLogo({
  team,
  size = 40,
  className = "",
}: {
  team: Team | null;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const initials =
    team?.acronym?.slice(0, 3).toUpperCase() ??
    (team?.name ? team.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() : "?");

  if (!team?.logo_url || failed) {
    return (
      <div
        className={`flex items-center justify-center rounded-md bg-white/5 border border-border font-display text-[11px] font-semibold text-muted ${className}`}
        style={{ width: size, height: size }}
      >
        {initials.slice(0, 3) || "?"}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-md bg-white/5 ring-1 ring-white/10 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={team.logo_url}
        alt={team.name}
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className="h-full w-full object-contain p-1"
        loading="lazy"
      />
    </div>
  );
}
