"use client";

import { RepoIntelligence } from "@/lib/github";

type RepoIntelligenceProps = {
  intelligence: RepoIntelligence[];
};

export default function RepoIntelligenceComponent({ intelligence }: RepoIntelligenceProps) {
  const categories = intelligence.reduce((acc, repo) => {
    acc[repo.category] = (acc[repo.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
      <h3 className="mb-4 text-xl font-semibold">Repo Intelligence</h3>
      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        {Object.entries(categories).map(([cat, count]) => (
          <div key={cat} className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
            <div className="text-lg font-bold">{count}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">{cat}</div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {intelligence.slice(0, 5).map((repo) => (
          <div key={repo.repoName} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
            <span className="font-medium">{repo.repoName}</span>
            <span className={`rounded px-2 py-1 text-xs ${
              repo.category === 'High Effort' ? 'bg-green-100 text-green-800' :
              repo.category === 'Experimental' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {repo.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}