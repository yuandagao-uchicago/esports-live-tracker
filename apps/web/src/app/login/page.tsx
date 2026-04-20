"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result =
        mode === "signin"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });
      if (result.error) setError(result.error.message);
      else router.push("/");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto mt-20 max-w-sm">
      <div className="relative overflow-hidden rounded-2xl glass p-8">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full blur-3xl opacity-30"
          style={{ background: "conic-gradient(from 180deg, #a855f7, #ec4899, #22d3ee, #a855f7)" }}
        />
        <div className="relative">
          <h1 className="display text-3xl font-bold uppercase">
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {mode === "signin"
              ? "Sign in to follow your teams."
              : "Join to build a personalized esports feed."}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-black/30 px-3.5 py-2.5 text-ink placeholder:text-muted focus:border-white/20 focus:outline-none"
            />
            <input
              type="password"
              placeholder="Password (min 6 chars)"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-black/30 px-3.5 py-2.5 text-ink placeholder:text-muted focus:border-white/20 focus:outline-none"
            />
            {error ? <p className="text-sm text-val">{error}</p> : null}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan px-4 py-2.5 font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-50"
            >
              {busy ? "..." : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 text-sm text-muted hover:text-ink"
          >
            {mode === "signin" ? "Need an account? Sign up →" : "Have an account? Sign in →"}
          </button>
        </div>
      </div>

      <Link
        href="/"
        className="mt-6 block text-center text-xs uppercase tracking-[0.22em] text-muted hover:text-ink"
      >
        Continue browsing as guest →
      </Link>
    </div>
  );
}
