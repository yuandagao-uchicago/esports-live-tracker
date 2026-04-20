import { redirect } from "next/navigation";
import Link from "next/link";
import { LiveMatchGrid } from "@/components/LiveMatchGrid";
import { MatchCard } from "@/components/MatchCard";
import { SectionHeader } from "@/components/SectionHeader";
import { fetchMatches, fetchRecent } from "@/lib/queries";
import { createSupabaseServer } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function FavoritesPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: favTeams }, { data: favTourns }] = await Promise.all([
    supabase.from("user_favorite_teams").select("team_id").eq("user_id", user.id),
    supabase.from("user_favorite_tournaments").select("tournament_id").eq("user_id", user.id),
  ]);

  const teamIds = (favTeams ?? []).map((r) => r.team_id as number);
  const tournamentIds = (favTourns ?? []).map((r) => r.tournament_id as number);

  if (teamIds.length === 0 && tournamentIds.length === 0) {
    return (
      <div className="mt-10 rounded-2xl glass p-10 text-center">
        <h1 className="display text-3xl font-bold uppercase">Your feed is empty</h1>
        <p className="mt-3 text-muted">
          Pick teams and tournaments to follow and they&apos;ll show up here.
        </p>
        <Link
          href="/settings"
          className="mt-6 inline-block rounded-lg bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan px-5 py-2.5 font-semibold text-white shadow-glow transition hover:brightness-110"
        >
          Choose your teams →
        </Link>
      </div>
    );
  }

  const [live, recent] = await Promise.all([
    fetchMatches(supabase, { teamIds, tournamentIds, statuses: ["live", "scheduled"], limit: 60 }),
    (async () => {
      const all = await fetchRecent(supabase, 40);
      const teamSet = new Set(teamIds);
      const tournSet = new Set(tournamentIds);
      return all
        .filter(
          (m) =>
            (m.team_a_id && teamSet.has(m.team_a_id)) ||
            (m.team_b_id && teamSet.has(m.team_b_id)) ||
            (m.tournament_id && tournSet.has(m.tournament_id)),
        )
        .slice(0, 9);
    })(),
  ]);

  return (
    <div className="pt-10">
      <SectionHeader
        eyebrow={`${teamIds.length} teams · ${tournamentIds.length} tournaments`}
        title="Your feed"
        right={
          <Link href="/settings" className="text-sm text-muted hover:text-ink">
            Edit →
          </Link>
        }
      />
      <LiveMatchGrid initial={live} filter={{ teamIds, tournamentIds }} />

      {recent.length > 0 ? (
        <>
          <SectionHeader eyebrow="Recap" title="Your recent results" />
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
