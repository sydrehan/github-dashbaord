"use client";

import Image from "next/image";
import { UserProfile } from "@/lib/github";
import { Users, BookOpen } from "lucide-react";

type UserHeaderProps = {
  user: UserProfile;
};

export default function UserHeader({ user }: UserHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-zinc-950">
      <div className="flex items-center gap-5">
        <Image
          src={user.avatar_url}
          alt={user.name ?? user.login}
          width={80}
          height={80}
          className="rounded-full border shadow-sm border-slate-200 dark:border-slate-800"
        />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            {user.name || user.login}
          </h1>
          <a
            href={`https://github.com/${user.login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
          >
            @{user.login}
          </a>
          {user.bio && (
            <p className="mt-2 flex max-w-md items-center text-sm text-slate-600 dark:text-slate-400">
              {user.bio}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex w-full md:mt-0 md:w-auto md:justify-end gap-6 text-sm">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Users className="h-4 w-4" />
            Followers
          </span>
          <span className="text-xl font-semibold text-slate-900 dark:text-slate-100">{user.followers.toLocaleString()}</span>
        </div>
        <div className="w-px bg-slate-200 dark:bg-slate-800" />
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Users className="h-4 w-4" />
            Following
          </span>
          <span className="text-xl font-semibold text-slate-900 dark:text-slate-100">{user.following.toLocaleString()}</span>
        </div>
        <div className="w-px bg-slate-200 dark:bg-slate-800" />
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <BookOpen className="h-4 w-4" />
            Repositories
          </span>
          <span className="text-xl font-semibold text-slate-900 dark:text-slate-100">{user.public_repos.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}