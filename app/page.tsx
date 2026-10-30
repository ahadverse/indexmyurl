import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  CheckCircle2,
  Code2,
  FileText,
  Gauge,
  ListChecks,
  ScanSearch,
  Search,
  Send,
  ShieldCheck,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import RedirectIfAuthed from '@/components/RedirectIfAuthed'
import { Badge } from '@/components/ui/Badge'
import { buttonClass } from '@/components/ui/buttonStyles'
import { Logo } from '@/components/ui/Logo'

const STEPS = [
  {
    n: '1',
    title: 'Add your URLs',
    body: 'Paste a list of pages, or load every page from your sitemap in one click.',
    Icon: ListChecks,
  },
  {
    n: '2',
    title: 'We scan every page',
    body: 'Status code, noindex, robots.txt, redirects, canonical and thin content are checked first, so nothing unindexable goes to Google.',
    Icon: ScanSearch,
  },
  {
    n: '3',
    title: 'Submit and track',
    body: 'Pages that pass are sent to Google. We follow each one in Search Console and use a credit only when it is indexed.',
    Icon: Send,
  },
]

const FEATURES = [
  {
    Icon: ShieldCheck,
    title: 'Pre-flight scan',
    body: 'Catch 404s, noindex tags, robots.txt blocks and redirect loops before they cost you a credit or a day of waiting.',
  },
  {
    Icon: Gauge,
    title: 'Live progress',
    body: 'Results stream in as each URL is checked, with a running count and time left, whether it is 5 pages or 500.',
  },
  {
    Icon: FileText,
    title: 'Sitemap import',
    body: 'Point us at your sitemap or sitemap index and scan the pages it lists, without copying a single URL.',
  },
  {
    Icon: BadgeCheck,
    title: 'Pay only when indexed',
    body: 'A credit is reserved when you submit and used only once Search Console confirms the page. If it never gets indexed, it is refunded.',
  },
  {
    Icon: Search,
    title: 'Verified by Search Console',
    body: 'Indexing status comes from Google Search Console’s URL Inspection, not from guesswork or a site: search.',
  },
  {
    Icon: Code2,
    title: 'API access',
    body: 'Submit and track URLs from your own tools with an API key, using the same checks as the dashboard.',
  },
]

const FAQ = [
  {
    q: 'Is indexing guaranteed?',
    a: 'No. Google alone decides what to index. IndexMeNow removes the avoidable blockers, asks Google to look at your pages and tells you what happened. Pages Google chooses not to index are not charged.',
  },
  {
    q: 'When is a credit used?',
    a: 'A credit is reserved when you submit a URL and used only when Search Console confirms the page is indexed. If it is still not indexed after the retries, the credit is refunded.',
  },
  {
    q: 'What does the scan check?',
    a: 'HTTP status, noindex in the page or headers, robots.txt rules for Googlebot, redirects, the canonical URL and thin content. Sitemaps and private addresses are refused.',
  },
  {
    q: 'How does IndexMeNow use my Google account?',
    a: 'To read your Search Console data (read-only) so it can check indexing status. Google officially supports its Indexing API only for job-posting and livestream pages; IndexMeNow uses it differently, so Google may limit or change this at any time. You can disconnect whenever you like.',
  },
]

