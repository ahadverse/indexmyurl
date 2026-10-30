import { cn } from '@/lib/cn'

export type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info'

const TONES: Record<Tone, { pill: string; dot: string }> = {
  neutral: { pill: 'bg-slate-100 text-slate-700 ring-slate-200', dot: 'bg-slate-400' },
  brand: { pill: 'bg-brand-50 text-brand-700 ring-brand-200', dot: 'bg-brand-500' },
  success: { pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  warning: { pill: 'bg-amber-50 text-amber-800 ring-amber-200', dot: 'bg-amber-500' },
  danger: { pill: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-red-500' },
  info: { pill: 'bg-sky-50 text-sky-700 ring-sky-200', dot: 'bg-sky-500' },
}

export function Badge({
  tone = 'neutral',
  dot,
  pulse,
  className,
  children,
}: {
  tone?: Tone
  /** a small status dot before the label */
  dot?: boolean
  /** animate the dot (work in progress) */
  pulse?: boolean
  className?: string
  children: React.ReactNode
}) {
  const t = TONES[tone]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        t.pill,
        className
      )}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', t.dot)} />}
          <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', t.dot)} />
        </span>
      )}
      {children}
    </span>
  )
}
