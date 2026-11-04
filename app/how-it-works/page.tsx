import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/JsonLd'
import { ContentSection, CtaBand, PageHero, PageShell } from '@/components/marketing/PageShell'
import { pageMetadata } from '@/lib/seo'
import { SITE_NAME, absoluteUrl } from '@/lib/site'

export const metadata: Metadata = pageMetadata({
  title: 'How it works: from a list of URLs to confirmed indexing',
  description:
    'Connect Search Console, scan your URLs for indexing blockers, submit the ones that pass and track each page until Search Console confirms it is indexed.',
  path: '/how-it-works',
})

const STEPS = [
  {
    title: 'Give IndexMeNow Search Console access',
    body: [
      'Credits are charged only for pages that are confirmed indexed, and only Google Search Console can confirm that. So the first step is to let IndexMeNow see your site there.',
      'You can connect your Google account with one click (read-only access to Search Console), or add our service account as a Full user of your property. Either way, IndexMeNow never edits anything in your Search Console.',
    ],
  },
  {
    title: 'Add your URLs',
    body: [
      'Paste a list of pages, or load every page from your sitemap or sitemap index in one click. You can scan up to 100 URLs at a time.',
    ],
  },
  {
    title: 'Every page is scanned first',
    body: [
      'Each URL is fetched the way a crawler would fetch it. The scan checks the HTTP status, noindex in the page or in the headers, robots.txt rules for Googlebot, redirects, the canonical URL and thin content, and reports each page as ready, to check, or blocked.',
      'Blocked pages are not submitted. That saves you a credit and a day of waiting for something that could never have been indexed.',
    ],
  },
  {
    title: 'Submit the pages that pass',
    body: [
      'When you submit, IndexMeNow first asks Search Console whether the page is already indexed. If it is, it is marked as indexed and nothing is charged. Otherwise a credit is reserved and the page joins the queue.',
      'After a short, randomized delay the page is sent to Google (see “What happens behind the scenes” below).',
    ],
  },
  {
    title: 'Each page is tracked in Search Console',
    body: [
      'IndexMeNow checks the page with Search Console’s URL Inspection: about 20 minutes after submitting, every 30 minutes for the first 6 hours, every 2 hours up to 24 hours, and every 6 hours after that.',
      'When Search Console says the page is indexed, the reserved credit is used. You can see every step on the job’s page in your dashboard.',
    ],
  },
  {
    title: 'If a page is not indexed, it is retried, then refunded',
    body: [
      'A page that Google has not indexed is submitted again, up to 3 times and at least 24 hours apart. If it is still not indexed after 7 days, the reserved credit goes back to your balance.',
    ],
  },
]

export default function HowItWorksPage() {
  const path = '/how-it-works'
  return (
    <PageShell path={path} crumbs={[{ name: 'How it works', path }]}>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: `How ${SITE_NAME} works`,
          url: absoluteUrl(path),
          description: metadata.description,
        }}
      />
      <PageHero
        eyebrow="How it works"
        title="From a list of URLs to confirmed indexing"
        intro="IndexMeNow scans first, submits what passes and follows each page until Search Console says whether it was indexed. Here is every step."
      />

      <ol className="mt-12 space-y-10">
        {STEPS.map((step, index) => (
          <li key={step.title} className="relative pl-14">
            <span className="absolute left-0 top-0 grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-base font-semibold text-white" aria-hidden="true">
              {index + 1}
            </span>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">{step.title}</h2>
            <div className="mt-3 space-y-3 text-[16px] leading-relaxed text-slate-600">
              {step.body.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </div>
          </li>
        ))}
      </ol>

      <ContentSection title="What happens behind the scenes">
        <p>
          After a page passes the scan, IndexMeNow publishes a small page on its own domain that points to your URL, and notifies Google about it through the Google Indexing API. Google decides whether and when to crawl, and what to do with your page. IndexMeNow then checks the outcome in Search Console.
        </p>
        <p>
          Google officially supports the Indexing API only for job-posting and livestream pages. Using it for other pages is outside what Google documents, so Google may limit or change how it responds at any time. That is why indexing is never guaranteed, and why you only pay when Search Console confirms the result.
        </p>
      </ContentSection>

      <ContentSection title="What to expect">
        <ul className="list-disc space-y-2 pl-6 marker:text-slate-400">
          <li>Google decides what gets indexed. Pages it chooses not to index are not charged.</li>
          <li>Some pages are indexed within hours, others take days, and some never are. Content quality matters most.</li>
          <li>
            A page that Google has crawled but declined rarely changes its mind because it was submitted again. See{' '}
            <Link href="/guides/crawled-currently-not-indexed" className="font-medium text-brand-600 hover:text-brand-700">
              Crawled – currently not indexed
            </Link>
            .
          </li>
        </ul>
        <p>
          Questions about credits? Read <Link href="/credits" className="font-medium text-brand-600 hover:text-brand-700">how credits work</Link>, or the{' '}
          <Link href="/faq" className="font-medium text-brand-600 hover:text-brand-700">FAQ</Link>.
        </p>
      </ContentSection>

      <CtaBand />
    </PageShell>
  )
}
