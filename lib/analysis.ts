import { ContributionCalendar, PullRequestStats } from "@/lib/github";
import { RepoCommitStat } from "@/lib/graphql";

export type AICodingInsights = {
  aiUsage: {
    percentage: number;
    confidence: number;
    indicator: string;
  };
  productivity: {
    commitsPerDay: number;
    oldCommitsPerDay: number;
    recentCommitsPerDay: number;
    prFrequency: number;
    productivityChange: number;
  };
  patterns: {
    nightRatio: number;
    weekendRatio: number;
    burstStyle: "burst" | "steady";
  };
  predictedTools: string[];
  efficiencyScore: number;
  aiTimeline: Array<{ month: string; beforeAI: number; afterAI: number }>;
  insights: string[];
};

function getCommitDates(repoCommitStats: RepoCommitStat[]) {
  return repoCommitStats.flatMap((repo) => repo.commits.map((commit) => new Date(commit.committedDate)));
}

function getWeeklyCounts(dates: Date[]) {
  const map = new Map<string, number>();
  dates.forEach((date) => {
    const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    map.set(month, (map.get(month) ?? 0) + 1);
  });
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, count]) => ({ month, count }));
}

export function buildAICodingInsights(
  contributionCalendar: ContributionCalendar,
  prs: PullRequestStats,
  repoCommitStats: RepoCommitStat[]
): AICodingInsights {
  const commitDates = getCommitDates(repoCommitStats);
  const now = new Date();

  const startDate = commitDates.length
    ? new Date(Math.min(...commitDates.map((d) => d.getTime())))
    : now;
  const totalDays = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

  const totalCommits = commitDates.length;
  const commitsPerDay = totalCommits / totalDays;

  const sortedWeeks = contributionCalendar.weekly
    .map((w) => ({ date: new Date(w.date), count: w.count }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const mid = Math.floor(sortedWeeks.length / 2);
  const oldCommits = sortedWeeks.slice(0, mid).reduce((sum, w) => sum + w.count, 0);
  const recentCommits = sortedWeeks.slice(mid).reduce((sum, w) => sum + w.count, 0);
  const oldDays = Math.max(1, sortedWeeks.slice(0, mid).length * 1);
  const recentDays = Math.max(1, sortedWeeks.slice(mid).length * 1);

  const oldCommitsPerDay = oldCommits / oldDays;
  const recentCommitsPerDay = recentCommits / recentDays;

  const prFrequency = prs.total / Math.max(1, totalDays);
  const productivityChange = (recentCommitsPerDay - oldCommitsPerDay) / Math.max(1, oldCommitsPerDay) * 100;

  const nightCommits = commitDates.filter((date) => date.getUTCHours() >= 20 || date.getUTCHours() < 6).length;
  const weekendCommits = commitDates.filter((date) => date.getUTCDay() === 0 || date.getUTCDay() === 6).length;

  const nightRatio = commitDates.length ? nightCommits / commitDates.length : 0;
  const weekendRatio = commitDates.length ? weekendCommits / commitDates.length : 0;

  const burstThreshold = 10;
  const longBursts = sortedWeeks.filter((w) => w.count >= burstThreshold).length;
  const burstStyle = longBursts > 2 ? "burst" : "steady";

  const aiBurstScore = Math.min(1, (longBursts / Math.max(1, sortedWeeks.length)) * 2);
  const largeRepoScore = Math.min(1, repoCommitStats.filter((repo) => repo.commits.length > 50).length / Math.max(1, repoCommitStats.length));
  const inferredUsage = (aiBurstScore * 0.5 + largeRepoScore * 0.3 + nightRatio * 0.2) * 100;
  const confidence = Math.round(Math.min(100, inferredUsage + 15));

  const prSuccessRate = prs.total > 0 ? prs.merged / prs.total : 0;
  const consistency = contributionCalendar.weekly.length ? contributionCalendar.weekly.filter((d) => d.count > 0).length / contributionCalendar.weekly.length : 0;
  const efficiencyScore = Math.min(100, commitsPerDay * 5 * 0.5 + prSuccessRate * 100 * 0.3 + consistency * 100 * 0.2);

  const aiTimelineBase = getWeeklyCounts(commitDates);
  const medianCount = aiTimelineBase.length ? aiTimelineBase.reduce((acc, d) => acc + d.count, 0) / aiTimelineBase.length : 0;
  const transitionIndex = aiTimelineBase.findIndex((d) => d.count > medianCount * 1.25) || 0;

  const aiTimeline = aiTimelineBase.map((entry, idx) => {
    const beforeAI = idx < transitionIndex ? entry.count : 0;
    const afterAI = idx >= transitionIndex ? entry.count : 0;
    return { ...entry, beforeAI, afterAI };
  });

  const predictedTools: string[] = [];
  if (aiBurstScore > 0.5) predictedTools.push("Copilot");
  if (nightRatio > 0.35) predictedTools.push("ChatGPT");
  if (weekendRatio > 0.2) predictedTools.push("Cursor");
  if (!predictedTools.length) predictedTools.push("Unknown (data inconclusive)");

  const insights: string[] = [];
  if (inferredUsage > 60) insights.push("Your commit patterns are highly indicative of AI-assisted development.");
  if (productivityChange > 10) insights.push("Your productivity has increased recently.");
  if (burstStyle === "burst") insights.push("You are a burst-style coder with high-intensity periods.");
  if (nightRatio > 0.4) insights.push("You often code at night.");
  if (!insights.length) insights.push("Your coding behavior is balanced with no strong outliers.");

  return {
    aiUsage: {
      percentage: Math.round(inferredUsage),
      confidence,
      indicator: inferredUsage > 60 ? "High" : inferredUsage > 30 ? "Medium" : "Low",
    },
    productivity: {
      commitsPerDay,
      oldCommitsPerDay,
      recentCommitsPerDay,
      prFrequency,
      productivityChange: Math.round(productivityChange),
    },
    patterns: {
      nightRatio: Math.round(nightRatio * 100),
      weekendRatio: Math.round(weekendRatio * 100),
      burstStyle,
    },
    predictedTools,
    efficiencyScore: Math.round(efficiencyScore),
    aiTimeline,
    insights,
  };
}