function ScanPreview() {
  const rows = [
    { url: 'example.com/blog/getting-started', http: '200', tone: 'success' as const, label: 'Ready', note: 'No problems found' },
    { url: 'example.com/pricing', http: '200', tone: 'success' as const, label: 'Ready', note: 'No problems found' },
    { url: 'example.com/old-landing', http: '301', tone: 'warning' as const, label: 'To check', note: 'Redirects to /pricing' },
    { url: 'example.com/draft-post', http: '200', tone: 'danger' as const, label: 'Blocked', note: 'A robots meta tag says noindex' },
    { url: 'example.com/team', http: '404', tone: 'danger' as const, label: 'Blocked', note: 'The page returns HTTP 404' },
  ]
  return (
    <div className="relative" aria-hidden="true">
      <div className="absolute -inset-4 rounded-[28px] bg-gradient-to-tr from-brand-200/60 via-violet-200/40 to-transparent blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-pop">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Scanned</p>
              <p className="text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
                12 <span className="text-lg font-medium text-slate-400">/ 12 URLs</span>
              </p>
            </div>
            <div className="flex gap-1.5">
              <Badge tone="success">
                <CheckCircle2 className="h-3 w-3" /> 8
              </Badge>
              <Badge tone="warning">
                <AlertTriangle className="h-3 w-3" /> 2
              </Badge>
              <Badge tone="danger">
                <XCircle className="h-3 w-3" /> 2
              </Badge>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500" />
          </div>
        </div>
        <ul className="divide-y divide-slate-100">
          {rows.map((r) => (
            <li key={r.url} className="flex items-center gap-3 px-5 py-3">
              <span
                className={`rounded-md px-1.5 py-0.5 font-mono text-xs font-medium ${
                  r.http === '200' ? 'bg-emerald-50 text-emerald-700' : r.http === '301' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                }`}
              >
                {r.http}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-slate-800">{r.url}</p>
                <p className="truncate text-xs text-slate-500">{r.note}</p>
              </div>
              <Badge tone={r.tone} dot>
                {r.label}
              </Badge>
            </li>
          ))}
        </ul>
        <p className="bg-slate-50 px-5 py-2.5 text-[11px] text-slate-400">Example scan</p>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <RedirectIfAuthed />

      {/* header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo href="/" />
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex" aria-label="Sections">
            <a href="#how" className="hover:text-slate-900">
              How it works
            </a>
            <a href="#features" className="hover:text-slate-900">
              Features
            </a>
            <a href="#faq" className="hover:text-slate-900">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className={buttonClass({ variant: 'ghost', size: 'sm' })}>
              Sign in
            </Link>
            <Link href="/register" className={buttonClass({ size: 'sm' })}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="bg-dots-dark absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-28 lg:pt-24">
          <div>
            <Badge tone="brand" className="mb-6">
              <ScanSearch className="h-3.5 w-3.5" /> Scan first. Submit what passes.
            </Badge>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[56px]">
              Know your pages can be indexed — <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">before you submit them.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              IndexMeNow scans every URL for the problems that keep pages out of Google, sends the ones that pass, and uses a credit only once Search Console confirms the page is indexed.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/register" className={buttonClass({ size: 'lg' })}>
                Start with 5 free credits <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/login" className={buttonClass({ variant: 'secondary', size: 'lg' })}>
                Sign in
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              {['No card needed', 'Charged only when indexed', 'Verified in Search Console'].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <ScanPreview />
        </div>
      </section>

      {/* how it works */}
      <section id="how" className="scroll-mt-16 border-y border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">From a list of URLs to confirmed indexing</h2>
          </div>
          <ol className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map(({ n, title, body, Icon }) => (
              <li key={n} className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-5xl font-semibold tabular-nums text-slate-100">{n}</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* features */}
      <section id="features" className="scroll-mt-16 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Features</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Everything between “submitted” and “indexed”</h2>
          </div>
          <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ Icon, title, body }) => (
              <div key={title}>
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-900 text-white">
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* faq */}
      <section id="faq" className="scroll-mt-16 border-t border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Questions, answered plainly</h2>
          <div className="mt-12 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-[15px] font-medium text-slate-900 [&::-webkit-details-marker]:hidden">
                  {q}
                  <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* cta */}
      <section className="px-4 py-20 sm:px-6">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-violet-700 px-8 py-16 text-center text-white sm:px-16">
          <div className="bg-dots absolute inset-0" aria-hidden="true" />
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Stop guessing why pages aren’t indexed.</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">Scan your first URLs free. You only use a credit when a page is confirmed indexed.</p>
            <Link href="/register" className="mt-9 inline-flex h-12 items-center justify-center rounded-xl bg-white px-7 text-[15px] font-semibold text-brand-700 shadow-sm transition-colors hover:bg-brand-50">
              Create your account <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 sm:flex-row sm:px-6">
          <Logo href="/" />
          <p>Indexing is decided by Google and is never guaranteed.</p>
          <div className="flex gap-5">
            <Link href="/login" className="hover:text-slate-900">
              Sign in
            </Link>
            <Link href="/register" className="hover:text-slate-900">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
