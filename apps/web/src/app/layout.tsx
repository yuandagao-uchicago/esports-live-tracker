import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Esports Live Tracker",
  description: "Live CSGO, Valorant, and League of Legends matches in real time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-border bg-panel">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold tracking-tight">
              <span className="text-red-500">●</span> Esports Live
            </Link>
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <Link href="/">Live</Link>
              <Link href="/favorites">Favorites</Link>
              <Link href="/settings">Settings</Link>
              <Link href="/health" className="text-gray-500">Health</Link>
              <Link href="/login" className="rounded bg-white/10 px-3 py-1 hover:bg-white/20">Sign in</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
