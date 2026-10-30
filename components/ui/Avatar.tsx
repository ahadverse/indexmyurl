import { cn } from '@/lib/cn'

const PALETTE = [
  'bg-brand-100 text-brand-700',
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-800',
  'bg-rose-100 text-rose-700',
]

/** A round avatar with initials; the colour is stable for a given seed (e.g. an email). */
export function Avatar({ label, seed, size = 'md', className }: { label: string; seed?: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const key = seed ?? label
  let hash = 0
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-grid shrink-0 select-none place-items-center rounded-full font-semibold',
        size === 'sm' && 'h-7 w-7 text-[11px]',
        size === 'md' && 'h-9 w-9 text-sm',
        size === 'lg' && 'h-14 w-14 text-lg',
        PALETTE[hash % PALETTE.length],
        className
      )}
    >
      {label}
    </span>
  )
}
