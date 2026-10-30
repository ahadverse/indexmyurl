'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, LayoutDashboard, List, LogOut, Menu, Plug, UserRound, X, Zap } from 'lucide-react'
import { clearAuth } from '@/lib/api'
import { cn } from '@/lib/cn'
import { initials } from '@/lib/format'
import type { User } from '@/lib/types'
import { Logo } from '@/components/ui/Logo'
import { Avatar } from '@/components/ui/Avatar'

const LINKS = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/urls', label: 'All URLs', Icon: List },
  { href: '/settings/google', label: 'Google', Icon: Plug },
  { href: '/profile', label: 'Profile', Icon: UserRound },
]

export default function Navbar({ user }: { user?: Partial<User> | null }) {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false) // user dropdown
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const name = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : ''
  const credits = user?.availableCredits ?? user?.credits

  // close the dropdown on outside click / Escape, and menus on navigation
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  useEffect(() => {
    setMenuOpen(false)
    setMobileOpen(false)
  }, [pathname])

  function logout() {
    clearAuth()
    router.push('/login')
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo href="/dashboard" />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {LINKS.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive(href) ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {credits !== undefined && (
            <Link
              href="/dashboard"
              title="Available credits"
              className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300 sm:flex"
            >
              <Zap className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
              <span className="tabular-nums">{credits}</span>
              <span className="text-slate-500">credit{credits === 1 ? '' : 's'}</span>
            </Link>
          )}

          <div ref={menuRef} className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-slate-100"
            >
              <Avatar label={initials(user?.firstName, user?.lastName, user?.email)} seed={user?.email} size="sm" />
              <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', menuOpen && 'rotate-180')} aria-hidden="true" />
              <span className="sr-only">Account menu</span>
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-64 origin-top-right animate-pop-in overflow-hidden rounded-xl border border-slate-200 bg-white shadow-pop"
              >
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="truncate text-sm font-medium text-slate-900">{name || 'Your account'}</p>
                  {user?.email && <p className="truncate text-[13px] text-slate-500">{user.email}</p>}
                </div>
                <div className="p-1.5">
                  <MenuLink href="/profile" Icon={UserRound}>
                    Profile & API key
                  </MenuLink>
                  <MenuLink href="/settings/google" Icon={Plug}>
                    Google accounts
                  </MenuLink>
                </div>
                <div className="border-t border-slate-100 p-1.5">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={logout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    <LogOut className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="grid h-10 w-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="animate-fade-in border-t border-slate-200 bg-white px-4 pb-4 pt-2 md:hidden">
          {credits !== undefined && (
            <p className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600">
              <Zap className="h-4 w-4 text-brand-500" aria-hidden="true" />
              <span className="font-medium tabular-nums text-slate-900">{credits}</span> credits available
            </p>
          )}
          {LINKS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                isActive(href) ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-100'
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
          <button
            type="button"
            onClick={logout}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4 text-slate-400" aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </header>
  )
}

function MenuLink({ href, Icon, children }: { href: string; Icon: typeof UserRound; children: React.ReactNode }) {
  return (
    <Link href={href} role="menuitem" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
      <Icon className="h-4 w-4 text-slate-400" aria-hidden="true" />
      {children}
    </Link>
  )
}
