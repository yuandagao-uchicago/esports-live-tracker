import { redirect } from "next/navigation";
import { LiveMatchGrid } from "@/components/LiveMatchGrid";
import { fetchMatches } from "@/lib/queries";
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
      <div>
        <h1 className="mb-4 text-2xl font-semibold">Favorites</h1>
        <p className="text-gray-500">
          You haven't favorited anything yet. Visit{" "}
          <a href="/settings" className="text-white underline">
            Settings
          </a>{" "}
          to pick teams and tournaments.
        </p>
      </div>
    );
  }

  const matches = await fetchMatches(supabase, { teamIds, tournamentIds });

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Favorites</h1>
      <LiveMatchGrid initial={matches} filter={{ teamIds, tournamentIds }} />
    </div>
  );
}
