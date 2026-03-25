"use client";

import { HiddenInsight } from "@/lib/github";

type InsightsPanelProps = {
  insights: HiddenInsight[];
};

export default function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
      <h3 className="mb-4 text-xl font-semibold">Hidden Insights</h3>
      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <div key={idx} className="rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 p-4 dark:from-indigo-900/20 dark:to-purple-900/20">
            <p className="text-sm italic">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}