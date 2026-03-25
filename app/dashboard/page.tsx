import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUser, getRepos, getPRs, getIssues, getContributionCalendar, buildGitHubWrapped, buildProductivityScore, buildRepoRanking, buildAIInsights, getUserByUsername, buildUserCompareSummary, UserCompareSummary, getUserEvents, buildDeveloperPersonality, buildConsistencyScore, buildGrowthScore, buildSkillEvolution, buildRepoIntelligence, buildWorkStyle, buildHiddenInsights, buildActivityTimeline } from "@/lib/github";
import { getContributionData, getPRAnalytics, getRepoCommitStats, ContributionData, PRAnalytics, RepoCommitStat } from "@/lib/graphql";
import { buildAICodingInsights } from "@/lib/analysis";
import RepoLanguagePie from "@/components/analytics/RepoLanguagePie";
import TimelineChart from "@/components/analytics/TimelineChart";
import ContributionHeatmap from "@/components/analytics/ContributionHeatmap";
import GitHubWrapped from "@/components/analytics/GitHubWrapped";
import ProductivityScore from "@/components/analytics/ProductivityScore";
import RepoRanking from "@/components/analytics/RepoRanking";
import AIInsights from "@/components/analytics/AIInsights";
import CompareUsers from "@/components/analytics/CompareUsers";
import DNACard from "@/components/analytics/DNACard";
import ConsistencyScoreComponent from "@/components/analytics/ConsistencyScore";
import GrowthScoreComponent from "@/components/analytics/GrowthScore";
import SkillEvolutionComponent from "@/components/analytics/SkillEvolution";
import RepoIntelligenceComponent from "@/components/analytics/RepoIntelligence";
import InsightsPanel from "@/components/analytics/InsightsPanel";
import ActivityTimeline from "@/components/analytics/ActivityTimeline";
import AICodingInsightsComponent from "@/components/analytics/AICodingInsights";
import { formatDate } from "@/lib/utils";

async function logoutAction() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.set("gh_token", "", { path: "/", maxAge: 0 });
  cookieStore.set("gh_username", "", { path: "/", maxAge: 0 });
  redirect("/");
}

