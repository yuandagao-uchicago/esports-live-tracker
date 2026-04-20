import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchMatchById } from "@/lib/queries";
import { createSupabaseServer } from "@/lib/supabase/server";
import { MatchDetailLive } from "./MatchDetailLive";

export const revalidate = 0;

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServer();
  const match = await fetchMatchById(supabase, Number(id));
  if (!match) notFound();

  return (
    <div className="pt-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-ink"
      >
        ← Back to feed
      </Link>
      <MatchDetailLive initial={match} />
    </div>
  );
}
