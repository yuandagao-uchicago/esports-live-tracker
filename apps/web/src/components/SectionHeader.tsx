export function SectionHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow?: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mt-14 mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="display text-3xl font-bold uppercase tracking-tight md:text-4xl">
          {title}
        </h2>
      </div>
      {right}
    </div>
  );
}
