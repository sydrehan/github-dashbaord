"use client";

import { ActivityEvent } from "@/lib/github";

type ActivityTimelineProps = {
  timeline: ActivityEvent[];
};

export default function ActivityTimeline({ timeline }: ActivityTimelineProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
      <h3 className="mb-4 text-xl font-semibold">Activity Timeline</h3>
      <div className="space-y-2">
        {timeline.map((event, idx) => {
          const d = new Date(event.date);
          const dateLabel = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(
            d.getUTCDate()
          ).padStart(2, '0')} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
          return (
            <div key={idx} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">{event.type} in {event.repo}</div>
                <div className="text-xs text-slate-500">{dateLabel} UTC</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}