type DashboardPageProps = {
  searchParams?: Promise<{ compareUsername?: string }> | { compareUsername?: string };
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const cookieStore = await cookies();
  const params = await searchParams;
  const compareUsername = params?.compareUsername?.trim();
  const token = cookieStore.get("gh_token")?.value;
  const username = cookieStore.get("gh_username")?.value;

  if (!token || !username) {
    redirect("/");
  }

  const [user, repos, prs, issues, contributions, events] = await Promise.all([
    getUser(token!),
    getRepos(token!, username!),
    getPRs(token!, username!),
    getIssues(token!, username!),
    getContributionCalendar(token!, username!),
    getUserEvents(token!, username!),
  ]);

  let gqlContributions: ContributionData = {
    totalCommitContributions: 0,
    totalPullRequestContributions: 0,
    totalIssueContributions: 0,
    weekly: [],
  };
  let gqlPRAnalytics: PRAnalytics = {
    totalCount: 0,
    mergedCount: 0,
    closedCount: 0,
    nodes: [],
  };
  let gqlRepoCommitStats: RepoCommitStat[] = [];
  try {
    [gqlContributions, gqlPRAnalytics, gqlRepoCommitStats] = await Promise.all([
      getContributionData(username!, token),
      getPRAnalytics(username!, token),
      getRepoCommitStats(username!, token),
    ]);
  } catch (error) {
    console.warn("GraphQL data load failed, using fallback values:", error);
    gqlContributions = {
      totalCommitContributions: 0,
      totalPullRequestContributions: 0,
      totalIssueContributions: 0,
      weekly: [],
    };
    gqlPRAnalytics = { totalCount: 0, mergedCount: 0, closedCount: 0, nodes: [] };
    gqlRepoCommitStats = [];
  }

  const totalStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
  const totalForks = repos.reduce((acc, repo) => acc + repo.forks_count, 0);

  const languageMap = new Map<string, number>();
  repos.forEach((repo) => {
    const lang = repo.language || "Unknown";
    languageMap.set(lang, (languageMap.get(lang) ?? 0) + 1);
  });

  const languageData = Array.from(languageMap.entries())
    .map(([language, value]) => ({ language, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const topRepos = repos
    .slice()
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6);

  let compareSummary: UserCompareSummary | null = null;
  if (
    compareUsername &&
    compareUsername.length > 0 &&
    compareUsername.toLowerCase() !== username?.toLowerCase()
  ) {
    const [compareUser, compareRepos, comparePRs, compareIssues, compareContributions] = await Promise.all([
      getUserByUsername(token!, compareUsername),
      getRepos(token!, compareUsername),
      getPRs(token!, compareUsername),
      getIssues(token!, compareUsername),
      getContributionCalendar(token!, compareUsername),
    ]);
    compareSummary = buildUserCompareSummary(
      compareUser,
      compareRepos,
      comparePRs,
      compareIssues,
      compareContributions
    );
  }

  const mostActiveDay = contributions.weekly.reduce(
    (best, d) => (d.count > best.count ? d : best),
    { date: "", count: 0, weekday: 0, color: "" }
  );

  const repoActivity = repos
    .slice()
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6);

  const wrapped = buildGitHubWrapped(repos, prs, issues, contributions);
  const productivityScore = buildProductivityScore(contributions, prs, issues, totalStars);
  const repoRankings = buildRepoRanking(repos);
  const aiInsights = buildAIInsights(contributions, prs, issues, repos, productivityScore);
  const primarySummary = buildUserCompareSummary(user, repos, prs, issues, contributions);

  const personality = buildDeveloperPersonality(events, repos);
  const consistency = buildConsistencyScore(contributions);
  const growth = buildGrowthScore(contributions, consistency.score / 100);
  const skillEvolution = buildSkillEvolution(repos);
  const repoIntelligence = buildRepoIntelligence(repos);
  const workStyle = buildWorkStyle(prs);
  const hiddenInsights = buildHiddenInsights(personality, consistency, growth, workStyle);
  const activityTimeline = buildActivityTimeline(events);
  const aiCodingInsights = buildAICodingInsights(contributions, prs, gqlRepoCommitStats);

  const repoCommitTimeline = Object.entries(
    gqlRepoCommitStats.reduce<Record<string, number>>((acc, repo) => {
      repo.commits.forEach((commit) => {
        const month = commit.committedDate.slice(0, 7);
        acc[month] = (acc[month] ?? 0) + 1;
      });
      return acc;
    }, {})
  )
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => (a.month > b.month ? 1 : -1));


  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-12 pt-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:px-10">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Developer DNA Analyzer</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{username} personal insights</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-lg bg-rose-500 px-4 py-2 text-sm text-white transition hover:bg-rose-400"
          >
            Log out
          </button>
        </form>
      </header>

      <section className="space-y-4">
        <DNACard personality={personality} />
        <div className="grid gap-4 md:grid-cols-2">
          <ConsistencyScoreComponent consistency={consistency} />
          <GrowthScoreComponent growth={growth} />
        </div>
        <SkillEvolutionComponent evolution={skillEvolution} />
        <RepoIntelligenceComponent intelligence={repoIntelligence} />
        <InsightsPanel insights={hiddenInsights} />
        <ActivityTimeline timeline={activityTimeline} />

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
          <h3 className="mb-4 text-xl font-semibold">GraphQL Developer Activity</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
              <div className="text-xs text-slate-500">Total Commits</div>
              <div className="text-2xl font-bold">{gqlContributions.totalCommitContributions}</div>
            </div>
            <div className="rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
              <div className="text-xs text-slate-500">Total PRs</div>
              <div className="text-2xl font-bold">{gqlPRAnalytics.totalCount}</div>
            </div>
            <div className="rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
              <div className="text-xs text-slate-500">GraphQL Repos</div>
              <div className="text-2xl font-bold">{gqlRepoCommitStats.length}</div>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
              <div className="text-sm font-medium">PR merge/close</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Merged: {gqlPRAnalytics.mergedCount} | Closed: {gqlPRAnalytics.closedCount}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
              <div className="text-sm font-medium">Top active repo</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">{gqlRepoCommitStats.sort((a, b) => b.commits.length - a.commits.length)[0]?.name || 'N/A'}</div>
            </div>
          </div>
        </div>

        <TimelineChart title="Repo commit activity (GraphQL)" data={repoCommitTimeline} color="#f59e0b" />
        <AICodingInsightsComponent data={aiCodingInsights} />

        <GitHubWrapped data={wrapped} />
        <ProductivityScore score={productivityScore} />
        <RepoRanking rank={repoRankings} />
        <AIInsights insight={aiInsights} />
        <form method="get" action="/dashboard" className="mt-3 flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium" htmlFor="compareUsername">Compare with:</label>
          <input
            id="compareUsername"
            name="compareUsername"
            defaultValue={compareUsername ?? ""}
            placeholder="Enter username"
            className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
          <button
            type="submit"
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-500"
          >
            Compare
          </button>
        </form>

        {compareSummary ? <CompareUsers primary={primarySummary} secondary={compareSummary} /> : null}
      </section>

      <section className="grid gap-4 md:grid-cols-[1fr_2fr]">
        <aside className="space-y-4">
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
            <div className="flex items-center gap-4">
              <Image
                src={user.avatar_url}
                alt={user.name ?? user.login}
                width={56}
                height={56}
                className="rounded-full"
              />
              <div>
                <h2 className="text-xl font-semibold">{user.name || user.login}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">@{user.login}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{user.bio || "No bio provided."}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                <strong>{user.followers}</strong> followers
              </div>
              <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                <strong>{user.following}</strong> following
              </div>
              <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                Joined {formatDate(user.created_at)}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
            <h3 className="mb-2 text-lg font-semibold">Key Overview</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
                <div className="text-xs text-slate-500">Repos</div>
                <div className="text-xl font-bold">{user.public_repos}</div>
              </div>
              <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
                <div className="text-xs text-slate-500">Stars</div>
                <div className="text-xl font-bold">{totalStars}</div>
              </div>
              <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
                <div className="text-xs text-slate-500">Forks</div>
                <div className="text-xl font-bold">{totalForks}</div>
              </div>
              <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
                <div className="text-xs text-slate-500">Commit Contributions</div>
                <div className="text-xl font-bold">{contributions.totalCommits}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
            <h3 className="mb-2 text-lg font-semibold">Activity Insights</h3>
            <p className="text-sm">Most active day: {mostActiveDay.date || "N/A"} ({mostActiveDay.count} contributions)</p>
            <p className="text-sm">🔥 Current streak: {contributions.streak} days</p>
            <p className="text-sm">🏆 Longest streak: {contributions.longestStreak} days</p>
            <p className="text-sm">PR success rate: {prs.successRate}%</p>
          </div>
        </aside>

        <article className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
              <h3 className="mb-2 text-lg font-semibold">Pull Requests</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">Total: {prs.total}</div>
                <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">Merged: {prs.merged}</div>
                <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">Closed: {prs.closed}</div>
                <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">Success: {prs.successRate}%</div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
              <h3 className="mb-2 text-lg font-semibold">Issues</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">Total: {issues.total}</div>
                <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">Open: {issues.open}</div>
                <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">Closed: {issues.closed}</div>
                <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">Trend: {issues.timeline.length} months</div>
              </div>
            </div>
          </div>

          <RepoLanguagePie data={languageData} />

          <div className="grid gap-4 md:grid-cols-2">
            <TimelineChart title="PR Timeline" data={prs.timeline} color="#38bdf8" />
            <TimelineChart title="Issues Timeline" data={issues.timeline} color="#f97316" />
          </div>

          <TimelineChart title="Commits Timeline" data={contributions.weekly
              .reduce((acc, day) => {
                const m = day.date.slice(0, 7);
                const existing = acc.find((item) => item.month === m);
                if (existing) existing.count += day.count;
                else acc.push({ month: m, count: day.count });
                return acc;
              }, [] as Array<{ month: string; count: number }>)
              .sort((a, b) => (a.month > b.month ? 1 : -1))}
            color="#34d399"
          />

          <ContributionHeatmap days={contributions.weekly} />

          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
            <h3 className="mb-2 text-lg font-semibold">Top repositories</h3>
            <ul className="space-y-2 text-sm">
              {topRepos.map((repo) => (
                <li key={repo.id} className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
                  <a href={repo.html_url} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                    {repo.name}
                  </a>
                  <p>{repo.description || "No description"}</p>
                  <div className="mt-1 flex gap-4 text-xs text-slate-500">
                    <span>⭐ {repo.stargazers_count}</span>
                    <span>🍴 {repo.forks_count}</span>
                    <span>{repo.language || "Unknown"}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
            <h3 className="mb-2 text-lg font-semibold">Recent repository activity</h3>
            <ul className="grid gap-2 text-sm">
              {repoActivity.map((repo) => (
                <li key={repo.id} className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{repo.name}</span>
                    <span className="text-xs text-slate-500">{formatDate(repo.updated_at)}</span>
                  </div>
                  <div className="text-xs text-slate-500">{repo.description || "No desc"}</div>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </section>
    </div>
  );
}
