type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string; type?: string }>;
};

async function fetchGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {},
  githubToken?: string
): Promise<T> {
  const token = githubToken || process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is not set");
  }

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub GraphQL error ${response.status}: ${text}`);
  }

  const json = (await response.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new Error(`GitHub GraphQL errors: ${json.errors.map((e) => e.message).join(", ")}`);
  }

  if (!json.data) {
    throw new Error("GitHub GraphQL response missing data");
  }

  return json.data;
}

export type ContributionData = {
  totalCommitContributions: number;
  totalPullRequestContributions: number;
  totalIssueContributions: number;
  weekly: Array<{ date: string; contributionCount: number }>;
};

export async function getContributionData(username: string, githubToken?: string): Promise<ContributionData> {
  const query = `query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }`;

  const data = await fetchGraphQL<{
    user: {
      contributionsCollection: {
        totalCommitContributions: number;
        totalPullRequestContributions: number;
        totalIssueContributions: number;
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{ contributionDays: Array<{ date: string; contributionCount: number }> }>;
        };
      };
    };
  }>(query, { username }, githubToken);

  const contributionCollection = data.user?.contributionsCollection;
  const weekly = contributionCollection?.contributionCalendar.weeks.flatMap((week) =>
    week.contributionDays.map((day) => ({ date: day.date, contributionCount: day.contributionCount }))
  ) ?? [];

  return {
    totalCommitContributions: contributionCollection?.totalCommitContributions ?? 0,
    totalPullRequestContributions: contributionCollection?.totalPullRequestContributions ?? 0,
    totalIssueContributions: contributionCollection?.totalIssueContributions ?? 0,
    weekly,
  };
}

export type PRAnalytics = {
  totalCount: number;
  mergedCount: number;
  closedCount: number;
  nodes: Array<{ createdAt: string; merged: boolean; state: string }>;
};

export async function getPRAnalytics(username: string, githubToken?: string): Promise<PRAnalytics> {
  const query = `query($username: String!) {
    user(login: $username) {
      pullRequests(first: 100) {
        totalCount
        nodes {
          createdAt
          merged
          state
        }
      }
    }
  }`;

  const data = await fetchGraphQL<{ user: { pullRequests: { totalCount: number; nodes: Array<{ createdAt: string; merged: boolean; state: string }> } } }>(
    query,
    { username },
    githubToken
  );

  const prs = data.user?.pullRequests;
  const mergedCount = prs?.nodes.filter((node) => node.merged).length ?? 0;
  const closedCount = prs?.nodes.filter((node) => node.state === "CLOSED").length ?? 0;

  return {
    totalCount: prs?.totalCount ?? 0,
    mergedCount,
    closedCount,
    nodes: prs?.nodes ?? [],
  };
}

export type RepoCommitStat = {
  name: string;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: string | null;
  commits: Array<{ committedDate: string }>;
};

export type RepoCommitStatsResponse = {
  nodes: Array<RepoCommitStat>;
};

export async function getRepoCommitStats(username: string, githubToken?: string): Promise<RepoCommitStat[]> {
  const query = `query($username: String!) {
    user(login: $username) {
      repositories(first: 50, ownerAffiliations: OWNER, privacy: PUBLIC) {
        nodes {
          name
          stargazerCount
          forkCount
          primaryLanguage { name }
          defaultBranchRef { target { ... on Commit { history(first: 50) { nodes { committedDate } } } } }
        }
      }
    }
  }`;

  type RepositoryNode = {
    name: string;
    stargazerCount: number;
    forkCount: number;
    primaryLanguage: { name: string } | null;
    defaultBranchRef: {
      target: {
        history: {
          nodes: Array<{ committedDate: string }>;
        };
      } | null;
    } | null;
  };

  type RepoCommitStatsQueryResult = {
    user: {
      repositories: {
        nodes: RepositoryNode[];
      };
    };
  };

  const data = await fetchGraphQL<RepoCommitStatsQueryResult>(query, { username }, githubToken);

  const repos = data.user?.repositories.nodes ?? [];

  return repos.map((repo) => ({
    name: repo.name,
    stargazerCount: repo.stargazerCount,
    forkCount: repo.forkCount,
    primaryLanguage: repo.primaryLanguage?.name ?? null,
    commits: repo.defaultBranchRef?.target && "history" in repo.defaultBranchRef.target
      ? repo.defaultBranchRef.target.history.nodes.map((commit) => ({ committedDate: commit.committedDate }))
      : [],
  }));
}
