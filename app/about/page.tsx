import type { Metadata } from 'next'
import Link from 'next/link'
import { ContentSection, CtaBand, PageHero, PageShell } from '@/components/marketing/PageShell'
import { pageMetadata } from '@/lib/seo'
import { CONTACT_EMAIL } from '@/lib/site'

export const metadata: Metadata = pageMetadata({
  title: 'About IndexMeNow',
  description:
    'IndexMeNow scans URLs for indexing problems, submits the ones that pass and charges only when Google Search Console confirms the page is indexed. What we build and how we think about it.',
  path: '/about',
})

const PRINCIPLES = [
  {
    title: 'Check before you submit',
    body: 'Most pages that never get indexed have a reason you can fix: a 404, a noindex tag, a robots.txt rule. Finding that first costs nothing and saves everyone’s time.',
  },
  {
    title: 'Verify, do not guess',
    body: 'We follow each page with Google Search Console’s URL Inspection, so a page is “indexed” when Google says it is, not when we hope it is.',
  },
  {
    title: 'Pay for results',
    body: 'A credit is used only when a page is confirmed indexed. Pages Google chooses not to index are refunded.',
  },
  {
    title: 'Be honest about the limits',
    body: 'Google decides what to index. We never promise otherwise, and we say plainly how we use Google’s tools, including that its Indexing API is officially meant for job-posting and livestream pages.',
  },
]

export default function AboutPage() {
  return (
    <PageShell path="/about" crumbs={[{ name: 'About', path: '/about' }]}>
      <PageHero
        eyebrow="About"
        title="Indexing, without the guesswork"
        intro="IndexMeNow scans URLs for the problems that keep pages out of Google, submits the ones that pass, and charges only when Search Console confirms the page is indexed."
      />

      <ContentSection title="What we do">
        <p>
          You give us a list of URLs, or a sitemap. We fetch each page the way a crawler would, tell you which ones have a problem and why, and send the rest to Google. Then we keep checking Search Console until we know what happened, and tell you.
        </p>
        <p>
          The result is a clear answer for every page: indexed, still waiting, or blocked, along with the reason.
        </p>
      </ContentSection>

      <ContentSection title="How we think about it">
        <dl className="space-y-6">
          {PRINCIPLES.map((principle) => (
            <div key={principle.title}>
              <dt className="text-lg font-semibold tracking-tight text-slate-900">{principle.title}</dt>
              <dd className="mt-1.5">{principle.body}</dd>
            </div>
          ))}
        </dl>
      </ContentSection>

      <ContentSection title="Your data">
        <p>
          We ask Google for read-only access to Search Console, and we use it only to confirm that you may submit a page and to check whether it was indexed. We never change anything in your Search Console, we do not use Google data for advertising and we do not sell it. The{' '}
          <Link href="/privacy" className="font-medium text-brand-600 hover:text-brand-700">privacy policy</Link> has the full detail.
        </p>
      </ContentSection>

      <ContentSection title="Learn more">
        <ul className="list-disc space-y-2 pl-6 marker:text-slate-400">
          <li><Link href="/how-it-works" className="font-medium text-brand-600 hover:text-brand-700">How it works</Link>, step by step</li>
          <li><Link href="/guides" className="font-medium text-brand-600 hover:text-brand-700">Indexing guides</Link> for the problems behind “not indexed”</li>
          {CONTACT_EMAIL && (
            <li><Link href="/contact" className="font-medium text-brand-600 hover:text-brand-700">Contact us</Link></li>
          )}
        </ul>
      </ContentSection>

      <CtaBand />
    </PageShell>
  )
}
