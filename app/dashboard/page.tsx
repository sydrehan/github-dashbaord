import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUser, getRepos, getPRs, getIssues, getContributionCalendar } from "@/lib/github";
import { transformRepoDataAsync } from "@/lib/analytics-transform";
import UserHeader from "@/components/analytics/UserHeader";
import RepoCard from "@/components/analytics/RepoCard";
import GlobalInsightsPanel from "@/components/analytics/GlobalInsightsPanel";
import { GitBranch, FolderOpen } from "lucide-react";

async function logoutAction() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.set("gh_token", "", { path: "/", maxAge: 0 });
  cookieStore.set("gh_username", "", { path: "/", maxAge: 0 });
  redirect("/");
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("gh_token")?.value;
  const storedUsername = cookieStore.get("gh_username")?.value;

  if (!token || !storedUsername) {
    redirect("/");
  }

  const user = await getUser(token!);
  const username = user.login;

  const [repos, prs, issues, contributions] = await Promise.all([
    getRepos(token!, username),
    getPRs(token!, username),
    getIssues(token!, username),
    getContributionCalendar(token!, username),
  ]);

  const { reposWithAnalytics, globalInsights } = await transformRepoDataAsync(token!, username, repos, prs, issues, contributions);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
      {/* Sleek Vercel-like Header Top Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              <GitBranch className="h-4 w-4" />
            </div>
            <span className="font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Analytics Hub
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {username}
            </span>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors"
            >
              Log out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* User Overview Section */}
        <section className="mb-10">
          <UserHeader user={user} />
        </section>

        {/* Global Analytics Section */}
        <section className="mb-12">
          <div className="mb-5">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Global Analytics
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Detailed breakdown of your GitHub activity across all repositories.
            </p>
          </div>
          <GlobalInsightsPanel insights={globalInsights} />
        </section>

        {/* Repository Analytics Section */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                Repository Summary
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Performance, activity, and collaboration metrics for your repositories.
              </p>
            </div>
          </div>

          {reposWithAnalytics.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-24 shadow-sm dark:border-slate-800 dark:bg-zinc-950">
              <FolderOpen className="mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                No repositories available
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm">
                We couldn't find any repositories to analyze. Create a repository on GitHub to start tracking insights.
              </p>
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Create new repository
              </a>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {reposWithAnalytics.map(({ repo, analytics }) => (
                <RepoCard key={repo.id} repo={repo} analytics={analytics} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
