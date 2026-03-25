"use client";

import { DeveloperPersonality } from "@/lib/github";

type DNACardProps = {
  personality: DeveloperPersonality;
};

export default function DNACard({ personality }: DNACardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
      <h3 className="mb-4 text-xl font-semibold">Developer DNA</h3>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
          <div className="text-sm opacity-90">Time Preference</div>
          <div className="text-lg font-bold">{personality.timePreference}</div>
        </div>
        <div className="rounded-lg bg-gradient-to-r from-green-500 to-teal-600 p-4 text-white">
          <div className="text-sm opacity-90">Work Style</div>
          <div className="text-lg font-bold">{personality.workStyle}</div>
        </div>
        <div className="rounded-lg bg-gradient-to-r from-orange-500 to-red-600 p-4 text-white">
          <div className="text-sm opacity-90">Coding Style</div>
          <div className="text-lg font-bold">{personality.codingStyle}</div>
        </div>
      </div>
    </div>
  );
}