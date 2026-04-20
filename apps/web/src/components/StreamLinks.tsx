import type { Stream } from "@/lib/types";

function detectProvider(url: string): { label: string; color: string } {
  const u = url.toLowerCase();
  if (u.includes("twitch.tv")) return { label: "Twitch", color: "bg-[#9146ff]" };
  if (u.includes("youtube.com") || u.includes("youtu.be")) return { label: "YouTube", color: "bg-[#ff0033]" };
  if (u.includes("afreecatv") || u.includes("soop")) return { label: "SOOP", color: "bg-[#0f62fe]" };
  if (u.includes("huya")) return { label: "Huya", color: "bg-[#ffa400]" };
  if (u.includes("douyu")) return { label: "Douyu", color: "bg-[#ff5d23]" };
  return { label: "Watch", color: "bg-white/15" };
}

function pickPrimary(streams: Stream[] | null | undefined): Stream | null {
  if (!streams || streams.length === 0) return null;
  const withUrl = streams.filter((s) => !!s.raw_url);
  if (withUrl.length === 0) return null;
  return (
    withUrl.find((s) => s.main && s.language === "en") ??
    withUrl.find((s) => s.language === "en" && s.official) ??
    withUrl.find((s) => s.language === "en") ??
    withUrl.find((s) => s.main) ??
    withUrl[0] ??
    null
  );
}

export function StreamButton({
  streams,
  size = "sm",
}: {
  streams: Stream[] | null | undefined;
  size?: "sm" | "md" | "lg";
}) {
  const primary = pickPrimary(streams);
  if (!primary || !primary.raw_url) return null;
  const p = detectProvider(primary.raw_url);
  const sizing =
    size === "lg"
      ? "px-4 py-2 text-sm"
      : size === "md"
        ? "px-3 py-1.5 text-xs"
        : "px-2.5 py-1 text-[11px]";
  return (
    <a
      href={primary.raw_url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`pointer-events-auto inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider text-white transition hover:brightness-110 ${p.color} ${sizing}`}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/90" />
      {p.label}
    </a>
  );
}

export function StreamList({ streams }: { streams: Stream[] | null | undefined }) {
  const list = (streams ?? []).filter((s) => !!s.raw_url);
  if (list.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {list.map((s, i) => {
        const p = detectProvider(s.raw_url!);
        return (
          <a
            key={i}
            href={s.raw_url!}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:brightness-110 ${p.color}`}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/90" />
            {p.label}
            {s.language ? (
              <span className="text-[10px] opacity-75">· {s.language}</span>
            ) : null}
            {s.official ? (
              <span className="text-[10px] opacity-75">· official</span>
            ) : null}
          </a>
        );
      })}
    </div>
  );
}
