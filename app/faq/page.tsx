import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { CtaBand, PageHero, PageShell } from '@/components/marketing/PageShell'
import { FAQ, FAQ_GROUPS } from '@/lib/faq'
import { faqJsonLd, pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Frequently asked questions',
  description:
    'Answers about how IndexMeNow works: credits and refunds, what the scan checks, Search Console access, limits, retries and the API.',
  path: '/faq',
})

export default function FaqPage() {
  return (
    <PageShell path="/faq" crumbs={[{ name: 'FAQ', path: '/faq' }]}>
      <JsonLd data={faqJsonLd(FAQ)} />
      <PageHero
        eyebrow="FAQ"
        title="Questions, answered plainly"
        intro="How credits work, what the scan checks, what Google decides and what we do. If something is missing, the guides go deeper."
      />

      <div className="mt-12 space-y-12">
        {FAQ_GROUPS.map((group) => (
          <section key={group.title} aria-labelledby={`faq-${group.title}`}>
            <h2 id={`faq-${group.title}`} className="text-xl font-semibold tracking-tight text-slate-900">
              {group.title}
            </h2>
            <div className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
              {group.items.map(({ q, a }) => (
                <details key={q} className="group px-6 py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-[15px] font-medium text-slate-900 [&::-webkit-details-marker]:hidden">
                    <h3 className="text-[15px] font-medium">{q}</h3>
                    <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-12 text-[15px] text-slate-600">
        Want the details? Read <Link href="/how-it-works" className="font-medium text-brand-600 hover:text-brand-700">how it works</Link>,{' '}
        <Link href="/credits" className="font-medium text-brand-600 hover:text-brand-700">how credits work</Link> or the{' '}
        <Link href="/guides" className="font-medium text-brand-600 hover:text-brand-700">indexing guides</Link>.
      </p>

      <CtaBand />
    </PageShell>
  )
}
