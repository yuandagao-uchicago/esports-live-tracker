import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/SectionHeader";
import { SettingsForm } from "./SettingsForm";
import type { Team, Tournament } from "@/lib/types";

export const revalidate = 0;

export default async function SettingsPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: teams }, { data: tournaments }, { data: favTeams }, { data: favTourns }] =
    await Promise.all([
      supabase.from("teams").select("*").order("name").limit(1000),
      supabase.from("tournaments").select("*").order("name").limit(500),
      supabase.from("user_favorite_teams").select("team_id").eq("user_id", user.id),
      supabase.from("user_favorite_tournaments").select("tournament_id").eq("user_id", user.id),
    ]);

  return (
    <div>
      <SectionHeader eyebrow="Personalize" title="Your preferences" />
      <SettingsForm
        teams={(teams ?? []) as Team[]}
        tournaments={(tournaments ?? []) as Tournament[]}
        initialTeamIds={(favTeams ?? []).map((r) => r.team_id as number)}
        initialTournamentIds={(favTourns ?? []).map((r) => r.tournament_id as number)}
      />
    </div>
  );
}
