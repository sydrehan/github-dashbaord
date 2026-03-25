"use client";

import { GrowthScore } from "@/lib/github";

type GrowthScoreProps = {
  growth: GrowthScore;
};

export default function GrowthScoreComponent({ growth }: GrowthScoreProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
      <h3 className="mb-4 text-xl font-semibold">Growth Score</h3>
      <div className="flex items-center gap-4">
        <div className="text-3xl font-bold text-green-600">{Math.round(growth.score)}</div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Recent: {growth.recentActivity} | Old: {growth.oldActivity}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Consistency: {Math.round(growth.consistency * 100)}%
          </p>
        </div>
      </div>
    </div>
  );
}