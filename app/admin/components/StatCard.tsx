export default function StatCard({
  label,
  value,
  hint,
  accent = "green",
}: {
  label: string;
  value: number;
  hint: string;
  accent?: "green" | "gold" | "amber" | "red";
}) {
  const accents = {
    green: "from-[#0B5D3B] to-[#094a31]",
    gold: "from-[#C9A227] to-[#a88620]",
    amber: "from-[#d97706] to-[#b45309]",
    red: "from-[#dc2626] to-[#b91c1c]",
  };

  return (
    <article className="rounded-2xl border border-[#0B5D3B]/10 bg-white p-5 shadow-[0_4px_20px_rgba(11,93,59,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7f73]">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-[#0f2419]">{value}</p>
          <p className="mt-1 text-xs text-[#6b7f73]">{hint}</p>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${accents[accent]} text-sm font-bold text-white shadow-sm`}
        >
          {value > 99 ? "99+" : value}
        </div>
      </div>
    </article>
  );
}
