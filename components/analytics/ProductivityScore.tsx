type Props = {
  score: number;
};

export default function ProductivityScore({ score }: Props) {
  const clamped = Math.max(0, Math.min(score, 100));
  return (
    <section className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
      <h2 className="mb-3 text-xl font-bold">📈 Productivity Score</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
        Productivity metric calculated from commits, PRs, issues and stars.
      </p>
      <div className="mb-2 text-2xl font-semibold">{clamped.toFixed(1)} / 100</div>
      <div className="h-4 w-full rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-4 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </section>
  );
}
