import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function login(formData: FormData) {
  "use server";
  const username = String(formData.get("username") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();

  if (!username || !token) {
    throw new Error("Username and token are required.");
  }

  const apiRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!apiRes.ok) {
    throw new Error("Failed to validate token. Check your PAT and try again.");
  }

  const cookieStore = await cookies();
  cookieStore.set("gh_username", username, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
  });
  cookieStore.set("gh_token", token, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
  });

  redirect("/dashboard");
}

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-zinc-900">
        <h1 className="mb-4 text-2xl font-bold">GitHub Analytics Dashboard</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          Enter your GitHub username and Personal Access Token (PAT). The token is stored only in an HTTP-only short-lived cookie.
        </p>

        <form action={login} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium">
              GitHub Username
            </label>
            <input
              id="username"
              name="username"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label htmlFor="token" className="block text-sm font-medium">
              Personal Access Token (PAT)
            </label>
            <input
              id="token"
              name="token"
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-sky-600 px-4 py-2 text-white transition hover:bg-sky-500"
          >
            Go to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
