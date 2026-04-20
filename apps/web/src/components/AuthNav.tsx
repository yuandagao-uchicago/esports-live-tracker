"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export function AuthNav() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const supabase = createSupabaseBrowser();

  useEffect(() => {
    let alive = true;
    supabase.auth.getUser().then(({ data }) => {
      if (alive) setEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  if (!email) {
    return (
      <Link
        href="/login"
        className="ml-2 rounded-md bg-gradient-to-r from-neon-purple to-neon-pink px-3 py-1.5 text-white font-medium shadow-glow transition hover:brightness-110"
      >
        Sign in
      </Link>
    );
  }

  const initial = email[0]?.toUpperCase() ?? "?";

  async function signOut() {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  }

  return (
    <div className="ml-2 flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-neon-purple to-neon-pink font-medium text-xs text-white">
        {initial}
      </span>
      <button
        onClick={signOut}
        className="rounded-md border border-border px-3 py-1.5 text-muted transition hover:bg-white/5 hover:text-ink"
      >
        Sign out
      </button>
    </div>
  );
}
