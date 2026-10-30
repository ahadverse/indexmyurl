import Link from 'next/link'
import { ScanSearch } from 'lucide-react'
import { cn } from '@/lib/cn'

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-sm ring-1 ring-inset ring-white/20',
        className
      )}
    >
      <ScanSearch className="h-[18px] w-[18px]" aria-hidden="true" />
    </span>
  )
}

export function Logo({ href = '/', invert, className }: { href?: string; invert?: boolean; className?: string }) {
  return (
    <Link href={href} className={cn('inline-flex items-center gap-2.5', className)} aria-label="IndexMeNow home">
      <LogoMark />
      <span className={cn('text-[17px] font-semibold tracking-tight', invert ? 'text-white' : 'text-slate-900')}>
        IndexMeNow
      </span>
    </Link>
  )
}
