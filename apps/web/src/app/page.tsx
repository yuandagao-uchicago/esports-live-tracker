import { LiveMatchGrid } from "@/components/LiveMatchGrid";
import { fetchMatches } from "@/lib/queries";
import { createSupabaseServer } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function Home() {
  const supabase = await createSupabaseServer();
  const matches = await fetchMatches(supabase);
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Live matches</h1>
      <LiveMatchGrid initial={matches} />
    </div>
  );
}
