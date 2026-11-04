import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { CtaBand, PageShell } from '@/components/marketing/PageShell'
import { RichText } from '@/components/marketing/RichText'
import { GUIDES, getGuide, readingMinutes, type GuideBlock } from '@/lib/guides'
import { pageMetadata } from '@/lib/seo'
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site'
import { formatLongDate } from '@/lib/format'

// Only the guides in lib/guides.ts exist; any other slug is a 404
export const dynamicParams = false

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const guide = getGuide(params.slug)
  if (!guide) return {}
  return pageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guides/${guide.slug}`,
    type: 'article',
    publishedTime: guide.published,
    modifiedTime: guide.modified,
  })
}

function Block({ block }: { block: GuideBlock }) {
  if (block.type === 'p') {
    return (
      <p>
        <RichText text={block.text} />
      </p>
    )
  }
  if (block.type === 'list') {
    const Tag = block.ordered ? 'ol' : 'ul'
    return (
      <Tag className={`space-y-2 pl-6 ${block.ordered ? 'list-decimal' : 'list-disc'} marker:text-slate-400`}>
        {block.items.map((item) => (
          <li key={item} className="pl-1">
            <RichText text={item} />
          </li>
        ))}
      </Tag>
    )
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            {block.headers.map((header) => (
              <th key={header} scope="col" className="px-4 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {block.rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, index) => (
                <td key={index} className={`px-4 py-3 align-top ${index === 0 ? 'font-medium text-slate-900' : ''}`}>
                  <RichText text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = getGuide(params.slug)
  if (!guide) notFound()

  const path = `/guides/${guide.slug}`
  const related = guide.related.map((slug) => getGuide(slug)).filter((g): g is NonNullable<typeof g> => !!g)

  return (
    <PageShell
      path={path}
      crumbs={[
        { name: 'Guides', path: '/guides' },
        { name: guide.title, path },
      ]}
    >
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: guide.title,
          description: guide.description,
          datePublished: guide.published,
          dateModified: guide.modified,
          inLanguage: 'en',
          mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(path) },
          image: absoluteUrl('/opengraph-image'),
          author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
          publisher: { '@id': `${SITE_URL}/#organization` },
        }}
      />

      <article>
        <header>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Guide</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">{guide.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" aria-hidden="true" /> {readingMinutes(guide)} min read
            </span>
            <span>
              Published <time dateTime={guide.published}>{formatLongDate(guide.published)}</time>
            </span>
            {guide.modified !== guide.published && (
              <span>
                Updated <time dateTime={guide.modified}>{formatLongDate(guide.modified)}</time>
              </span>
            )}
          </div>
        </header>

        <div className="mt-8 space-y-4 text-lg leading-relaxed text-slate-600">
          {guide.intro.map((text) => (
            <p key={text}>
              <RichText text={text} />
            </p>
          ))}
        </div>

        <nav aria-label="On this page" className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-sm font-semibold text-slate-900">On this page</h2>
          <ol className="mt-3 space-y-1.5 text-[15px]">
            {guide.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-brand-600 hover:text-brand-700">
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {guide.sections.map((section) => (
          <section key={section.id} id={section.id} className="mt-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{section.heading}</h2>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-slate-600">
              {section.blocks.map((block, index) => (
                <Block key={index} block={block} />
              ))}
            </div>
          </section>
        ))}
      </article>

      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="related">
          <h2 id="related" className="text-xl font-semibold tracking-tight text-slate-900">
            Keep reading
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {related.map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/guides/${other.slug}`}
                  className="block h-full rounded-xl border border-slate-200 p-5 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
                >
                  <span className="text-[15px] font-semibold text-slate-900">{other.title}</span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-slate-600">{other.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <CtaBand
        title="Check your URLs before you submit them"
        body="IndexMeNow scans each page for the blockers described in this guide, and uses a credit only when Search Console confirms the page is indexed."
      />
    </PageShell>
  )
}
