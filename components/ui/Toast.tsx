'use client'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react'
import { cn } from '@/lib/cn'

type ToastTone = 'success' | 'error' | 'info'

interface ToastInput {
  title: string
  description?: string
  tone?: ToastTone
}

interface ToastItem extends ToastInput {
  id: number
  tone: ToastTone
}

const ToastContext = createContext<{ toast: (t: ToastInput) => void } | null>(null)

const ICONS = {
  success: { Icon: CheckCircle2, cls: 'text-emerald-500' },
  error: { Icon: CircleAlert, cls: 'text-red-500' },
  info: { Icon: Info, cls: 'text-sky-500' },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => setItems((prev) => prev.filter((t) => t.id !== id)), [])

  const toast = useCallback(
    (input: ToastInput) => {
      const id = Date.now() + Math.random()
      const tone = input.tone ?? 'info'
      setItems((prev) => [...prev.slice(-3), { ...input, id, tone }])
      // errors stay longer: they are read, not just noticed
      setTimeout(() => dismiss(id), tone === 'error' ? 8000 : 4500)
    },
    [dismiss]
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
      >
        {items.map((t) => {
          const { Icon, cls } = ICONS[t.tone]
          return (
            <div
              key={t.id}
              role={t.tone === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-pop"
            >
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', cls)} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">{t.title}</p>
                {t.description && <p className="mt-0.5 text-sm text-slate-500">{t.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="-mr-1 -mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <Providers>')
  return ctx.toast
}
