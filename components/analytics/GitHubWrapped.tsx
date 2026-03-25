type WrappedData = {
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  mostUsedLanguage: string;
  topRepo: string;
  topRepoStars: number;
  contributionStreak: number;
  longestStreak: number;
  codingPersonality: string;
};

type Props = {
  data: WrappedData;
};

export default function GitHubWrapped({ data }: Props) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
      <h2 className="mb-3 text-xl font-bold">🔥 GitHub Wrapped</h2>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">{data.codingPersonality}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
          <div className="text-xs text-slate-500">Commits (year)</div>
          <div className="text-2xl font-bold">{data.totalCommits}</div>
        </div>
        <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
          <div className="text-xs text-slate-500">PRs</div>
          <div className="text-2xl font-bold">{data.totalPRs}</div>
        </div>
        <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
          <div className="text-xs text-slate-500">Issues</div>
          <div className="text-2xl font-bold">{data.totalIssues}</div>
        </div>
        <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
          <div className="text-xs text-slate-500">Current streak</div>
          <div className="text-2xl font-bold">{data.contributionStreak}d</div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
          <div className="text-xs text-slate-500">Most used language</div>
          <div className="text-lg font-semibold">{data.mostUsedLanguage}</div>
        </div>
        <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
          <div className="text-xs text-slate-500">Top repo</div>
          <div className="text-lg font-semibold">{data.topRepo} ({data.topRepoStars}⭐)</div>
        </div>
      </div>
      <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        <span role="img" aria-label="trophy">🏆</span> Longest streak: {data.longestStreak} days
      </div>
    </section>
  );
}
