'use client'
import { forwardRef, useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/cn'

interface FieldProps {
  label?: string
  hint?: string
  error?: string
  leftIcon?: React.ReactNode
  rightSlot?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & FieldProps>(
  function Input({ label, hint, error, leftIcon, rightSlot, className, id, ...props }, ref) {
    const autoId = useId()
    const inputId = id ?? autoId
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
    return (
      <div>
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              'block h-10 w-full rounded-lg border bg-white text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-4 disabled:bg-slate-50 disabled:text-slate-500',
              leftIcon ? 'pl-10' : 'pl-3',
              rightSlot ? 'pr-10' : 'pr-3',
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                : 'border-slate-300 hover:border-slate-400 focus:border-brand-500 focus:ring-brand-100',
              className
            )}
            {...props}
          />
          {rightSlot && <span className="absolute inset-y-0 right-1.5 flex items-center">{rightSlot}</span>}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="mt-1.5 text-[13px] text-red-600">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="mt-1.5 text-[13px] text-slate-500">
            {hint}
          </p>
        ) : null}
      </div>
    )
  }
)

/** A password field with a show / hide toggle. */
export const PasswordInput = forwardRef<HTMLInputElement, Omit<React.ComponentProps<typeof Input>, 'type' | 'rightSlot'>>(
  function PasswordInput(props, ref) {
    const [visible, setVisible] = useState(false)
    return (
      <Input
        ref={ref}
        {...props}
        type={visible ? 'text' : 'password'}
        rightSlot={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            className="grid h-7 w-7 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
      />
    )
  }
)
