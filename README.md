# IndexMeNow — Frontend

Next.js 14 (App Router) + Tailwind CSS client for the IndexMeNow backend.

## Getting Started

```bash
npm install
cp .env.example .env     # set NEXT_PUBLIC_API_URL to your backend
npm run dev              # http://localhost:3001
```

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server on port 3001 |
| `npm run build` | Production build |
| `npm start` | Serve the production build on port 3001 |
| `npm run lint` | Run ESLint |

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API, no trailing slash. Falls back to the hosted Render backend if unset. |

The backend's `FRONTEND_URL` must match the URL this app is served from (CORS and the Google OAuth redirect depend on it).

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── login/ register/         # Authentication
│   ├── dashboard/               # Scan + submit URLs, list jobs
│   ├── jobs/[jobId]/            # Job status detail
│   ├── profile/                 # Account & credits
│   ├── settings/google/         # Connect / manage Google accounts
│   └── auth/callback/           # Receives the token after Google OAuth
├── components/                  # Navbar, StatusBadge, UrlScanner
└── lib/api.ts                   # API client (apiFetch, apiStream for SSE) + token storage helpers
```

## URL scanner

The dashboard's "Submit URLs" card (`components/UrlScanner.tsx`) takes any number of pasted URLs
(up to 100 per batch), scans them on the backend (`POST /api/urls/preflight`) and shows live progress —
URLs scanned so far, a progress bar, URLs/s and time left, and ready / to check / blocked counts —
while the results fill in row by row. Only URLs the scan did not block can be selected, and
submitting them (`POST /api/urls/submit/bulk`) shows the same progress. Both endpoints stream
Server-Sent Events, read with `apiStream()` because `EventSource` cannot POST or send an
`Authorization` header. It needs a backend that has these endpoints.
