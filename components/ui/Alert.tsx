'use client'
import { AlertTriangle, CheckCircle2, CircleAlert, Info, X } from 'lucide-react'
import { cn } from '@/lib/cn'

export type AlertTone = 'error' | 'success' | 'warning' | 'info'

const TONES: Record<AlertTone, { box: string; icon: string; Icon: typeof Info }> = {
  error: { box: 'border-red-200 bg-red-50 text-red-900', icon: 'text-red-500', Icon: CircleAlert },
  success: { box: 'border-emerald-200 bg-emerald-50 text-emerald-900', icon: 'text-emerald-500', Icon: CheckCircle2 },
  warning: { box: 'border-amber-200 bg-amber-50 text-amber-900', icon: 'text-amber-500', Icon: AlertTriangle },
  info: { box: 'border-sky-200 bg-sky-50 text-sky-900', icon: 'text-sky-500', Icon: Info },
}

export function Alert({
  tone = 'info',
  title,
  children,
  onClose,
  className,
}: {
  tone?: AlertTone
  title?: string
  children?: React.ReactNode
  onClose?: () => void
  className?: string
}) {
  const { box, icon, Icon } = TONES[tone]
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-lg border px-4 py-3 text-sm', box, className)}
    >
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', icon)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && 'mt-0.5', 'leading-relaxed')}>{children}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="-mr-1 grid h-6 w-6 shrink-0 place-items-center rounded-md opacity-60 hover:bg-black/5 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
