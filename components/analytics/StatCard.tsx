"use client";

import { Activity, GitFork, GitPullRequest, Star } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: "star" | "fork" | "activity" | "pr";
  trend?: {
    value: number;
    isPositive: boolean;
  };
};

const iconMap = {
  star: Star,
  fork: GitFork,
  activity: Activity,
  pr: GitPullRequest,
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
}: StatCardProps) {
  const Icon = icon ? iconMap[icon] : undefined;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
            <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1">
          <span
            className={`text-xs font-medium ${
              trend.isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {trend.isPositive ? "+" : ""}{trend.value}%
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  );
}