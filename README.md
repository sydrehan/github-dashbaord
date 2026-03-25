# GitHub Analytics Dashboard (Next.js App Router)

A scalable GitHub analytics dashboard using Next.js App Router + TypeScript + Tailwind + Recharts. No separate backend; token is handled in short-lived HTTP-only cookies.

## Features

- Login with GitHub username + Personal Access Token (PAT)
- Server Components + Server Actions for secure data fetch
- GitHub REST + GraphQL data: profile, repos, PRs, issues, contributions
- Repository analytics (stars, forks, language distribution)
- Contribution heatmap + streak + activity insights
- Responsive UI + dark mode

## Folder structure

- `app/page.tsx`: login page and auth action
- `app/dashboard/page.tsx`: analytics dashboard
- `components/analytics/*`: chart components (Recharts)
- `lib/github.ts`: GitHub API helper functions
- `lib/utils.ts`: date formatting utilities

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Authenticate

Generate a GitHub PAT with these scopes (minimum):

- `read:user`
- `repo` (or `public_repo` if only public repositories)

Enter your username + PAT at `/`.

## Production

```bash
npm run build
npm start
```

## Validate

- `npm run lint`
- `npm run build`

## Optional env

No GitHub token is stored in `.env.local` by default; you still can define app constants:

```env
NEXT_PUBLIC_APP_NAME="GitHub Analytics Dashboard"
```

## Notes

- Token is never exposed to client script
- Token cookie expiry is 10 minutes
- Rate limit checks available via GitHub API

