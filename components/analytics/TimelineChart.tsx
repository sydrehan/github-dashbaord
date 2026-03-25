"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Point = { month: string; count: number };

type Props = {
  title: string;
  data: Point[];
  color: string;
};

export default function TimelineChart({ title, data, color }: Props) {
  if (!data.length) return <div className="text-sm text-slate-500">No timeline data available.</div>;

  return (
    <div className="h-72 w-full rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Area type="monotone" dataKey="count" stroke={color} fillOpacity={1} fill="url(#colorArea)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
