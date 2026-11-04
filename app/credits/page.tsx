import type { Metadata } from 'next'
import Link from 'next/link'
import { ContentSection, CtaBand, PageHero, PageShell } from '@/components/marketing/PageShell'
import { pageMetadata } from '@/lib/seo'
import { CONTACT_EMAIL } from '@/lib/site'

export const metadata: Metadata = pageMetadata({
  title: 'How credits work: you pay only when a page is indexed',
  description:
    'Every account starts with 5 free credits. A credit is reserved when you submit a URL, used only when Search Console confirms it is indexed, and refunded if it is not.',
  path: '/credits',
})

const OUTCOMES = [
  ['The page is already indexed', 'No credit is used. It is marked as indexed straight away.'],
  ['The scan finds a blocker (noindex, 404, robots.txt…)', 'The page is not submitted and no credit is reserved.'],
  ['You submit a page and Search Console confirms it is indexed', 'One credit is used.'],
  ['The page is still not indexed after the retries', 'The reserved credit is refunded.'],
  ['Google rejects the submission', 'The reserved credit is refunded.'],
]

export default function CreditsPage() {
  return (
    <PageShell path="/credits" crumbs={[{ name: 'Credits', path: '/credits' }]}>
      <PageHero
        eyebrow="Credits"
        title="You pay only when a page is indexed"
        intro="One credit covers one URL that Search Console confirms as indexed. If Google does not index it, you keep the credit."
      />

      <ContentSection title="Start with 5 free credits">
        <p>Every new account gets 5 free credits and no card is needed. Scanning URLs for problems never costs a credit.</p>
      </ContentSection>

      <ContentSection title="Reserved, then used or refunded">
        <ol className="list-decimal space-y-3 pl-6 marker:font-semibold marker:text-brand-600">
          <li>
            <strong className="font-semibold text-slate-900">Reserved.</strong> When you submit a URL, one credit is set aside. You can still see it in your balance, but it is not available for another submission.
          </li>
          <li>
            <strong className="font-semibold text-slate-900">Used.</strong> When Search Console confirms that the page is indexed, the reserved credit is used.
          </li>
          <li>
            <strong className="font-semibold text-slate-900">Refunded.</strong> If the page is still not indexed after the retries (up to 3, at least 24 hours apart) and 7 days, the credit returns to your balance.
          </li>
        </ol>
      </ContentSection>

      <ContentSection title="What happens in each case">
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Situation</th>
                <th scope="col" className="px-4 py-3 font-semibold">Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {OUTCOMES.map(([situation, result]) => (
                <tr key={situation}>
                  <td className="px-4 py-3 align-top font-medium text-slate-900">{situation}</td>
                  <td className="px-4 py-3 align-top">{result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentSection>

      <ContentSection title="Daily limit">
        <p>
          To keep submissions steady and spread them out over time, each account can submit up to 50 URLs a day. The limit resets at midnight.
        </p>
      </ContentSection>

      <ContentSection title="Need more credits?">
        <p>
          If you have used your free credits and want more, get in touch and we will add them to your account.
          {CONTACT_EMAIL ? (
            <>
              {' '}
              Write to{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-brand-600 hover:text-brand-700">
                {CONTACT_EMAIL}
              </a>
              .
            </>
          ) : null}
        </p>
        <p>
          Indexing is decided by Google and is never guaranteed, which is exactly why credits are tied to the result. See the{' '}
          <Link href="/faq" className="font-medium text-brand-600 hover:text-brand-700">FAQ</Link> for the details.
        </p>
      </ContentSection>

      <CtaBand />
    </PageShell>
  )
}
