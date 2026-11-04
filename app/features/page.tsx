import type { Metadata } from 'next'
import Link from 'next/link'
import { BadgeCheck, Code2, Download, FileText, Gauge, RefreshCw, Search, ShieldCheck } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { CtaBand, PageHero, PageShell } from '@/components/marketing/PageShell'
import { pageMetadata, softwareJsonLd } from '@/lib/seo'
import { SITE_DESCRIPTION } from '@/lib/site'

export const metadata: Metadata = pageMetadata({
  title: 'Features: pre-flight scan, Search Console tracking and API',
  description:
    'Pre-flight scan, sitemap import, live progress, Search Console verification, automatic retries and refunds, CSV export and an API. Everything between submitted and indexed.',
  path: '/features',
})

const FEATURES = [
  {
    Icon: ShieldCheck,
    title: 'Pre-flight scan',
    summary: 'Find out why a page cannot be indexed before you submit it.',
    points: [
      'HTTP status: 404, 410, 401 and server errors',
      'noindex in the robots meta tag or the X-Robots-Tag header',
      'robots.txt rules that block Googlebot',
      'Redirects, redirect loops and a canonical that points elsewhere',
      'Thin content, DNS and TLS errors',
    ],
    link: { href: '/guides/fix-noindex-and-robots-txt-blocks', label: 'How noindex and robots.txt blocks work' },
  },
  {
    Icon: Gauge,
    title: 'Live progress',
    summary: 'Results stream in as each URL is checked, with a running count and the time left, whether it is 5 pages or 100.',
  },
  {
    Icon: FileText,
    title: 'Sitemap import',
    summary: 'Point IndexMeNow at a sitemap or a sitemap index and scan the pages it lists, without copying a single URL.',
    link: { href: '/guides/how-to-submit-a-sitemap', label: 'How to create and submit a sitemap' },
  },
  {
    Icon: BadgeCheck,
    title: 'Pay only when indexed',
    summary: 'A credit is reserved when you submit and used only once Search Console confirms the page. If it never gets indexed, it is refunded.',
    link: { href: '/credits', label: 'How credits work' },
  },
  {
    Icon: Search,
    title: 'Verified by Search Console',
    summary: 'Indexing status comes from Google Search Console’s URL Inspection, not from guesswork or a site: search.',
    link: { href: '/guides/url-inspection-tool-explained', label: 'How to read URL Inspection' },
  },
  {
    Icon: RefreshCw,
    title: 'Automatic retries and refunds',
    summary: 'A page that is not indexed is submitted again, up to 3 times and at least 24 hours apart. After 7 days the credit goes back to your balance.',
  },
  {
    Icon: Download,
    title: 'Job history and CSV export',
    summary: 'Every URL you submitted is listed with its status and how many times it was tried. Search, filter by status and export the list as a CSV file.',
  },
  {
    Icon: Code2,
    title: 'API access',
    summary: 'Scan, submit and track URLs from your own tools with an API key, using the same checks as the dashboard.',
    link: { href: '/docs/api', label: 'Read the API documentation' },
  },
]

export default function FeaturesPage() {
  return (
    <PageShell path="/features" crumbs={[{ name: 'Features', path: '/features' }]} width="max-w-5xl">
      <JsonLd data={softwareJsonLd(SITE_DESCRIPTION)} />
      <div className="max-w-3xl">
        <PageHero
          eyebrow="Features"
          title="Everything between “submitted” and “indexed”"
          intro="Scanning, submitting, tracking, retrying and refunding, in one place and in that order."
        />
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {FEATURES.map(({ Icon, title, summary, points, link }) => (
          <section key={title} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-card">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-900 text-white">
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{summary}</p>
            {points && (
              <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[15px] text-slate-600 marker:text-slate-400">
                {points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            )}
            {link && (
              <Link href={link.href} className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-700">
                {link.label} →
              </Link>
            )}
          </section>
        ))}
      </div>

      <div className="mx-auto max-w-3xl">
        <CtaBand />
      </div>
    </PageShell>
  )
}
