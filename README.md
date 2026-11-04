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
| `NEXT_PUBLIC_SITE_URL` | Public origin of this site (e.g. `https://storewike.store`). Used for canonical URLs, Open Graph, sitemap.xml, robots.txt and structured data, so set it in production. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Optional. Shown on the privacy policy, terms and credits page. When set, the `/contact` page exists and is in the sitemap; when empty, `/contact` is a 404. |

`NEXT_PUBLIC_*` values are baked in at build time: after changing one, run `npm run build` again (a restart is not enough).

The backend's `FRONTEND_URL` must match the URL this app is served from (CORS and the Google OAuth redirect depend on it).

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── how-it-works/ features/ credits/ faq/ about/ contact/   # Public marketing pages
│   ├── docs/api/                # API documentation
│   ├── guides/ guides/[slug]/   # Indexing guides (content in lib/guides.ts)
│   ├── sitemap.ts robots.ts manifest.ts icon.tsx opengraph-image.tsx not-found.tsx
│   ├── login/ register/         # Authentication
│   ├── dashboard/               # Scan + submit URLs, list jobs
│   ├── jobs/[jobId]/            # Job status detail
│   ├── profile/                 # Account & credits
│   ├── settings/google/         # Connect / manage Google accounts
│   └── auth/callback/           # Receives the token after Google OAuth
├── components/                  # Navbar, StatusBadge, UrlScanner
│   └── marketing/               # SiteHeader, SiteFooter, PageShell, Breadcrumbs, RichText (public pages)
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

## SEO

Every public page is a server component (no client JavaScript for its content) and gets, through
`pageMetadata()` in `lib/seo.ts`: a unique title and description, a canonical URL, Open Graph and Twitter
tags and the generated share image (`/opengraph-image`). Structured data (`JsonLd`): Organization and
WebSite on every page, BreadcrumbList on inner pages, Article on guides, FAQPage on `/faq`,
SoftwareApplication on `/` and `/features`.

- **Add a guide:** append an entry to `GUIDES` in `lib/guides.ts`. The guide page, the guide list, the
  sitemap, the structured data and the reading time all follow from it. Inline formatting in the text:
  `**bold**`, `` `code` `` and `[label](/path)`.
- **Add a page:** create `app/<name>/page.tsx` with `export const metadata = pageMetadata({...})`, wrap the
  content in `PageShell`, and add the path to `app/sitemap.ts` (and the nav/footer if it belongs there).
- `app/icon.tsx` and `app/opengraph-image.tsx` run on the edge runtime (`next/og`).
- Private pages (`/dashboard`, `/urls`, `/jobs/…`, `/profile`, `/settings/…`) stay out of the sitemap and
  are disallowed in `robots.txt`.
