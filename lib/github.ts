import { cache } from "react";

const GH_REST_BASE = "https://api.github.com";
const GH_GRAPHQL_BASE = "https://api.github.com/graphql";

function makeHeaders(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
  };
}

async function ghRest<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${GH_REST_BASE}${path}`, {
    headers: makeHeaders(token),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`GitHub REST error: ${res.status} ${errorText}`);
  }
  return res.json();
}

type GhGraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

async function ghGraphql<T>(query: string, variables: unknown, token: string): Promise<T> {
  const res = await fetch(GH_GRAPHQL_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...makeHeaders(token),
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub GraphQL error: ${res.status} ${text}`);
  }

  const json = (await res.json()) as GhGraphqlResponse<T>;
  if (json.errors) {
    throw new Error(`GitHub GraphQL error: ${JSON.stringify(json.errors)}`);
  }
  if (!json.data) {
    throw new Error("GitHub GraphQL response missing data");
  }
  return json.data;
}

export type UserProfile = {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  followers: number;
  following: number;
  created_at: string;
  public_repos: number;
};

export type RepoItem = {
  id: number;
  name: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  description: string | null;
  updated_at: string;
};

export type PullRequestStats = {
  total: number;
  merged: number;
  closed: number;
  successRate: number;
  timeline: Array<{ month: string; count: number }>;
};

export type IssueStats = {
  total: number;
  open: number;
  closed: number;
  timeline: Array<{ month: string; count: number }>;
};

export type ContributionCalendar = {
  totalCommits: number;
  totalIssues: number;
  totalPRs: number;
  weekly: Array<{ date: string; count: number; weekday: number; color: string }>;
  streak: number;
  longestStreak: number;
};

type PullRequestNode = {
  createdAt: string;
  merged: boolean;
  closedAt?: string | null;
};

type IssueNode = {
  createdAt: string;
  state: "OPEN" | "CLOSED";
};

