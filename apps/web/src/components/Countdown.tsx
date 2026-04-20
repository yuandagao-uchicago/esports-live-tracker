"use client";

import { useEffect, useState } from "react";

export function Countdown({ iso, prefix = "in " }: { iso: string | null; prefix?: string }) {
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!iso) return <span className="text-muted">TBD</span>;

  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return <span className="text-muted">started</span>;

  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  const label =
    days > 0 ? `${days}d ${hours % 24}h` : hours > 0 ? `${hours}h ${mins % 60}m` : `${mins}m`;

  return (
    <span className="font-mono text-muted">
      {prefix}
      <span className="text-ink">{label}</span>
    </span>
  );
}
