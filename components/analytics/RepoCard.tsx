"use client";

import Image from "next/image";
import { ExternalLink, Star, GitFork, Eye, Users, MessageSquare, GitPullRequest, GitCommit, Link as LinkIcon } from "lucide-react";
import { RepoItem } from "@/lib/github";

type RepoAnalytics = {
  commits: number;
  prs: number;
  issues: number;
  contributors: number;
  commitComments: number;
  prComments: number;
  issueComments: number;
  reviews: number;
  topContributors: Array<{ login: string; avatar_url: string }>;
  languages: Array<{ name: string; percentage: number }>;
  traffic?: { views: number; uniqueViews: number; };
  changes?: { additions: number; deletions: number; };
};

type RepoCardProps = {
  repo: RepoItem;
  analytics: RepoAnalytics;
};

export default function RepoCard({ repo, analytics }: RepoCardProps) {
  const isEmpty = analytics.commits === 0 && analytics.prs === 0 && analytics.issues === 0;
  const isPrivate = repo.private;

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-zinc-950 dark:hover:border-slate-700 shadow-sm">
      {/* Header section */}
      <div className="flex flex-col border-b border-slate-100 p-5 dark:border-slate-800/60 bg-white dark:bg-zinc-950 rounded-t-xl">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center justify-between gap-3">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold tracking-tight text-slate-900 hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400 group flex items-center gap-2"
              >
                {repo.name}
                <LinkIcon className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <span
                className={`rounded-md px-2 py-0.5 text-[11px] font-medium border ${
                  isPrivate
                    ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400"
                    : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {isPrivate ? "Private" : "Public"}
              </span>
            </div>
          </div>
        </div>
        
        {repo.description ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {repo.description}
          </p>
        ) : (
          <p className="mt-3 text-sm italic text-slate-400 dark:text-slate-500">
            No description provided.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
          {repo.language && (
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white dark:ring-zinc-950"></div>
              <span>{repo.language}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5" title="Stars">
            <Star className="h-3.5 w-3.5" />
            <span>{repo.stargazers_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Forks">
            <GitFork className="h-3.5 w-3.5" />
            <span>{repo.forks_count.toLocaleString()}</span>
          </div>
          {analytics.traffic && (
            <div className="flex items-center gap-1.5" title="Traffic Views">
              <Eye className="h-3.5 w-3.5" />
              <span>{analytics.traffic.views.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-1 items-center justify-center p-8 bg-slate-50/50 dark:bg-zinc-900/20 rounded-b-xl">
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/50">
              <GitCommit className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No activity yet</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">This repository has zero recorded collaboration</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60 p-5 bg-slate-50/30 dark:bg-zinc-900/10 rounded-b-xl flex-1">
          {/* Activity grid */}
          <div className="grid grid-cols-2 gap-y-4 pb-5">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">Commits</span>
              <span className="flex items-center gap-1.5 flex-wrap font-medium text-slate-900 dark:text-slate-100">
                <GitCommit className="h-4 w-4 text-slate-400" /> {analytics.commits}
                {analytics.changes && (
                  <span className="text-[11px] ml-1 flex items-center gap-1.5">
                    <span className="text-green-600 dark:text-green-400">+{analytics.changes.additions.toLocaleString()}</span>
                    <span className="text-red-500 dark:text-red-400">-{analytics.changes.deletions.toLocaleString()}</span>
                  </span>
                )}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">Pull Requests</span>
              <span className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-100">
                <GitPullRequest className="h-4 w-4 text-slate-400" /> {analytics.prs}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">Issues</span>
              <span className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-100">
                <MessageSquare className="h-4 w-4 text-slate-400" /> {analytics.issues}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">Contributors</span>
              <span className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-100">
                <Users className="h-4 w-4 text-slate-400" /> {analytics.contributors}
              </span>
            </div>
          </div>

          {/* Collaboration & Insights */}
          <div className="flex flex-col gap-4 pt-5">
            {(analytics.commitComments > 0 || analytics.prComments > 0 || analytics.issueComments > 0 || analytics.reviews > 0) && (
              <div className="flex flex-wrap gap-2">
                {analytics.commitComments > 0 && <Badge icon="💬">{analytics.commitComments} commit comments</Badge>}
                {analytics.prComments > 0 && <Badge icon="💬">{analytics.prComments} PR comments</Badge>}
                {analytics.issueComments > 0 && <Badge icon="💬">{analytics.issueComments} issue comments</Badge>}
                {analytics.reviews > 0 && <Badge icon="✅">{analytics.reviews} reviews</Badge>}
              </div>
            )}
            
            {analytics.topContributors.length > 0 && (
              <div className="mt-1">
                <span className="mb-2 block text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Top Contributors</span>
                <div className="flex -space-x-2.5">
                  {analytics.topContributors.slice(0, 5).map((contributor) => (
                     <div key={contributor.login} className="h-8 w-8 overflow-hidden rounded-full ring-2 ring-slate-50 dark:ring-zinc-900" title={contributor.login}>
                        <Image
                          src={contributor.avatar_url}
                          alt={contributor.login}
                          width={32}
                          height={32}
                        />
                     </div>
                  ))}
                  {analytics.contributors > 5 && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-600 ring-2 ring-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-zinc-900 shadow-sm">
                      +{analytics.contributors - 5}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

function Badge({ children, icon }: { children: React.ReactNode, icon: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-700/60 dark:bg-zinc-900/50 dark:text-slate-300">
      <span className="text-[10px]">{icon}</span> {children}
    </span>
  );
}