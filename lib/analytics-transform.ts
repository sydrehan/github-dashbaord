import { 
  RepoItem, 
  PullRequestStats, 
  IssueStats, 
  ContributionCalendar,
  getRepoDetailCommits,
  getRepoDetailCommitStats,
  getRepoDetailPRs,
  getRepoDetailIssues,
  getRepoDetailEvents,
  getRepoDetailContributorsStats,
  getRepoDetailPRReviews
} from "./github";

export type RepoAnalytics = {
  commits: number;
  prs: number;
  issues: number;
  contributors: number;
  commitComments: number;
  prComments: number;
  issueComments: number;
  reviews: number;
  topContributors: Array<{ login: string; avatar_url: string }>;
  languages: Array<{ name: string; percentage: number }>;
  traffic?: {
    views: number;
    uniqueViews: number;
  };
  changes?: {
    additions: number;
    deletions: number;
  };
};

export type GlobalInsights = {
  totalRepos: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalComments: number;
  totalReviews: number;
  totalContributors: number;
  totalViews?: number;
};

export async function transformRepoDataAsync(
  token: string,
  username: string,
  repos: RepoItem[],
  prs: PullRequestStats,
  issues: IssueStats,
  contributions: ContributionCalendar
): Promise<{
  reposWithAnalytics: Array<{ repo: RepoItem; analytics: RepoAnalytics }>;
  globalInsights: GlobalInsights;
}> {
  // Take top 5 repos based on updated time to match CLI script logic
  const sortedRepos = repos
    .slice()
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  const reposWithAnalytics = await Promise.all(
    sortedRepos.map(async (repo) => {
      const owner = repo.owner?.login || username;
      
      const [repoCommits, repoPRs, repoIssues, repoEvents, repoStats] = await Promise.all([
        getRepoDetailCommits(token, owner, repo.name),
        getRepoDetailPRs(token, owner, repo.name),
        getRepoDetailIssues(token, owner, repo.name),
        getRepoDetailEvents(token, owner, repo.name),
        getRepoDetailContributorsStats(token, owner, repo.name)
      ]);

      let additions = 0;
      let deletions = 0;

      // Extract details for the 10 most recent commits to get additions/deletions
      const recentCommits = (repoCommits || []).slice(0, 10);
      for (const c of recentCommits) {
        if (c.sha) {
          const detail = await getRepoDetailCommitStats(token, owner, repo.name, c.sha);
          if (detail?.stats) {
            additions += detail.stats.additions || 0;
            deletions += detail.stats.deletions || 0;
          }
        }
      }

      let reviews = 0;
      const recentPRs = (repoPRs || []).slice(0, 5);
      for (const pr of recentPRs) {
        if (pr.number) {
          const rev = await getRepoDetailPRReviews(token, owner, repo.name, pr.number);
          reviews += (rev || []).length;
        }
      }

      const totalContributors = Array.isArray(repoStats) && repoStats.length > 0 ? repoStats.length : 1;
      const topContributors = Array.isArray(repoStats)
        ? repoStats
            .sort((a, b) => (b.total || 0) - (a.total || 0))
            .slice(0, 5)
            .map(s => ({
              login: s.author?.login || username,
              avatar_url: s.author?.avatar_url || 'https://github.com/images/error/user_happy.gif'
            }))
        : [];

      const analytics: RepoAnalytics = {
        commits: repoCommits?.length || 0,
        prs: repoPRs?.length || 0,
        issues: repoIssues?.length || 0,
        contributors: totalContributors,
        commitComments: 0,
        prComments: 0,
        issueComments: 0,
        reviews,
        topContributors,
        languages: repo.language ? [
          { name: repo.language, percentage: 100 }
        ] : [],
        changes: { additions, deletions }
      };

      return { repo, analytics };
    })
  );

  const globalInsights: GlobalInsights = {
    totalRepos: repos.length,
    totalCommits: contributions.totalCommits,
    totalPRs: prs.total,
    totalIssues: issues.total,
    totalComments: reposWithAnalytics.reduce((acc, r) =>
      acc + r.analytics.commitComments + r.analytics.prComments + r.analytics.issueComments, 0),
    totalReviews: reposWithAnalytics.reduce((acc, r) => acc + r.analytics.reviews, 0),
    totalContributors: reposWithAnalytics.reduce((acc, r) => acc + r.analytics.contributors, 0),
    totalViews: 0
  };

  return { reposWithAnalytics, globalInsights };
}