"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

type Props = {
  data: Array<{ language: string; value: number }>;
};

const COLORS = ["#3b82f6", "#f97316", "#10b981", "#facc15", "#8b5cf6", "#ec4899", "#14b8a6", "#fb7185"];

export default function RepoLanguagePie({ data }: Props) {
  if (!data.length) return <div className="text-sm text-slate-500">No language data yet.</div>;
  return (
    <div className="h-72 w-full rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
      <h3 className="mb-2 text-lg font-semibold">Language Distribution</h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie dataKey="value" data={data} nameKey="language" outerRadius={90} innerRadius={45} fill="#8884d8" label>
            {data.map((entry, index) => (
              <Cell key={entry.language} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
