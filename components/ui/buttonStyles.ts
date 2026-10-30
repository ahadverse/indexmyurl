import { cn } from '@/lib/cn'

// Plain module (no 'use client'): server components such as the landing page need these
// class names too, and a function exported from a client file cannot be called on the server.

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerSoft' | 'dark'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300',
  secondary:
    'border border-slate-300 bg-white text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100 disabled:text-slate-400 disabled:hover:border-slate-300 disabled:hover:bg-white',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:text-slate-300 disabled:hover:bg-transparent',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800 disabled:bg-red-300',
  dangerSoft: 'border border-red-200 bg-white text-red-600 hover:bg-red-50 disabled:text-red-300 disabled:hover:bg-white',
  dark: 'bg-slate-900 text-white shadow-sm hover:bg-slate-800 disabled:bg-slate-400',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 rounded-lg px-3 text-[13px]',
  md: 'h-10 gap-2 rounded-lg px-4 text-sm',
  lg: 'h-12 gap-2 rounded-xl px-6 text-[15px]',
}

/** Class names of a button, for styling a <Link> or <a> like one. */
export function buttonClass({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
} = {}): string {
  return cn(
    'inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-colors disabled:cursor-not-allowed',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className
  )
}
