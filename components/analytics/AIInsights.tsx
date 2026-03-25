type AIInsightsData = {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
};

type Props = {
  insight: AIInsightsData;
};

export default function AIInsights({ insight }: Props) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
      <h2 className="mb-3 text-xl font-bold">🧠 AI Insights</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <h3 className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">Strengths</h3>
          <ul className="list-disc pl-4 text-sm text-slate-700 dark:text-slate-200">
            {insight.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">Weaknesses</h3>
          <ul className="list-disc pl-4 text-sm text-slate-700 dark:text-slate-200">
            {insight.weaknesses.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">Suggestions</h3>
          <ul className="list-disc pl-4 text-sm text-slate-700 dark:text-slate-200">
            {insight.suggestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