const buildTimeline = (dates: string[]) => {
  const map = new Map<string, number>();
  dates.forEach((d) => {
    const date = new Date(d);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return Array.from(map.entries())
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .map(([month, count]) => ({ month, count }));
};

export const getUser = cache(async (token: string): Promise<UserProfile> => {
  return ghRest<UserProfile>("/user", token);
});

export const getUserByUsername = cache(async (token: string, username: string): Promise<UserProfile> => {
  return ghRest<UserProfile>(`/users/${username}`, token);
});

export const getRepos = cache(async (token: string, username: string): Promise<RepoItem[]> => {
  const repos: RepoItem[] = [];
  let page = 1;
  while (true) {
    const chunk = await ghRest<RepoItem[]>(
      `/users/${username}/repos?per_page=100&page=${page}&type=owner&sort=updated`,
      token
    );
    repos.push(...chunk);
    if (chunk.length < 100) break;
    page += 1;
  }
  return repos;
});

export const getPRs = cache(async (token: string, username: string): Promise<PullRequestStats> => {
  const query = `
    query($login:String!, $after:String) {
      user(login: $login) {
        pullRequests(first: 100, after: $after, orderBy: { field: CREATED_AT, direction: DESC }) {
          totalCount
          pageInfo { hasNextPage endCursor }
          nodes {
            createdAt
            merged
            closedAt
          }
        }
      }
    }
  `;

  type PrResponse = {
    user: {
      pullRequests: {
        totalCount: number;
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        nodes: PullRequestNode[];
      };
    } | null;
  };

  const nodes: PullRequestNode[] = [];
  let after: string | null = null;
  let total = 0;

  do {
    const response: PrResponse = await ghGraphql<PrResponse>(query, { login: username, after }, token);
    const connection = response.user?.pullRequests;
    if (!connection) break;
    total = connection.totalCount;
    nodes.push(...connection.nodes);
    after = connection.pageInfo.hasNextPage ? connection.pageInfo.endCursor : null;
  } while (after);

  const merged = nodes.filter((pr) => pr.merged).length;
  const closed = nodes.filter((pr) => !pr.merged && pr.closedAt).length;
  const timeline = buildTimeline(nodes.map((pr) => pr.createdAt));
  const successRate = total > 0 ? Math.round((merged / total) * 100) : 0;
  return { total, merged, closed, successRate, timeline };
});

export const getIssues = cache(async (token: string, username: string): Promise<IssueStats> => {
  const query = `
    query($login:String!, $after:String) {
      user(login: $login) {
        issues(first: 100, after: $after, orderBy: { field: CREATED_AT, direction: DESC }) {
          totalCount
          pageInfo { hasNextPage endCursor }
          nodes {
            createdAt
            state
          }
        }
      }
    }
  `;

  type IssueResponse = {
    user: {
      issues: {
        totalCount: number;
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        nodes: IssueNode[];
      };
    } | null;
  };

  const nodes: IssueNode[] = [];
  let after: string | null = null;
  let total = 0;

  do {
    const response: IssueResponse = await ghGraphql<IssueResponse>(query, { login: username, after }, token);
    const connection = response.user?.issues;
    if (!connection) break;
    total = connection.totalCount;
    nodes.push(...connection.nodes);
    after = connection.pageInfo.hasNextPage ? connection.pageInfo.endCursor : null;
  } while (after);

  const open = nodes.filter((i) => i.state === "OPEN").length;
  const closed = nodes.filter((i) => i.state === "CLOSED").length;
  const timeline = buildTimeline(nodes.map((i) => i.createdAt));
  return { total, open, closed, timeline };
});

export const getContributionCalendar = cache(async (token: string, username: string): Promise<ContributionCalendar> => {
  const query = `
    query($login:String!) {
      user(login:$login) {
        contributionsCollection {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
                color
                weekday
              }
            }
          }
        }
      }
    }
  `;

  type ContributionResponse = {
    user: {
      contributionsCollection: {
        totalCommitContributions: number;
        totalIssueContributions: number;
        totalPullRequestContributions: number;
        contributionCalendar: {
          weeks: Array<{ contributionDays: Array<{ date: string; contributionCount: number; color: string; weekday: number }> }>;
        };
      };
    } | null;
  };

  const data = await ghGraphql<ContributionResponse>(query, { login: username }, token);
  const coll = data.user?.contributionsCollection;
  if (!coll) {
    return {
      totalCommits: 0,
      totalIssues: 0,
      totalPRs: 0,
      weekly: [],
      streak: 0,
      longestStreak: 0,
    };
  }

  const weeks = coll.contributionCalendar.weeks ?? [];
  const weekly = weeks.flatMap((w) =>
    w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount, color: d.color, weekday: d.weekday }))
  );

  const sortedDays = [...weekly].sort((a, b) => a.date.localeCompare(b.date));
  let streak = 0;
  let longestStreak = 0;
  let currentStreak = 0;

  for (let i = 0; i < sortedDays.length; i++) {
    const day = sortedDays[i];
    if (day.count > 0) {
      currentStreak += 1;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  // Calculate current streak (latest contiguous days from end)
  for (let i = sortedDays.length - 1; i >= 0; i--) {
    if (sortedDays[i].count > 0) {
      streak += 1;
    } else {
      break;
    }
  }

  return {
    totalCommits: coll.totalCommitContributions,
    totalIssues: coll.totalIssueContributions,
    totalPRs: coll.totalPullRequestContributions,
    weekly,
    streak,
    longestStreak,
  };
});

export type GitHubWrapped = {
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  mostUsedLanguage: string;
  topRepo: string;
  topRepoStars: number;
  contributionStreak: number;
  longestStreak: number;
  codingPersonality: string;
};

export type UserCompareSummary = {
  username: string;
  avatar_url: string;
  repos: number;
  stars: number;
  forks: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  currentStreak: number;
  longestStreak: number;
};

export function buildUserCompareSummary(
  user: UserProfile,
  repos: RepoItem[],
  prs: PullRequestStats,
  issues: IssueStats,
  contributions: ContributionCalendar
): UserCompareSummary {
  const stars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
  const forks = repos.reduce((acc, repo) => acc + repo.forks_count, 0);

  return {
    username: user.login,
    avatar_url: user.avatar_url,
    repos: user.public_repos,
    stars,
    forks,
    totalCommits: contributions.totalCommits,
    totalPRs: prs.total,
    totalIssues: issues.total,
    currentStreak: contributions.streak,
    longestStreak: contributions.longestStreak,
  };
};

export function buildProductivityScore(
  contributions: ContributionCalendar,
  prs: PullRequestStats,
  issues: IssueStats,
  totalStars: number
): number {
  const score =
    contributions.totalCommits * 0.4 +
    prs.total * 0.3 +
    issues.total * 0.2 +
    totalStars * 0.1;
  const normalized = (score / 1000) * 100;
  return Math.max(0, Math.min(normalized, 100));
}

export function buildGitHubWrapped(
  repos: RepoItem[],
  prs: PullRequestStats,
  issues: IssueStats,
  contributions: ContributionCalendar
): GitHubWrapped {
  const languageCounts = repos.reduce<Record<string, number>>((acc, repo) => {
    const lang = repo.language || "Unknown";
    acc[lang] = (acc[lang] ?? 0) + 1;
    return acc;
  }, {});

  const mostUsedLanguage = Object.entries(languageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A";

  const topRepoItem = repos.slice().sort((a, b) => b.stargazers_count - a.stargazers_count)[0];
  const topRepo = topRepoItem?.name ?? "N/A";
  const topRepoStars = topRepoItem?.stargazers_count ?? 0;

  const sentiScore = contributions.totalCommits + prs.total * 3 + issues.total;
  const codingPersonality = 
    sentiScore > 1000
      ? "You are a Night Owl Developer 🦉 with high momentum in open-source."
      : sentiScore > 400
      ? "You are a Consistent Hacker 🔥 who ships features steadily."
      : "You are a Focused Builder 🧠 gaining momentum in productivity.";

  return {
    totalCommits: contributions.totalCommits,
    totalPRs: prs.total,
    totalIssues: issues.total,
    mostUsedLanguage,
    topRepo,
    topRepoStars,
    contributionStreak: contributions.streak,
    longestStreak: contributions.longestStreak,
    codingPersonality,
  };
}

export type RepoRankingItem = {
  repoName: string;
  stars: number;
  forks: number;
  commits: number;
  score: number;
  badging: "Best Repo" | "Rising Repo" | "Top Repo";
};

export type AIInsightsData = {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
};

export function buildAIInsights(
  contributions: ContributionCalendar,
  prs: PullRequestStats,
  issues: IssueStats,
  repos: RepoItem[],
  productivityScore: number
): AIInsightsData {
  const topLanguage = repos.reduce<Record<string, number>>((acc, repo) => {
    const lang = repo.language || "Unknown";
    acc[lang] = (acc[lang] ?? 0) + 1;
    return acc;
  }, {});

  const dominantLanguage = Object.entries(topLanguage)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "unknown";

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];

  strengths.push(`Strong contributions with ${contributions.totalCommits} commits this year`);
  strengths.push(`Healthy PR activity (${prs.total} total PRs)`);

  if (contributions.streak > 30) {
    strengths.push("Excellent current streak, showing consistency.");
  }

  if (productivityScore >= 70) {
    strengths.push("High productivity score");
  } else {
    weaknesses.push("Productivity score could improve with more focused activity.");
  }

  if (issues.total < 20) {
    weaknesses.push("Issue triage volume is low; engage more issue-driven work.");
  }

  suggestions.push(`Explore deeper into ${dominantLanguage} tooling and patterns.`);
  suggestions.push("Add consistent issue close cadence to improve project health.");
  suggestions.push("Share your top repositories as open-source stories for impact.");

  return { strengths, weaknesses, suggestions };
}

export function buildRepoRanking(repos: RepoItem[]): RepoRankingItem[] {
  const ranked = repos
    .map((repo) => {
      const commits = 0;
      const score = repo.stargazers_count * 3 + repo.forks_count * 2 + commits;
      return {
        repoName: repo.name,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        commits,
        score,
        badging: "Top Repo" as "Best Repo" | "Rising Repo" | "Top Repo",
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item, index) => {
      const badge: "Best Repo" | "Rising Repo" | "Top Repo" =
        index === 0 ? "Best Repo" : index === 1 ? "Rising Repo" : "Top Repo";
      return {
        ...item,
        badging: badge,
      };
    });

  return ranked;
}

export const getRateLimit = cache(async (token: string) => {
  return ghRest<{ rate: unknown; resources: unknown }>(`/rate_limit`, token);
});

export type UserEventPayload = {
  action?: string;
  [key: string]: unknown;
};

export type UserEvent = {
  id: string;
  type: string;
  actor: { login: string };
  repo: { name: string };
  payload: UserEventPayload;
  public: boolean;
  created_at: string;
};

export const getUserEvents = cache(async (token: string, username: string): Promise<UserEvent[]> => {
  const events = await ghRest<UserEvent[]>(`/users/${username}/events?per_page=100`, token);
  return events;
});

export type DeveloperPersonality = {
  timePreference: 'Night Owl' | 'Early Bird' | 'Balanced';
  workStyle: 'Team Player' | 'Solo Builder';
  codingStyle: 'Experimental' | 'Consistent';
};

export type ConsistencyScore = {
  score: number;
  activeDays: number;
  totalDays: number;
};

export type GrowthScore = {
  score: number;
  recentActivity: number;
  oldActivity: number;
  consistency: number;
};

export type SkillEvolution = {
  firstLanguage: string;
  currentLanguage: string;
  transitions: string[];
};

export type RepoCategory = 'High Effort' | 'Experimental' | 'Abandoned';

export type RepoIntelligence = {
  repoName: string;
  category: RepoCategory;
  reason: string;
};

export type WorkStyle = 'Detail Oriented' | 'Burst Worker';

export type FocusArea = 'Frontend' | 'Backend' | 'Full Stack';

export type HiddenInsight = string;

export type ActivityEvent = {
  date: string;
  type: string;
  repo: string;
  description: string;
};

export function buildDeveloperPersonality(events: UserEvent[], repos: RepoItem[]): DeveloperPersonality {
  const hours = events.map(e => new Date(e.created_at).getHours());
  const morning = hours.filter(h => h >= 6 && h < 12).length;
  const evening = hours.filter(h => h >= 18 && h < 24).length;
  const timePreference = evening > morning ? 'Night Owl' : morning > evening ? 'Early Bird' : 'Balanced';

  const prEvents = events.filter(e => e.type === 'PullRequestEvent').length;
  const issueEvents = events.filter(e => e.type === 'IssuesEvent').length;
  const workStyle = (prEvents + issueEvents) > 10 ? 'Team Player' : 'Solo Builder';

  const languages = new Set(repos.map(r => r.language).filter(Boolean));
  const codingStyle = languages.size > 5 ? 'Experimental' : 'Consistent';

  return { timePreference, workStyle, codingStyle };
}

export function buildConsistencyScore(contributions: ContributionCalendar): ConsistencyScore {
  const activeDays = contributions.weekly.filter(d => d.count > 0).length;
  const totalDays = contributions.weekly.length;
  const score = totalDays > 0 ? (activeDays / totalDays) * 100 : 0;
  return { score, activeDays, totalDays };
}

export function buildGrowthScore(contributions: ContributionCalendar, consistency: number): GrowthScore {
  const days = contributions.weekly;
  const mid = Math.floor(days.length / 2);
  const oldActivity = days.slice(0, mid).reduce((sum, d) => sum + d.count, 0);
  const recentActivity = days.slice(mid).reduce((sum, d) => sum + d.count, 0);
  const growth = oldActivity > 0 ? (recentActivity / oldActivity) * consistency : 0;
  const score = Math.min(growth * 100, 100);
  return { score, recentActivity, oldActivity, consistency };
}

export function buildSkillEvolution(repos: RepoItem[]): SkillEvolution {
  const sorted = [...repos].sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
  const first = sorted[0]?.language || 'Unknown';
  const current = repos.reduce((acc, r) => {
    const lang = r.language || 'Unknown';
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const currentLang = Object.entries(current).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
  const transitions = Array.from(new Set(repos.map(r => r.language).filter((lang): lang is string => lang !== null)));
  return { firstLanguage: first, currentLanguage: currentLang, transitions };
}

export function buildRepoIntelligence(repos: RepoItem[]): RepoIntelligence[] {
  const now = Date.now();
  return repos.map(repo => {
    const updated = new Date(repo.updated_at).getTime();
    const ageDays = (now - updated) / (1000 * 60 * 60 * 24);
    const stars = repo.stargazers_count;
    let category: RepoCategory;
    let reason: string;
    if (stars > 10 && ageDays < 30) {
      category = 'High Effort';
      reason = 'High stars and recently active';
    } else if (stars < 5 && ageDays < 90) {
      category = 'Experimental';
      reason = 'Low stars but recent updates';
    } else {
      category = 'Abandoned';
      reason = 'Low activity or old updates';
    }
    return { repoName: repo.name, category, reason };
  });
}

export function buildWorkStyle(prs: PullRequestStats): WorkStyle {
  return prs.total > 50 ? 'Detail Oriented' : 'Burst Worker';
}

export function buildFocusArea(repos: RepoItem[]): FocusArea {
  const langs = repos.map(r => r.language).filter((lang): lang is string => lang !== null);
  const hasFrontend = langs.some(l => ['JavaScript', 'TypeScript', 'HTML', 'CSS'].includes(l));
  const hasBackend = langs.some(l => ['Python', 'Java', 'Go', 'Ruby', 'PHP'].includes(l));
  if (hasFrontend && hasBackend) return 'Full Stack';
  if (hasFrontend) return 'Frontend';
  if (hasBackend) return 'Backend';
  return 'Full Stack';
}

export function buildHiddenInsights(
  personality: DeveloperPersonality,
  consistency: ConsistencyScore,
  growth: GrowthScore,
  workStyle: WorkStyle
): HiddenInsight[] {
  const insights: string[] = [];
  if (personality.timePreference === 'Night Owl') insights.push('You prefer coding at night, possibly for uninterrupted focus.');
  if (personality.workStyle === 'Solo Builder') insights.push('You thrive in solo projects, building things independently.');
  if (consistency.score < 50) insights.push('Your coding consistency could improve with regular habits.');
  if (growth.score > 100) insights.push('You are growing rapidly, keep up the momentum!');
  if (workStyle === 'Detail Oriented') insights.push('You focus on small, frequent contributions.');
  return insights;
}

export function buildActivityTimeline(events: UserEvent[]): ActivityEvent[] {
  return events.slice(0, 50).map(e => ({
    date: e.created_at,
    type: e.type,
    repo: e.repo?.name || 'unknown',
    description: e.payload?.action || e.type,
  }));
}

