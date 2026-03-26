"use client";

import { Activity, GitPullRequest, MessageSquare, Users, Eye } from "lucide-react";

type GlobalInsights = {
  totalRepos: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalComments: number;
  totalReviews: number;
  totalContributors: number;
  totalViews?: number;
};

type GlobalInsightsPanelProps = {
  insights: GlobalInsights;
};

export default function GlobalInsightsPanel({ insights }: GlobalInsightsPanelProps) {
  const metrics = [
    { label: "Total Commits", value: insights.totalCommits, icon: Activity },
    { label: "Pull Requests", value: insights.totalPRs, icon: GitPullRequest },
    { label: "Issues", value: insights.totalIssues, icon: MessageSquare },
    { label: "Comments", value: insights.totalComments, icon: MessageSquare },
    { label: "Reviews", value: insights.totalReviews, icon: Eye },
    { label: "Contributors", value: insights.totalContributors, icon: Users },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-zinc-950 overflow-hidden">
      <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 dark:divide-slate-800 md:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex flex-col p-6 items-center lg:items-start text-center lg:text-left hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
              <metric.icon className="h-4 w-4" />
              {metric.label}
            </span>
            <span className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              {metric.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      {insights.totalViews && (
        <div className="bg-slate-50 dark:bg-zinc-900/50 px-6 py-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
          <span>Total Traffic Views Across Repositories</span>
          <span className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            {insights.totalViews.toLocaleString()} views
          </span>
        </div>
      )}
    </div>
  );
}