import { Hero } from "@/components/Hero";
import { LiveMatchGrid } from "@/components/LiveMatchGrid";
import { MatchCard } from "@/components/MatchCard";
import { SectionHeader } from "@/components/SectionHeader";
import { fetchMatches, fetchRecent } from "@/lib/queries";
import { createSupabaseServer } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function Home() {
  const supabase = await createSupabaseServer();
  const [upcomingAndLive, recent] = await Promise.all([
    fetchMatches(supabase, { statuses: ["live", "scheduled"], limit: 30 }),
    fetchRecent(supabase, 6),
  ]);

  const liveCount = upcomingAndLive.filter((m) => m.status === "live").length;
  const upcomingCount = upcomingAndLive.length - liveCount;

  return (
    <div>
      <Hero liveCount={liveCount} upcomingCount={upcomingCount} />

      <SectionHeader
        eyebrow={liveCount > 0 ? "Live · Upcoming" : "Coming Up Next"}
        title={liveCount > 0 ? "Matches On" : "Schedule"}
        right={
          <span className="hidden text-xs text-muted md:inline">
            {liveCount > 0 ? `${liveCount} live now` : "next off the shelf"}
          </span>
        }
      />
      <LiveMatchGrid initial={upcomingAndLive} />

      {recent.length > 0 ? (
        <>
          <SectionHeader eyebrow="Recap" title="Recent Results" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {recent.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
