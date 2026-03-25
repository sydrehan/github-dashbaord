type RepoScore = {
  repoName: string;
  stars: number;
  forks: number;
  commits: number;
  score: number;
  badging: "Best Repo" | "Rising Repo" | "Top Repo";
};

type Props = {
  rank: RepoScore[];
};

export default function RepoRanking({ rank }: Props) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
      <h2 className="mb-3 text-xl font-bold">🏆 Repo Ranking</h2>
      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Top repositories by computed score.</p>

      <ul className="space-y-3">
        {rank.map((item, index) => (
          <li key={item.repoName} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-base font-semibold">{index + 1}. {item.repoName}</h3>
              <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-medium text-sky-800 dark:bg-sky-900 dark:text-sky-200">{item.badging}</span>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Stars: {item.stars} · Forks: {item.forks} · Commits estimate: {item.commits}
            </div>
            <div className="mt-2 text-sm font-semibold">Score: {item.score.toFixed(1)}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
