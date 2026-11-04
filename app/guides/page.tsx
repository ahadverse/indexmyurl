import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { CtaBand, PageHero, PageShell } from '@/components/marketing/PageShell'
import { GUIDES, readingMinutes } from '@/lib/guides'
import { pageMetadata } from '@/lib/seo'
import { SITE_NAME, absoluteUrl } from '@/lib/site'
import { formatLongDate } from '@/lib/format'

export const metadata: Metadata = pageMetadata({
  title: 'Google indexing guides',
  description:
    'Plain-language guides to getting pages into Google: why a page is not indexed, what the Search Console statuses mean, and how to fix noindex, robots.txt and sitemap problems.',
  path: '/guides',
})

export default function GuidesPage() {
  const crumbs = [{ name: 'Guides', path: '/guides' }]
  return (
    <PageShell path="/guides" crumbs={crumbs}>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${SITE_NAME} guides`,
          url: absoluteUrl('/guides'),
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: GUIDES.map((guide, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: absoluteUrl(`/guides/${guide.slug}`),
              name: guide.title,
            })),
          },
        }}
      />
      <PageHero
        eyebrow="Guides"
        title="Get your pages into Google"
        intro="Practical, plain-language guides to the problems that keep pages out of Google, and what to do about each one."
      />

      <ul className="mt-12 space-y-5">
        {GUIDES.map((guide) => (
          <li key={guide.slug}>
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-shadow hover:shadow-pop">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                <Link href={`/guides/${guide.slug}`} className="hover:text-brand-700">
                  {guide.title}
                </Link>
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{guide.summary}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" aria-hidden="true" /> {readingMinutes(guide)} min read
                </span>
                <time dateTime={guide.modified}>Updated {formatLongDate(guide.modified)}</time>
                <Link href={`/guides/${guide.slug}`} className="ml-auto inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700">
                  Read the guide <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <CtaBand />
    </PageShell>
  )
}
