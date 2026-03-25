"use client";

import { AICodingInsights } from "@/lib/analysis";
import TimelineChart from "@/components/analytics/TimelineChart";

type AICodingInsightsProps = {
  data: AICodingInsights;
};

export default function AICodingInsightsComponent({ data }: AICodingInsightsProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
      <h3 className="mb-4 text-xl font-semibold">AI Coding Insights (Estimated)</h3>
      <div className="grid gap-2 md:grid-cols-4 mb-4 text-sm">
        <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
          <div className="text-xs text-slate-500">AI Usage</div>
          <div className="text-xl font-bold">{data.aiUsage.percentage}%</div>
          <div className="text-[10px] uppercase text-slate-500">Confidence {data.aiUsage.confidence}%</div>
        </div>
        <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
          <div className="text-xs text-slate-500">Efficiency Score</div>
          <div className="text-xl font-bold">{data.efficiencyScore}/100</div>
          <div className="text-[10px] text-slate-500">Estimated</div>
        </div>
        <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
          <div className="text-xs text-slate-500">Night Coding</div>
          <div className="text-xl font-bold">{data.patterns.nightRatio}%</div>
        </div>
        <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
          <div className="text-xs text-slate-500">Weekend Coding</div>
          <div className="text-xl font-bold">{data.patterns.weekendRatio}%</div>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
          <div className="text-sm font-medium">Predicted AI tools</div>
          <ul className="mt-2 list-disc pl-4 text-xs text-slate-700 dark:text-slate-200">
            {data.predictedTools.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
          <div className="text-sm font-medium">Trends</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {data.productivity.productivityChange >= 0
              ? `Productivity up ${data.productivity.productivityChange}%`
              : `Productivity down ${Math.abs(data.productivity.productivityChange)}%`}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">PRs/day {data.productivity.prFrequency.toFixed(2)}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Commit/day {data.productivity.commitsPerDay.toFixed(2)}</div>
        </div>
      </div>
      <div className="mt-4 h-64">
        <TimelineChart
          title="AI vs Human Timeline"
          data={data.aiTimeline.map((t) => ({ month: t.month, count: t.beforeAI + t.afterAI }))}
          color="#8b5cf6"
        />
      </div>
      <div className="mt-4 space-y-2">
        {data.insights.map((insight) => (
          <div key={insight} className="rounded-lg bg-indigo-50 p-3 text-sm text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-100">
            {insight}
          </div>
        ))}
      </div>
    </div>
  );
}