import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { Breadcrumbs } from './Breadcrumbs'
import { buttonClass } from '@/components/ui/buttonStyles'
import type { Crumb } from '@/lib/seo'

/**
 * Frame of every public content page: skip link, header, breadcrumbs, <main>, footer.
 * `path` highlights the current item in the navigation.
 */
export function PageShell({
  path,
  crumbs,
  children,
  width = 'max-w-3xl',
}: {
  path: string
  crumbs?: Crumb[]
  children: React.ReactNode
  /** Tailwind max-width class of the content column */
  width?: string
}) {
  return (
    <div className="min-h-screen bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-pop"
      >
        Skip to content
      </a>
      <SiteHeader current={path} />
      <main id="main" className={`mx-auto px-4 py-12 sm:px-6 sm:py-16 ${width}`}>
        {crumbs && crumbs.length > 0 && (
          <div className="mb-8">
            <Breadcrumbs crumbs={crumbs} />
          </div>
        )}
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}

/** Eyebrow + h1 + intro paragraph at the top of a content page. */
export function PageHero({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: string }) {
  return (
    <header>
      {eyebrow && <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">{eyebrow}</p>}
      <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
      {intro && <p className="mt-5 text-lg leading-relaxed text-slate-600">{intro}</p>}
    </header>
  )
}

/** Call to action at the bottom of a content page. */
export function CtaBand({
  title = 'Scan your first URLs free',
  body = 'Every account starts with 5 free credits. A credit is used only when Search Console confirms a page is indexed.',
}: {
  title?: string
  body?: string
}) {
  return (
    <aside className="mt-16 rounded-2xl border border-brand-100 bg-brand-50 px-6 py-8 sm:px-10" aria-label="Get started">
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-slate-600">{body}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/register" className={buttonClass({})}>
          Create your account <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Link>
        <Link href="/how-it-works" className={buttonClass({ variant: 'secondary' })}>
          See how it works
        </Link>
      </div>
    </aside>
  )
}

/** A titled block of body copy inside a content page. */
export function ContentSection({
  id,
  title,
  children,
}: {
  id?: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-24">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
      <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-slate-600">{children}</div>
    </section>
  )
}
