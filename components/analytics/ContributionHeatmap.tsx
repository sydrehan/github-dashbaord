"use client";

type Props = {
  days: Array<{ date: string; count: number; color: string; weekday: number }>;
};

export default function ContributionHeatmap({ days }: Props) {
  if (!days.length) return <div className="text-sm text-slate-500">No contribution data yet.</div>;

  // Group by week (starting Sunday) for simple grid
  const byWeek = new Map<string, typeof days>();
  days.forEach((d) => {
    const weekStart = new Date(d.date);
    const week = `${weekStart.getUTCFullYear()}-${String(weekStart.getUTCMonth() + 1).padStart(2, "0")}-${String(weekStart.getUTCDate()).padStart(2, "0")}`;
    const entry = byWeek.get(week) ?? [];
    entry.push(d);
    byWeek.set(week, entry);
  });

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
      <h3 className="mb-2 text-lg font-semibold">Contributions Heatmap</h3>
      <div className="grid gap-1 overflow-x-auto whitespace-nowrap p-1" style={{ gridTemplateColumns: `repeat(${Math.ceil(days.length / 7)}, 18px)` }}>
        {days.map((day) => (
          <div
            key={day.date}
            title={`${day.date}: ${day.count} contributions`}
            style={{ backgroundColor: day.color, width: 18, height: 18, borderRadius: 3 }}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
        <span>0</span>
        <div className="flex gap-1">
          <span className="h-3 w-3 rounded-sm bg-[#ebedf0]" />
          <span className="h-3 w-3 rounded-sm bg-[#c6e48b]" />
          <span className="h-3 w-3 rounded-sm bg-[#7bc96f]" />
          <span className="h-3 w-3 rounded-sm bg-[#239a3b]" />
          <span className="h-3 w-3 rounded-sm bg-[#196127]" />
        </div>
        <span>more</span>
      </div>
    </div>
  );
}
