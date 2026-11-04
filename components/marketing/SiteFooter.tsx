import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { CONTACT_EMAIL } from '@/lib/site'

const COLUMNS: Array<{ title: string; links: Array<{ href: string; label: string }> }> = [
  {
    title: 'Product',
    links: [
      { href: '/features', label: 'Features' },
      { href: '/how-it-works', label: 'How it works' },
      { href: '/credits', label: 'How credits work' },
      { href: '/docs/api', label: 'API documentation' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { href: '/guides', label: 'All guides' },
      { href: '/guides/why-is-my-page-not-indexed', label: 'Why a page is not indexed' },
      { href: '/guides/how-to-check-if-a-url-is-indexed', label: 'Check if a URL is indexed' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      ...(CONTACT_EMAIL ? [{ href: '/contact', label: 'Contact' }] : []),
      { href: '/privacy', label: 'Privacy policy' },
      { href: '/terms', label: 'Terms of service' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/register', label: 'Create an account' },
      { href: '/login', label: 'Sign in' },
    ],
  },
]

/** Footer of every public page: links to every section, which also helps crawlers reach all of them. */
export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div>
            <Logo href="/" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              Scan URLs for indexing problems, submit the ones that pass, and use a credit only when Google Search Console confirms the page is indexed.
            </p>
          </div>
          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-sm font-semibold text-slate-900">{column.title}</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-slate-600 hover:text-slate-900">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500">
          Indexing is decided by Google and is never guaranteed. IndexMeNow is not affiliated with Google.
        </p>
      </div>
    </footer>
  )
}
