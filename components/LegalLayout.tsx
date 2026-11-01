import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { buttonClass } from '@/components/ui/buttonStyles'
import { CONTACT_EMAIL } from '@/lib/site'

/** Shared frame for the privacy policy and terms: simple header, readable column, footer links. */
export function LegalLayout({
  title,
  updated,
  intro,
  children,
}: {
  title: string
  updated: string
  intro: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo href="/" />
          <div className="flex items-center gap-2">
            <Link href="/login" className={buttonClass({ variant: 'ghost', size: 'sm' })}>
              Sign in
            </Link>
            <Link href="/register" className={buttonClass({ size: 'sm' })}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-slate-500">Last updated {updated}</p>
        <p className="mt-6 text-[17px] leading-relaxed text-slate-600">{intro}</p>
        <div className="mt-12 space-y-10">{children}</div>
      </main>

      <footer className="border-t border-slate-200 py-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 sm:flex-row sm:px-6">
          <Logo href="/" />
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-slate-900">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-900">
              Terms
            </Link>
            <Link href="/login" className="hover:text-slate-900">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
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
