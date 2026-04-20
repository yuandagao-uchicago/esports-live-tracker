import { notFound } from "next/navigation";
import { fetchMatchById } from "@/lib/queries";
import { createSupabaseServer } from "@/lib/supabase/server";
import { GAME_LABELS, MAP_SCORE_UNIT } from "@/lib/types";
import { MatchDetailLive } from "./MatchDetailLive";

export const revalidate = 0;

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServer();
  const match = await fetchMatchById(supabase, Number(id));
  if (!match) notFound();

  return (
    <div>
      <div className="mb-4 text-sm text-gray-400">
        <span className="uppercase tracking-wide">{GAME_LABELS[match.game]}</span>
        {match.tournament ? <> · {match.tournament.name}</> : null}
        {match.best_of ? <> · BO{match.best_of}</> : null}
      </div>
      <MatchDetailLive initial={match} />
      <p className="mt-6 text-xs text-gray-600">
        Map scores shown as {MAP_SCORE_UNIT[match.game]}.
      </p>
    </div>
  );
}
