import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#05060b",
        ink: "#f4f4f7",
        muted: "#8a8fa3",
        border: "rgba(255,255,255,0.08)",
        glass: "rgba(17,18,32,0.65)",
        lol: "#00d4ff",
        csgo: "#ffb800",
        val: "#ff4655",
        neon: {
          pink: "#ec4899",
          purple: "#a855f7",
          cyan: "#06b6d4",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        glow: "0 0 32px rgba(168, 85, 247, 0.18)",
        glowLol: "0 0 28px rgba(0,212,255,0.25)",
        glowCsgo: "0 0 28px rgba(255,184,0,0.25)",
        glowVal: "0 0 28px rgba(255,70,85,0.3)",
      },
      keyframes: {
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(255,70,85,0.7)" },
          "70%": { boxShadow: "0 0 0 10px rgba(255,70,85,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(255,70,85,0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        floatY: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.6s ease-out infinite",
        shimmer: "shimmer 8s linear infinite",
        floatY: "floatY 6s ease-in-out infinite",
      },
      backgroundImage: {
        hero: "radial-gradient(1200px 600px at 20% -10%, rgba(168,85,247,0.25), transparent 60%), radial-gradient(900px 500px at 90% 10%, rgba(236,72,153,0.18), transparent 55%), radial-gradient(800px 600px at 50% 100%, rgba(6,182,212,0.14), transparent 55%)",
        grid: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
