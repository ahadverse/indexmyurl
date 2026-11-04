import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell } from '@/components/marketing/PageShell'
import { buttonClass } from '@/components/ui/buttonStyles'
import { GUIDES } from '@/lib/guides'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <PageShell path="">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">This page does not exist</h1>
      <p className="mt-4 text-lg leading-relaxed text-slate-600">
        The address may be mistyped, or the page may have moved. Try one of these instead.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className={buttonClass({})}>
          Go to the home page
        </Link>
        <Link href="/guides" className={buttonClass({ variant: 'secondary' })}>
          Browse the guides
        </Link>
      </div>
      <h2 className="mt-14 text-lg font-semibold text-slate-900">Popular guides</h2>
      <ul className="mt-4 space-y-2 text-[15px]">
        {GUIDES.slice(0, 4).map((guide) => (
          <li key={guide.slug}>
            <Link href={`/guides/${guide.slug}`} className="font-medium text-brand-600 hover:text-brand-700">
              {guide.title}
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  )
}
