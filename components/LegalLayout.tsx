import { CONTACT_EMAIL } from '@/lib/site'
import { PageShell } from '@/components/marketing/PageShell'

/** Shared frame for the privacy policy and terms: the site header and footer around a readable column. */
export function LegalLayout({
  path,
  title,
  updated,
  intro,
  children,
}: {
  /** Path of the page, for the navigation and the breadcrumb */
  path: string
  title: string
  updated: string
  intro: string
  children: React.ReactNode
}) {
  return (
    <PageShell path={path} crumbs={[{ name: title, path }]}>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
      <p className="mt-3 text-sm text-slate-500">Last updated {updated}</p>
      <p className="mt-6 text-[17px] leading-relaxed text-slate-600">{intro}</p>
      <div className="mt-12 space-y-10">{children}</div>
    </PageShell>
  )
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-slate-600">{children}</div>
    </section>
  )
}

export function LegalList({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc space-y-1.5 pl-6">{children}</ul>
}

/** The contact address as a mailto link, or a plain pointer when none is configured. */
export function LegalContact() {
  if (!CONTACT_EMAIL) return <>the contact details shown on our website</>
  return (
    <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-brand-600 hover:text-brand-700">
      {CONTACT_EMAIL}
    </a>
  )
}
