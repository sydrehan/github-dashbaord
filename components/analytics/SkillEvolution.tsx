"use client";

import { SkillEvolution } from "@/lib/github";

type SkillEvolutionProps = {
  evolution: SkillEvolution;
};

export default function SkillEvolutionComponent({ evolution }: SkillEvolutionProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
      <h3 className="mb-4 text-xl font-semibold">Skill Evolution</h3>
      <div className="space-y-2">
        <div>
          <span className="text-sm text-slate-600 dark:text-slate-400">First Language:</span>
          <span className="ml-2 font-medium">{evolution.firstLanguage}</span>
        </div>
        <div>
          <span className="text-sm text-slate-600 dark:text-slate-400">Current Dominant:</span>
          <span className="ml-2 font-medium">{evolution.currentLanguage}</span>
        </div>
        <div>
          <span className="text-sm text-slate-600 dark:text-slate-400">Transitions:</span>
          <div className="mt-1 flex flex-wrap gap-1">
            {evolution.transitions.map((lang) => (
              <span key={lang} className="rounded bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">
                {lang}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}