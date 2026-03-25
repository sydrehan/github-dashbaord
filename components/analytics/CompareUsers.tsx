import Image from "next/image";
import { UserCompareSummary } from "@/lib/github";

type Props = {
  primary: UserCompareSummary;
  secondary: UserCompareSummary;
};

function metricWinner(primary: number, secondary: number) {
  if (primary > secondary) return "primary";
  if (secondary > primary) return "secondary";
  return "tie";
}

export default function CompareUsers({ primary, secondary }: Props) {
  const comparison = [
    { label: "Repos", p: primary.repos, s: secondary.repos },
    { label: "Stars", p: primary.stars, s: secondary.stars },
    { label: "Forks", p: primary.forks, s: secondary.forks },
    { label: "Commits", p: primary.totalCommits, s: secondary.totalCommits },
    { label: "PRs", p: primary.totalPRs, s: secondary.totalPRs },
    { label: "Issues", p: primary.totalIssues, s: secondary.totalIssues },
  ];

  return (
    <section className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
      <h2 className="mb-3 text-xl font-bold">⚔️ Compare Two Users</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {[primary, secondary].map((user) => (
          <div key={user.username} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Image src={user.avatar_url} alt={user.username} width={30} height={30} className="rounded-full" />
              <h3 className="font-semibold">{user.username}</h3>
            </div>
            <div className="mt-2 text-sm">
              <p>Repos: {user.repos}</p>
              <p>Stars: {user.stars}</p>
              <p>Forks: {user.forks}</p>
              <p>Commits: {user.totalCommits}</p>
              <p>PRs: {user.totalPRs}</p>
              <p>Issues: {user.totalIssues}</p>
              <p>Streak: {user.currentStreak} (best {user.longestStreak})</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className="pb-2">Metric</th>
              <th className="pb-2">{primary.username}</th>
              <th className="pb-2">{secondary.username}</th>
              <th className="pb-2">Winner</th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((item) => {
              const winner = metricWinner(item.p, item.s);
              const winningName = winner === "primary" ? primary.username : winner === "secondary" ? secondary.username : "Tie";
              return (
                <tr key={item.label}>
                  <td className="py-1 font-medium">{item.label}</td>
                  <td>{item.p}</td>
                  <td>{item.s}</td>
                  <td>{winner === "tie" ? "Tie" : winningName}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
