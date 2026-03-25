"use client";

import { ConsistencyScore } from "@/lib/github";

type ConsistencyScoreProps = {
  consistency: ConsistencyScore;
};

export default function ConsistencyScoreComponent({ consistency }: ConsistencyScoreProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
      <h3 className="mb-4 text-xl font-semibold">Consistency Score</h3>
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16">
          <svg className="h-full w-full" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="2"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray={`${consistency.score}, 100`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
            {Math.round(consistency.score)}%
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Active {consistency.activeDays} of {consistency.totalDays} days
          </p>
        </div>
      </div>
    </div>
  );
}