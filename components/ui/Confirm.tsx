'use client'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  /** danger = red confirm button, for destructive actions */
  tone?: 'danger' | 'brand'
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

/** `const confirm = useConfirm(); if (!(await confirm({ title: '…' }))) return` — replaces window.confirm(). */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used inside <Providers>')
  return ctx
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<((ok: boolean) => void) | null>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const close = useCallback((ok: boolean) => {
    resolver.current?.(ok)
    resolver.current = null
    setOptions(null)
  }, [])

  useEffect(() => {
    if (!options) return
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false)
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [options, close])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center">
          <div
            className="absolute inset-0 animate-fade-in bg-slate-900/40 backdrop-blur-[2px]"
            onClick={() => close(false)}
            aria-hidden="true"
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby={options.description ? 'confirm-description' : undefined}
            className="relative w-full max-w-md animate-pop-in rounded-2xl bg-white p-6 shadow-pop"
          >
            <div className="flex gap-4">
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                  options.tone === 'danger' ? 'bg-red-100 text-red-600' : 'bg-brand-100 text-brand-600'
                }`}
              >
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 id="confirm-title" className="text-base font-semibold text-slate-900">
                  {options.title}
                </h2>
                {options.description && (
                  <p id="confirm-description" className="mt-1.5 text-sm leading-relaxed text-slate-500">
                    {options.description}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button ref={cancelRef} variant="secondary" onClick={() => close(false)}>
                Cancel
              </Button>
              <Button variant={options.tone === 'danger' ? 'danger' : 'primary'} onClick={() => close(true)}>
                {options.confirmLabel ?? 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
