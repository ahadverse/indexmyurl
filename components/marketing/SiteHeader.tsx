import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { buttonClass } from '@/components/ui/buttonStyles'
import { NAV_LINKS } from '@/lib/site'
import { cn } from '@/lib/cn'

/**
 * Header of every public page. A server component with no client JavaScript: the mobile menu is a
 * <details> element, so the links are real, crawlable <a> tags on every screen size.
 */
export function SiteHeader({ current }: { current?: string }) {
  const isCurrent = (href: string) => current === href || (current ?? '').startsWith(`${href}/`)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo href="/" />

        <nav className="hidden items-center gap-1 text-sm font-medium md:flex" aria-label="Main">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={isCurrent(href) ? 'page' : undefined}
              className={cn(
                'rounded-lg px-3 py-2 transition-colors',
                isCurrent(href) ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className={buttonClass({ variant: 'ghost', size: 'sm' })}>
            Sign in
          </Link>
          <Link href="/register" className={cn(buttonClass({ size: 'sm' }), 'hidden sm:inline-flex')}>
            Get started
          </Link>

          <details className="group relative md:hidden">
            <summary
              className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-lg text-slate-600 hover:bg-slate-100 [&::-webkit-details-marker]:hidden"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </summary>
            <nav
              className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-pop"
              aria-label="Mobile"
            >
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={isCurrent(href) ? 'page' : undefined}
                  className={cn(
                    'block rounded-lg px-3 py-2.5 text-sm font-medium',
                    isCurrent(href) ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-100'
                  )}
                >
                  {label}
                </Link>
              ))}
              <Link href="/register" className="mt-1 block rounded-lg bg-brand-600 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-700">
                Get started free
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  )
}
