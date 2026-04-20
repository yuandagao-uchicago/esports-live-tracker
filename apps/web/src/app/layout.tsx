import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { AuthNav } from "@/components/AuthNav";

const display = Oswald({ subsets: ["latin"], variable: "--font-display", weight: ["400", "500", "600", "700"] });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "STAGE — Esports Live",
  description: "Live CSGO, Valorant, and League of Legends matches, updating in real time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <header className="sticky top-0 z-20 border-b border-border backdrop-blur-xl bg-black/40">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-neon-purple via-neon-pink to-neon-cyan shadow-glow">
                <span className="absolute inset-[2px] rounded-[4px] bg-black/70" />
                <span className="relative font-display text-[13px] font-bold tracking-tighter">S</span>
              </span>
              <span className="font-display text-xl font-bold tracking-tight">
                <span className="chromatic">STAGE</span>
                <span className="ml-2 text-xs font-normal uppercase tracking-[0.2em] text-muted">Esports</span>
              </span>
            </Link>

            <div className="flex items-center gap-1 text-sm text-muted">
              <NavLink href="/">Live</NavLink>
              <NavLink href="/favorites">Favorites</NavLink>
              <NavLink href="/settings">Settings</NavLink>
              <NavLink href="/health" className="opacity-70">Health</NavLink>
              <AuthNav />
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-7xl px-5 pb-24">{children}</main>

        <footer className="border-t border-border py-8 text-center text-xs text-muted">
          Data from PandaScore · Built for MPCS 51238 Design, Build, Ship
        </footer>
      </body>
    </html>
  );
}

function NavLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-1.5 transition hover:bg-white/5 hover:text-ink ${className}`}
    >
      {children}
    </Link>
  );
}
